import { Draw } from "@/types";

export function resizeDraw(
  position:
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | `point-${number}`,
  x: number,
  y: number,
  selectedDraw: Draw,
  diagrams: Draw[],
  farthestPointsInfo: {
    farthestLeftPoint: { point: "start" | "end" | "point"; x: number };
    farthestRightPoint: { point: "start" | "end" | "point"; x: number };
    farthestTopPoint: { point: "start" | "end" | "point"; y: number };
    farthestBottomPoint: { point: "start" | "end" | "point"; y: number };
  } | null,
  intialPointsForFreeHandMove?: {
    initialPoint: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null
): Draw | null {
  if (
    selectedDraw.shape === "rectangle" ||
    selectedDraw.shape === "diamond" ||
    selectedDraw.shape === "circle"
  ) {
    switch (position) {
      case "topLeft":
        selectedDraw.startX = x;
        selectedDraw.startY = y;
        break;
      case "topRight":
        selectedDraw.endX = x;
        selectedDraw.startY = y;
        break;
      case "bottomRight":
        selectedDraw.endX = x;
        selectedDraw.endY = y;
        break;
      case "bottomLeft":
        selectedDraw.startX = x;
        selectedDraw.endY = y;
        break;
      case "left":
        selectedDraw.startX = x;
        break;
      case "right":
        selectedDraw.endX = x;
        break;
      case "top":
        selectedDraw.startY = y;
        break;
      case "bottom":
        selectedDraw.endY = y;
        break;
    }
  }
  if (selectedDraw.shape === "line" || selectedDraw.shape === "arrow") {
    if (position.includes("point")) {
      const index = parseInt(position.split("-")[1]!);
      switch (index) {
        case 0:
          selectedDraw.startX = x;
          selectedDraw.startY = y;
          break;
        case 1:
          selectedDraw.points![0] = {
            x: x,
            y: y,
          };
          break;
        case 2:
          selectedDraw.endX = x;
          selectedDraw.endY = y;
          break;
      }
    }
    if (farthestPointsInfo) {
      switch (position) {
        case "topLeft":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "topRight":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottomRight":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottomLeft":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "left":
          if (farthestPointsInfo.farthestLeftPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestLeftPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          break;
        case "right":
          if (farthestPointsInfo.farthestRightPoint?.point === "start") {
            selectedDraw.startX = x;
          } else if (farthestPointsInfo.farthestRightPoint?.point === "end") {
            selectedDraw.endX = x;
          } else {
            selectedDraw.points![0]!.x = x;
          }
          break;
        case "top":
          if (farthestPointsInfo.farthestTopPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestTopPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
        case "bottom":
          if (farthestPointsInfo.farthestBottomPoint?.point === "start") {
            selectedDraw.startY = y;
          } else if (farthestPointsInfo.farthestBottomPoint?.point === "end") {
            selectedDraw.endY = y;
          } else {
            selectedDraw.points![0]!.y = y;
          }
          break;
      }
    }
  }
  if (
    selectedDraw.shape === "freeHand" &&
    intialPointsForFreeHandMove?.originalPoints
  ) {
    const farthestLeft = Math.min(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.x)
    );
    const farthestRight = Math.max(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.x)
    );
    const farthestTop = Math.min(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.y)
    );
    const farthestBottom = Math.max(
      ...intialPointsForFreeHandMove.originalPoints.map((point) => point.y)
    );

    const originalWidth = farthestRight - farthestLeft;
    const originalHeight = farthestBottom - farthestTop;

    switch (position) {
      case "left": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
        });
        break;
      }
      case "right": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
        });
        break;
      }
      case "top": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "bottom": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
      case "topLeft": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "topRight": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = farthestBottom - y;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestBottom;
            point.y = farthestBottom + dy * scaleY;
          }
        });
        break;
      }
      case "bottomRight": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = x - farthestLeft;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestLeft;
            point.x = farthestLeft + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
      case "bottomLeft": {
        selectedDraw.points!.forEach((point, index) => {
          const originalPoint =
            intialPointsForFreeHandMove.originalPoints[index]!;
          if (originalWidth === 0) {
            point.x = x;
          } else {
            const newWidth = farthestRight - x;
            const scaleX = newWidth / originalWidth;
            const dx = originalPoint.x - farthestRight;
            point.x = farthestRight + dx * scaleX;
          }
          if (originalHeight === 0) {
            point.y = y;
          } else {
            const newHeight = y - farthestTop;
            const scaleY = newHeight / originalHeight;
            const dy = originalPoint.y - farthestTop;
            point.y = farthestTop + dy * scaleY;
          }
        });
        break;
      }
    }
  }
  if (selectedDraw.shape === "text") {
    const fontSize = Math.max(10, selectedDraw.startY! - y);
    selectedDraw.fontSize = fontSize.toString();
  }
  const ind = diagrams.findIndex((draw) => draw.id === selectedDraw.id);
  diagrams[ind] = selectedDraw;
  return selectedDraw;
}

