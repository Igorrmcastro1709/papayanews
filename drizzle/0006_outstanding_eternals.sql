CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`subscribed` int NOT NULL DEFAULT 1,
	`subscribed_at` timestamp NOT NULL DEFAULT (now()),
	`unsubscribed_at` timestamp,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `newsletters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('draft','scheduled','sent') NOT NULL DEFAULT 'draft',
	`scheduled_for` timestamp,
	`sent_at` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletters_id` PRIMARY KEY(`id`)
);
