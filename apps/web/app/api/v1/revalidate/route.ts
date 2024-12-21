import { invalidateCloudFrontPaths } from "@/lib/cloudfront";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const secret = req.headers.get("x-revalidate-secret");

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/blog", "page");
  revalidatePath("/(public)/blog/[slug]", "page");

  // open-next specific
  await invalidateCloudFrontPaths(["/blog/*"]);

  return NextResponse.json({ success: true });
};
