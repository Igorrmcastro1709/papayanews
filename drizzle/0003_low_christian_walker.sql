CREATE TABLE `content_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_id` int NOT NULL,
	`user_id` int,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`user_id` int,
	`viewed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_views_id` PRIMARY KEY(`id`)
);
