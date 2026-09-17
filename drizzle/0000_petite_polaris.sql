CREATE TABLE `board_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '' NOT NULL,
	`image_url` text,
	`image_key` text,
	`updated_by` text DEFAULT 'Discord' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL
);
