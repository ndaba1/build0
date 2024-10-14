"use client";

import { Card } from "@/components/ui/card";
import { listTemplateSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { InboxIcon } from "lucide-react";
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
    </div>
  );
}
