import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projects } from "./projects.sql";
import { users } from "./users.sql";

export const tokens = pgTable(
  "tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    hashedKey: text("hashed_key").notNull().unique(),
    partialKey: text("partial_key").notNull(),
    isRevoked: boolean("is_revoked").notNull().default(false),

    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    scopes: text("scopes"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (t) => ({
    userIdIndex: index("user_id_index").on(t.userId),
    projectIdIndex: index("project_id_index").on(t.projectId),
    hashedKeyIndex: index("hashed_key_index").on(t.hashedKey),
    expiresAtIndex: index("expires_at_index").on(t.expiresAt),
  })
);

export const createTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
  isRevoked: true,
  hashedKey: true,
  partialKey: true,
  userId: true,
});

export const getTokenSchema = createSelectSchema(tokens, {
  createdAt: z.string(),
  expiresAt: z.string(),
}).omit({
  hashedKey: true,
});

export const listTokenSchema = getTokenSchema.array();

export const tokenRelations = relations(tokens, ({ one, many }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tokens.projectId],
    references: [projects.id],
  }),
}));

export type DbToken = typeof tokens.$inferSelect;
