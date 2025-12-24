CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`total_referrals` int NOT NULL DEFAULT 0,
	`total_points_earned` int NOT NULL DEFAULT 0,
	`is_active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrer_id` int NOT NULL,
	`referred_id` int NOT NULL,
	`referral_code_id` int NOT NULL,
	`referrer_points_earned` int NOT NULL DEFAULT 500,
	`referred_points_earned` int NOT NULL DEFAULT 200,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_history_id` PRIMARY KEY(`id`)
);
