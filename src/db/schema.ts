import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core";

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departDate: text("depart_date"),
  returnDate: text("return_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id")
    .notNull()
    .references(() => searches.id, { onDelete: "cascade" }),
  airline: text("airline").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  stops: integer("stops").notNull().default(0),
  price: doublePrecision("price"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const legs = pgTable("legs", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id")
    .notNull()
    .references(() => routes.id, { onDelete: "cascade" }),
  legOrder: integer("leg_order").notNull().default(1),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  flightNumber: text("flight_number"),
  departTime: text("depart_time"),
  arriveTime: text("arrive_time"),
  availability: text("availability").notNull().default("unknown"),
  notes: text("notes"),
});
