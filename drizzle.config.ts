import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.FLIGHTS_DB_URL!,
    authToken: process.env.FLIGHTS_DB_AUTH_TOKEN,
  },
} satisfies Config;
