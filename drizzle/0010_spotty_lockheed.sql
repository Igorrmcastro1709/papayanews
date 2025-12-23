CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`message` text NOT NULL,
	`is_ai_response` int NOT NULL DEFAULT 0,
	`reply_to_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
