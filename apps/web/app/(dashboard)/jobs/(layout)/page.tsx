"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listJobsSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  FileScanIcon
} from "lucide-react";
import { handle } from "typed-handlers";
import { z } from "zod";
import { JobCard } from "./job-card";

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
          {data.map((job, idx) => (
            <JobCard key={job.id} job={job} idx={idx} />
          ))}
        </Card>
      ) : null}
    </div>
  );
}
