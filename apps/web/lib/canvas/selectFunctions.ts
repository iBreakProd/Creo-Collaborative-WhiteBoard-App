import { Draw } from "@/types";

export const getDrawAtPosition: (
  x: number,
  y: number,
  diagrams: Draw[],
  ctx: CanvasRenderingContext2D
) => Draw | null = (
  x: number,
  y: number,
  diagrams: Draw[],
  ctx: CanvasRenderingContext2D
) => {
  for (let i = diagrams.length - 1; i >= 0; i--) {
    const draw = diagrams[i];
    if (isWithinDraw(x, y, draw!, ctx)) {
      return draw!;
    }
  }
  return null;
};

export const isWithinDraw: (
  mouseX: number,
  mouseY: number,
  draw: Draw,
  ctx: CanvasRenderingContext2D
) => boolean = (
  mouseX: number,
  mouseY: number,
  draw: Draw,
  ctx: CanvasRenderingContext2D
) => {
  if (!draw) return false;
  const shape = draw.shape;

  switch (shape) {
    case "rectangle": {
      if (
        draw.startX === undefined ||
        draw.startY === undefined ||
        draw.endX === undefined ||
        draw.endY === undefined
      )
        return false;
      const minX = Math.min(draw.startX, draw.endX);
      const maxX = Math.max(draw.startX, draw.endX);
      const minY = Math.min(draw.startY, draw.endY);
      const maxY = Math.max(draw.startY, draw.endY);
      return (
        mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY
      );
    }
    case "diamond": {
      if (
        draw.startX === undefined ||
        draw.startY === undefined ||
        draw.endX === undefined ||
        draw.endY === undefined
      )
        return false;
      const width = draw.endX - draw.startX;
      const height = draw.endY - draw.startY;

      const absWidth = Math.abs(width);
      const absHeight = Math.abs(height);

      const centerX = draw.startX + width / 2;
      const centerY = draw.startY + height / 2;

      if (absWidth === 0 || absHeight === 0) {
        // Handle severely malformed diamond (a line or a point)
        const p1 = { x: draw.startX, y: draw.startY };
        const p2 = { x: draw.endX, y: draw.endY };
        const lineTolerance = 5;

        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) {
          // It's a point
          return (
            Math.pow(mouseX - p1.x, 2) + Math.pow(mouseY - p1.y, 2) <
            lineTolerance * lineTolerance
          );
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dxLine = mouseX - closestX;
        const dyLine = mouseY - closestY;

        const distSq = dxLine * dxLine + dyLine * dyLine;

        return distSq < lineTolerance * lineTolerance;
      }

      const dx = Math.abs(mouseX - centerX);
      const dy = Math.abs(mouseY - centerY);

      const isInside = dx / (absWidth / 2) + dy / (absHeight / 2) <= 1;

      // Circumference check
      const vertices = [
        { x: centerX, y: draw.startY }, // top
        { x: draw.endX, y: centerY }, // right
        { x: centerX, y: draw.endY }, // bottom
        { x: draw.startX, y: centerY }, // left
      ];

      let onCircumference = false;
      for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i]!;
        const p2 = vertices[(i + 1) % vertices.length]!;
        const lineTolerance = 5;
        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) continue;

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dx_line = mouseX - closestX;
        const dy_line = mouseY - closestY;

        const distSq = dx_line * dx_line + dy_line * dy_line;

        if (distSq < lineTolerance * lineTolerance) {
          onCircumference = true;
          break;
        }
      }

      if (draw.fillStyle !== "transparent") {
        return isInside || onCircumference;
      } else {
        return onCircumference;
      }
    }
    case "circle": {
      if (
        draw.startX === undefined ||
        draw.startY === undefined ||
        draw.endX === undefined ||
        draw.endY === undefined
      )
        return false;
      const centerX = (draw.startX + draw.endX) / 2;
      const centerY = (draw.startY + draw.endY) / 2;

      const radiusX = Math.abs(draw.endX - draw.startX) / 2;
      const radiusY = Math.abs(draw.endY - draw.startY) / 2;

      // Handle severely malformed circle (a line or a point)
      if (radiusX === 0 || radiusY === 0) {
        let p1, p2;
        if (radiusX === 0 && radiusY === 0) {
          // Point
          p1 = { x: centerX, y: centerY };
          p2 = { x: centerX, y: centerY };
        } else if (radiusX === 0) {
          // Vertical line
          p1 = { x: centerX, y: draw.startY };
          p2 = { x: centerX, y: draw.endY };
        } else {
          // Horizontal line
          p1 = { x: draw.startX, y: centerY };
          p2 = { x: draw.endX, y: centerY };
        }

        const lineTolerance = 5;
        const lenSq = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (lenSq === 0) {
          // It's a point
          return (
            Math.pow(mouseX - p1.x, 2) + Math.pow(mouseY - p1.y, 2) <
            lineTolerance * lineTolerance
          );
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);

        const dxLine = mouseX - closestX;
        const dyLine = mouseY - closestY;

        const distSq = dxLine * dxLine + dyLine * dyLine;

        return distSq < lineTolerance * lineTolerance;
      }

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;

      // Check if inside the ellipse
      const isInside =
        (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1;

      // Circumference check
      const lineTolerance = 5;
      const outerRadiusX = radiusX + lineTolerance;
      const outerRadiusY = radiusY + lineTolerance;
      const isInsideOuter =
        (dx * dx) / (outerRadiusX * outerRadiusX) +
          (dy * dy) / (outerRadiusY * outerRadiusY) <=
        1;

      const innerRadiusX = radiusX - lineTolerance;
      const innerRadiusY = radiusY - lineTolerance;

      if (innerRadiusX <= 0 || innerRadiusY <= 0) {
        // For thin ellipses, the circumference is the whole shape within the tolerance
        const isOnCircumference = isInsideOuter;
        if (draw.fillStyle !== "transparent") {
          return isInside || isOnCircumference;
        }
        return isOnCircumference;
      }

      const isInsideInner =
        (dx * dx) / (innerRadiusX * innerRadiusX) +
          (dy * dy) / (innerRadiusY * innerRadiusY) <=
        1;

      const isOnCircumference = isInsideOuter && !isInsideInner;

      if (draw.fillStyle !== "transparent") {
        return isInside || isOnCircumference;
      } else {
        return isOnCircumference;
      }
    }
    case "line": {
      // For lines with an intermediate point, check for proximity to the quadratic Bezier curve.
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.startX!, y: draw.startY! };
        const p1 = draw.points[0]!;
        const p2 = { x: draw.endX!, y: draw.endY! };

        // Calculate the control point for the curve, identical to the rendering function.
        const controlPoint = {
          x: 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x,
          y: 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y,
        };

        const lineTolerance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = i / numSamples;
          // Using the quadratic Bezier formula: B(t) = (1-t)^2*P0 + 2(1-t)t*P_control + t^2*P2
          const Bx =
            (1 - t) ** 2 * p0.x +
            2 * (1 - t) * t * controlPoint.x +
            t ** 2 * p2.x;
          const By =
            (1 - t) ** 2 * p0.y +
            2 * (1 - t) * t * controlPoint.y +
            t ** 2 * p2.y;

          const distSq = (mouseX - Bx) ** 2 + (mouseY - By) ** 2;
          if (distSq < lineTolerance ** 2) {
            return true;
          }
        }
        return false;
      }

      // For straight lines or polylines, check distance to each segment.
      const points = [
        { x: draw.startX!, y: draw.startY! },
        ...(draw.points || []),
        { x: draw.endX!, y: draw.endY! },
      ];
      const lineTolerance = 5;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;

        if (lenSq === 0) {
          if ((mouseX - p1.x) ** 2 + (mouseY - p1.y) ** 2 < lineTolerance ** 2)
            return true;
          continue;
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);
        const distSq = (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2;

        if (distSq < lineTolerance ** 2) {
          return true;
        }
      }
      return false;
    }
    case "arrow": {
      // For lines with an intermediate point, check for proximity to the quadratic Bezier curve.
      if (draw.points && draw.points.length === 1) {
        const p0 = { x: draw.startX!, y: draw.startY! };
        const p1 = draw.points[0]!;
        const p2 = { x: draw.endX!, y: draw.endY! };

        const controlPoint = {
          x: 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x,
          y: 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y,
        };

        const lineTolerance = 5;
        const numSamples = 1000;

        for (let i = 0; i <= numSamples; i++) {
          const t = i / numSamples;
          const Bx =
            (1 - t) ** 2 * p0.x +
            2 * (1 - t) * t * controlPoint.x +
            t ** 2 * p2.x;
          const By =
            (1 - t) ** 2 * p0.y +
            2 * (1 - t) * t * controlPoint.y +
            t ** 2 * p2.y;

          const distSq = (mouseX - Bx) ** 2 + (mouseY - By) ** 2;
          if (distSq < lineTolerance ** 2) {
            return true;
          }
        }

        const angle = Math.atan2(
          p2.y -
            (2 * (1 - 0.99) * 0.99 * controlPoint.y +
              0.99 ** 2 * p2.y +
              (1 - 0.99) ** 2 * p0.y),
          p2.x -
            (2 * (1 - 0.99) * 0.99 * controlPoint.x +
              0.99 ** 2 * p2.x +
              (1 - 0.99) ** 2 * p0.x)
        );

        const arrowLength = 20;
        const arrowWidth = 10;
        const x1 = p2.x - arrowLength * Math.cos(angle - Math.PI / 6);
        const y1 = p2.y - arrowLength * Math.sin(angle - Math.PI / 6);
        const x2 = p2.x - arrowLength * Math.cos(angle + Math.PI / 6);
        const y2 = p2.y - arrowLength * Math.sin(angle + Math.PI / 6);

        // Check if the mouse is within the arrowhead triangle
        const isInsideArrowhead = isPointInTriangle(
          { x: mouseX, y: mouseY },
          p2,
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        );

        return isInsideArrowhead;
      }

      const points = [
        { x: draw.startX!, y: draw.startY! },
        ...(draw.points || []),
        { x: draw.endX!, y: draw.endY! },
      ];
      const lineTolerance = 5;
      let isOnLine = false;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]!;
        const p2 = points[i + 1]!;
        const lenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;

        if (lenSq === 0) {
          if (
            (mouseX - p1.x) ** 2 + (mouseY - p1.y) ** 2 <
            lineTolerance ** 2
          ) {
            isOnLine = true;
            break;
          }
          continue;
        }

        let t =
          ((mouseX - p1.x) * (p2.x - p1.x) + (mouseY - p1.y) * (p2.y - p1.y)) /
          lenSq;
        t = Math.max(0, Math.min(1, t));
        const closestX = p1.x + t * (p2.x - p1.x);
        const closestY = p1.y + t * (p2.y - p1.y);
        const distSq = (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2;

        if (distSq < lineTolerance ** 2) {
          isOnLine = true;
          break;
        }
      }

      if (isOnLine) return true;

      // Arrowhead selection for straight lines/polylines
      const p_end = points[points.length - 1]!;
      const p_before_end = points[points.length - 2]!;
      const angle = Math.atan2(
        p_end.y - p_before_end.y,
        p_end.x - p_before_end.x
      );

      const arrowLength = 20;
      const x1 = p_end.x - arrowLength * Math.cos(angle - Math.PI / 6);
      const y1 = p_end.y - arrowLength * Math.sin(angle - Math.PI / 6);
      const x2 = p_end.x - arrowLength * Math.cos(angle + Math.PI / 6);
      const y2 = p_end.y - arrowLength * Math.sin(angle + Math.PI / 6);

      const isInsideArrowhead = isPointInTriangle(
        { x: mouseX, y: mouseY },
        p_end,
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );

      return isInsideArrowhead;
    }
    case "freeHand": {
      if (!draw.points || draw.points.length < 2) {
        return false;
      }

      const lineTolerance = 5;

      for (let i = 0; i < draw.points.length - 1; i++) {
        const p1 = draw.points[i]!;
        const p2 = draw.points[i + 1]!;

        const x1 = p1.x;
        const y1 = p1.y;
        const x2 = p2.x;
        const y2 = p2.y;

        const lenSq = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        if (lenSq === 0) {
          if (
            Math.pow(mouseX - x1, 2) + Math.pow(mouseY - y1, 2) <
            lineTolerance * lineTolerance
          ) {
            return true;
          }
          continue;
        }

        let t = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);

        const dx = mouseX - closestX;
        const dy = mouseY - closestY;

        const distSq = dx * dx + dy * dy;

        if (distSq < lineTolerance * lineTolerance) {
          return true;
        }
      }

      return false;
    }
    case "text": {
      const { text, font, fontSize } = draw;
      if (!text || !font || !fontSize) return false;

      ctx.font = `${fontSize}px ${font}`;
      const lines = text.split("\n");
      const maxTextWidth = Math.max(...lines.map(line => ctx.measureText(line).width), 0);
      const textHeight = parseInt(fontSize);
      const lineHeight = textHeight * 1.2;
      
      const topY = draw.startY! - textHeight;
      const bottomY = draw.startY! + (lines.length - 1) * lineHeight;

      return (
        mouseX >= draw.startX! &&
        mouseX <= draw.startX! + maxTextWidth &&
        mouseY >= topY &&
        mouseY <= bottomY
      );
    }
    default: {
      return false;
    }
  }
};

