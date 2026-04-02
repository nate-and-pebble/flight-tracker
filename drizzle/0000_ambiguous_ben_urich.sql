CREATE TABLE "legs" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_id" integer NOT NULL,
	"leg_order" integer DEFAULT 1 NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"flight_number" text,
	"depart_time" text,
	"arrive_time" text,
	"availability" text DEFAULT 'unknown' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" integer NOT NULL,
	"airline" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"stops" integer DEFAULT 0 NOT NULL,
	"price" double precision,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"depart_date" text,
	"return_date" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "legs" ADD CONSTRAINT "legs_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE cascade ON UPDATE no action;