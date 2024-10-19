import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projects } from "./projects.sql";

export const documentFormats = pgEnum("document_formats", ["PDF", "IMAGE"]);

export const variables = pgTable("variables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  description: text("description"),
  value: text("value").notNull(),
  secret: boolean("secret").default(false),
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
});

export const documentTypes = pgTable(
  "document_types",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    description: text("description"),
    s3PathPrefix: text("s3_path_prefix").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
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
    uniqueProjectDocType: unique("unique_project_doc_type").on(
      t.projectId,
      t.name
    ),
    nameIndex: index("document_type_name_index").on(t.name),
    projectIndex: index("document_type_project_idx").on(t.projectId),
  })
);

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
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
    payloadSchema: jsonb("payload_schema").notNull(),
    previewPayload: jsonb("preview_payload"),
    description: text("description"),
    documentFormat: documentFormats("document_format").default("PDF"),
    documentTypeId: text("document_type_id")
      .notNull()
      .references(() => documentTypes.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
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
    functionDefinition: text("function_definition").notNull(), // js code (generated),
    rawFunctionDefinition: text("raw_function_definition").notNull(), // ts code (editable)
    s3PathPrefix: text("s3_path_prefix"),
    lastGeneratedAt: timestamp("last_generated_at", {
      mode: "date",
      withTimezone: true,
    }),
    generationCount: integer("generation_count").notNull().default(0),
  },
  (t) => ({
    nameIndex: index("name_index").on(t.name),
    uniqueProjectTemplate: unique("unique_project_template").on(
      t.projectId,
      t.name
    ),
    projectIndex: index("template_project_idx").on(t.projectId),
    documentTypeIndex: index("template_doc_type_idx").on(t.documentTypeId),
  })
);

export type Template = typeof templates.$inferSelect;

export const getTemplateSchema = createSelectSchema(templates, {
  createdAt: z.string(),
  updatedAt: z.string(),
  payloadSchema: z.record(z.string(), z.any()),
}).extend({
  documentType: getDocumentTypeSchema,
});

export const listTemplateSchema = getTemplateSchema.array();
export const createTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const patchTemplateSchema = createInsertSchema(templates)
  .partial()
  .omit({
    id: true,
    name: true,
    documentFormat: true,
    lastGeneratedAt: true,
    generationCount: true,
    createdAt: true,
    updatedAt: true,
  });

export const templateRelations = relations(templates, ({ one }) => ({
  documentType: one(documentTypes, {
    fields: [templates.documentTypeId],
    references: [documentTypes.id],
  }),
}));
