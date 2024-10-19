import { withAuth } from "@/lib/auth/with-auth";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import {
    createTemplateSchema,
    documentTypes,
    templates,
} from "@repo/database/schema";
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
  const res = await db
    .select({
      id: templates.id,
      name: templates.name,
      isActive: templates.isActive,
      version: templates.version,
      createdAt: templates.createdAt,
      lastGeneratedAt: templates.lastGeneratedAt,
      generationCount: templates.generationCount,
      documentType: documentTypes,
    })
    .from(templates)
    .leftJoin(documentTypes, eq(documentTypes.id, templates.documentTypeId));

  return NextResponse.json({ templates: res });
});
