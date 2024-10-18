import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { authConfig } from "./auth";
import { cookies } from "next/headers";
import { getCurrentUser } from "aws-amplify/auth/server";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: authConfig,
});

export async function authCurrentUser() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies: cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error) {
    console.error("Error getting current user", error);
    return null;
  }
}
