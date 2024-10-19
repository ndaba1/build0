import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projects, tokens, users } from "@repo/database/schema";
import { NextRequest } from "next/server";
import { ZodAny, z } from "zod";
import { hashToken } from "../hash-token";

export function withProject<T = z.infer<ZodAny>>(
  handler: (args: {
    req: NextRequest;
    params: T;
    user: { id: string; sub: string };
    token: { id: string; scopes: string | null };
    project: { id: string };
  }) => Promise<Response>
) {
  return async (req: NextRequest, { params }: { params: T }) => {
    // TODO: refine project auth and provide better error responses!
    const bearer = req.headers.get("Authorization");
    const token = bearer?.replace("Bearer ", "");

    // using an access token
    if (token?.startsWith("b0")) {
      const hashedKey = await hashToken(token);
      const [accessToken] = await db
        .select({
          token: { id: tokens.id, scopes: tokens.scopes },
          user: { id: users.id, sub: users.sub },
          project: { id: projects.id },
        })
        .from(tokens)
        .innerJoin(users, eq(tokens.userId, users.id))
        .innerJoin(projects, eq(tokens.projectId, projects.id))
        .where(eq(tokens.hashedKey, hashedKey));

      if (!accessToken || !accessToken.user || !accessToken.project) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      return handler({ req, params, ...accessToken });
    }

    return Response.json({ message: "Unauthorized" }, { status: 401 });
  };
}
