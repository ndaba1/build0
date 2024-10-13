"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { listTemplateSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { handle } from "typed-handlers";
import { z } from "zod";

export default function Templates() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const cfg = handle("/api/v1/templates");

      const { data } = await axios.get<z.infer<typeof listTemplateSchema>>(
        cfg.url
      );

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            PDF Templates
          </h2>
          <p className="text-muted-foreground leading-tight">
            Create re-usable templates with theming, custom variables and more.
          </p>
        </div>

        <Link
          href="/templates/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Create Template
        </Link>
      </div>

      {!data?.length ? (
        <Card className="w-full my-20 rounded-xl flex flex-col items-center justify-center p-40">
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
        <div className="grid grid-cols-1 my-20 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((template) => (
            <Card key={template.id} className="p-6 rounded-xl">
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-muted-foreground mt-2">
                {template.description}
              </p>
            </Card>
          ))}
        </div>
      ) : null}
    </main>
  );
}
