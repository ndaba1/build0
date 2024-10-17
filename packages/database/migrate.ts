import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./src/client";

async function main() {
  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: "./migrations" });
}

main();
