import { env } from "@/env";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { tokens, users } from "@repo/database/schema";
import axios from "axios";
import { JWK, createLocalJWKSet, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { ZodAny, z } from "zod";
import { hashToken } from "../hash-token";
import { redis } from "../redis";

export function withAuth<T = z.infer<ZodAny>>(
  handler: (args: {
    req: NextRequest;
    params: T;
    user: { id: string; sub: string };
    token?: { id: string; scopes: string | null };
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
        })
        .from(tokens)
        .innerJoin(users, eq(tokens.userId, users.id))
        .where(eq(tokens.hashedKey, hashedKey));

      if (!accessToken) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      return handler({ req, params, ...accessToken });
    }
    // using dashboard session
    else if (token) {
      console.log("Using dashboard session");

      const payload = await verifyCognitoToken(token);
      console.log("payload", payload);

      if (!payload) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      const [user] = await db
        .select({ id: users.id, sub: users.sub })
        .from(users)
        .where(eq(users.sub, payload.sub));

      if (!user) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }

      return handler({ req, params, user });
    }

    return Response.json({ message: "Unauthorized" }, { status: 401 });
  };
}

const region = env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = env.NEXT_PUBLIC_USER_POOL_ID;
const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
const jwksUri = `${cognitoIssuer}/.well-known/jwks.json`;
const JWKS_CACHE_KEY = `cognito_${userPoolId}:jwks`;

type AccessTokenPayload = {
  sub: string;
  iss: string;
  "cognito:username": string;
  origin_jti: string;
  aud: string;
  event_id: string;
  token_use: string;
  auth_time: number;
  name: string;
  exp: number;
  iat: number;
  jti: string;
  email: string;
};

async function getJwks() {
  let jwks: JWK[] = [];

  const cachedJwks = await redis.get(JWKS_CACHE_KEY);
  console.log("cachedJwks", cachedJwks);
  if (cachedJwks) {
    console.log("JWKS found in cache");
    jwks = JSON.parse(cachedJwks);
  } else {
    console.log("JWKS not found in cache");
    const { data } = await axios.get(jwksUri);
    jwks = data.keys;

    await redis.set(JWKS_CACHE_KEY, JSON.stringify(jwks), "EX", 60 * 60 * 24);
  }

  return createLocalJWKSet({ keys: jwks });
}

async function verifyCognitoToken(token: string) {
  try {
    const JWKS = await getJwks();
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: cognitoIssuer,
    });

    return payload as AccessTokenPayload;
  } catch (error) {
    return null;
  }
}
