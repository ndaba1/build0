"use client";

import { useAuth } from "@/components/authenticator";
import { SmallBadge } from "@/components/badge";
import { Loader } from "@/components/loader";
import { Card } from "@/components/ui/card";
import { useProject } from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { listTemplateSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNowStrict } from "date-fns";
import { FileSlidersIcon, InboxIcon } from "lucide-react";
import Link from "next/link";
import { handle } from "typed-handlers";
import { z } from "zod";

export function TemplatesList() {
  const { idToken } = useAuth();
  const { slug } = useProject();
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const cfg = handle("/api/v1/templates");

      const { data } = await axios.get<{
        templates: z.infer<typeof listTemplateSchema>;
      }>(cfg.url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return data.templates;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 2,
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
          <InboxIcon
            strokeWidth={1.5}
            className="mb-3 h-12 w-12 text-muted-foreground"
          />
          <p className="max-w-sm text-muted-foreground text-center">
            Looks like you don&apos;t have any templates yet. Create a new
            template to get started.
          </p>
        </Card>
      ) : null}

      {data?.length ? (
        <div className="grid grid-cols-1 my-8 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((template) => {
            const values = {
              Created:
                formatDistanceToNowStrict(new Date(template.createdAt)) +
                " ago",
              "Last generated": template.lastGeneratedAt
                ? formatDistanceToNowStrict(
                    new Date(template.lastGeneratedAt)
                  ) + " ago"
                : "---",
              "Document count": template.generationCount || "---",
              "Document type": template.documentType.name || "---",
            };

            return (
              <Link key={template.id} href={`editor/${template.id}`}>
                <Card className="p-6 rounded-2xl cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-opacity-10 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                      <FileSlidersIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <div className="ml-auto">
                      <SmallBadge
                        className={cn(
                          "ml-auto",
                          template.isActive
                            ? "border-green-200 bg-green-100/80 text-green-600"
                            : "border-yellow-200 bg-yellow-100/80 text-yellow-600"
                        )}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </SmallBadge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {template.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 gap-y-4 mt-6">
                    {Object.entries(values).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-muted-foreground text-sm font-semibold">
                          {key}
                        </p>
                        <p className="text-muted-foreground text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
