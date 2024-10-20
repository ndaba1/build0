import { Card } from "@/components/ui/card";
import { and, desc, eq, isNull } from "@repo/database";
import { db } from "@repo/database/client";
import { getJobSchema, jobs, projects, templates } from "@repo/database/schema";
import { FileScanIcon } from "lucide-react";
import { z } from "zod";
import { JobCard } from "./job-card";

export const dynamic = "force-dynamic";

export default async function Jobs({ params }: { params: { slug: string } }) {
  // load root jobs only
  const data = await db
    .select({
      id: jobs.id,
      startedAt: jobs.startedAt,
      endedAt: jobs.endedAt,
      status: jobs.status,
      targetFormat: jobs.targetFormat,
      documentId: jobs.documentId,
      templateId: jobs.templateId,
      projectId: jobs.projectId,
      template: {
        id: templates.id,
        name: templates.name,
      },
    })
    .from(jobs)
    .innerJoin(templates, eq(jobs.templateId, templates.id))
    .innerJoin(projects, eq(jobs.projectId, projects.id))
    .where(and(eq(projects.slug, params.slug), isNull(jobs.refJobId)))
    .limit(12)
    .orderBy(desc(jobs.startedAt));

  return (
    <div>
      {!data?.length ? (
        <Card className="w-full my-8 rounded-xl flex flex-col items-center justify-center p-40">
          <FileScanIcon
            strokeWidth={1.5}
            className="mb-4 h-12 w-12 text-muted-foreground"
          />
          <p className="max-w-sm text-muted-foreground text-center">
            Your jobs will appear here. Generate a document via the API to start
            creating new jobs.
          </p>
        </Card>
      ) : null}

      {data?.length ? (
        <Card className="rounded-2xl my-8">
          {data.map((job, idx) => (
            <JobCard
              key={job.id}
              job={job as unknown as z.infer<typeof getJobSchema>}
              idx={idx}
            />
          ))}
        </Card>
      ) : null}
    </div>
  );
}
