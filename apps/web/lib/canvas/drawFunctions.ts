import { Draw } from "@/types";

export const renderDraws = (
  ctx: CanvasRenderingContext2D,
  canvasCurrent: HTMLCanvasElement,
  diagrams: Draw[],
  activeDraw: Draw | null,
  selectionBox: Draw | null,
  activeAction:
    | "select"
    | "move"
    | "draw"
    | "resize"
    | "edit"
    | "erase"
    | "pan"
    | "zoom",
  selectedDraw: Draw | null,
  toErase: Draw[],
  panOffset: { x: number; y: number },
  scale: number
) => {
  ctx.save();
  ctx.clearRect(0, 0, canvasCurrent.width, canvasCurrent.height);
  ctx.translate(panOffset.x, panOffset.y);
  ctx.scale(scale, scale);

  diagrams.forEach((diagram) => {
    ctx.save();
    if (diagram.strokeStyle) {
      ctx.strokeStyle = diagram.strokeStyle;
    }
    if (diagram.fillStyle) {
      ctx.fillStyle = diagram.fillStyle;
    }
    if (diagram.lineWidth) {
      ctx.lineWidth = diagram.lineWidth;
    }
    if (toErase?.includes(diagram)) {
      ctx.globalAlpha = 0.2;
    }
    switch (diagram.shape) {
      case "rectangle":
        renderRectangle(ctx, diagram);
        break;
      case "diamond":
        renderDiamond(ctx, diagram);
        break;
      case "circle":
        renderCircle(ctx, diagram);
        break;
      case "line":
        renderLine(ctx, diagram);
        break;
      case "arrow":
        renderArrow(ctx, diagram);
        break;
      case "freeHand":
        renderFreeHand(ctx, diagram);
        break;
      case "text":
        renderText(ctx, diagram);
        break;
    }
    ctx.restore();
  });
  if (activeDraw) {
    if (activeDraw.strokeStyle) {
      ctx.strokeStyle = activeDraw.strokeStyle;
    }
    if (activeDraw.fillStyle) {
      ctx.fillStyle = activeDraw.fillStyle;
    }
    if (activeDraw.lineWidth) {
      ctx.lineWidth = activeDraw.lineWidth;
    }
    switch (activeDraw.shape) {
      case "rectangle":
        renderRectangle(ctx, activeDraw);
        break;
      case "diamond":
        renderDiamond(ctx, activeDraw);
        break;
      case "circle":
        renderCircle(ctx, activeDraw);
        break;
      case "line":
        renderLine(ctx, activeDraw);
        break;
      case "arrow":
        renderArrow(ctx, activeDraw);
        break;
      case "freeHand":
        renderFreeHand(ctx, activeDraw);
        break;
      case "text":
        renderText(ctx, activeDraw);
        renderCursor(ctx, activeDraw);
        break;
    }
  }
  if (selectionBox) {
    renderSelectionBox(ctx, selectionBox);
    if (selectedDraw?.shape === "text" && activeAction === "edit") {
      renderCursor(ctx, selectedDraw);
    }
  }
  ctx.restore();
};

function renderRectangle(ctx: CanvasRenderingContext2D, diagram: Draw) {
  const cornerRadius = Math.min(
    40,
    Math.min(
      Math.abs(diagram.endX! - diagram.startX!),
      Math.abs(diagram.endY! - diagram.startY!)
    ) * 0.2,
    Math.min(
      Math.abs(diagram.endX! - diagram.startX!),
      Math.abs(diagram.endY! - diagram.startY!)
    ) / 2
  );
  ctx.beginPath();
  ctx.roundRect(
    diagram.startX!,
    diagram.startY!,
    diagram.endX! - diagram.startX!,
    diagram.endY! - diagram.startY!,
    cornerRadius
  );
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}

