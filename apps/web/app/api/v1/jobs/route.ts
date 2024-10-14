import { withAuth } from "@/lib/with-auth";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { jobs, templates } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const GET = withAuth(async () => {
  const res = await db
    .select()
    .from(jobs)
    .limit(10)
    .leftJoin(templates, eq(jobs.templateId, templates.id));

  const data = res.map((j) => ({
    ...j.jobs,
    template: j.templates,
  }));

  return NextResponse.json({ jobs: data, status: "success" });
});
