import { db } from "@/db/client";
import { searches } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let allSearches: { id: number; name: string; origin: string; destination: string; departDate: string | null }[] = [];
  try {
    allSearches = await db.select().from(searches);
  } catch {
    // DB not configured yet
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Flight Tracker</h1>
        <p className="text-gray-400 mb-8">
          Track flight availability and pricing across routes.
        </p>

        {allSearches.length === 0 ? (
          <p className="text-gray-500">
            No searches yet. Use the CLI to add one:
            <code className="block mt-2 bg-gray-900 p-3 rounded text-sm text-gray-300">
              npx tsx cli/add.ts search --name &quot;Summer Trip&quot; --origin DEN --destination NRT
            </code>
          </p>
        ) : (
          <ul className="space-y-2">
            {allSearches.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/search/${s.id}`}
                  className="block p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-400 ml-3 text-sm">
                    {s.origin} → {s.destination}
                    {s.departDate && ` · ${s.departDate}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
