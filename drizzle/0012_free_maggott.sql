CREATE TABLE `user_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requester_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`avatar_url` varchar(500),
	`avatar_key` varchar(500),
	`bio` text,
	`headline` varchar(255),
	`company` varchar(255),
	`position` varchar(255),
	`location` varchar(255),
	`linkedin_url` varchar(500),
	`github_url` varchar(500),
	`website_url` varchar(500),
	`interests` text,
	`is_public` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
