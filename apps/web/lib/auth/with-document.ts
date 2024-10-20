import { env } from "@/env";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { documents } from "@repo/database/schema";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { ZodAny, z } from "zod";

export function withDocument<T = z.infer<ZodAny>>(
  handler: (args: {
    req: NextRequest;
    params: T;
    document: { id: string; s3Key: string };
  }) => Promise<Response>
) {
  return async (req: NextRequest, { params }: { params: T }) => {
    const token = req.nextUrl.searchParams.get("token");

    // token is signed jwt with document id
    if (token) {
      const secret = new TextEncoder().encode(env.DOCUMENT_TOKEN_SECRET);

      try {
        const { payload } = await jwtVerify(token, secret);
        const documentId = payload.id as string;

        const [document] = await db
          .select({
            id: documents.id,
            s3Key: documents.s3Key,
          })
          .from(documents)
          .where(eq(documents.id, documentId));

        if (document) {
          return handler({ req, params, document });
        }
      } catch (error) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    return Response.json({ message: "Unauthorized" }, { status: 401 });
  };
}
