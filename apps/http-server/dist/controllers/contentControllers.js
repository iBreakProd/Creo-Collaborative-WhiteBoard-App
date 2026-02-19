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
exports.fetchHomeInfo = fetchHomeInfo;
exports.fetchAllChatMessages = fetchAllChatMessages;
exports.fetchAllDraws = fetchAllDraws;
const client_1 = require("@workspace/db/client");
const drizzle_orm_1 = require("drizzle-orm");
function fetchHomeInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title } = req.query;
        const userId = req.userId;
        try {
            const query = client_1.db.select({
                id: client_1.roomsTable.id,
                title: client_1.roomsTable.title,
                joinCode: client_1.roomsTable.joinCode,
            })
                .from(client_1.roomsTable)
                .innerJoin(client_1.roomParticipantsTable, (0, drizzle_orm_1.eq)(client_1.roomsTable.id, client_1.roomParticipantsTable.roomId))
                .where(title
                ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(client_1.roomParticipantsTable.userId, userId), (0, drizzle_orm_1.like)(client_1.roomsTable.title, `%${title}%`))
                : (0, drizzle_orm_1.eq)(client_1.roomParticipantsTable.userId, userId));
            const rooms = yield query;
            // Fetch latest chat for each room (manual approach for now)
            const roomsWithChat = yield Promise.all(rooms.map((room) => __awaiter(this, void 0, void 0, function* () {
                const latestChat = yield client_1.db.select({
                    content: client_1.chatsTable.content,
                    user: {
                        name: client_1.usersTable.name
                    }
                })
                    .from(client_1.chatsTable)
                    .innerJoin(client_1.usersTable, (0, drizzle_orm_1.eq)(client_1.chatsTable.userId, client_1.usersTable.id))
                    .where((0, drizzle_orm_1.eq)(client_1.chatsTable.roomId, room.id))
                    .orderBy((0, drizzle_orm_1.desc)(client_1.chatsTable.serialNumber))
                    .limit(1);
                return Object.assign(Object.assign({}, room), { Chat: latestChat });
            })));
            res.json({
                rooms: roomsWithChat
            });
        }
        catch (e) {
            console.log(e);
            res.status(401).json({
                message: "Could not fetch rooms",
            });
        }
    });
}
function fetchAllChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                message: "User Id not found",
            });
            return;
        }
        const { roomId } = req.params;
        const { lastSrNo } = req.query;
        try {
            // Verify user is in room
            const roomCheck = yield client_1.db.select({ id: client_1.roomsTable.id })
                .from(client_1.roomsTable)
                .innerJoin(client_1.roomParticipantsTable, (0, drizzle_orm_1.eq)(client_1.roomsTable.id, client_1.roomParticipantsTable.roomId))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(client_1.roomsTable.id, roomId), (0, drizzle_orm_1.eq)(client_1.roomParticipantsTable.userId, userId)))
                .limit(1);
            if (roomCheck.length === 0) {
                res.status(401).json({
                    message: "User not part of the room",
                });
                return;
            }
            let messages;
            const baseQuery = client_1.db.select({
                id: client_1.chatsTable.id,
                content: client_1.chatsTable.content,
                serialNumber: client_1.chatsTable.serialNumber,
                createdAt: client_1.chatsTable.createdAt,
                userId: client_1.chatsTable.userId,
                user: {
                    username: client_1.usersTable.username,
                },
                roomId: client_1.chatsTable.roomId,
            })
                .from(client_1.chatsTable)
                .innerJoin(client_1.usersTable, (0, drizzle_orm_1.eq)(client_1.chatsTable.userId, client_1.usersTable.id));
            if (lastSrNo !== undefined) {
                messages = yield baseQuery
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(client_1.chatsTable.roomId, roomId), (0, drizzle_orm_1.lt)(client_1.chatsTable.serialNumber, parseInt(lastSrNo))))
                    .orderBy((0, drizzle_orm_1.desc)(client_1.chatsTable.serialNumber))
                    .limit(25);
            }
            else {
                messages = yield baseQuery
                    .where((0, drizzle_orm_1.eq)(client_1.chatsTable.roomId, roomId))
                    .orderBy((0, drizzle_orm_1.desc)(client_1.chatsTable.serialNumber))
                    .limit(25);
            }
            res.json({
                messages: messages.reverse(),
            });
        }
        catch (e) {
            console.log(e);
            res.status(401).json({
                message: "Could not fetch messages",
            });
        }
    });
}
function fetchAllDraws(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                message: "User Id not found",
            });
            return;
        }
        const { roomId } = req.params;
        try {
            const draws = yield client_1.db.select().from(client_1.drawsTable).where((0, drizzle_orm_1.eq)(client_1.drawsTable.roomId, roomId));
            res.json({
                draws,
            });
        }
        catch (e) {
            console.log(e);
            res.status(401).json({
                message: "Could not fetch draws",
            });
        }
    });
}
