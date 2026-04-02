import { db } from "@/db/client";
import { searches, routes, legs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchId = parseInt(id);
  if (isNaN(searchId)) {
    return NextResponse.json({ error: "Invalid search ID" }, { status: 400 });
  }

  const search = await db
    .select()
    .from(searches)
    .where(eq(searches.id, searchId))
    .then((r) => r[0]);

  if (!search) {
    return NextResponse.json({ error: "Search not found" }, { status: 404 });
  }

  const allRoutes = await db
    .select()
    .from(routes)
    .where(eq(routes.searchId, searchId));

  const routesWithLegs = await Promise.all(
    allRoutes.map(async (route) => {
      const routeLegs = await db
        .select()
        .from(legs)
        .where(eq(legs.routeId, route.id));
      return { ...route, legs: routeLegs.sort((a, b) => a.legOrder - b.legOrder) };
    })
  );

  return NextResponse.json({ search, routes: routesWithLegs });
}
