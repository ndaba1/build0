import { Card } from "@/components/ui/card";
import { desc, eq } from "@repo/database";
import { db } from "@repo/database/client";
import {
  documents,
  projects,
  templates
} from "@repo/database/schema";
import { FileScanIcon } from "lucide-react";
import { DocumentCard } from "./document-card";

export const dynamic = "force-dynamic";

export default async function Documents({
  params,
}: {
  params: { slug: string };
}) {
  const data = await db
    .select({
      id: documents.id,
      name: documents.name,
      jobId: documents.jobId,
      templateId: documents.templateId,
      templateName: templates.name,
      externalId: documents.externalId,
      previewUrl: documents.previewUrl,
      downloadUrl: documents.documentUrl,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(templates, eq(documents.templateId, templates.id))
    .innerJoin(projects, eq(documents.projectId, projects.id))
    .where(eq(projects.slug, params.slug))
    .orderBy(desc(documents.createdAt));

  return (
    <div>
      {!data?.length ? (
        <Card className="w-full my-8 rounded-xl flex flex-col items-center justify-center p-40">
          <FileScanIcon
            strokeWidth={1.5}
            className="mb-4 h-12 w-12 text-muted-foreground"
          />
          <p className="max-w-sm text-muted-foreground text-center">
            No documents have been generated for this project yet.
          </p>
        </Card>
      ) : null}

      {data?.length ? (
        <Card className="rounded-2xl my-8">
          {data.map((document, idx) => (
            <DocumentCard key={document.id} document={document} idx={idx} />
          ))}
        </Card>
      ) : null}
    </div>
  );
}
