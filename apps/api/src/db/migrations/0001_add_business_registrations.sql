CREATE TYPE "public"."TradeRole" AS ENUM('IMPORTER', 'EXPORTER', 'FREIGHT_FORWARDER', 'CUSTOMS_BROKER', 'MANUFACTURER', 'DISTRIBUTOR', 'TRADER');--> statement-breakpoint
CREATE TABLE "business_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accountId" uuid NOT NULL,
	"fullName" text NOT NULL,
	"email" text NOT NULL,
	"phoneNumber" text NOT NULL,
	"country" text NOT NULL,
	"businessName" text NOT NULL,
	"businessRegistrationNumber" text NOT NULL,
	"taxId" text NOT NULL,
	"address" text NOT NULL,
	"postalCode" text NOT NULL,
	"city" text NOT NULL,
	"tradeRole" "TradeRole" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_registrations_accountId_unique" UNIQUE("accountId")
);
--> statement-breakpoint
ALTER TABLE "business_registrations" ADD CONSTRAINT "business_registrations_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_unique" UNIQUE("userId");