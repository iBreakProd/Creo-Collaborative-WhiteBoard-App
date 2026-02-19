CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serialNumber" serial NOT NULL,
	"content" text NOT NULL,
	"userId" uuid NOT NULL,
	"roomId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "draw" (
	"id" text PRIMARY KEY NOT NULL,
	"shape" "shape" NOT NULL,
	"strokeStyle" text NOT NULL,
	"fillStyle" text NOT NULL,
	"lineWidth" integer NOT NULL,
	"font" text,
	"fontSize" text,
	"startX" integer,
	"startY" integer,
	"endX" integer,
	"endY" integer,
	"text" text,
	"points" json,
	"roomId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_participants" (
	"roomId" uuid NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"joinCode" text NOT NULL,
	"adminId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "room_joinCode_unique" UNIQUE("joinCode")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DROP TABLE "Chat" CASCADE;--> statement-breakpoint
DROP TABLE "Draw" CASCADE;--> statement-breakpoint
DROP TABLE "_participants" CASCADE;--> statement-breakpoint
DROP TABLE "Room" CASCADE;--> statement-breakpoint
DROP TABLE "User" CASCADE;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draw" ADD CONSTRAINT "draw_roomId_room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_roomId_room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room" ADD CONSTRAINT "room_adminId_user_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;