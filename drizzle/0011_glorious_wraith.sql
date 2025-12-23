CREATE TABLE `chat_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`file_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`summary_date` timestamp NOT NULL,
	`content` text NOT NULL,
	`news_count` int NOT NULL DEFAULT 0,
	`messages_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_summaries_id` PRIMARY KEY(`id`)
);
