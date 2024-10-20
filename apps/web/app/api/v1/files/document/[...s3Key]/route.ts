import { withDocument } from "@/lib/auth/with-document";
import { throwError } from "@/lib/throw-error";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { Params } from "typed-handlers";

export const GET = withDocument<Params<"/api/v1/files/document/[...s3Key]">>(
  async ({ req, params, document }) => {
    const s3 = new S3Client({});
    const docKey = params.s3Key.join("/");

    if (document.s3Key !== docKey) {
      return throwError("Unauthorized", 401);
    }

    const command = new GetObjectCommand({
      Bucket: Resource.BuildZeroBucket.name,
      Key: docKey,
    });

    const { Body, ContentType, ContentLength } = await s3.send(command);
    const disposition =
      req.nextUrl.searchParams.get("disposition") || "attachment";
    const filename = req.nextUrl.searchParams.get("filename") || "document.pdf";

    if (!Body) {
      return throwError("Document not found", 404);
    }

    // Set headers
    const headers = {
      "Content-Type": ContentType || "application/pdf",
      "Content-Length": ContentLength?.toString() || "0",
      "Content-Disposition": `${
        disposition === "inline" ? "inline" : "attachment"
      }; filename="${filename}"`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    return new Response(Body as ReadableStream, {
      headers,
    });
  }
);
