"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomController = createRoomController;
exports.joinRoomController = joinRoomController;
exports.fetchAllRoomsController = fetchAllRoomsController;
const client_1 = require("@workspace/db/client");
const utils_1 = require("../utils");
const common_1 = require("@workspace/common");
const drizzle_orm_1 = require("drizzle-orm");
function createRoomController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.userId;
            const joinCode = (0, utils_1.random)(6);
            if (!userId) {
                res.status(401).json({
                    message: "User Id not found",
                });
                return;
            }
            // Use transaction for atomic creation
            const room = yield client_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const [insertedRoom] = yield tx.insert(client_1.roomsTable).values({
                    title: req.body.title,
                    joinCode,
                    adminId: userId,
                }).returning();
                yield tx.insert(client_1.roomParticipantsTable).values({
                    roomId: insertedRoom.id,
                    userId: userId,
                });
                return insertedRoom;
            }));
            res.status(201).json({
                message: "Room created successfully",
                room,
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Error creating room",
            });
        }
    });
}
function joinRoomController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                message: "User Id not found",
            });
            return;
        }
        const validInputs = common_1.JoinRoomSchema.safeParse(req.body);
        if (!validInputs.success) {
            res.status(411).json({
                message: "Invalid Input",
            });
            return;
        }
        try {
            const joinCode = validInputs.data.joinCode;
            // First find the room by join code
            const existingRooms = yield client_1.db.select().from(client_1.roomsTable).where((0, drizzle_orm_1.eq)(client_1.roomsTable.joinCode, joinCode));
            const room = existingRooms[0];
            if (!room) {
                res.status(404).json({
                    message: "Room not found",
                });
                return;
            }
            // Insert into participants
            try {
                yield client_1.db.insert(client_1.roomParticipantsTable).values({
                    roomId: room.id,
                    userId: userId,
                });
            }
            catch (e) {
                // If unique constraint violation (already joined), handle gracefully or ignore
                if (e.code === '23505') {
                    console.log("User already in room");
                }
                else {
                    throw e;
                }
            }
            res.json({
                message: "Room Joined Successfully",
                room,
            });
            return;
        }
        catch (e) {
            console.log(e);
            res.status(400).json({
                message: "Faced error joining room, please try again",
            });
            return;
        }
    });
}
function fetchAllRoomsController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                message: "User Id not found",
            });
            return;
        }
        try {
            // Replicating logic using multiple queries for simplicity first
            // TODO: Optimize if necessary
            // Fetch rooms where userId is in participants
            const userRooms = yield client_1.db.select({
                id: client_1.roomsTable.id,
                title: client_1.roomsTable.title,
                joinCode: client_1.roomsTable.joinCode,
                createdAt: client_1.roomsTable.createdAt,
                adminId: client_1.roomsTable.adminId,
                admin: {
                    username: client_1.usersTable.username,
                }
            })
                .from(client_1.roomsTable)
                .innerJoin(client_1.roomParticipantsTable, (0, drizzle_orm_1.eq)(client_1.roomsTable.id, client_1.roomParticipantsTable.roomId))
                .innerJoin(client_1.usersTable, (0, drizzle_orm_1.eq)(client_1.roomsTable.adminId, client_1.usersTable.id))
                .where((0, drizzle_orm_1.eq)(client_1.roomParticipantsTable.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(client_1.roomsTable.createdAt));
            // For each room, fetch latest Chat and Draw
            const roomsWithDetails = yield Promise.all(userRooms.map((room) => __awaiter(this, void 0, void 0, function* () {
                const latestChat = yield client_1.db.select({
                    content: client_1.chatsTable.content,
                    createdAt: client_1.chatsTable.createdAt,
                    user: {
                        username: client_1.usersTable.username
                    }
                })
                    .from(client_1.chatsTable)
                    .innerJoin(client_1.usersTable, (0, drizzle_orm_1.eq)(client_1.chatsTable.userId, client_1.usersTable.id))
                    .where((0, drizzle_orm_1.eq)(client_1.chatsTable.roomId, room.id))
                    .orderBy((0, drizzle_orm_1.desc)(client_1.chatsTable.serialNumber)) // serialNumber is auto inc
                    .limit(1);
                const latestDraws = yield client_1.db.select()
                    .from(client_1.drawsTable)
                    .where((0, drizzle_orm_1.eq)(client_1.drawsTable.roomId, room.id))
                    .limit(10);
                return Object.assign(Object.assign({}, room), { Chat: latestChat, Draw: latestDraws });
            })));
            const sortedRooms = roomsWithDetails.sort((a, b) => {
                var _a, _b;
                const aLatestChat = ((_a = a.Chat[0]) === null || _a === void 0 ? void 0 : _a.createdAt) || a.createdAt || new Date(0);
                const bLatestChat = ((_b = b.Chat[0]) === null || _b === void 0 ? void 0 : _b.createdAt) || b.createdAt || new Date(0);
                return new Date(bLatestChat).getTime() - new Date(aLatestChat).getTime();
            });
            res.json({
                message: "Rooms fetched successfully",
                rooms: sortedRooms,
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({
                message: "Error fetching rooms",
            });
        }
    });
}
