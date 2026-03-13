ALTER TABLE "accounts" ADD COLUMN "fullName" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "phoneNumber" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "businessName" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "businessRegistrationNumber" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "taxId" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "postalCode" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "tradeRole" "TradeRole";--> statement-breakpoint

UPDATE "accounts"
SET
	"fullName" = br."fullName",
	"email" = br."email",
	"phoneNumber" = br."phoneNumber",
	"country" = br."country",
	"businessName" = br."businessName",
	"businessRegistrationNumber" = br."businessRegistrationNumber",
	"taxId" = br."taxId",
	"address" = br."address",
	"postalCode" = br."postalCode",
	"city" = br."city",
	"tradeRole" = br."tradeRole",
	"updatedAt" = GREATEST("accounts"."updatedAt", br."updatedAt")
FROM "business_registrations" br
WHERE br."accountId" = "accounts"."id";--> statement-breakpoint

DROP TABLE "business_registrations";--> statement-breakpoint