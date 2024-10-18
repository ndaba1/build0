import { JsonEditor } from "@/components/editor";
import { Badge } from "@/components/tremor/badge";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import {
    documents,
    getJobSchema,
    jobs,
    templates,
} from "@repo/database/schema";
import { DownloadIcon, ExternalLinkIcon, RefreshCwIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { getJobDurationInfo } from "../(layout)/job-card";

export default async function JobDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await db
    .select({
      id: jobs.id,
      status: jobs.status,
      errorMessage: jobs.errorMessage,
      targetFormat: jobs.targetFormat,
      template: templates,
      startedAt: jobs.startedAt,
      endedAt: jobs.endedAt,
      documentId: jobs.documentId,
      previewUrl: documents.preview_url,
      documentUrl: documents.document_url,
      retries: jobs.retries,
      templateVariables: jobs.templateVariables,
      templateId: jobs.templateId,
      templateVersion: jobs.templateVersion,
    })
    .from(jobs)
    .where(eq(jobs.id, params.id))
    .leftJoin(templates, eq(templates.id, jobs.templateId))
    .leftJoin(documents, eq(documents.id, jobs.documentId));
  const job = result[0];

  const { formattedDuration, formattedMinsAgo } = getJobDurationInfo(
    job as unknown as z.infer<typeof getJobSchema>
  );

  const values = {
    Template: job.template?.name,
    Status: (
      <>
        {job.status === "PENDING" ? (
          <Badge variant="warning">Pending</Badge>
        ) : null}
        {job.status === "COMPLETED" ? (
          <Badge variant="success">Completed</Badge>
        ) : null}
        {job.status === "FAILED" ? <Badge variant="error">Failed</Badge> : null}
      </>
    ),
    Target: (job.targetFormat || "PDF").toLowerCase(),
    Duration: `${formattedDuration} (${formattedMinsAgo} ago)`,
  };

  return (
    <div>
      <section className="border-b w-full bg-background">
        <div className="max-w-6xl mx-auto p-4 py-12 space-y-8">
          <Breadcrumb>
            <BreadcrumbList className="text-base">
              <BreadcrumbItem>
                <Link href="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link href="/jobs">Jobs</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{job.id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="p-8 grid bg-muted/20 grid-cols-12 gap-8">
            {job.status === "FAILED" ? (
              <div className="border bg-background p-4 border-destructive rounded-md h-72 col-span-4">
                <h1 className="text-xl font-medium">Job Failed</h1>
                <p className="mt-2 text-muted-foreground">{job.errorMessage}</p>
              </div>
            ) : null}
            {job.status === "COMPLETED" ? (
              <Image
                alt="Image"
                height={1600}
                width={900}
                src={`/api/v1/download/${job.documentId}?type=preview` || ""}
                className="border bg-background p-4 object-cover object-top rounded-md h-72 col-span-4"
              />
            ) : null}

            <div className="col-span-8 flex py-4 flex-col justify-between">
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(values).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Preview URL</p>
                <p className="text-foreground whitespace-nowrap overflow-hidden w-[600px] text-ellipsis">
                  {job.previewUrl || "No preview available"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Document URL</p>
                <p className="text-foreground whitespace-nowrap overflow-hidden w-[600px] text-ellipsis">
                  {job.documentUrl || "No document available"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {job.status === "COMPLETED" ? (
                  <Link
                    target="_blank"
                    href={`http://localhost:3000/api/v1/download/${job.documentId}?type=file`}
                    className={buttonVariants({ variant: "default" })}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Link>
                ) : null}
                <Link
                  target="_blank"
                  href={`http://localhost:3000/api/v1/download/${job.documentId}?type=preview&disposition=inline`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Preview
                </Link>
                {job.status === "FAILED" ? (
                  <Button variant="outline">
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Re-run Job
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="max-w-6xl mx-auto p-4 py-12">
        <Card className="rounded-xl">
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <CardTitle>Template Variables</CardTitle>
              <UIBadge variant="default">Read Only</UIBadge>
            </div>
          </CardHeader>
          <CardContent className="p-0 py-1 pl-2 overflow-hidden">
            <JsonEditor
              options={{
                readOnly: true,
                rulers: [],
                overviewRulerLanes: 0
              }}
              height={500}
              className="shadow-none border-none opacity-60"
              value={JSON.stringify(job.templateVariables, null, 2)}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
