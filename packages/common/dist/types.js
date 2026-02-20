"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketMessageSchema = exports.JoinRoomSchema = exports.CreateRoomSchema = exports.UserSigninSchema = exports.UserSignupSchema = void 0;
const zod_1 = require("zod");
exports.UserSignupSchema = zod_1.z.object({
    // (for http - server)
    username: zod_1.z.string(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string(),
});
exports.UserSigninSchema = zod_1.z.object({
    // (for http - server)
    username: zod_1.z.string(),
    password: zod_1.z.string().min(8),
});
exports.CreateRoomSchema = zod_1.z.object({
    title: zod_1.z.string(),
});
exports.JoinRoomSchema = zod_1.z.object({
    // (for http - server)
    joinCode: zod_1.z.string().length(6),
});
exports.WebSocketMessageSchema = zod_1.z.object({
    // Messages shared via WebSocket (for frontend and ws - server)
    type: zod_1.z.enum([
        "connect_room",
        "disconnect_room",
        "chat_message",
        "draw",
        "error_message",
    ]),
    roomId: zod_1.z.string(),
    userId: zod_1.z.string(),
    content: zod_1.z.string().optional(),
});
