import { withAuth } from "@/lib/auth/with-auth";
import { throwError } from "@/lib/throw-error";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import {
    patchTemplateSchema,
    templates
} from "@repo/database/schema";
import { NextResponse } from "next/server";
import { Params } from "typed-handlers";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

export const PATCH = withAuth<Params<"/api/v1/templates/[id]">>(
  async ({ req, params }) => {
    try {
      const body = await req.json();
      const data = patchTemplateSchema.parse(body);

      const res = await db
        .update(templates)
        .set(data)
        .where(eq(templates.id, params.id))
        .returning();

      return NextResponse.json({ template: res[0] });
    } catch (e) {
      if (e instanceof z.ZodError) {
        const validationError = fromError(e);
        return throwError(validationError.toString(), 400);
      }

      return new Response((e as z.infer<ZodAny>).message, { status: 500 });
    }
  }
);
