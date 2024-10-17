import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.sql";

export const userRoles = pgEnum("user_roles", ["MEMBER", "ADMIN"]);

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  usage: integer("usage").default(0),
  usageLimit: integer("usage_limit").default(500),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const createProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const getProjectSchema = createSelectSchema(projects, {
  createdAt: z.string(),
  updatedAt: z.string(),
}).omit({
  id: true,
});

export const listProjectSchema = getProjectSchema.array();

export const projectUsers = pgTable("project_users", {
  projectId: text("project_id").references(() => projects.id),
  userId: text("user_id").references(() => users.id),
  role: userRoles("user_role").default("MEMBER"),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdate(() => new Date()),
});

export const projectRelations = relations(projects, ({ many }) => ({
  users: many(projectUsers),
}));
