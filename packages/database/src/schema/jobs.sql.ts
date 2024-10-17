import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { documentFormats, getTemplateSchema, templates } from "./templates.sql";

export const jobs = pgTable(
  "jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id),
    templateVersion: integer("template_version").notNull(),
    documentId: text("document_id"),
    targetFormat: documentFormats("target_format").default("PDF"),
    templateVariables: jsonb("template_variables").notNull(),
    status: text("status").notNull().default("PENDING"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    retries: integer("retries").notNull().default(0),
    errorMessage: text("error_message"),
  },
  (t) => ({
    templateIdIndex: index("job_template_id_idx").on(t.templateId),
  })
);

export type Job = typeof jobs.$inferSelect;

export const jobRelations = relations(jobs, ({ one }) => ({
  template: one(templates, {
    fields: [jobs.templateId],
    references: [templates.id],
  }),
}));

export const createJobSchema = createInsertSchema(jobs).omit({
  id: true,
  startedAt: true,
  endedAt: true,
  retries: true,
  errorMessage: true,
});

export const getJobSchema = createSelectSchema(jobs, {
  startedAt: z.string(),
  endedAt: z.string(),
})
  .omit({
    templateVariables: true,
  })
  .extend({
    template: getTemplateSchema,
  });

export const listJobsSchema = getJobSchema.array();
