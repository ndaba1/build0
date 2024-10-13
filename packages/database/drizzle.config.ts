import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";

const cfg = Resource.BuildZeroDatabase;

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/schema.ts"],
  out: "./migrations",
  dbCredentials: {
    host: cfg.host,
    port: cfg.port,
    user: cfg.username,
    password: cfg.password,
    database: cfg.database,
  },
});
