import { JsonEditor } from "@/components/editor";
import { Badge } from "@/components/tremor/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import {
  documents,
  getJobSchema,
  jobs,
  templates,
} from "@repo/database/schema";
import {
  ClipboardCopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { getJobDurationInfo } from "../(layout)/job-card";

const jobParams = {
  id: jobs.id,
  status: jobs.status,
  errorMessage: jobs.errorMessage,
  targetFormat: jobs.targetFormat,
  template: templates,
  startedAt: jobs.startedAt,
  endedAt: jobs.endedAt,
  documentId: jobs.documentId,
  previewUrl: documents.previewUrl,
  documentUrl: documents.documentUrl,
  retries: jobs.retries,
  templateVariables: jobs.templateVariables,
  templateId: jobs.templateId,
  templateVersion: jobs.templateVersion,
};

const childJobParams = {
  id: jobs.id,
  status: jobs.status,
  errorMessage: jobs.errorMessage,
  targetFormat: jobs.targetFormat,
  startedAt: jobs.startedAt,
  endedAt: jobs.endedAt,
  documentId: jobs.documentId,
  retries: jobs.retries,
};

export default async function JobDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [[job], [childJob]] = await Promise.all([
    db
      .select(jobParams)
      .from(jobs)
      .where(eq(jobs.id, params.id))
      .leftJoin(templates, eq(templates.id, jobs.templateId))
      .leftJoin(documents, eq(documents.id, jobs.documentId)),
    db.select(childJobParams).from(jobs).where(eq(jobs.refJobId, params.id)),
  ]);

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
                <Link href="../">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link href="../jobs">Jobs</Link>
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
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                  {job.errorMessage}
                </p>
              </div>
            ) : null}
            {job.status === "COMPLETED" ? (
              <Image
                alt="Image"
                height={1600}
                width={900}
                src={job.previewUrl || ""}
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
                    href={job.documentUrl || ""}
                    className={buttonVariants({ variant: "default" })}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Link>
                ) : null}
                <Link
                  target="_blank"
                  href={`${job.previewUrl}&disposition=inline` || ""}
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
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="border-none">
            <Card className="rounded-xl rounded-bl-none rounded-br-none shadow-none">
              <AccordionTrigger className="px-4">
                <CardHeader className="w-full flex py-4 items-center flex-row justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">Preview Job</CardTitle>
                    {childJob.status === "PENDING" ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : null}
                    {childJob.status === "COMPLETED" ? (
                      <Badge variant="success">Completed</Badge>
                    ) : null}
                    {childJob.status === "FAILED" ? (
                      <Badge variant="error">Failed</Badge>
                    ) : null}
                    {!childJob ? (
                      <Badge variant="error">No Child Job</Badge>
                    ) : null}
                  </div>

                  <Button size="sm" variant="outline">
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Re-run
                  </Button>
                </CardHeader>
              </AccordionTrigger>

              <AccordionContent className="pb-0">
                <CardContent className="p-0 border-t py-4 text-base bg-muted overflow-hidden flex flex-col gap-1.5 font-mono">
                  {childJob.retries > 0 ? (
                    <LogLine>Retries: {childJob.retries}</LogLine>
                  ) : null}
                  <LogLine>
                    Preview job started at {childJob.startedAt.toISOString()}
                  </LogLine>
                  {childJob.errorMessage ? (
                    <>
                      <LogLine className="bg-red-500 text-white">
                        Preview job failed with error: {childJob.errorMessage}
                      </LogLine>

                      <LogLine>
                        Job failed with no preview url generated
                      </LogLine>
                    </>
                  ) : (
                    <>
                      <LogLine>
                        Preview job ended at {childJob.endedAt?.toISOString()}
                      </LogLine>
                      <LogLine>
                        Successfully generated preview url {job.previewUrl}
                      </LogLine>
                    </>
                  )}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-none">
            <Card className="rounded-xl rounded-tl-none rounded-tr-none">
              <AccordionTrigger className="px-4">
                <CardHeader className="w-full flex py-4 items-center flex-row justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">
                      Template Variables
                    </CardTitle>
                    <Badge variant="default">Read Only</Badge>
                  </div>

                  <Button size="sm" variant="outline">
                    <ClipboardCopyIcon className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
              </AccordionTrigger>

              <AccordionContent>
                <CardContent className="p-0 border-t py-1 pl-2 overflow-hidden">
                  <JsonEditor
                    options={{
                      readOnly: true,
                      rulers: [],
                      overviewRulerLanes: 0,
                    }}
                    height={500}
                    className="shadow-none border-none opacity-60"
                    value={JSON.stringify(job.templateVariables, null, 2)}
                  />
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}

function LogLine({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("px-12 text-muted-foreground", className)}>{children}</p>;
}
