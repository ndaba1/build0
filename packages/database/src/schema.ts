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
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const variables = pgTable("variables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  description: text("description"),
  value: text("value").notNull(),
  secret: boolean("secret").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const documentTypes = pgTable("document_types", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  description: text("description"),
  s3PathPrefix: text("s3_path_prefix").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

export const getDocumentTypeSchema = createSelectSchema(documentTypes, {
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const listDocumentTypeSchema = getDocumentTypeSchema.array();
export const createDocumentTypeSchema = createInsertSchema(documentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export const templates = pgTable(
  "templates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull().unique(),
    isActive: boolean("is_active").notNull().default(false),
    version: integer("version").notNull().default(1),
    payloadSchema: jsonb("payload_schema").notNull(),
    description: text("description"),
    documentTypeId: text("document_type_id")
      .notNull()
      .references(() => documentTypes.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).$onUpdate(() => new Date()),
    functionDefinition: text("function_definition").notNull(), // js code (generated),
    rawFunctionDefinition: text("raw_function_definition").notNull(), // ts code (editable)
    s3PathPrefix: text("s3_path_prefix"),
    lastGeneratedAt: timestamp("last_generated_at", {
      mode: "date",
      withTimezone: true,
    }),
    previewUrl: text("preview_url"),
    generationCount: integer("generation_count").notNull().default(0),
  },
  (t) => ({
    nameIndex: index("name_index").on(t.name),
    documentTypeIndex: index("template_doc_type_idx").on(t.documentTypeId),
  })
);

export type Template = typeof templates.$inferSelect;

export const getTemplateSchema = createSelectSchema(templates, {
  createdAt: z.string(),
  updatedAt: z.string(),
  payloadSchema: z.record(z.string(), z.any()),
});
export const listTemplateSchema = getTemplateSchema.array();
export const createTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const templateRelations = relations(templates, ({ one }) => ({
  documentType: one(documentTypes, {
    fields: [templates.documentTypeId],
    references: [documentTypes.id],
  }),
}));

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

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id),
    templateVersion: integer("template_version").notNull(),
    templateVariables: jsonb("template_variables").notNull(),
    s3Key: text("s3_key").notNull(),
    document_url: text("url").notNull(),
    preview_url: text("preview_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).$onUpdate(() => new Date()),
    isDeleted: boolean("is_deleted").notNull().default(false),
  },
  (t) => ({
    templateIdIndex: index("doc_template_id_idx").on(t.templateId),
  })
);

export type TDocument = typeof documents.$inferSelect;

export const createDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export const tokens = pgTable(
  "tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    hashedKey: text("hashed_key").notNull(),
    partialKey: text("partial_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    isRevoked: boolean("is_revoked").notNull().default(false),
  },
  (t) => ({
    hashedKeyIndex: index("hashed_key_index").on(t.hashedKey),
    expiresAtIndex: index("expires_at_index").on(t.expiresAt),
  })
);

export const createTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
  isRevoked: true,
});

export const getTokenSchema = createSelectSchema(tokens, {
  createdAt: z.string(),
  expiresAt: z.string(),
}).omit({
  hashedKey: true,
});

export const listTokenSchema = getTokenSchema.array();
