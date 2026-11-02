ALTER TABLE `budgets` ADD `month` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `budgets_month_unique` ON `budgets` (`month`);