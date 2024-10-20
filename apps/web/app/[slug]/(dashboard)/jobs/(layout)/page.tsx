"use client";

import { useAuth } from "@/components/authenticator";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import { useProject } from "@/hooks/use-project";
import { listJobsSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FileScanIcon } from "lucide-react";
import { handle } from "typed-handlers";
import { z } from "zod";
import { JobCard } from "./job-card";

export default function Jobs() {
  const { idToken } = useAuth();
  const { id: projectId } = useProject();
  const { data, isLoading } = useQuery({
    queryKey: ["jobs-listing"],
    queryFn: async () => {
      const cfg = handle("/api/v1/jobs", {
        query: { projectId: projectId! },
      });

      const { data } = await axios.get<{
        jobs: z.infer<typeof listJobsSchema>;
      }>(cfg.url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return data.jobs;
    },
  });

  if (isLoading) {
    return (
      <div className="relative w-full h-96">
        <Loader fullScreen={false} showLogo={false} />;
      </div>
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
