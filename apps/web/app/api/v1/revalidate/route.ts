import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/blog");
  revalidatePath("/(public)/blog/[slug]", "page");

  return NextResponse.json({ success: true });
};
