import { db } from "@repo/database/client";
import { TemplatesList } from "./page-client";
import { documentTypes, projects, templates } from "@repo/database/schema";
import { eq } from "@repo/database";
import { SmallBadge } from "@/components/badge";
import { formatDistanceToNowStrict } from "date-fns";
import { Card } from "@/components/ui/card";
import { FileSlidersIcon, InboxIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Templates({
  params,
}: {
  params: { slug: string };
}) {
  const data = await db
    .select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      isActive: templates.isActive,
      version: templates.version,
      createdAt: templates.createdAt,
      lastGeneratedAt: templates.lastGeneratedAt,
      generationCount: templates.generationCount,
      documentType: documentTypes,
    })
    .from(templates)
    .innerJoin(projects, eq(templates.projectId, projects.id))
    .innerJoin(documentTypes, eq(documentTypes.id, templates.documentTypeId))
    .where(eq(projects.slug, params.slug));

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
