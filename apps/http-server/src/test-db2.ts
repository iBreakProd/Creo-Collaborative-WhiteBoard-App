import { db, roomsTable, roomParticipantsTable, chatsTable, drawsTable, usersTable } from "@workspace/db/client";
import { eq, desc } from "drizzle-orm";

async function run() {
    try {
        const users = await db.select().from(usersTable).limit(1);
        if (users.length === 0) return console.log("no users");
        const userId = users[0].id;
        console.log("Testing with userId", userId);

        const userRooms = await db.select({
            id: roomsTable.id,
            title: roomsTable.title,
            joinCode: roomsTable.joinCode,
            createdAt: roomsTable.createdAt,
            adminId: roomsTable.adminId,
            admin: {
                 username: usersTable.username,
            }
         })
         .from(roomsTable)
         .innerJoin(roomParticipantsTable, eq(roomsTable.id, roomParticipantsTable.roomId))
         .innerJoin(usersTable, eq(roomsTable.adminId, usersTable.id))
         .where(eq(roomParticipantsTable.userId, userId))
         .orderBy(desc(roomsTable.createdAt));
         
         const uniqueUserRoomsMap = new Map();
         userRooms.forEach(room => {
             if (!uniqueUserRoomsMap.has(room.id)) {
                 uniqueUserRoomsMap.set(room.id, room);
             }
         });
         const uniqueUserRooms = Array.from(uniqueUserRoomsMap.values());

         const roomsWithDetails = await Promise.all(uniqueUserRooms.map(async (room) => {
            const latestChat = await db.select({
                content: chatsTable.content,
                createdAt: chatsTable.createdAt,
                user: {
                    username: usersTable.username
                }
            })
            .from(chatsTable)
            .innerJoin(usersTable, eq(chatsTable.userId, usersTable.id))
            .where(eq(chatsTable.roomId, room.id))
            .orderBy(desc(chatsTable.serialNumber))
            .limit(1);
    
            const latestDraws = await db.select()
            .from(drawsTable)
            .where(eq(drawsTable.roomId, room.id))
            .limit(10);
            
            return {
                ...room,
                Chat: latestChat,
                Draw: latestDraws
            };
        }));
         
         console.log("Success! Unique user rooms count:", uniqueUserRooms.length);
         process.exit(0);
    } catch(e) {
        console.error("DEBUG ERROR", e);
        process.exit(1);
    }
}
run();
