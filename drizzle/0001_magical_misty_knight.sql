ALTER TABLE `board_updates` ADD `translations` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_board_updates_active_section` ON `board_updates` (`active`,`section`);