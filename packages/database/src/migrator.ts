import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./client";

export const handler = async (event: any) => {
  await migrate(db, { migrationsFolder: "./migrations" });
};
