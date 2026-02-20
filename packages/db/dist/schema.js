"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomParticipantsTable = exports.drawsTable = exports.chatsTable = exports.roomsTable = exports.usersTable = exports.shapeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.shapeEnum = (0, pg_core_1.pgEnum)("shape", [
    "rectangle",
    "diamond",
    "circle",
    "line",
    "arrow",
    "text",
    "freeHand",
]);
exports.usersTable = (0, pg_core_1.pgTable)("user", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    username: (0, pg_core_1.text)("username").unique().notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    photo: (0, pg_core_1.text)("photo"),
});
exports.roomsTable = (0, pg_core_1.pgTable)("room", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.text)("title").notNull(),
    joinCode: (0, pg_core_1.text)("joinCode").unique().notNull(),
    adminId: (0, pg_core_1.uuid)("adminId")
        .references(() => exports.usersTable.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
exports.chatsTable = (0, pg_core_1.pgTable)("chat", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    serialNumber: (0, pg_core_1.serial)("serialNumber"),
    content: (0, pg_core_1.text)("content").notNull(),
    userId: (0, pg_core_1.uuid)("userId")
        .references(() => exports.usersTable.id)
        .notNull(),
    roomId: (0, pg_core_1.uuid)("roomId")
        .references(() => exports.roomsTable.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").defaultNow(),
});
exports.drawsTable = (0, pg_core_1.pgTable)("draw", {
    id: (0, pg_core_1.text)("id").primaryKey(), // Prisma had String @id, keeping text as primary key but it might not be uuid
    shape: (0, exports.shapeEnum)("shape").notNull(),
    strokeStyle: (0, pg_core_1.text)("strokeStyle").notNull(),
    fillStyle: (0, pg_core_1.text)("fillStyle").notNull(),
    lineWidth: (0, pg_core_1.integer)("lineWidth").notNull(),
    font: (0, pg_core_1.text)("font"),
    fontSize: (0, pg_core_1.text)("fontSize"),
    startX: (0, pg_core_1.integer)("startX"),
    startY: (0, pg_core_1.integer)("startY"),
    endX: (0, pg_core_1.integer)("endX"),
    endY: (0, pg_core_1.integer)("endY"),
    text: (0, pg_core_1.text)("text"),
    points: (0, pg_core_1.json)("points"),
    roomId: (0, pg_core_1.uuid)("roomId")
        .references(() => exports.roomsTable.id)
        .notNull(),
});
exports.roomParticipantsTable = (0, pg_core_1.pgTable)("room_participants", {
    roomId: (0, pg_core_1.uuid)("roomId").references(() => exports.roomsTable.id).notNull(),
    userId: (0, pg_core_1.uuid)("userId").references(() => exports.usersTable.id).notNull(),
}, (t) => [
    { pk: [t.roomId, t.userId] }
]);