export function calculateFarthestPoints(selectedDraw: Draw) {
  if (selectedDraw.shape === "line" || selectedDraw.shape === "arrow") {
    let farthestLeftPoint: {
      point: "start" | "end" | "point";
      x: number;
    } | null = null;
    let farthestRightPoint: {
      point: "start" | "end" | "point";
      x: number;
    } | null = null;
    let farthestTopPoint: {
      point: "start" | "end" | "point";
      y: number;
    } | null = null;
    let farthestBottomPoint: {
      point: "start" | "end" | "point";
      y: number;
    } | null = null;

    if (
      selectedDraw.startX! <= selectedDraw.endX! &&
      selectedDraw.startX! <= selectedDraw.points![0]!.x
    ) {
      farthestLeftPoint = { point: "start", x: selectedDraw.startX! };
    } else if (
      selectedDraw.endX! <= selectedDraw.startX! &&
      selectedDraw.endX! <= selectedDraw.points![0]!.x
    ) {
      farthestLeftPoint = { point: "end", x: selectedDraw.endX! };
    } else {
      farthestLeftPoint = { point: "point", x: selectedDraw.points![0]!.x };
    }

    if (
      selectedDraw.startX! >= selectedDraw.endX! &&
      selectedDraw.startX! >= selectedDraw.points![0]!.x
    ) {
      farthestRightPoint = { point: "start", x: selectedDraw.startX! };
    } else if (
      selectedDraw.endX! >= selectedDraw.startX! &&
      selectedDraw.endX! >= selectedDraw.points![0]!.x
    ) {
      farthestRightPoint = { point: "end", x: selectedDraw.endX! };
    } else {
      farthestRightPoint = { point: "point", x: selectedDraw.points![0]!.x };
    }

    if (
      selectedDraw.startY! <= selectedDraw.endY! &&
      selectedDraw.startY! <= selectedDraw.points![0]!.y
    ) {
      farthestTopPoint = { point: "start", y: selectedDraw.startY! };
    } else if (
      selectedDraw.endY! <= selectedDraw.startY! &&
      selectedDraw.endY! <= selectedDraw.points![0]!.y
    ) {
      farthestTopPoint = { point: "end", y: selectedDraw.endY! };
    } else {
      farthestTopPoint = { point: "point", y: selectedDraw.points![0]!.y };
    }

    if (
      selectedDraw.startY! >= selectedDraw.endY! &&
      selectedDraw.startY! >= selectedDraw.points![0]!.y
    ) {
      farthestBottomPoint = { point: "start", y: selectedDraw.startY! };
    } else if (
      selectedDraw.endY! >= selectedDraw.startY! &&
      selectedDraw.endY! >= selectedDraw.points![0]!.y
    ) {
      farthestBottomPoint = { point: "end", y: selectedDraw.endY! };
    } else {
      farthestBottomPoint = { point: "point", y: selectedDraw.points![0]!.y };
    }
    return {
      farthestLeftPoint: farthestLeftPoint,
      farthestRightPoint: farthestRightPoint,
      farthestTopPoint: farthestTopPoint,
      farthestBottomPoint: farthestBottomPoint,
    };
  }
  return null;
}

