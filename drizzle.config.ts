import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Local development reads the Neon dev-branch URL from .env.development.local
// (gitignored). In CI/production NEON_DATABASE_URL is already in the environment
// and these files are absent, so these calls are a no-op there.
config({ path: ".env.development.local" });
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL || "",
  },
});
