import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const url = process.env.FLIGHTS_DB_URL;
    if (!url) throw new Error("FLIGHTS_DB_URL is required");
    const client = postgres(url);
    _db = drizzle(client, { schema });
  }
  return _db;
}

// Convenience: lazy proxy so consumers can import { db }
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    return Reflect.get(real, prop, receiver);
  },
});
