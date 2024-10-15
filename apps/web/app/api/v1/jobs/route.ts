import { withAuth } from "@/lib/with-auth";
import { desc, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { jobs, templates } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const GET = withAuth(async () => {
  const res = await db
    .select()
    .from(jobs)
    .limit(30)
    .orderBy(desc(jobs.endedAt))
    .leftJoin(templates, eq(jobs.templateId, templates.id));

  const data = res.map((j) => ({
    ...j.jobs,
    template: j.templates,
  }));

  return NextResponse.json({ jobs: data, status: "success" });
});
