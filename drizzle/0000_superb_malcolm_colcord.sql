CREATE TABLE `legs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_id` integer NOT NULL,
	`leg_order` integer DEFAULT 1 NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`flight_number` text,
	`depart_time` text,
	`arrive_time` text,
	`availability` text DEFAULT 'unknown' NOT NULL,
	`notes` text,
	FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`search_id` integer NOT NULL,
	`airline` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`stops` integer DEFAULT 0 NOT NULL,
	`price` real,
	`notes` text,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL,
	FOREIGN KEY (`search_id`) REFERENCES `searches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`depart_date` text,
	`return_date` text,
	`notes` text,
	`created_at` text DEFAULT '(datetime(''now''))' NOT NULL
);
