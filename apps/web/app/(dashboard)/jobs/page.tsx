"use client";

import { SmallBadge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listJobsSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { format } from "date-fns/format";
import { FileScanIcon, FileTextIcon, MoreVerticalIcon } from "lucide-react";
import { handle } from "typed-handlers";
import { z } from "zod";

export default function Jobs() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs-listing"],
    queryFn: async () => {
      const cfg = handle("/api/v1/jobs");

      const { data } = await axios.get<{
        jobs: z.infer<typeof listJobsSchema>;
      }>(cfg.url);

      return data.jobs;
    },
  });

  if (isLoading) {
    const arr = Array.from(Array(10).keys());
    return (
      <Card className="rounded-xl my-8">
        {arr.map((i, idx) => (
          <section
            key={i}
            className={cn(
              "p-6 grid gap-4 grid-cols-12",
              idx !== 0 && "border-t"
            )}
          >
            <Skeleton className="col-span-3 h-6" />
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-2 h-6" />
            <Skeleton className="col-span-3 h-6" />
          </section>
        ))}
      </Card>
    );
  }

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
          {data.map((job, idx) => {
            const startedAt = Date.parse(job.startedAt);
            const endedAt = job.endedAt ? Date.parse(job.endedAt) : null;
            const duration = endedAt ? endedAt - startedAt : null;
            const formattedDuration = duration
              ? format(duration, "s's'")
              : "--";

            const formattedMinsAgo = formatDistanceToNowStrict(
              new Date(startedAt)
            )
              .replace("hours", "h")
              .replace("minutes", "m")
              .replace("seconds", "s");

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
                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="text-foreground mb-0.5 font-medium">
                      {job.template.name}
                    </p>

                    <p className="text-muted-foreground text-sm">{job.id}</p>
                  </div>
                </div>

                <div className="col-span-3">
                  {job.status === "PENDING" ? (
                    <SmallBadge className="border-yellow-200 bg-yellow-100/80 text-yellow-600">
                      Pending
                    </SmallBadge>
                  ) : null}
                  {job.status === "COMPLETED" ? (
                    <SmallBadge className="border-green-200 bg-green-100/80 text-green-600">
                      Completed
                    </SmallBadge>
                  ) : null}
                  {job.status === "FAILED" ? (
                    <SmallBadge className="border-red-200 bg-red-100/80 text-red-600">
                      Failed
                    </SmallBadge>
                  ) : null}
                  <p className="text-sm mt-1">
                    {formattedDuration} ({formattedMinsAgo} ago)
                  </p>
                </div>

                <div className="col-span-3 justify-end inline-flex items-center gap-4">
                  <Button size="sm" variant="outline" className="py-0">
                    View Job
                  </Button>
                  <MoreVerticalIcon className="w-5 h-5" />
                </div>
              </section>
            );
          })}
        </Card>
      ) : null}
    </div>
  );
}
