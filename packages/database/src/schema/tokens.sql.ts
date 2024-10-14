import { createId } from "@paralleldrive/cuid2";
import {
    boolean,
    index,
    pgTable,
    text,
    timestamp
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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
