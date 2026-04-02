import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const searches = sqliteTable("searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departDate: text("depart_date"),
  returnDate: text("return_date"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  searchId: integer("search_id")
    .notNull()
    .references(() => searches.id, { onDelete: "cascade" }),
  airline: text("airline").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  stops: integer("stops").notNull().default(0),
  price: real("price"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const legs = sqliteTable("legs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
