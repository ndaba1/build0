import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { jobs } from "./jobs.sql";
import { templates } from "./templates.sql";

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id),
    templateVersion: integer("template_version").notNull(),
    templateVariables: jsonb("template_variables").notNull(),
    s3Key: text("s3_key").notNull(),
    document_url: text("url").notNull(),
    preview_url: text("preview_url"),
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
    isDeleted: boolean("is_deleted").notNull().default(false),
  },
  (t) => ({
    jobIdIndex: index("job_id_idx").on(t.jobId),
    s3KeyIndex: index("s3_key_idx").on(t.s3Key),
    documentKeyIndex: index("document_key_idx").on(t.s3Key),
    templateIdIndex: index("doc_template_id_idx").on(t.templateId),
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
  isDeleted: true,
});
