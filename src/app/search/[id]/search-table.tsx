"use client";

import { Fragment, useState, useMemo } from "react";

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
  createdAt: string | Date;
  legs: Leg[];
};

type SortKey = "price" | "stops" | "availability" | null;
type SortDir = "asc" | "desc";

const AVAILABILITY_DOT: Record<string, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
  unknown: "⚪",
};

function availabilityScore(legs: Leg[]): number {
  let score = 0;
  for (const leg of legs) {
    if (leg.availability === "red") score += 200;
    else if (leg.availability === "yellow") score += 50;
  }
  return score;
}

function computeScore(route: Route): number {
  const price = route.price ?? 0;
  const stopsPenalty = route.stops * 50;
  const avail = availabilityScore(route.legs);
  return price + stopsPenalty + avail;
}

export function SearchTable({ routes }: { routes: Route[] }) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scores = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of routes) map.set(r.id, computeScore(r));
    return map;
  }, [routes]);

  const bestId = useMemo(() => {
    if (routes.length === 0) return null;
    let best = routes[0];
    let bestScore = scores.get(best.id) ?? Infinity;
    for (const r of routes) {
      const s = scores.get(r.id) ?? Infinity;
      if (s < bestScore) {
        best = r;
        bestScore = s;
      }
    }
    return best.id;
  }, [routes, scores]);

  const sorted = useMemo(() => {
    const arr = [...routes];
    if (!sortKey) return arr;
    arr.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "price":
          av = a.price ?? Infinity;
          bv = b.price ?? Infinity;
          break;
        case "stops":
          av = a.stops;
          bv = b.stops;
          break;
        case "availability":
          av = availabilityScore(a.legs);
          bv = availabilityScore(b.legs);
          break;
        default:
          return 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [routes, sortKey, sortDir]);

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  if (routes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        No routes found for this search.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-left text-gray-400">
            <th className="py-3 px-3 font-medium">Origin</th>
            <th className="py-3 px-3 font-medium">Airline</th>
            <th className="py-3 px-3 font-medium">Route</th>
            <th
              className="py-3 px-3 font-medium cursor-pointer hover:text-gray-200 select-none"
              onClick={() => toggleSort("stops")}
            >
              Stops{sortArrow("stops")}
            </th>
            <th
              className="py-3 px-3 font-medium cursor-pointer hover:text-gray-200 select-none"
              onClick={() => toggleSort("availability")}
            >
              Availability{sortArrow("availability")}
            </th>
            <th
              className="py-3 px-3 font-medium cursor-pointer hover:text-gray-200 select-none"
              onClick={() => toggleSort("price")}
            >
              Price{sortArrow("price")}
            </th>
            <th className="py-3 px-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((route) => {
            const isExpanded = expanded.has(route.id);
            const isBest = route.id === bestId;
            return (
              <Fragment key={route.id}>
                <tr
                  className={`border-b border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-900 ${
                    isBest ? "bg-yellow-950/30" : ""
                  }`}
                  onClick={() => toggleExpand(route.id)}
                >
                  <td className="py-3 px-3 font-mono">{route.origin}</td>
                  <td className="py-3 px-3">
                    {isBest && <span className="mr-1">⭐</span>}
                    {route.airline}
                    {isBest && (
                      <span className="ml-2 text-xs bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {route.origin} → {route.destination}
                  </td>
                  <td className="py-3 px-3">{route.stops}</td>
                  <td className="py-3 px-3">
                    {route.legs.length > 0
                      ? route.legs.map((l, i) => (
                          <span key={i} title={`${l.origin}→${l.destination}: ${l.availability}`}>
                            {AVAILABILITY_DOT[l.availability] || "⚪"}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className="py-3 px-3">
                    {route.price != null ? `$${route.price.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                    {route.notes || ""}
                  </td>
                </tr>
                {isExpanded && route.legs.length > 0 && (
                  <tr className="bg-gray-900/50">
                    <td colSpan={7} className="p-0">
                      <div className="px-6 py-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 text-left">
                              <th className="py-1 px-2">#</th>
                              <th className="py-1 px-2">Segment</th>
                              <th className="py-1 px-2">Flight</th>
                              <th className="py-1 px-2">Depart</th>
                              <th className="py-1 px-2">Arrive</th>
                              <th className="py-1 px-2">Availability</th>
                              <th className="py-1 px-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {route.legs.map((leg) => (
                              <tr key={leg.id} className="border-t border-gray-800/30">
                                <td className="py-1.5 px-2 text-gray-500">{leg.legOrder}</td>
                                <td className="py-1.5 px-2 font-mono">
                                  {leg.origin} → {leg.destination}
                                </td>
                                <td className="py-1.5 px-2">{leg.flightNumber || "—"}</td>
                                <td className="py-1.5 px-2">{leg.departTime || "—"}</td>
                                <td className="py-1.5 px-2">{leg.arriveTime || "—"}</td>
                                <td className="py-1.5 px-2">
                                  {AVAILABILITY_DOT[leg.availability] || "⚪"} {leg.availability}
                                </td>
                                <td className="py-1.5 px-2 text-gray-500">{leg.notes || ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