export function moveDraw(
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  selectedDraw: Draw,
  diagrams: Draw[],
  intialPointsForFreeHandMove?: {
    initialPoint: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null
): Draw | null {
  const oldStartX = selectedDraw.startX!;
  const oldStartY = selectedDraw.startY!;

  const newStartX = x - offsetX;
  const newStartY = y - offsetY;
  const dx = newStartX - oldStartX;
  const dy = newStartY - oldStartY;

  selectedDraw.startX = newStartX;
  selectedDraw.startY = newStartY;
  selectedDraw.endX! += dx;
  selectedDraw.endY! += dy;

  if (
    (selectedDraw.shape === "line" || selectedDraw.shape === "arrow") &&
    selectedDraw.points
  ) {
    selectedDraw.points = selectedDraw.points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));
  }

  if (selectedDraw.shape === "freeHand" && intialPointsForFreeHandMove) {
    const dx = intialPointsForFreeHandMove.initialPoint.x - x;
    const dy = intialPointsForFreeHandMove.initialPoint.y - y;
    selectedDraw.points = intialPointsForFreeHandMove.originalPoints.map(
      (point) => ({
        x: point.x - dx,
        y: point.y - dy,
      })
    );
  }

  const ind = diagrams.findIndex((draw) => draw.id === selectedDraw.id);

  diagrams[ind] = selectedDraw;

  return selectedDraw;
}

export function handleShapeSelectionBox(
  draw: Draw,
  ctx: CanvasRenderingContext2D
): Draw | null {
  let farthestLeft = Math.min(draw.startX!, draw.endX!);
  let farthestRight = Math.max(draw.startX!, draw.endX!);
  let farthestTop = Math.min(draw.startY!, draw.endY!);
  let farthestBottom = Math.max(draw.startY!, draw.endY!);
  switch (draw.shape) {
    case "rectangle":
    case "circle":
      return {
        ...draw,
        id: "0",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
      };
    case "diamond":
      return {
        ...draw,
        id: "0",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
      };
    case "line":
    case "arrow":
      const p1 = { x: draw.startX!, y: draw.startY! };
      const p2 = { x: draw.points![0]!.x, y: draw.points![0]!.y };
      const p3 = { x: draw.endX!, y: draw.endY! };

      farthestLeft = Math.min(p1.x, p2.x, p3.x);
      farthestRight = Math.max(p1.x, p2.x, p3.x);
      farthestTop = Math.min(p1.y, p2.y, p3.y);
      farthestBottom = Math.max(p1.y, p2.y, p3.y);

      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
        points: [p1, p2, p3],
      };
    case "freeHand":
      const points = draw.points!;
      farthestLeft = Math.min(...points.map((point) => point.x));
      farthestRight = Math.max(...points.map((point) => point.x));
      farthestTop = Math.min(...points.map((point) => point.y));
      farthestBottom = Math.max(...points.map((point) => point.y));
      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: farthestLeft - 5,
        startY: farthestTop - 5,
        endX: farthestRight + 5,
        endY: farthestBottom + 5,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
      };
    case "text":
      ctx.font = `${draw.fontSize}px ${draw.font}`;
      const lines = (draw.text || "").split("\n");
      const maxTextWidth = Math.max(...lines.map(line => ctx.measureText(line).width), 0);
      const lineHeight = parseInt(draw.fontSize!) * 1.2;
      const endX = draw.startX! + maxTextWidth;
      const endY = draw.startY! - parseInt(draw.fontSize!);
      const bottomY = draw.startY! + (lines.length - 1) * lineHeight;
      return {
        ...draw,
        id: "1",
        shape: "rectangle",
        startX: draw.startX! - 10,
        startY: bottomY + 10,
        endX: endX + 10,
        endY: endY - 10,
        fillStyle: "transparent",
        strokeStyle: "#5588ff",
        lineWidth: 2,
        text: "text",
      };
    default:
      return null;
  }
}
