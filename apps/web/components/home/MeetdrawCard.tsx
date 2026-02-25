import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Room } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { renderDraws } from "@/lib/canvas/drawFunctions";

const MeetdrawCard = ({ room }: { room: Room }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (canvasRef.current && room.Draw) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        let draws = room.Draw;

        if (draws.length === 0) {
          draws = [
            {
              id: "sample1",
              shape: "text",
              strokeStyle: "#eeeeee",
              fillStyle: "#eeeeee00",
              lineWidth: 2,
              font: "Arial",
              fontSize: "20",
              startX: 889,
              startY: 210,
              endX: undefined,
              endY: undefined,
              text: "",
              points: [],
            },
            {
              id: "sample2",
              shape: "text",
              strokeStyle: "#555555",
              fillStyle: "#eeeeee00",
              lineWidth: 5,
              font: "Comic Sans MS",
              fontSize: "80",
              startX: -315,
              startY: -100,
              endX: -643,
              endY: -422,
              text: "Nothing to see here...",
              points: [],
            },
          ];
        }

        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

        draws.forEach((draw) => {
          if (draw.startX !== undefined && draw.startY !== undefined) {
            minX = Math.min(minX, draw.startX);
            minY = Math.min(minY, draw.startY);
            maxX = Math.max(maxX, draw.startX);
            maxY = Math.max(maxY, draw.startY);
          }
          if (draw.endX !== undefined && draw.endY !== undefined) {
            minX = Math.min(minX, draw.endX);
            minY = Math.min(minY, draw.endY);
            maxX = Math.max(maxX, draw.endX);
            maxY = Math.max(maxY, draw.endY);
          }
          if (draw.points) {
            draw.points.forEach((point) => {
              minX = Math.min(minX, point.x);
              minY = Math.min(minY, point.y);
              maxX = Math.max(maxX, point.x);
              maxY = Math.max(maxY, point.y);
            });
          }
        });

        const padding = 20;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const drawingWidth = maxX - minX;
        const drawingHeight = maxY - minY;
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;

        let scale = 1;
        if (drawingWidth > 0 && drawingHeight > 0) {
          scale = Math.min(
            canvasWidth / drawingWidth,
            canvasHeight / drawingHeight
          );
          scale = Math.min(Math.max(scale, 0.1), 2);
        }

        const panOffset = {
          x: (canvasWidth - drawingWidth * scale) / 2 - minX * scale,
          y: (canvasHeight - drawingHeight * scale) / 2 - minY * scale,
        };

        renderDraws(
          ctx,
          canvas,
          draws,
          null, // activeDraw
          null, // selectionBox
          "draw", // activeAction
          null, // selectedDraw
          [], // toErase
          panOffset,
          scale
        );
      }
    }
  }, [room.Draw]);

  return (
    <Card
      onClick={() => router.push(`/canvas/${room.id}`)}
      className="block py-4 row-span-1 overflow-clip border cursor-pointer backdrop-blur-md bg-black/25 hover:-translate-y-[3px] transition-all duration-200 h-fit min-h-0"
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{room.title}</CardTitle>
        <p className="text-xs text-neutral-500">
          {new Date(room.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent className="w-full h-full mt-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-neutral-900/70 rounded-md"
          style={{ minHeight: "150px" }}
        ></canvas>
      </CardContent>
    </Card>
  );
};

export default MeetdrawCard;
