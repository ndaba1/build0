import { withAuth } from "@/lib/with-auth";
import { db } from "@repo/database/client";
import { createTemplateSchema, templates } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { ZodAny, z } from "zod";

export const POST = withAuth(async ({ req }) => {
  try {
    const body = await req.json();
    const data = createTemplateSchema.parse(body);

    const res = await db.insert(templates).values(data).returning();

    return NextResponse.json({ item: res[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: (e as z.infer<ZodAny>).message || "Errror" },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async ({ req }) => {
  const res = await db.select().from(templates);

  return NextResponse.json(res);
});
