"use server";
import { Room } from "@/types";
import axiosInstance from "@/lib/axios/axiosInstance";

export interface RoomActionState {
  message: string;
  room?: Room;
}

export async function createRoomAction(
  initialState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const title = formData.get("title") as string;

  if (!title || title.trim().length === 0) {
    return {
      message: "Title is required",
    };
  }

  if (title.length > 50) {
    return {
      message: "Title must be less than 50 characters",
    };
  }

  try {
    const room = await axiosInstance.post(`/room/create`, {
      title,
    });
    return {
      message: "Room created successfully",
      room: room.data.room,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: error.response.data.message,
    };
  }
}

export async function joinRoomAction(
  initialState: RoomActionState,
  formData: FormData
): Promise<RoomActionState> {
  const joinCode = formData.get("joinCode") as string;

  if (!joinCode || joinCode.trim().length === 0) {
    return {
      message: "Join code is required",
    };
  }

  try {
    const room = await axiosInstance.post(`/room/join`, {
      joinCode,
    });
    return {
      message: "Room joined successfully",
      room: room.data.room,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: error.response.data.message,
    };
  }
}

export async function fetchRoomById(roomId: string) {
  try {
    const res = await axiosInstance.get(`/room/${roomId}`);
    return res.data.room;
  } catch (error) {
    console.error(error);
    return null;
  }
}
