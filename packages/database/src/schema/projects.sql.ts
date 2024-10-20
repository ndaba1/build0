import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users.sql";

export const userRoles = pgEnum("user_roles", ["MEMBER", "ADMIN"]);

export const projects = pgTable(
  "projects",
  {
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
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  },
  (t) => ({
    slugIdx: index("slug_idx").on(t.slug),
  })
);

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

export const projectUserStatus = pgEnum("project_user_status", [
  "PENDING",
  "ACTIVE",
  "DISABLED",
]);

export const projectUsers = pgTable(
  "project_users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    projectId: text("project_id").references(() => projects.id),
    userId: text("user_id").references(() => users.id),
    role: userRoles("user_role").notNull().default("MEMBER"),
    status: projectUserStatus("status").notNull().default("ACTIVE"),

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
    statusIdx: index("project_user_status_idx").on(t.status),
    projectUserIdx: index("project_user_idx").on(t.projectId, t.userId),
  })
);

export const projectUsersRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}));

export const projectRelations = relations(projects, ({ many }) => ({
  users: many(projectUsers),
}));
