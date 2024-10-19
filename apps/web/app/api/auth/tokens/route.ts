import { withAuth } from "@/lib/auth/with-auth";
import { hashToken } from "@/lib/hash-token";
import { db } from "@repo/database/client";
import { createTokenSchema, tokens } from "@repo/database/schema";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

export const POST = withAuth(async ({ req, user }) => {
  try {
    const data = await req.json();
    const body = createTokenSchema.parse(data);

    // create token
    const token = `b0_${nanoid(24)}`;
    const hashedKey = await hashToken(token);
    const partialKey = `${token.slice(0, 2)}...${token.slice(-4)}`;

    await db.insert(tokens).values({
      ...body,
      hashedKey,
      partialKey,
      userId: user.id,
    });

    return NextResponse.json({ message: "Token created", token });
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

    return NextResponse.json(
      { message: (e as z.infer<ZodAny>).message || "Errror" },
      { status: 400 }
    );
  }
});
