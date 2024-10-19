import { and, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projects, templates } from "@repo/database/schema";
import { TemplateEditor } from ".";

export default async function Editor({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const [{ templates: template }] = await db
    .select()
    .from(templates)
    .innerJoin(projects, eq(templates.projectId, projects.id))
    .where(and(eq(templates.id, params.id), eq(projects.slug, params.slug)));

  return <TemplateEditor template={template} />;
}
