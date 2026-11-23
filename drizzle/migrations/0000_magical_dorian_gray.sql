CREATE TABLE `ac_units` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`location_id` text NOT NULL,
	`zone_id` text NOT NULL,
	`asset_tag` text NOT NULL,
	`brand` text NOT NULL,
	`model_number` text,
	`serial_number` text,
	`ac_type` text DEFAULT 'split_wall' NOT NULL,
	`capacity_pk` real DEFAULT 1 NOT NULL,
	`refrigerant_type` text DEFAULT 'R32',
	`installation_date` integer,
	`last_service_date` integer,
	`next_service_due_date` integer,
	`service_interval_months` integer DEFAULT 3 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ac_units_asset_tag_unique` ON `ac_units` (`asset_tag`);--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pic_name` text NOT NULL,
	`pic_phone` text NOT NULL,
	`pic_email` text,
	`default_service_interval_months` integer DEFAULT 3 NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_number` text NOT NULL,
	`service_order_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`subtotal` integer NOT NULL,
	`tax_amount` integer DEFAULT 0 NOT NULL,
	`total_amount` integer NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`pdf_url` text,
	`sent_at` integer,
	`paid_at` integer,
	`due_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text,
	`pic_name` text,
	`pic_phone` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `service_evidences` (
	`id` text PRIMARY KEY NOT NULL,
	`service_item_id` text NOT NULL,
	`evidence_type` text NOT NULL,
	`photo_url` text NOT NULL,
	`caption` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`service_item_id`) REFERENCES `service_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `service_items` (
	`id` text PRIMARY KEY NOT NULL,
	`service_order_id` text NOT NULL,
	`ac_unit_id` text NOT NULL,
	`action_type` text DEFAULT 'routine_wash' NOT NULL,
	`notes` text,
	`before_pressure_psi` real,
	`after_pressure_psi` real,
	`before_ampere` real,
	`after_ampere` real,
	`before_temp_c` real,
	`after_temp_c` real,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`labor_cost` integer DEFAULT 0,
	`parts_cost` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`service_order_id`) REFERENCES `service_orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ac_unit_id`) REFERENCES `ac_units`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `service_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_id` text NOT NULL,
	`location_id` text NOT NULL,
	`technician_id` text,
	`scheduled_date` integer NOT NULL,
	`status` text DEFAULT 'SCHEDULED' NOT NULL,
	`check_in_at` integer,
	`completed_at` integer,
	`customer_pic_signature_url` text,
	`customer_pic_signer_name` text,
	`rating` integer,
	`feedback` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`technician_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_orders_order_number_unique` ON `service_orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'technician' NOT NULL,
	`phone` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `whatsapp_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`recipient_phone` text NOT NULL,
	`message_type` text NOT NULL,
	`provider` text NOT NULL,
	`payload` text,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`error_message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` text PRIMARY KEY NOT NULL,
	`location_id` text NOT NULL,
	`name` text NOT NULL,
	`floor` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
