import { withAuth } from "@/lib/auth/with-auth";
import { throwError } from "@/lib/throw-error";
import { desc, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { jobs, templates } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const GET = withAuth(async ({ req }) => {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return throwError("projectId is required", 400);
  }

  const data = await db
    .select({
      id: jobs.id,
      startedAt: jobs.startedAt,
      endedAt: jobs.endedAt,
      status: jobs.status,
      targetFormat: jobs.targetFormat,
      templateId: jobs.templateId,
      projectId: jobs.projectId,
      template: {
        id: templates.id,
        name: templates.name,
      },
    })
    .from(jobs)
    .leftJoin(templates, eq(jobs.templateId, templates.id))
    .where(eq(jobs.projectId, projectId))
    .limit(12)
    .orderBy(desc(jobs.startedAt));

  return NextResponse.json({ jobs: data, status: "success" });
});
