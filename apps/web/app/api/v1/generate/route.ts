import { env } from "@/env";
import { withProject } from "@/lib/auth/with-project";
import { payloadSchemaToZod, type PayloadSchema } from "@/lib/payload-schema";
import { throwError } from "@/lib/throw-error";
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
import { SignJWT } from "jose";
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

export const POST = withProject(async ({ req, project }) => {
  const documentName = req.nextUrl.searchParams.get("documentName");
  const templateName = req.nextUrl.searchParams.get("templateName");
  if (!templateName) {
    return throwError("Template name must be provided", 400);
  }

  if (!documentName) {
    return throwError("Document name must be provided", 400);
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

    if (!template.isActive) {
      return throwError(
        "Cannot generate a document from a template in draft mode",
        400
      );
    }

    const schema = payloadSchemaToZod(template.payloadSchema as PayloadSchema);
    const body = await req.json();
    const data = schema.parse(body);

    // start job
    const job = await startJob({ template, data, projectId: project.id });
    jobId = job.id;

    // TODO: stop using eval -- unsafe
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
    await uploadPdfToS3(pdfBuffer, s3Key);

    // complete job
    const doc = await completeJob(job.id, {
      s3Key,
      jobId: job.id,
      name: documentName,
      documentUrl: `${env.FILE_SERVER_URL}/document/${s3Key}`,
      templateId: template.id,
      templateVersion: template.version,
      templateVariables: data,
      projectId: project.id,
    });

    const secret = new TextEncoder().encode(env.DOCUMENT_TOKEN_SECRET);
    const jwt = await new SignJWT({ id: doc.id })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    const fileUrl = `${doc.documentUrl}?token=${jwt}`;
    await db
      .update(documents)
      .set({
        documentUrl: fileUrl,
      })
      .where(eq(documents.id, doc.id));

    return NextResponse.json({
      fileUrl,
      success: true,
    });
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

async function startJob({
  data,
  template,
  projectId,
}: {
  template: Template;
  data: z.infer<ZodAny>;
  projectId: string;
}) {
  const [job] = await db
    .insert(jobs)
    .values({
      projectId,
      templateId: template.id,
      templateVersion: template.version,
      templateVariables: data,
      startedAt: new Date(),
      status: "PENDING",
    })
    .returning();

  return job;
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

  return entry;
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

async function uploadPdfToS3(buffer: Buffer, key: string) {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: Resource.BuildZeroBucket.name,
    ContentType: "application/pdf",
    Body: buffer,
  });

  const client = new S3Client({});
  await client.send(command);
}
