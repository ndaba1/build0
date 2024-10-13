import { payloadSchemaToZod, type PayloadSchema } from "@/lib/payload-schema";
import { withAuth } from "@/lib/with-auth";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { templates } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

export const POST = withAuth(async ({ req }) => {
  const templateName = req.nextUrl.searchParams.get("templateName");
  if (!templateName) {
    return new Response("templateName is required", { status: 400 });
  }

  try {
    const results = await db
      .select()
      .from(templates)
      .where(eq(templates.name, templateName));
    const template = results[0];

    if (!template) {
      return new Response(JSON.stringify({ message: "Template not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const schema = payloadSchemaToZod(template.payloadSchema as PayloadSchema);

    const body = await req.json();
    const data = schema.parse(body);

    return NextResponse.json({ template });
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