function renderDiamond(ctx: CanvasRenderingContext2D, diagram: Draw) {
  let width = diagram.endX! - diagram.startX!;
  let height = diagram.endY! - diagram.startY!;

  let x = diagram.startX!;
  let y = diagram.startY!;

  // Ensure curvature is within the valid range [0, 0.5]
  const f = 0.25;

  // The 4 main vertices of the diamond (top, right, bottom, left)
  const Vt = { x: x + width / 2, y: y };
  const Vr = { x: x + width, y: y + height / 2 };
  const Vb = { x: x + width / 2, y: y + height };
  const Vl = { x: x, y: y + height / 2 };

  // Points near the Top vertex
  const P_tl_t = { x: (1 - f) * Vt.x + f * Vl.x, y: (1 - f) * Vt.y + f * Vl.y };
  const P_tr_t = { x: (1 - f) * Vt.x + f * Vr.x, y: (1 - f) * Vt.y + f * Vr.y };

  // Points near the Right vertex
  const P_rt_r = { x: (1 - f) * Vr.x + f * Vt.x, y: (1 - f) * Vr.y + f * Vt.y };
  const P_rb_r = { x: (1 - f) * Vr.x + f * Vb.x, y: (1 - f) * Vr.y + f * Vb.y };

  // Points near the Bottom vertex
  const P_br_b = { x: (1 - f) * Vb.x + f * Vr.x, y: (1 - f) * Vb.y + f * Vr.y };
  const P_bl_b = { x: (1 - f) * Vb.x + f * Vl.x, y: (1 - f) * Vb.y + f * Vl.y };

  // Points near the Left vertex
  const P_lb_l = { x: (1 - f) * Vl.x + f * Vb.x, y: (1 - f) * Vl.y + f * Vb.y };
  const P_lt_l = { x: (1 - f) * Vl.x + f * Vt.x, y: (1 - f) * Vl.y + f * Vt.y };

  // Construct the path using lines and quadratic curves
  ctx.beginPath();
  ctx.moveTo(P_tl_t.x, P_tl_t.y); // Start at the point on the top-left edge

  // Curve around the Top vertex
  ctx.quadraticCurveTo(Vt.x, Vt.y, P_tr_t.x, P_tr_t.y);
  ctx.lineTo(P_rt_r.x, P_rt_r.y); // Straight line on the top-right edge

  // Curve around the Right vertex
  ctx.quadraticCurveTo(Vr.x, Vr.y, P_rb_r.x, P_rb_r.y);
  ctx.lineTo(P_br_b.x, P_br_b.y); // Straight line on the bottom-right edge

  // Curve around the Bottom vertex
  ctx.quadraticCurveTo(Vb.x, Vb.y, P_bl_b.x, P_bl_b.y);
  ctx.lineTo(P_lb_l.x, P_lb_l.y); // Straight line on the bottom-left edge
  ctx.quadraticCurveTo(Vl.x, Vl.y, P_lt_l.x, P_lt_l.y);
  ctx.lineTo(P_tl_t.x, P_tl_t.y);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}

function renderCircle(ctx: CanvasRenderingContext2D, diagram: Draw) {
  const centerX = (diagram.startX! + diagram.endX!) / 2;
  const centerY = (diagram.startY! + diagram.endY!) / 2;

  const radiusX = Math.abs(diagram.endX! - diagram.startX!) / 2;
  const radiusY = Math.abs(diagram.endY! - diagram.startY!) / 2;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
}

function renderLine(ctx: CanvasRenderingContext2D, diagram: Draw) {
  ctx.beginPath();
  ctx.moveTo(diagram.startX!, diagram.startY!);

  const p0 = { x: diagram.startX!, y: diagram.startY! };
  const p1 = diagram.points![0]!;
  const p2 = { x: diagram.endX!, y: diagram.endY! };

  const controlPointX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
  const controlPointY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;

  ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x, p2.y);

  ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, diagram: Draw) {
  const p0 = { x: diagram.startX!, y: diagram.startY! };
  const p1 = diagram.points![0]!;
  const p2 = { x: diagram.endX!, y: diagram.endY! };

  const controlPointX = 2 * p1.x - 0.5 * p0.x - 0.5 * p2.x;
  const controlPointY = 2 * p1.y - 0.5 * p0.y - 0.5 * p2.y;

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(controlPointX, controlPointY, p2.x, p2.y);
  ctx.stroke();

  // Calculate the angle of the arrow head from the tangent of the curve
  const tangentDx = p2.x - controlPointX;
  const tangentDy = p2.y - controlPointY;
  const angle = Math.atan2(tangentDy, tangentDx);

  const lineLength = Math.sqrt(
    Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)
  );
  const headLength =
    Math.min(lineLength * 0.2, 20) + (diagram.lineWidth ?? 1) * 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(
    p2.x - headLength * Math.cos(angle - Math.PI / 10),
    p2.y - headLength * Math.sin(angle - Math.PI / 10)
  );
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(
    p2.x - headLength * Math.cos(angle + Math.PI / 10),
    p2.y - headLength * Math.sin(angle + Math.PI / 10)
  );
  ctx.stroke();
  ctx.restore();
}

function renderFreeHand(ctx: CanvasRenderingContext2D, diagram: Draw) {
  if (!diagram.points || diagram.points.length < 2) {
    return;
  }

  ctx.beginPath();
  ctx.moveTo(diagram.points[0]!.x, diagram.points[0]!.y);

  // Use quadratic curves for a smoother line
  for (let i = 1; i < diagram.points.length - 2; i += 2) {
    // Calculate the midpoint for the curve
    const xc = (diagram.points[i]!.x + diagram.points[i + 2]!.x) / 2;
    const yc = (diagram.points[i]!.y + diagram.points[i + 2]!.y) / 2;
    // The current point is the control point, and the midpoint is the end point
    ctx.quadraticCurveTo(diagram.points[i]!.x, diagram.points[i]!.y, xc, yc);
  }
  ctx.lineTo(
    diagram.points[diagram.points.length - 1]!.x,
    diagram.points[diagram.points.length - 1]!.y
  );

  ctx.stroke();
}

