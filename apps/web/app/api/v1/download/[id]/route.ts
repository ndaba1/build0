import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { documents } from "@repo/database/schema";
import { Resource } from "sst";
import { Params } from "typed-handlers";

export const GET = withAuth<Params<"/api/v1/download/[id]">>(
  async ({ req, params }) => {
    const documentId = params.id;
    // valid values are "file" or "preview"
    const downloadType = req.nextUrl.searchParams.get("type") || "file";
    const disposition =
      req.nextUrl.searchParams.get("disposition") || "attachment";
    const isPreview = downloadType === "preview";

    if (!documentId) {
      return throwError("A documentId is required", 400);
    }

    const results = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));
    const document = results[0];

    if (!document) {
      return throwError("Document does not exist", 400);
    }

    const s3 = new S3Client({});
    const command = new GetObjectCommand({
      Bucket: isPreview
        ? Resource.BuildZeroImageBucket.name
        : Resource.BuildZeroBucket.name,
      Key: `${document.s3Key}${isPreview ? ".png" : ""}`, // append .png for preview
    });

    const { Body, ContentType, ContentLength } = await s3.send(command);

    if (!Body) {
      return throwError("Document not found", 404);
    }

    // Set headers
    const fallbackContentType = isPreview ? "image/png" : "application/pdf";
    const headers = {
      "Content-Type": ContentType || fallbackContentType,
      "Content-Length": ContentLength?.toString() || "0",
      "Content-Disposition": `${
        disposition === "inline" ? "inline" : "attachment"
      }; filename="${documentId}.${isPreview ? "png" : "pdf"}"`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return new Response(Body as ReadableStream, {
      headers,
    });
  }
);
