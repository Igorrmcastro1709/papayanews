CREATE TABLE `signup_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`verification_code` varchar(6) NOT NULL,
	`verified` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `signup_requests_id` PRIMARY KEY(`id`)
);