function renderText(ctx: CanvasRenderingContext2D, diagram: Draw) {
  ctx.font = `${diagram.fontSize!}px ${diagram.font!}`;
  ctx.fillStyle = diagram.strokeStyle!;
  const lines = (diagram.text || "").split("\n");
  const lineHeight = parseInt(diagram.fontSize!) * 1.2;
  lines.forEach((line, index) => {
    ctx.fillText(line, diagram.startX!, diagram.startY! + index * lineHeight);
  });
}

function renderCursor(ctx: CanvasRenderingContext2D, diagram: Draw) {
  ctx.font = `${diagram.fontSize!}px ${diagram.font!}`;
  const lines = (diagram.text || "").split("\n");
  const lastLine = lines[lines.length - 1] || "";
  const textWidth = ctx.measureText(lastLine).width;
  const lineHeight = parseInt(diagram.fontSize!) * 1.2;
  const cursorX = diagram.startX! + textWidth;
  const cursorY = diagram.startY! + (lines.length - 1) * lineHeight;

  if (Math.floor(Date.now() / 600) % 2) {
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY + 3);
    ctx.lineTo(cursorX, cursorY - parseInt(diagram.fontSize!) - 3);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function renderSelectionBox(ctx: CanvasRenderingContext2D, selectionBox: Draw) {
  if (selectionBox.strokeStyle) {
    ctx.strokeStyle = selectionBox.strokeStyle;
  }
  if (selectionBox.fillStyle) {
    ctx.fillStyle = selectionBox.fillStyle;
  }
  if (selectionBox.lineWidth) {
    ctx.lineWidth = selectionBox.lineWidth;
  }
  const corner_1 = {
    x: selectionBox.startX!,
    y: selectionBox.startY!,
  };
  const corner_2 = { x: selectionBox.endX!, y: selectionBox.startY! };
  const corner_3 = { x: selectionBox.endX!, y: selectionBox.endY! };
  const corner_4 = { x: selectionBox.startX!, y: selectionBox.endY! };
  ctx.beginPath();
  ctx.strokeRect(
    selectionBox.startX!,
    selectionBox.startY!,
    selectionBox.endX! - selectionBox.startX!,
    selectionBox.endY! - selectionBox.startY!
  );
  ctx.fillStyle = "#cccccc";
  ctx.lineWidth = 1;
  if (selectionBox.text === "text") {
    const corner = { x: selectionBox.endX!, y: selectionBox.endY! };
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 3, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  } else {
    ctx.fillRect(corner_1.x - 4, corner_1.y - 4, 8, 8);
    ctx.fillRect(corner_2.x - 4, corner_2.y - 4, 8, 8);
    ctx.fillRect(corner_3.x - 4, corner_3.y - 4, 8, 8);
    ctx.fillRect(corner_4.x - 4, corner_4.y - 4, 8, 8);
    ctx.strokeRect(corner_1.x - 4, corner_1.y - 4, 8, 8);
    ctx.strokeRect(corner_2.x - 4, corner_2.y - 4, 8, 8);
    ctx.strokeRect(corner_3.x - 4, corner_3.y - 4, 8, 8);
    ctx.strokeRect(corner_4.x - 4, corner_4.y - 4, 8, 8);
    ctx.stroke();
    ctx.fill();
    if (selectionBox.points.length === 3) {
      ctx.fillStyle = "#5588ff";
      ctx.beginPath();
      ctx.moveTo(selectionBox.points[0]!.x, selectionBox.points[0]!.y);

      ctx.arc(
        selectionBox.points[0]!.x,
        selectionBox.points[0]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[1]!.x, selectionBox.points[1]!.y);
      ctx.arc(
        selectionBox.points[1]!.x,
        selectionBox.points[1]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[2]!.x, selectionBox.points[2]!.y);
      ctx.arc(
        selectionBox.points[2]!.x,
        selectionBox.points[2]!.y,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = "#5588ff70";
      ctx.moveTo(selectionBox.points[0]!.x, selectionBox.points[0]!.y);
      ctx.arc(
        selectionBox.points[0]!.x,
        selectionBox.points[0]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[1]!.x, selectionBox.points[1]!.y);
      ctx.arc(
        selectionBox.points[1]!.x,
        selectionBox.points[1]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.moveTo(selectionBox.points[2]!.x, selectionBox.points[2]!.y);
      ctx.arc(
        selectionBox.points[2]!.x,
        selectionBox.points[2]!.y,
        8,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
  ctx.closePath();
}
