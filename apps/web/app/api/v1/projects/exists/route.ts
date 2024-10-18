import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projects } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const GET = withAuth(async ({ req }) => {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return throwError("Slug is required", 400);
  }

  const results = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug));

  return NextResponse.json({ exists: results.length > 0 });
});
