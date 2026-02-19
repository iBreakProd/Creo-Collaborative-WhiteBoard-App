import { WebSocket, WebSocketServer } from "ws";
import { db, chatsTable, drawsTable, usersTable } from "@workspace/db/client";
import { eq } from "drizzle-orm";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocketMessageSchema } from "@workspace/common";
import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(__dirname, "../.env") });

interface WSConnection {
  userId: string;
  socket: WebSocket;
  verified: boolean;
}

const wss = new WebSocketServer({ port: Number(process.env.PORT) });

const activeRooms = new Map<string, WSConnection[]>();
const userVerificationStatus = new Map<
  WebSocket,
  { verified: boolean; userId?: string }
>();

wss.on("connection", async (socket: WebSocket, req: Request) => {
  const searchParams = new URLSearchParams(req.url.split("?")[1]);
  const token = searchParams.get("token");

  userVerificationStatus.set(socket, { verified: false });

  socket.on("message", async (data) => {
    const userStatus = userVerificationStatus.get(socket);

    if (!userStatus?.verified) {
      socket.send(
        JSON.stringify({
          type: "error_message",
          content: "User not verified",
        })
      );
      return;
    }

    const recievedData = JSON.parse(data as unknown as string);
    const validMessage = WebSocketMessageSchema.safeParse(recievedData);

    if (!validMessage.success) {
      console.log("Invalid message type : ", recievedData);
      socket.send(
        JSON.stringify({
          type: "error_message",
          content: "Invalid Message Schema/Format",
        })
      );
      return;
    }

    switch (validMessage.data.type) {
      case "connect_room":
        activeRooms.set(validMessage.data.roomId!, [
          ...(activeRooms.get(validMessage.data.roomId!) || []),
          { userId: validMessage.data.userId!, socket, verified: true },
        ]);
        break;
      case "disconnect_room":
        for (const [roomId, connections] of activeRooms.entries()) {
          const updatedConnections = connections.filter(
            (conn) => conn.socket !== socket
          );
          if (updatedConnections.length === 0) {
            activeRooms.delete(roomId);
          } else {
            activeRooms.set(roomId, updatedConnections);
          }
        }
        break;
      case "chat_message": {
        const socketList = activeRooms.get(validMessage.data.roomId!);

        if (
          !socketList?.some(
            (conn) =>
              conn.userId === validMessage.data.userId && conn.socket === socket
          )
        ) {
          socket.send(
            JSON.stringify({
              type: "error_message",
              content: "Not connected to the room",
            })
          );
          return;
        }
        try {
            const [addChat] = await db.insert(chatsTable).values({
                userId: validMessage.data.userId!,
                roomId: validMessage.data.roomId!,
                content: validMessage.data.content!,
            }).returning({
                id: chatsTable.id,
                content: chatsTable.content,
                serialNumber: chatsTable.serialNumber,
                createdAt: chatsTable.createdAt,
                userId: chatsTable.userId,
                roomId: chatsTable.roomId,
            });

            // Need to fetch user details separately or join?
            // Returning clause only returns table columns. 
            // To match previous Select behavior (including user relation), we might need a subsequent fetch or just return what we have if the client handles it.
            // But let's fetch user name if needed by client.
            const user = await db.select({ username: usersTable.username }).from(usersTable).where(eq(usersTable.id, addChat.userId));
            
            const chatWithUser = {
                ...addChat,
                user: {
                    username: user[0]?.username
                }
            };
          socketList?.forEach((member) => {
            member.socket.send(
              JSON.stringify({
                type: "chat_message",
                userId: validMessage.data.userId!,
                roomId: validMessage.data.roomId!,
                content: JSON.stringify(chatWithUser),
              })
            );
          });
        } catch (e) {
          console.log(e);
          socket.send(
            JSON.stringify({
              type: "error_message",
              content: "Error adding chat message",
            })
          );
        }

        break;
      }
      case "draw": {
        const socketList = activeRooms.get(validMessage.data.roomId!);

        if (
          !socketList?.some(
            (conn) =>
              conn.userId === validMessage.data.userId && conn.socket === socket
          )
        ) {
          socket.send(
            JSON.stringify({
              type: "error_message",
              content: "Not connected to the room",
            })
          );
          return;
        }

        const drawData = JSON.parse(validMessage.data.content!);

        try {
          let addedDraw;
          let draw;
          switch (drawData.type) {
            case "create":
              draw = drawData.modifiedDraw;
              await db.insert(drawsTable).values({
                  id: draw.id,
                  shape: draw.shape,
                  strokeStyle: draw.strokeStyle,
                  fillStyle: draw.fillStyle,
                  lineWidth: draw.lineWidth,
                  font: draw.font,
                  fontSize: draw.fontSize,
                  startX: draw.startX,
                  startY: draw.startY,
                  endX: draw.endX,
                  endY: draw.endY,
                  text: draw.text,
                  points: draw.points,
                  roomId: validMessage.data.roomId!,
              });
              break;
            case "move":
            case "edit":
            case "resize":
              draw = drawData.modifiedDraw;
              await db.update(drawsTable).set({
                  startX: draw.startX,
                  startY: draw.startY,
                  endX: draw.endX,
                  endY: draw.endY,
                  text: draw.text,
                  points: draw.points,
                  shape: draw.shape,
                  strokeStyle: draw.strokeStyle,
                  fillStyle: draw.fillStyle,
                  lineWidth: draw.lineWidth,
                  font: draw.font,
                  fontSize: draw.fontSize,
              }).where(eq(drawsTable.id, draw.id));
              break;
            case "erase":
              draw = drawData.originalDraw;
              await db.delete(drawsTable).where(eq(drawsTable.id, draw.id));
              break;
          }

          socketList?.forEach((member) => {
            member.socket.send(
              JSON.stringify({
                type: "draw",
                userId: validMessage.data.userId!,
                roomId: validMessage.data.roomId!,
                content: validMessage.data.content!,
              })
            );
          });
        } catch (e) {
          console.log(e);
          socket.send(
            JSON.stringify({
              type: "error_message",
              content: "Error adding draw",
            })
          );
        }
        break;
      }
    }
  });

  socket.on("close", () => {
    userVerificationStatus.delete(socket);
    for (const [roomId, connections] of activeRooms.entries()) {
      const updatedConnections = connections.filter(
        (conn) => conn.socket !== socket
      );
      if (updatedConnections.length === 0) {
        activeRooms.delete(roomId);
      } else {
        activeRooms.set(roomId, updatedConnections);
      }
    }
  });

  if (!token) {
    console.log("Token not found");
    socket.send(
      JSON.stringify({
        type: "error_message",
        content: "Token not found",
      })
    );
    socket.close();
    return;
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "kjhytfrde45678iuytrfdcfgy6tr"
    ) as JwtPayload;

    if (!verified?.id) {
      console.log("User not authorised");
      socket.send(
        JSON.stringify({
          type: "error_message",
          content: "User not authorised",
        })
      );
      socket.close();
      return;
    }

    const userResult = await db.select().from(usersTable).where(eq(usersTable.id, verified.id));
    const userFound = userResult[0];

    if (!userFound) {
      console.log("User does not exist");
      socket.send(
        JSON.stringify({
          type: "error_message",
          content: "User does not exist",
        })
      );
      socket.close();
      return;
    }

    userVerificationStatus.set(socket, { verified: true, userId: verified.id });
    socket.send(
      JSON.stringify({
        type: "connection_ready",
        userId: verified.id,
      })
    );
  } catch (e) {
    console.log(e);
    console.log("Error verifying user");
    socket.send(
      JSON.stringify({
        type: "error_message",
        content: "Error verifying user",
      })
    );
    socket.close();
    return;
  }
});
