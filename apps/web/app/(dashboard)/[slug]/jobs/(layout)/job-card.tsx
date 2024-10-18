import { Badge } from "@/components/tremor/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getJobSchema } from "@repo/database/schema";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  DotIcon,
  FileImageIcon,
  FileTextIcon,
  MoreVerticalIcon,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

export function getJobDurationInfo(job: z.infer<typeof getJobSchema>) {
  const startedAt = Date.parse(job.startedAt);
  const endedAt = job.endedAt ? Date.parse(job.endedAt) : null;
  const duration = endedAt ? endedAt - startedAt : null;
  const formattedDuration = duration ? format(duration, "s's'") : "--";

  const formattedMinsAgo = formatDistanceToNowStrict(new Date(startedAt))
    .replace("hours", "h")
    .replace("minutes", "m")
    .replace("seconds", "s");

  return { formattedDuration, formattedMinsAgo };
}

export function JobCard({
  idx,
  job,
}: {
  job: z.infer<typeof getJobSchema>;
  idx: number;
}) {
  const { formattedDuration, formattedMinsAgo } = getJobDurationInfo(job);

  return (
    <section
      key={job.id}
      className={cn(
        "p-4 px-6 grid grid-cols-12 gap-4 items-center justify-between",
        idx !== 0 && "border-t"
      )}
    >
      <div className="col-span-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-muted border flex items-center justify-center">
          {job.targetFormat === "IMAGE" ? (
            <FileImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div>
          <p className="text-foreground mb-0.5 font-medium">
            {job.template.name}
          </p>

          <div className="flex items-center">
            <p className="text-muted-foreground w-[180px] overflow-hidden text-ellipsis text-sm whitespace-nowrap">
              {job.id}
            </p>

            <DotIcon className="w-4 h-4 text-muted-foreground mr-1" />
            <p className="text-muted-foreground text-sm">
              {(job.targetFormat || "PDF").toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-3">
        {job.status === "PENDING" ? (
          <Badge variant="warning">Pending</Badge>
        ) : null}
        {job.status === "COMPLETED" ? (
          <Badge variant="success">Completed</Badge>
        ) : null}
        {job.status === "FAILED" ? <Badge variant="error">Failed</Badge> : null}
        <p className="text-sm mt-1">
          {formattedDuration} ({formattedMinsAgo} ago)
        </p>
      </div>

      <div className="col-span-3 justify-end inline-flex items-center gap-4">
        <Link
          href={`/jobs/${job.id}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          View Job
        </Link>
        <MoreVerticalIcon className="w-5 h-5" />
      </div>
    </section>
  );
}
