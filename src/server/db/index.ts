import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var _db: ReturnType<typeof drizzle> | undefined;
}

const db =
  global._db ||
  drizzle(new Pool({ connectionString: process.env.NEON_DATABASE_URL }), {
    schema,
  });

if (process.env.NODE_ENV === "development") {
  global._db = db;
}

export { db };
