import { Request, Response } from "express";
import { db, roomsTable, roomParticipantsTable, chatsTable, drawsTable, usersTable } from "@workspace/db/client";
import { random } from "../utils";
import { JoinRoomSchema } from "@workspace/common";
import { eq, desc } from "drizzle-orm";

export async function createRoomController(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const joinCode = random(6);

    if (!userId) {
      res.status(401).json({
        message: "User Id not found",
      });
      return;
    }

    // Use transaction for atomic creation
    const room = await db.transaction(async (tx) => {
        const [insertedRoom] = await tx.insert(roomsTable).values({
            title: req.body.title,
            joinCode,
            adminId: userId,
        }).returning();

        await tx.insert(roomParticipantsTable).values({
            roomId: insertedRoom.id,
            userId: userId,
        });

        return insertedRoom;
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error creating room",
    });
  }
}

export async function joinRoomController(req: Request, res: Response) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "User Id not found",
    });
    return;
  }

  const validInputs = JoinRoomSchema.safeParse(req.body);
  if (!validInputs.success) {
    res.status(411).json({
      message: "Invalid Input",
    });
    return;
  }

  try {
    const joinCode = validInputs.data.joinCode;

    // First find the room by join code
    const existingRooms = await db.select().from(roomsTable).where(eq(roomsTable.joinCode, joinCode));
    const room = existingRooms[0];

    if (!room) {
      res.status(404).json({
        message: "Room not found",
      });
      return;
    }

    // Insert into participants
    try {
        await db.insert(roomParticipantsTable).values({
            roomId: room.id,
            userId: userId,
        });
    } catch (e: any) {
        // If unique constraint violation (already joined), handle gracefully or ignore
        if (e.code === '23505') {
            console.log("User already in room");
        } else {
            throw e;
        }
    }

    res.json({
      message: "Room Joined Successfully",
      room,
    });
    return;
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Faced error joining room, please try again",
    });
    return;
  }
}

export async function fetchAllRoomsController(req: Request, res: Response) {
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

    // For each room, fetch latest Chat and Draw
    const roomsWithDetails = await Promise.all(userRooms.map(async (room) => {
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
        .orderBy(desc(chatsTable.serialNumber)) // serialNumber is auto inc
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

    const sortedRooms = roomsWithDetails.sort((a, b) => {
      const aLatestChat = a.Chat[0]?.createdAt || a.createdAt || new Date(0);
      const bLatestChat = b.Chat[0]?.createdAt || b.createdAt || new Date(0);
      return new Date(bLatestChat).getTime() - new Date(aLatestChat).getTime();
    });

    res.json({
      message: "Rooms fetched successfully",
      rooms: sortedRooms,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Error fetching rooms",
    });
  }
}
