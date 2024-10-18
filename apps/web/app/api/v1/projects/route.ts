import { withAuth } from "@/lib/with-auth";
import { db } from "@repo/database/client";
import { createProjectSchema, projects } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

export const POST = withAuth(async ({ req }) => {
  try {
    const body = await req.json();
    const data = createProjectSchema.parse(body);

    const res = await db.insert(projects).values(data).returning();

    return NextResponse.json({ project: res[0] });
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
