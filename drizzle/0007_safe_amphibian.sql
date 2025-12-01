CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('badge','comment_reply','event_reminder','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` int NOT NULL DEFAULT 0,
	`link` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
