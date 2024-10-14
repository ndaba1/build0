import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { templates } from "@repo/database/schema";
import { TemplateEditor } from ".";

export default async function Editor({ params }: { params: { id: string } }) {
  const results = await db
    .select()
    .from(templates)
    .where(eq(templates.id, params.id));
  const template = results[0];

  return <TemplateEditor template={template} />;
}
