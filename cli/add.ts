import "dotenv/config";
import { db } from "../src/db/client";
import { searches, routes, legs } from "../src/db/schema";
import { eq } from "drizzle-orm";

const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`Usage: npx tsx cli/add.ts <command> [options]

Commands:
  search  --name <name> --origin <code> --destination <code> [--depart <date>] [--return <date>] [--notes <text>]
  route   --search-id <id> --airline <name> --origin <code> --destination <code> [--stops <n>] [--price <amount>] [--notes <text>]
  leg     --route-id <id> --origin <code> --destination <code> [--order <n>] [--flight <num>] [--depart <time>] [--arrive <time>] [--availability <green|yellow|red|unknown>] [--notes <text>]
  import  --file <path.json>
  list    [searches|routes --search-id <id>|legs --route-id <id>]
`);
  process.exit(1);
}

function getFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function requireFlag(flag: string, label: string): string {
  const val = getFlag(flag);
  if (!val) {
    console.error(`Error: ${label} is required (${flag})`);
    process.exit(1);
  }
  return val;
}

async function main() {
  if (!command) usage();

  switch (command) {
    case "search": {
      const name = requireFlag("--name", "name");
      const origin = requireFlag("--origin", "origin");
      const destination = requireFlag("--destination", "destination");
      const result = await db.insert(searches).values({
        name,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departDate: getFlag("--depart"),
        returnDate: getFlag("--return"),
        notes: getFlag("--notes"),
      }).returning();
      console.log(`Created search ID: ${result[0].id}`);
      break;
    }

    case "route": {
      const searchId = parseInt(requireFlag("--search-id", "search ID"));
      const airline = requireFlag("--airline", "airline");
      const origin = requireFlag("--origin", "origin");
      const destination = requireFlag("--destination", "destination");
      const stops = getFlag("--stops");
      const price = getFlag("--price");
      const result = await db.insert(routes).values({
        searchId,
        airline,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        stops: stops ? parseInt(stops) : 0,
        price: price ? parseFloat(price) : null,
        notes: getFlag("--notes"),
      }).returning();
      console.log(`Created route ID: ${result[0].id}`);
      break;
    }

    case "leg": {
      const routeId = parseInt(requireFlag("--route-id", "route ID"));
      const origin = requireFlag("--origin", "origin");
      const destination = requireFlag("--destination", "destination");
      const order = getFlag("--order");
      const availability = getFlag("--availability") || "unknown";
      if (!["green", "yellow", "red", "unknown"].includes(availability)) {
        console.error("Error: availability must be green, yellow, red, or unknown");
        process.exit(1);
      }
      const result = await db.insert(legs).values({
        routeId,
        legOrder: order ? parseInt(order) : 1,
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        flightNumber: getFlag("--flight"),
        departTime: getFlag("--depart"),
        arriveTime: getFlag("--arrive"),
        availability,
        notes: getFlag("--notes"),
      }).returning();
      console.log(`Created leg ID: ${result[0].id}`);
      break;
    }

    case "import": {
      const file = requireFlag("--file", "file path");
      const fs = await import("fs");
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));

      if (data.searches) {
        for (const s of data.searches) {
          const [search] = await db.insert(searches).values({
            name: s.name,
            origin: s.origin,
            destination: s.destination,
            departDate: s.departDate,
            returnDate: s.returnDate,
            notes: s.notes,
          }).returning();
          console.log(`Created search ID: ${search.id}`);

          if (s.routes) {
            for (const r of s.routes) {
              const [route] = await db.insert(routes).values({
                searchId: search.id,
                airline: r.airline,
                origin: r.origin,
                destination: r.destination,
                stops: r.stops ?? 0,
                price: r.price,
                notes: r.notes,
              }).returning();
              console.log(`  Created route ID: ${route.id}`);

              if (r.legs) {
                for (const l of r.legs) {
                  const [leg] = await db.insert(legs).values({
                    routeId: route.id,
                    legOrder: l.legOrder ?? 1,
                    origin: l.origin,
                    destination: l.destination,
                    flightNumber: l.flightNumber,
                    departTime: l.departTime,
                    arriveTime: l.arriveTime,
                    availability: l.availability ?? "unknown",
                    notes: l.notes,
                  }).returning();
                  console.log(`    Created leg ID: ${leg.id}`);
                }
              }
            }
          }
        }
      }
      break;
    }

    case "list": {
      const sub = args[1] || "searches";
      if (sub === "searches") {
        const all = await db.select().from(searches);
        for (const s of all) {
          console.log(`[${s.id}] ${s.name} — ${s.origin} → ${s.destination} (${s.departDate || "no date"})`);
        }
        if (all.length === 0) console.log("No searches found.");
      } else if (sub === "routes") {
        const searchId = parseInt(requireFlag("--search-id", "search ID"));
        const all = await db.select().from(routes).where(eq(routes.searchId, searchId));
        for (const r of all) {
          console.log(`[${r.id}] ${r.airline} ${r.origin}→${r.destination} ${r.stops} stops $${r.price ?? "?"}`);
        }
        if (all.length === 0) console.log("No routes found.");
      } else if (sub === "legs") {
        const routeId = parseInt(requireFlag("--route-id", "route ID"));
        const all = await db.select().from(legs).where(eq(legs.routeId, routeId));
        for (const l of all) {
          console.log(`[${l.id}] #${l.legOrder} ${l.origin}→${l.destination} ${l.flightNumber || ""} ${l.availability}`);
        }
        if (all.length === 0) console.log("No legs found.");
      } else {
        console.error(`Unknown list type: ${sub}`);
        usage();
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      usage();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
