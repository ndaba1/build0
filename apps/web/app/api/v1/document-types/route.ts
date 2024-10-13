import { withAuth } from "@/lib/with-auth";
import { db } from "@repo/database/client";
import { createDocumentTypeSchema, documentTypes } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

export const GET = withAuth(async ({ req }) => {
  const res = await db.select().from(documentTypes);

  return NextResponse.json(res);
});

export const POST = withAuth(async ({ req }) => {
  try {
    const body = await req.json();
    const data = createDocumentTypeSchema.parse(body);

    const res = await db.insert(documentTypes).values(data).returning();

    return NextResponse.json({ item: res[0] });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const validationError = fromError(e);
      return new Response(
        JSON.stringify({ message: validationError.toString() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response((e as z.infer<ZodAny>).message, { status: 500 });
  }
});
