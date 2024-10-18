import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { tokens } from "@repo/database/schema";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { ZodAny, z } from "zod";
import { runWithAmplifyServerContext } from "./amplify";
import { Amplify } from "aws-amplify";
import { authConfig } from "./auth";

Amplify.configure(authConfig, { ssr: true });

export function withAuth<T = z.infer<ZodAny>>(
  handler: (args: { req: NextRequest; params: T }) => Promise<Response>
) {
  return async (req: NextRequest, { params }: { params: T }) => {
    const bearer = req.headers.get("Authorization");
    const token = bearer?.replace("Bearer ", "");

    // using an access token
    if (token?.startsWith("b0")) {
      console.log("Using access token");
      const accessToken = await db
        .select()
        .from(tokens)
        .where(eq(tokens.hashedKey, token));

      if (accessToken.length === 0) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }
    // using dashboard session
    else {
      console.log("Using dashboard session");
      try {
        const user = await runWithAmplifyServerContext({
          nextServerContext: { cookies },
          operation: (contextSpec) => getCurrentUser(contextSpec),
        });

        console.log(user);

        if (!user.userId) {
          return Response.json({ message: "Unauthorized" }, { status: 401 });
        }
      } catch (e) {
        console.error("error occurred", e);
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    return handler({ req, params });
  };
}
