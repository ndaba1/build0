import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

const cfg = Resource.BuildZeroDatabase;

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/schema/*.sql.ts"],
  out: "./migrations",
  dbCredentials: {
    host: cfg.host,
    port: cfg.port,
    user: cfg.username,
    password: cfg.password,
    database: cfg.database,
  },
});
