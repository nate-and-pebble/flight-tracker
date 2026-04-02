import { db } from "@/db/client";
import { searches, routes, legs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SearchTable } from "./search-table";

export const dynamic = "force-dynamic";

type Leg = {
  id: number;
  routeId: number;
  legOrder: number;
  origin: string;
  destination: string;
  flightNumber: string | null;
  departTime: string | null;
  arriveTime: string | null;
  availability: string;
  notes: string | null;
};

type Route = {
  id: number;
  searchId: number;
  airline: string;
  origin: string;
  destination: string;
  stops: number;
  price: number | null;
  notes: string | null;
  createdAt: string;
  legs: Leg[];
};

export default async function SearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const searchId = parseInt(id);
  if (isNaN(searchId)) notFound();

  const search = await db
    .select()
    .from(searches)
    .where(eq(searches.id, searchId))
    .then((r) => r[0]);

  if (!search) notFound();

  const allRoutes = await db
    .select()
    .from(routes)
    .where(eq(routes.searchId, searchId));

  const routesWithLegs: Route[] = await Promise.all(
    allRoutes.map(async (route) => {
      const routeLegs = await db
        .select()
        .from(legs)
        .where(eq(legs.routeId, route.id));
      return {
        ...route,
        legs: routeLegs.sort((a, b) => a.legOrder - b.legOrder),
      };
    })
  );

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{search.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {search.origin} → {search.destination}
            {search.departDate && ` · ${search.departDate}`}
            {search.returnDate && ` – ${search.returnDate}`}
          </p>
          {search.notes && (
            <p className="text-gray-500 text-sm mt-1">{search.notes}</p>
          )}
        </div>
        <SearchTable routes={routesWithLegs} />
      </div>
    </main>
  );
}
