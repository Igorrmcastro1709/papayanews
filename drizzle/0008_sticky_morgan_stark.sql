CREATE TABLE `forum_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thread_id` int NOT NULL,
	`user_id` int NOT NULL,
	`content` text NOT NULL,
	`upvotes` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`upvotes` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_upvotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`thread_id` int,
	`reply_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forum_upvotes_id` PRIMARY KEY(`id`)
);
