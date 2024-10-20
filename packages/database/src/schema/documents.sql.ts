import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { jobs } from "./jobs.sql";
import { projects } from "./projects.sql";
import { templates } from "./templates.sql";

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id),
    externalId: text("external_id"),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),

    templateVersion: integer("template_version").notNull(),
    templateVariables: jsonb("template_variables").notNull(),

    s3Key: text("s3_key").notNull(),
    documentUrl: text("url").notNull(),
    previewUrl: text("preview_url"),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  },
  (t) => ({
    jobIdIndex: index("job_id_idx").on(t.jobId),
    s3KeyIndex: index("s3_key_idx").on(t.s3Key),
    documentKeyIndex: index("document_key_idx").on(t.s3Key),
    templateIdIndex: index("doc_template_id_idx").on(t.templateId),
    uniqueProjectExternalId: unique("unique_project_external_id").on(
      t.jobId,
      t.externalId
    ),
  })
);

export const documentsRelations = relations(documents, ({ one }) => ({
  job: one(jobs, {
    fields: [documents.jobId],
    references: [jobs.id],
  }),
  template: one(templates, {
    fields: [documents.templateId],
    references: [templates.id],
  }),
}));

export type TDocument = typeof documents.$inferSelect;

export const createDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
