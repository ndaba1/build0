import { payloadSchemaToZod, type PayloadSchema } from "@/lib/payload-schema";
import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq, sql } from "@repo/database";
import { db } from "@repo/database/client";
import {
  Template,
  createDocumentSchema,
  documents,
  jobs,
  templates,
} from "@repo/database/schema";
import { NextResponse } from "next/server";
import path from "path";
import PdfPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Resource } from "sst";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

// Define fonts
const fonts = {
  Roboto: {
    normal: path.join(process.cwd(), "fonts/Roboto-Regular.ttf"),
    bold: path.join(process.cwd(), "fonts/Roboto-Medium.ttf"),
    italics: path.join(process.cwd(), "fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(process.cwd(), "fonts/Roboto-MediumItalic.ttf"),
  },
};

export const POST = withAuth(async ({ req }) => {
  const templateName = req.nextUrl.searchParams.get("templateName");
  if (!templateName) {
    return throwError("A templateName query parameter is required", 400);
  }

  let jobId: string | undefined;

  try {
    const results = await db
      .select()
      .from(templates)
      .where(eq(templates.name, templateName));
    const template = results[0];

    if (!template) {
      return throwError("Template does not exist", 400);
    }

    // if (!template.isActive) {
    //   return throwError(
    //     "Cannot generate a document from a template in draft mode",
    //     400
    //   );
    // }

    const schema = payloadSchemaToZod(template.payloadSchema as PayloadSchema);
    const body = await req.json();
    const data = schema.parse(body);

    // start job
    const job = await startJob(template, data);
    jobId = job.id;

    const generateFunc = eval(template.functionDefinition + "; generate");
    if (typeof generateFunc !== "function") {
      return throwError(
        "Template does not have a valid generate function",
        400
      );
    }

    // pdfmake docDefinition
    const docDefinition = generateFunc(data);
    const pdfBuffer = await generatePdfBuffer(docDefinition);

    const s3Key = `${template.s3PathPrefix?.replace(/^\//g, "")}/${job.id}.pdf`;
    const s3Url = await uploadPdfToS3(pdfBuffer, s3Key);

    // complete job
    await completeJob(job.id, {
      s3Key,
      jobId: job.id,
      document_url: s3Url,
      templateId: template.id,
      templateVersion: template.version,
      templateVariables: data,
    });

    return NextResponse.json({ url: s3Url, success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const validationError = fromError(e);
      return throwError(validationError.toString(), 400);
    }

    if (jobId) {
      await failJob(
        jobId,
        (e as z.infer<ZodAny>).message || "An unknown server error occurred"
      );
    }

    return new Response((e as z.infer<ZodAny>).message, { status: 500 });
  }
});

async function startJob(template: Template, data: z.infer<ZodAny>) {
  const results = await db
    .insert(jobs)
    .values({
      templateId: template.id,
      templateVersion: template.version,
      templateVariables: data,
      startedAt: new Date(),
      status: "PENDING",
    })
    .returning();

  return results[0];
}

async function completeJob(
  jobId: string,
  doc: z.infer<typeof createDocumentSchema>
) {
  const res = await db.insert(documents).values(doc).returning();
  const entry = res[0];

  // must wait for doc before completing job
  await Promise.all([
    db
      .update(jobs)
      .set({
        status: "COMPLETED",
        endedAt: new Date(),
        documentId: entry.id,
      })
      .where(eq(jobs.id, jobId)),
    db
      .update(templates)
      .set({
        lastGeneratedAt: new Date(),
        generationCount: sql`${templates.generationCount} + 1`,
      })
      .where(eq(templates.id, doc.templateId)),
  ]);
}

async function failJob(jobId: string, errorMessage: string) {
  await db
    .update(jobs)
    .set({
      status: "FAILED",
      errorMessage: errorMessage,
      endedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));
}

async function generatePdfBuffer(
  docDefinition: TDocumentDefinitions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const printer = new PdfPrinter(fonts);
    const doc = printer.createPdfKitDocument(docDefinition);

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });

    doc.on("error", (err) => {
      reject(err);
    });

    doc.end();
  });
}

async function uploadPdfToS3(buffer: Buffer, key: string): Promise<string> {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: Resource.BuildZeroBucket.name,
    ContentType: "application/pdf",
    Body: buffer,
  });

  const client = new S3Client({});
  await client.send(command);

  return `https://${Resource.BuildZeroBucket.name}.s3.amazonaws.com/${key}`;
}
