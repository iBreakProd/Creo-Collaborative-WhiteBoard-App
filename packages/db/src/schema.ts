import {
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  integer,
  real,
} from "drizzle-orm/pg-core";

export const shapeEnum = pgEnum("shape", [
  "rectangle",
  "diamond",
  "circle",
  "line",
  "arrow",
  "text",
  "freeHand",
]);

export const usersTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  photo: text("photo"),
});

export const roomsTable = pgTable("room", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  joinCode: text("joinCode").unique().notNull(),
  adminId: uuid("adminId")
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const chatsTable = pgTable("chat", {
    id: uuid("id").primaryKey().defaultRandom(),
    serialNumber: serial("serialNumber"),
    content: text("content").notNull(),
    userId: uuid("userId")
        .references(() => usersTable.id)
        .notNull(),
    roomId: uuid("roomId")
        .references(() => roomsTable.id)
        .notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const drawsTable = pgTable("draw", {
  id: text("id").primaryKey(), // Prisma had String @id, keeping text as primary key but it might not be uuid
  shape: shapeEnum("shape").notNull(),
  strokeStyle: text("strokeStyle").notNull(),
  fillStyle: text("fillStyle").notNull(),
  lineWidth: real("lineWidth").notNull(),
  font: text("font"),
  fontSize: text("fontSize"),
  startX: real("startX"),
  startY: real("startY"),
  endX: real("endX"),
  endY: real("endY"),
  text: text("text"),
  points: json("points"),
  roomId: uuid("roomId")
    .references(() => roomsTable.id)
    .notNull(),
});

export const roomParticipantsTable = pgTable("room_participants", {
    roomId: uuid("roomId").references(() => roomsTable.id).notNull(),
    userId: uuid("userId").references(() => usersTable.id).notNull(),
}, (t) => [
    { pk: [t.roomId, t.userId] }
]);