function isPointInTriangle(
  p: { x: number; y: number },
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) {
  const s =
    p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y;
  const t =
    p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y;

  if (s < 0 != t < 0 && s != 0 && t != 0) {
    return false;
  }

  const A =
    -p1.y * p2.x + p0.y * (p2.x - p1.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y;

  return A < 0 ? s <= 0 && s + t >= A : s >= 0 && s + t <= A;
}

export function hoverOverSelectionBox(
  selectionBox: Draw | null,
  x: number,
  y: number
): {
  cursor: string;
  position:
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | `point-${number}`;
} | null {
  if (!selectionBox) return null;

  const topLeft = { x: selectionBox.startX!, y: selectionBox.startY! };
  const topRight = { x: selectionBox.endX!, y: selectionBox.startY! };
  const bottomRight = { x: selectionBox.endX!, y: selectionBox.endY! };
  const bottomLeft = { x: selectionBox.startX!, y: selectionBox.endY! };

  const leftEdge = {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: bottomLeft.x,
    y2: bottomLeft.y,
  };
  const rightEdge = {
    x1: topRight.x,
    y1: topRight.y,
    x2: bottomRight.x,
    y2: bottomRight.y,
  };
  const topEdge = {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: topRight.x,
    y2: topRight.y,
  };
  const bottomEdge = {
    x1: bottomLeft.x,
    y1: bottomLeft.y,
    x2: bottomRight.x,
    y2: bottomRight.y,
  };

  if (selectionBox.text === "text") {
    if (
      x >= bottomRight.x - 4 &&
      x <= bottomRight.x + 4 &&
      y >= bottomRight.y - 4 &&
      y <= bottomRight.y + 4
    ) {
      return { cursor: "nesw-resize", position: "topRight" };
    }
    return null;
  }

  if (
    x >= topLeft.x - 4 &&
    x <= topLeft.x + 4 &&
    y >= topLeft.y - 4 &&
    y <= topLeft.y + 4
  ) {
    return { cursor: "nwse-resize", position: "topLeft" };
  } else if (
    x >= topRight.x - 4 &&
    x <= topRight.x + 4 &&
    y >= topRight.y - 4 &&
    y <= topRight.y + 4
  ) {
    return { cursor: "nesw-resize", position: "topRight" };
  } else if (
    x >= bottomRight.x - 4 &&
    x <= bottomRight.x + 4 &&
    y >= bottomRight.y - 4 &&
    y <= bottomRight.y + 4
  ) {
    return { cursor: "nwse-resize", position: "bottomRight" };
  } else if (
    x >= bottomLeft.x - 4 &&
    x <= bottomLeft.x + 4 &&
    y >= bottomLeft.y - 4 &&
    y <= bottomLeft.y + 4
  ) {
    return { cursor: "nesw-resize", position: "bottomLeft" };
  } else if (
    x >= leftEdge.x1 - 4 &&
    x <= leftEdge.x2 + 4 &&
    y >= leftEdge.y1 - 4 &&
    y <= leftEdge.y2 + 4
  ) {
    return { cursor: "ew-resize", position: "left" };
  } else if (
    x >= rightEdge.x1 - 4 &&
    x <= rightEdge.x2 + 4 &&
    y >= rightEdge.y1 - 4 &&
    y <= rightEdge.y2 + 4
  ) {
    return { cursor: "ew-resize", position: "right" };
  } else if (
    y >= topEdge.y1 - 4 &&
    y <= topEdge.y2 + 4 &&
    x >= topEdge.x1 - 4 &&
    x <= topEdge.x2 + 4
  ) {
    return { cursor: "ns-resize", position: "top" };
  } else if (
    y >= bottomEdge.y1 - 4 &&
    y <= bottomEdge.y2 + 4 &&
    x >= bottomEdge.x1 - 4 &&
    x <= bottomEdge.x2 + 4
  ) {
    return { cursor: "ns-resize", position: "bottom" };
  }

  if (selectionBox.points) {
    for (let index = 0; index < selectionBox.points.length; index++) {
      const point = selectionBox.points[index];
      if (
        x >= point!.x - 8 &&
        x <= point!.x + 8 &&
        y >= point!.y - 8 &&
        y <= point!.y + 8
      ) {
        return { cursor: "pointer", position: `point-${index}` };
      }
    }
  }

  return null;
}
