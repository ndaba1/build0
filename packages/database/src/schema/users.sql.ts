import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { projectUsers } from "./projects.sql";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    avatar: text("avatar"),
    name: text("name").notNull(),
    sub: text("sub").notNull(),
    email: text("email").notNull().unique(),
    isMachine: boolean("is_machine").default(false),

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
    subIdx: index("sub_idx").on(t.sub),
    emailIdx: index("email_idx").on(t.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projectUsers),
}));


export type User = typeof users.$inferSelect;