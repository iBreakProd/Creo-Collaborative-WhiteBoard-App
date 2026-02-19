CREATE TYPE "public"."shape" AS ENUM('rectangle', 'diamond', 'circle', 'line', 'arrow', 'text', 'freeHand');--> statement-breakpoint
CREATE TABLE "Chat" (
	"id" text PRIMARY KEY NOT NULL,
	"serialNumber" integer GENERATED ALWAYS AS IDENTITY (sequence name "Chat_serialNumber_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"content" text NOT NULL,
	"userId" text NOT NULL,
	"roomId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Draw" (
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
	"points" jsonb,
	"roomId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_participants" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Room" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"joinCode" text NOT NULL,
	"adminId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Room_joinCode_unique" UNIQUE("joinCode")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_A_Room_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Room"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_participants" ADD CONSTRAINT "_participants_B_User_id_fk" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Room" ADD CONSTRAINT "Room_adminId_User_id_fk" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;