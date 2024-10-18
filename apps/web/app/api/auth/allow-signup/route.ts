import { env } from "@/env";
import { count } from "@repo/database";
import { db } from "@repo/database/client";
import { users } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  // TODO: add redis config?

  if (env.ENABLE_SELF_SIGNUP) {
    console.log("self signup is enabled");
    return NextResponse.json({ allowSignup: true });
  }

  // if there are no users, allow the first user to sign up
  const members = await db.select({ count: count() }).from(users);

  if (members[0].count === 0) {
    console.log("first user is signing up");
    return NextResponse.json({ allowSignup: true });
  }

  return NextResponse.json({
    allowSignup: false,
    message: "Access to this dashboard is available via invitation only.",
  });
};
