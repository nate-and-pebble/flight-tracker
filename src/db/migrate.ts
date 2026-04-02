import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  const client = createClient({
    url: process.env.FLIGHTS_DB_URL!,
    authToken: process.env.FLIGHTS_DB_AUTH_TOKEN,
  });
  const db = drizzle(client);
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
