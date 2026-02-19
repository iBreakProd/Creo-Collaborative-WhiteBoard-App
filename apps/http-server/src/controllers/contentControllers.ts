import { Request, Response } from "express";
import { db, roomsTable, roomParticipantsTable, chatsTable, drawsTable, usersTable } from "@workspace/db/client";
import { eq, desc, like, and, lt } from "drizzle-orm";

export async function fetchHomeInfo(req: Request, res: Response) {
  const { title } = req.query;
  const userId = req.userId;

  try {
    const query = db.select({
       id: roomsTable.id,
       title: roomsTable.title,
       joinCode: roomsTable.joinCode,
    })
    .from(roomsTable)
    .innerJoin(roomParticipantsTable, eq(roomsTable.id, roomParticipantsTable.roomId))
    .where(
        title 
        ? and(
            eq(roomParticipantsTable.userId, userId as string),
            like(roomsTable.title, `%${title as string}%`)
        )
        : eq(roomParticipantsTable.userId, userId as string)
    );

    const rooms = await query;

    // Fetch latest chat for each room (manual approach for now)
    const roomsWithChat = await Promise.all(rooms.map(async (room) => {
        const latestChat = await db.select({
            content: chatsTable.content,
            user: {
                name: usersTable.name
            }
        })
        .from(chatsTable)
        .innerJoin(usersTable, eq(chatsTable.userId, usersTable.id))
        .where(eq(chatsTable.roomId, room.id))
        .orderBy(desc(chatsTable.serialNumber))
        .limit(1);

        return {
            ...room,
            Chat: latestChat
        };
    }));

    res.json({
        rooms: roomsWithChat
    });

  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch rooms",
    });
  }
}

export async function fetchAllChatMessages(req: Request, res: Response) {
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
    const roomCheck = await db.select({ id: roomsTable.id })
        .from(roomsTable)
        .innerJoin(roomParticipantsTable, eq(roomsTable.id, roomParticipantsTable.roomId))
        .where(and(eq(roomsTable.id, roomId), eq(roomParticipantsTable.userId, userId)))
        .limit(1);

    if (roomCheck.length === 0) {
      res.status(401).json({
        message: "User not part of the room",
      });
      return;
    }

    let messages;

    const baseQuery = db.select({
          id: chatsTable.id,
          content: chatsTable.content,
          serialNumber: chatsTable.serialNumber,
          createdAt: chatsTable.createdAt,
          userId: chatsTable.userId,
          user: {
            username: usersTable.username,
          },
          roomId: chatsTable.roomId,
    })
    .from(chatsTable)
    .innerJoin(usersTable, eq(chatsTable.userId, usersTable.id));

    if (lastSrNo !== undefined) {
      messages = await baseQuery
        .where(and(
            eq(chatsTable.roomId, roomId),
            lt(chatsTable.serialNumber, parseInt(lastSrNo as string))
        ))
        .orderBy(desc(chatsTable.serialNumber))
        .limit(25);
    } else {
      messages = await baseQuery
        .where(eq(chatsTable.roomId, roomId))
        .orderBy(desc(chatsTable.serialNumber))
        .limit(25);
    }

    res.json({
      messages: messages.reverse(),
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch messages",
    });
  }
}

export async function fetchAllDraws(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  const { roomId } = req.params;

  try {
    const draws = await db.select().from(drawsTable).where(eq(drawsTable.roomId, roomId));

    res.json({
      draws,
    });
  } catch (e) {
    console.log(e);
    res.status(401).json({
      message: "Could not fetch draws",
    });
  }
}
