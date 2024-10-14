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
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const documentFormats = pgEnum("document_formats", ["PDF"]);

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
    documentFormat: documentFormats(),
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
