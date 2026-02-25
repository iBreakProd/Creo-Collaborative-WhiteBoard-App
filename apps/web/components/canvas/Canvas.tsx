"use client";

import { renderDraws } from "@/lib/canvas/drawFunctions";
import {
  moveDraw,
  resizeDraw,
  handleShapeSelectionBox,
  calculateFarthestPoints,
} from "@/lib/canvas/updateFunctions";
import {
  getDrawAtPosition,
  hoverOverSelectionBox,
} from "@/lib/canvas/selectFunctions";
import { Action, Draw, Message } from "@/types";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useRef, useState } from "react";
import { BsFonts } from "react-icons/bs";
import {
  PiArrowRight,
  PiChatsCircle,
  PiCircle,
  PiCircleFill,
  PiCursor,
  PiCursorFill,
  PiDiamond,
  PiDiamondFill,
  PiEraser,
  PiEraserFill,
  PiLineVertical,
  PiLineVerticalLight,
  PiMinus,
  PiPencil,
  PiPencilFill,
  PiPlus,
  PiSquare,
  PiSquareFill,
} from "react-icons/pi";
import { LiaHandPaper, LiaHandRock } from "react-icons/lia";
import {
  performAction,
  performRedo,
  performUndo,
  pushToUndoRedoArray,
} from "@/lib/canvas/actionRelatedFunctions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { TbZoom } from "react-icons/tb";
import { GrRedo, GrUndo } from "react-icons/gr";
import { AiOutlineHome } from "react-icons/ai";
import { BiCopy } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { setUser, setActiveRoom } from "@/lib/features/meetdraw/appSlice";
import { useWebSocket } from "@/lib/hooks/websocket";
import { fetchRoomById } from "@/actions/roomActions";
import { toast } from "@workspace/ui/components/sonner";
import { WebSocketMessage } from "@workspace/common";
import ChatBar from "./ChatBar";
import {
  fetchAllChatMessages,
  fetchMoreChatMessages,
} from "@/actions/chatActions";
import { fetchAllDraws } from "@/actions/contentActions";

const CURSOR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#d946ef", "#ec4899", "#f43f5e",
];

const getCursorColor = (identifier: string) => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

const Canvas = ({ roomId, token }: { roomId: string; token: string }) => {
  const [showChatBar, setShowChatBar] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { socket, isLoading, isError } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
  );
  const [serverReady, setServerReady] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.app.user);
  const room = useAppSelector((state) => state.app.activeRoom);
  const [isFetchingRoom, setFetchingRoom] = useState<boolean>(!room);
  const [activeAction, setActiveAction] = useState<
    "select" | "move" | "draw" | "resize" | "edit" | "erase" | "pan" | "zoom"
  >("select");
  const [activeShape, setActiveShape] = useState<
    "rectangle" | "diamond" | "circle" | "line" | "arrow" | "text" | "freeHand"
  >("rectangle");
  const [selectedShape, setSelectedShape] = useState<
    | "rectangle"
    | "diamond"
    | "circle"
    | "line"
    | "arrow"
    | "text"
    | "freeHand"
    | null
  >(null);
  const [activeStrokeStyle, setActiveStrokeStyle] = useState<string>("#eeeeee");
  const [activeFillStyle, setActiveFillStyle] = useState<string>("#eeeeee00");
  const [activeLineWidth, setActiveLineWidth] = useState<number>(2);
  const [activeFont, setActiveFont] = useState<string>("Arial");
  const [activeFontSize, setActiveFontSize] = useState<string>("20");
  const panOffset = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const lastSrNoRef = useRef<number>(0);
  const chatMessageInputRef = useRef<HTMLTextAreaElement>(null);
  const unreadMessagesRef = useRef<boolean>(false);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] =
    useState<boolean>(false);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; username: string; color: string }>>({});
  const lastCursorEmitTimeRef = useRef<number>(0);
  const activeDraw = useRef<Draw>(null);
  const selectedDraw = useRef<Draw>(null);
  const originalDrawState = useRef<Draw>(null);
  const modifiedDrawState = useRef<Draw>(null);
  const movingOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scale = useRef<number>(1);
  const intialPointsForFreeHandMove = useRef<{
    initialPoint: { x: number; y: number };
    originalPoints: { x: number; y: number }[];
  } | null>(null);
  const resizingInfo = useRef<
    | "topLeft"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | `point-${number}`
    | null
  >(null);
  const farthestPointsInfoForLineAndArror = useRef<{
    farthestLeftPoint: { point: "start" | "end" | "point"; x: number };
    farthestRightPoint: { point: "start" | "end" | "point"; x: number };
    farthestTopPoint: { point: "start" | "end" | "point"; y: number };
    farthestBottomPoint: { point: "start" | "end" | "point"; y: number };
  } | null>(null);
  const shapeSelectionBox = useRef<Draw>(null);
  const isErasing = useRef<boolean>(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const textInp = useRef<string>("");
  const undoRedoArrayRef = useRef<Action[]>([]);
  const editCounterRef = useRef<number>(0);
  const undoRedoIndexRef = useRef<number>(-1);
  const toErase = useRef<Draw[]>([]);
  const diagrams = useRef<Draw[]>([]);

  const updateUndoRedoState = () => {
    setCanUndo(undoRedoIndexRef.current >= 0);
    setCanRedo(undoRedoIndexRef.current < undoRedoArrayRef.current.length - 1);
  };

  useEffect(() => {
    if (!token) {
      router.replace("/signin");
    }

    if (!user) {
      const user = JSON.parse(sessionStorage.getItem("user")!);
      if (user) {
        dispatch(setUser(user));
      }
    }

    const fetchDraws = async () => {
      const draws = await fetchAllDraws(roomId);
      diagrams.current = draws;
    };

    fetchDraws();
  }, [user, token, dispatch]);

  useEffect(() => {
    const initRoom = async () => {
      if (!room && roomId) {
        setFetchingRoom(true);
        const fetchedRoom = await fetchRoomById(roomId);
        if (fetchedRoom) {
          dispatch(setActiveRoom(fetchedRoom));
        }
        setFetchingRoom(false);
      } else if (room) {
        setFetchingRoom(false);
      }
    };
    initRoom();
  }, [room, roomId, dispatch]);

  useEffect(() => {
    if (user && socket && !isLoading && !isError) {
      if (serverReady) {
        const connectMessage: WebSocketMessage = {
          type: "connect_room",
          roomId: roomId,
          userId: user.id,
        };
        socket.send(JSON.stringify(connectMessage));
      }

      socket.onmessage = (event) => {
        if (event.data === "pong") {
          console.log("WS Client: Heartbeat 'pong' received");
          return;
        }

        let data;
        try {
          data = JSON.parse(event.data);
        } catch (e) {
          console.error("WS Client: Failed to parse message", event.data, e);
          return;
        }

        switch (data.type) {
          case "connection_ready":
            setServerReady(true);
            break;
          case "error_message":
            toast.error(data.content, {
              description: "Please try again",
            });
            break;
          case "disconnect_room":
            if (data.userId) {
              setCursors((prev) => {
                const newCursors = { ...prev };
                delete newCursors[data.userId];
                return newCursors;
              });
            }
            break;
          case "chat_message":
            const message = JSON.parse(data.content);
            if (message.userId !== user?.id) {
              unreadMessagesRef.current = true;
            }
            setChatMessages((prev) => [...prev, message]);
            break;
          case "draw":
            if (data.userId === user?.id) {
              return;
            }
            const action = JSON.parse(data.content);
            diagrams.current = performAction(action, diagrams.current);
            break;
          case "cursor":
            if (data.userId === user?.id) {
              return;
            }
            const pos = JSON.parse(data.content);
            setCursors((prev) => ({
              ...prev,
              [data.userId]: {
                x: pos.x,
                y: pos.y,
                username: pos.username,
                color: getCursorColor(pos.username || data.userId),
              },
            }));
            break;
        }
      };
    }

    return () => {
      if (user && socket && serverReady) {
        const disconnectMessage: WebSocketMessage = {
          type: "disconnect_room",
          roomId: roomId,
          userId: user.id,
        };
        socket.send(JSON.stringify(disconnectMessage));
      }
    };
  }, [user, socket, isLoading, isError, roomId, serverReady]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (roomId) {
        try {
          const messages = await fetchAllChatMessages(roomId);
          setChatMessages(messages);
          if (messages.length > 0) {
            lastSrNoRef.current = messages[0]!.serialNumber;
          }
        } catch (error) {
          toast.error("Failed to fetch chat messages:", {
            description: "Please check your connection and try again.",
          });
          console.error("Failed to fetch chat messages:", error);
        }
      }
    };

    fetchMessages();
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    if (!socket) {
      toast.error("Connection failed, please refresh and try again");
      return;
    }

    if (socket && serverReady && content.trim()) {
      const chatMessage: WebSocketMessage = {
        type: "chat_message",
        roomId: roomId,
        userId: user!.id,
        content: content.trim(),
      };
      socket.send(JSON.stringify(chatMessage));
    }
  };

  const handleLoadMoreMessages = async (): Promise<Message[]> => {
    if (!lastSrNoRef.current || isLoadingMoreMessages) return [];

    setIsLoadingMoreMessages(true);
    try {
      const messages = await fetchMoreChatMessages(roomId, lastSrNoRef.current);
      if (messages.length > 0) {
        setChatMessages((prev) => [...messages, ...prev]);
        lastSrNoRef.current = messages[0]?.serialNumber || 0;
      } else {
        lastSrNoRef.current = 0;
      }
      return messages;
    } catch (error) {
      toast.error("Failed to load more messages");
      console.error("Failed to load more messages:", error);
      return [];
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

  const closeSocket = () => {
    if (user && socket && serverReady) {
      const disconnectMessage: WebSocketMessage = {
        type: "disconnect_room",
        roomId: roomId,
        userId: user.id,
      };
      socket.send(JSON.stringify(disconnectMessage));
    }
  };

  const activeShapeRef = useRef(activeShape);
  const selectedShapeRef = useRef(selectedShape);
  const activeActionRef = useRef(activeAction);
  const isDraggingRef = useRef<boolean>(isDragging);
  const activeStrokeStyleRef = useRef<string>(activeStrokeStyle);
  const activeFillStyleRef = useRef<string>(activeFillStyle);
  const activeLineWidthRef = useRef<number>(activeLineWidth);
  const activeFontRef = useRef<string>(activeFont);
  const activeFontSizeRef = useRef<string>(activeFontSize);

  useEffect(() => {
    activeShapeRef.current = activeShape;
    activeActionRef.current = activeAction;
    selectedShapeRef.current = selectedShape;
    isDraggingRef.current = isDragging;
    activeStrokeStyleRef.current = activeStrokeStyle;
    activeFillStyleRef.current = activeFillStyle;
    activeLineWidthRef.current = activeLineWidth;
    activeFontRef.current = activeFont;
    activeFontSizeRef.current = activeFontSize;

    if (canvasRef.current) {
      canvasRef.current.focus();
      switch (activeActionRef.current) {
        case "pan":
          if (isDraggingRef.current) {
            canvasRef.current.style.cursor = "grabbing";
          } else {
            canvasRef.current.style.cursor = "grab";
          }
          break;
        case "zoom":
          canvasRef.current.style.cursor = "zoom-in";
          break;
        case "select":
          canvasRef.current.style.cursor = "default";
          break;
        case "move":
          canvasRef.current.style.cursor = "move";
          break;
        case "draw":
          canvasRef.current.style.cursor = "crosshair";
          break;
        case "resize":
          canvasRef.current.style.cursor = "default";
          break;
        case "edit":
          canvasRef.current.style.cursor = "text";
          break;
        case "erase":
          canvasRef.current.style.cursor = "cell";
          break;
      }
    }

    if (selectedDraw.current) {
      selectedDraw.current.fillStyle = activeFillStyleRef.current;
      selectedDraw.current.strokeStyle = activeStrokeStyleRef.current;
      selectedDraw.current.lineWidth = activeLineWidthRef.current;
      selectedDraw.current.font = activeFontRef.current;
      if (
        selectedDraw.current.fontSize === "20" ||
        selectedDraw.current.fontSize === "40" ||
        selectedDraw.current.fontSize === "60"
      ) {
        selectedDraw.current.fontSize = activeFontSizeRef.current;
      }
    }
  }, [
    activeShape,
    activeAction,
    isDragging,
    selectedShape,
    activeStrokeStyle,
    activeFillStyle,
    activeLineWidth,
    activeFont,
    activeFontSize,
    socket,
  ]);

  function executeUndo() {
    if (!socket) {
      return;
    }
    console.log("undo");
    const changes = performUndo(
      undoRedoArrayRef.current,
      undoRedoIndexRef.current,
      diagrams.current,
      socket,
      user!.id,
      roomId
    );

    if (shapeSelectionBox.current && canvasRef.current) {
      shapeSelectionBox.current = null;
    }

    diagrams.current = changes.diagrams;
    undoRedoArrayRef.current = changes.undoRedoArray;
    undoRedoIndexRef.current = changes.undoRedoIndex;
    updateUndoRedoState();
  }

  function executeRedo() {
    if (!socket) {
      return;
    }
    console.log("redo");
    const changes = performRedo(
      undoRedoArrayRef.current,
      undoRedoIndexRef.current,
      diagrams.current,
      socket,
      user!.id,
      roomId
    );

    if (shapeSelectionBox.current && canvasRef.current) {
      shapeSelectionBox.current = null;
    }

    diagrams.current = changes.diagrams;
    undoRedoArrayRef.current = changes.undoRedoArray;
    undoRedoIndexRef.current = changes.undoRedoIndex;
    updateUndoRedoState();
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleShortcuts = (event: KeyboardEvent) => {
      const isEditingChat = chatMessageInputRef.current === document.activeElement;
      const isEditingText =
        ((activeActionRef.current === "edit" || activeActionRef.current === "draw") &&
        (activeDraw.current?.shape === "text" || selectedDraw.current?.shape === "text")) ||
        isEditingChat;

      if (!isEditingText) {
        switch (event.key) {
          case "1":
          case "s":
          case "S":
            setActiveAction("select");
            break;
          case "2":
          case "r":
          case "R":
            setActiveAction("draw");
            setActiveShape("rectangle");
            break;
          case "3":
          case "d":
          case "D":
            setActiveAction("draw");
            setActiveShape("diamond");
            break;
          case "4":
          case "c":
          case "C":
            setActiveAction("draw");
            setActiveShape("circle");
            break;
          case "5":
          case "l":
          case "L":
            setActiveAction("draw");
            setActiveShape("line");
            break;
          case "6":
          case "a":
          case "A":
            setActiveAction("draw");
            setActiveShape("arrow");
            break;
          case "7":
          case "f":
          case "F":
            setActiveAction("draw");
            setActiveShape("freeHand");
            break;
          case "8":
          case "t":
          case "T":
            setActiveAction("draw");
            setActiveShape("text");
            break;
          case "9":
          case "e":
          case "E":
            setActiveAction("erase");
            break;
        }

        if (event.shiftKey && !event.metaKey) {
          setActiveAction("pan");
          return;
        }

        if (event.ctrlKey && !event.shiftKey) {
          setActiveAction("zoom");
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "zoom-in";
          }
          return;
        }

        if (event.metaKey && !event.shiftKey && event.key === "z") {
          event.preventDefault();
          executeUndo();
        }

        if (
          (event.metaKey && event.shiftKey && event.key === "z") ||
          (event.metaKey && event.key === "y")
        ) {
          event.preventDefault();
          executeRedo();
        }
      }
    };

    const handleShortcutsClose = (event: KeyboardEvent) => {
      const isEditingChat = chatMessageInputRef.current === document.activeElement;
      const isEditingText =
        ((activeActionRef.current === "edit" || activeActionRef.current === "draw") &&
        (activeDraw.current?.shape === "text" || selectedDraw.current?.shape === "text")) ||
        isEditingChat;

      if (!isEditingText) {
        if (event.key === "Shift") {
          setActiveAction("select");
          return;
        }
        if (event.key === "Control") {
          setActiveAction("select");
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "default";
          }
          return;
        }
      }
    };

    document.addEventListener("keydown", handleShortcuts);
    document.addEventListener("keyup", handleShortcutsClose);

    return () => {
      document.removeEventListener("keydown", handleShortcuts);
      document.removeEventListener("keyup", handleShortcutsClose);
    };
  }, [socket, isLoading]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvasCurrent = canvasRef.current;

    const ctx = canvasCurrent.getContext("2d");
    if (!ctx) return;
    canvasCurrent.focus();

    let animationFrameId: number;
    const renderLoop = () => {
      renderDraws(
        ctx,
        canvasCurrent,
        diagrams.current,
        activeDraw.current,
        shapeSelectionBox.current,
        activeActionRef.current,
        selectedDraw.current,
        toErase.current,
        panOffset.current,
        scale.current
      );
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    animationFrameId = requestAnimationFrame(renderLoop);

    const getMousePosition = (event: MouseEvent) => {
      return {
        offsetX: (event.offsetX - panOffset.current.x) / scale.current,
        offsetY: (event.offsetY - panOffset.current.y) / scale.current,
      };
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Prevent interactions if the server hasn't verified the connection yet or if it was rejected
      if (!serverReady || !socket || isLoading || isError) {
        toast.error("Connecting to server...", {
          description: "Wait until your connection is verified to draw.",
        });
        return;
      }

      setIsDragging(true);
      if (activeActionRef.current === "pan") {
        panStartPoint.current = { x: event.offsetX, y: event.offsetY };
        return;
      }

      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "select") {
        const draw = getDrawAtPosition(offsetX, offsetY, diagrams.current, ctx);

        const hoveredSelectionBox = hoverOverSelectionBox(
          shapeSelectionBox.current!,
          offsetX,
          offsetY
        );
        if (!hoveredSelectionBox && draw) {
          setActiveFillStyle(draw?.fillStyle!);
          setActiveStrokeStyle(draw?.strokeStyle!);
          setActiveLineWidth(draw?.lineWidth!);
          if (draw?.shape === "text") {
            setActiveFont(draw.font!);
            setActiveFontSize(draw.fontSize!);
          }
        }

        if (draw?.shape === "text") {
          currentX.current = offsetX;
          currentY.current = offsetY;
        }

        if (draw && !hoveredSelectionBox?.position.includes("point")) {
          shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);
          setActiveAction("move");
          movingOffset.current = {
            x: offsetX - draw.startX!,
            y: offsetY - draw.startY!,
          };
          intialPointsForFreeHandMove.current = {
            initialPoint: {
              x: offsetX,
              y: offsetY,
            },
            originalPoints: draw.points
              ? JSON.parse(JSON.stringify(draw.points))
              : [],
          };
          selectedDraw.current = draw;
          setSelectedShape(draw.shape);
          setActiveShape(draw.shape);
          originalDrawState.current = JSON.parse(JSON.stringify(draw));
        } else if (hoveredSelectionBox) {
          setActiveAction("resize");
          resizingInfo.current = hoveredSelectionBox.position;
          farthestPointsInfoForLineAndArror.current = calculateFarthestPoints(
            selectedDraw.current!
          );
          intialPointsForFreeHandMove.current = {
            initialPoint: {
              x: offsetX,
              y: offsetY,
            },
            originalPoints: selectedDraw.current!.points
              ? JSON.parse(JSON.stringify(selectedDraw.current!.points))
              : [],
          };
          originalDrawState.current = JSON.parse(
            JSON.stringify(selectedDraw.current)
          );
        } else {
          setActiveAction("select");
          editCounterRef.current = 0;
          selectedDraw.current = null;
          setSelectedShape(null);
          shapeSelectionBox.current = null;
        }
      }

      if (activeActionRef.current === "edit") {
        if (selectedDraw.current && selectedDraw.current.shape === "text") {
          diagrams.current.push(selectedDraw.current);
          if (originalDrawState.current && selectedDraw.current && socket) {
            const action: Action = {
              type: "edit",
              originalDraw: JSON.parse(
                JSON.stringify(originalDrawState.current)
              ),
              modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current!)),
            };
            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user!.id,
              roomId
            );
            modifiedDrawState.current = null;
            originalDrawState.current = null;
            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;

            updateUndoRedoState();
          }
          textInp.current = "";
          selectedDraw.current = null;
          setSelectedShape(null);
          shapeSelectionBox.current = null;
          setActiveAction("select");
          return;
        }
      }

      if (activeActionRef.current === "erase") {
        isErasing.current = true;
      }

      if (activeActionRef.current === "draw") {
        if (activeDraw.current && activeDraw.current.shape === "text") {
          diagrams.current.push(activeDraw.current);
          if (socket) {
            const action: Action = {
              type: "create",
              originalDraw: null,
              modifiedDraw: JSON.parse(JSON.stringify(activeDraw.current!)),
            };
            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user!.id,
              roomId
            );

            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;
            updateUndoRedoState();
          }
          textInp.current = "";
          activeDraw.current = null;
          shapeSelectionBox.current = null;
          setActiveAction("select");
          return;
        }

        const currentActiveShape = activeShapeRef.current;
        const isDrawing = currentActiveShape === "freeHand";
        const isLineOrArrow =
          currentActiveShape === "line" || currentActiveShape === "arrow";
        const isText = currentActiveShape === "text";
        startX.current = offsetX;
        startY.current = offsetY;

        activeDraw.current = {
          id: Date.now().toString() + "-" + user!.id,
          shape: currentActiveShape,
          strokeStyle: activeStrokeStyleRef.current,
          fillStyle: isText
            ? activeStrokeStyleRef.current
            : isDrawing
              ? "transparent"
              : activeFillStyleRef.current,
          lineWidth: activeLineWidthRef.current,
          points:
            isDrawing || isLineOrArrow
              ? [{ x: startX.current, y: startY.current }]
              : [],
          startX: isDrawing ? undefined : startX.current,
          startY: isDrawing ? undefined : startY.current,
          text: isText ? textInp.current : "",
          font: activeFontRef.current,
          fontSize: activeFontSizeRef.current,
        };

        if (isText) {
          shapeSelectionBox.current = handleShapeSelectionBox(
            activeDraw.current!,
            ctx
          );
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const canvasCurrent = canvasRef.current!;
      if (activeActionRef.current === "pan") {
        if (isDraggingRef.current) {
          canvasCurrent.style.cursor = "grabbing";
          const dx = event.offsetX - panStartPoint.current.x;
          const dy = event.offsetY - panStartPoint.current.y;
          panOffset.current.x += dx;
          panOffset.current.y += dy;
          panStartPoint.current.x = event.offsetX;
          panStartPoint.current.y = event.offsetY;
        } else {
          canvasCurrent.style.cursor = "grab";
        }
        return;
      }

      const { offsetX, offsetY } = getMousePosition(event);

      // Throttled cursor emission
      const now = Date.now();
      if (now - lastCursorEmitTimeRef.current > 50) {
        if (socket && serverReady) {
          const cursorMessage: WebSocketMessage = {
            type: "cursor",
            roomId: roomId,
            userId: user!.id,
            content: JSON.stringify({ x: offsetX, y: offsetY, username: user!.name || user!.username }),
          };
          socket.send(JSON.stringify(cursorMessage));
        }
        lastCursorEmitTimeRef.current = now;
      }

      if (activeActionRef.current === "select") {
        const hoveredDraw = getDrawAtPosition(
          offsetX,
          offsetY,
          diagrams.current,
          ctx
        );

        const hoveredSelectionBox = hoverOverSelectionBox(
          shapeSelectionBox.current,
          offsetX,
          offsetY
        );

        canvasCurrent.style.cursor = hoveredSelectionBox
          ? hoveredSelectionBox.cursor
          : hoveredDraw
            ? "move"
            : "default";
        return;
      }

      if (activeActionRef.current === "resize") {
        const hoveredSelectionBox = hoverOverSelectionBox(
          shapeSelectionBox.current!,
          offsetX,
          offsetY
        );

        canvasCurrent.style.cursor = hoveredSelectionBox?.cursor || "default";

        const draw = resizeDraw(
          resizingInfo.current!,
          offsetX,
          offsetY,
          selectedDraw.current!,
          diagrams.current,
          farthestPointsInfoForLineAndArror.current,
          intialPointsForFreeHandMove.current
        );

        if (!draw) return;

        modifiedDrawState.current = JSON.parse(JSON.stringify(draw));
        shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);

        return;
      }

      if (activeActionRef.current === "move") {
        canvasCurrent.style.cursor = "move";
        const draw = moveDraw(
          offsetX,
          offsetY,
          movingOffset.current.x,
          movingOffset.current.y,
          selectedDraw.current!,
          diagrams.current,
          intialPointsForFreeHandMove.current
        );

        modifiedDrawState.current = JSON.parse(JSON.stringify(draw));

        if (!draw) return;

        shapeSelectionBox.current = handleShapeSelectionBox(draw, ctx);
      }

      if (activeActionRef.current === "draw") {
        shapeSelectionBox.current = null;
        if (activeShapeRef.current === "text") {
          canvasCurrent.style.cursor = "text";
        } else {
          canvasCurrent.style.cursor = "crosshair";
        }
        if (!activeDraw.current) return;

        currentX.current = offsetX;
        currentY.current = offsetY;

        if (activeDraw.current.shape === "freeHand") {
          activeDraw.current.points?.push({
            x: currentX.current,
            y: currentY.current,
          });
        } else if (activeDraw.current.shape !== "text") {
          activeDraw.current.endX = currentX.current;
          activeDraw.current.endY = currentY.current;
          if (
            activeDraw.current.shape === "line" ||
            activeDraw.current.shape === "arrow"
          ) {
            activeDraw.current.points = [
              {
                x: (activeDraw.current.startX! + activeDraw.current.endX!) / 2,
                y: (activeDraw.current.startY! + activeDraw.current.endY!) / 2,
              },
            ];
          }
        } else {
          selectedDraw.current = activeDraw.current;
          shapeSelectionBox.current = handleShapeSelectionBox(
            activeDraw.current,
            ctx
          );
          setSelectedShape(activeDraw.current.shape);
          setActiveShape(activeDraw.current.shape);
        }
      }

      if (activeActionRef.current === "erase") {
        canvasCurrent.style.cursor = "cell";
      }

      if (activeActionRef.current === "erase" && isErasing.current) {
        const hoveredOver = getDrawAtPosition(
          offsetX,
          offsetY,
          diagrams.current,
          ctx
        );

        if (hoveredOver) {
          if (!toErase.current.includes(hoveredOver)) {
            toErase.current.push(hoveredOver);
          }
        }
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      const canvasCurrent = canvasRef.current!;
      setIsDragging(false);

      if (activeActionRef.current === "pan") {
        canvasCurrent.style.cursor = "grab";
        return;
      }
      const { offsetX, offsetY } = getMousePosition(event);

      if (activeActionRef.current === "select") {
        canvasCurrent.style.cursor = "default";
        return;
      }

      if (activeActionRef.current === "erase" && isErasing.current) {
        diagrams.current = diagrams.current.filter(
          (draw) => !toErase.current.includes(draw)
        );
        toErase.current.forEach((draw) => {
          if (socket) {
            const action: Action = {
              type: "erase",
              originalDraw: JSON.parse(JSON.stringify(draw)),
              modifiedDraw: null,
            };
            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user!.id,
              roomId
            );

            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;
            updateUndoRedoState();
          }
        });
        isErasing.current = false;
        toErase.current = [];
        return;
      }

      if (activeActionRef.current === "resize") {
        if (!selectedDraw.current) return;
        if (
          selectedDraw.current!.shape === "rectangle" ||
          selectedDraw.current!.shape === "diamond" ||
          selectedDraw.current!.shape === "circle"
        ) {
          if (selectedDraw.current!.endX! < selectedDraw.current!.startX!) {
            let a = selectedDraw.current!.endX;
            selectedDraw.current!.endX = selectedDraw.current!.startX;
            selectedDraw.current!.startX = a;
          }
          if (selectedDraw.current!.endY! < selectedDraw.current!.startY!) {
            let a = selectedDraw.current!.endY;
            selectedDraw.current!.endY = selectedDraw.current!.startY;
            selectedDraw.current!.startY = a;
          }
        }
        if (originalDrawState.current && modifiedDrawState.current && socket) {
          const action: Action = {
            type: "resize",
            originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
            modifiedDraw: JSON.parse(JSON.stringify(modifiedDrawState.current)),
          };
          const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
            action,
            undoRedoArrayRef.current,
            undoRedoIndexRef.current,
            socket,
            user!.id,
            roomId
          );

          modifiedDrawState.current = null;
          originalDrawState.current = null;
          undoRedoArrayRef.current = undoRedoArray;
          undoRedoIndexRef.current = undoRedoIndex;
          updateUndoRedoState();
        }
        setActiveAction("select");
        resizingInfo.current = null;
        return;
      }

      if (activeActionRef.current === "move") {
        if (
          currentX.current === offsetX &&
          currentY.current === offsetY &&
          selectedDraw.current?.shape === "text"
        ) {
          if (editCounterRef.current < 1) {
            editCounterRef.current++;
            setActiveAction("select");
          } else {
            setActiveAction("edit");
            originalDrawState.current = JSON.parse(
              JSON.stringify(selectedDraw.current)
            );
            canvasCurrent.style.cursor = "text";
            editCounterRef.current = 0;
          }
          return;
        }
        if (originalDrawState.current && modifiedDrawState.current && socket) {
          const action: Action = {
            type: "move",
            originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
            modifiedDraw: JSON.parse(JSON.stringify(modifiedDrawState.current)),
          };
          const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
            action,
            undoRedoArrayRef.current,
            undoRedoIndexRef.current,
            socket,
            user!.id,
            roomId
          );

          modifiedDrawState.current = null;
          originalDrawState.current = null;
          undoRedoArrayRef.current = undoRedoArray;
          undoRedoIndexRef.current = undoRedoIndex;
          updateUndoRedoState();
        }
        setActiveAction("select");
      }

      if (activeActionRef.current === "draw") {
        if (!activeDraw.current) return;

        if (activeDraw.current.shape === "text") return;

        if (activeDraw.current.shape !== "freeHand") {
          activeDraw.current.endX = offsetX;
          activeDraw.current.endY = offsetY;

          if (
            activeDraw.current.shape === "rectangle" ||
            activeDraw.current.shape === "diamond" ||
            activeDraw.current.shape === "circle"
          ) {
            if (activeDraw.current.endX < activeDraw.current.startX!) {
              let a = activeDraw.current.endX;
              activeDraw.current.endX = activeDraw.current.startX;
              activeDraw.current.startX = a;
            }
            if (activeDraw.current.endY < activeDraw.current.startY!) {
              let a = activeDraw.current.endY;
              activeDraw.current.endY = activeDraw.current.startY;
              activeDraw.current.startY = a;
            }
          } else if (
            activeDraw.current.shape === "line" ||
            activeDraw.current.shape === "arrow"
          ) {
            activeDraw.current.points = [
              {
                x: (activeDraw.current.startX! + activeDraw.current.endX!) / 2,
                y: (activeDraw.current.startY! + activeDraw.current.endY!) / 2,
              },
            ];
          }
        }

        diagrams.current.push(activeDraw.current);
        if (socket) {
          const action: Action = {
            type: "create",
            originalDraw: null,
            modifiedDraw: JSON.parse(JSON.stringify(activeDraw.current)),
          };

          const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
            action,
            undoRedoArrayRef.current,
            undoRedoIndexRef.current,
            socket,
            user!.id,
            roomId
          );

          undoRedoArrayRef.current = undoRedoArray;
          undoRedoIndexRef.current = undoRedoIndex;
          updateUndoRedoState();
        }
        activeDraw.current = null;
        startX.current = null;
        startY.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeActionRef.current === "select") {
        return;
      }

      if (activeActionRef.current === "draw") {
        if (!activeDraw.current || activeDraw.current.shape !== "text") return;
        event.preventDefault();

        if (event.key === "Enter") {
          if (event.shiftKey) {
            textInp.current += "\n";
            activeDraw.current!.text = textInp.current;
            return;
          }
          diagrams.current.push(activeDraw.current!);
          if (socket) {
            const action: Action = {
              type: "create",
              originalDraw: null,
              modifiedDraw: JSON.parse(JSON.stringify(activeDraw.current!)),
            };
            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user!.id,
              roomId
            );
            modifiedDrawState.current = null;
            originalDrawState.current = null;
            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;
            updateUndoRedoState();
          }
          textInp.current = "";
          activeDraw.current = null;
        } else if (event.key === "Escape") {
          textInp.current = "";
          activeDraw.current = null;
        } else if (event.key === "Backspace") {
          textInp.current = textInp.current.slice(0, -1);
          activeDraw.current.text = textInp.current;
        } else if (event.key.length === 1) {
          textInp.current += event.key;
          activeDraw.current.text = textInp.current;
        }
      }

      if (activeActionRef.current === "draw") {
        if (activeDraw.current?.shape === "text") {
          shapeSelectionBox.current = handleShapeSelectionBox(
            activeDraw.current!,
            ctx
          );
          return;
        }
        shapeSelectionBox.current = null;
      }

      if (activeActionRef.current === "edit") {
        if (!selectedDraw.current || selectedDraw.current.shape !== "text")
          return;

        textInp.current = selectedDraw.current.text || "";

        event.preventDefault();

        if (event.key === "Enter") {
          if (event.shiftKey) {
            textInp.current += "\n";
            selectedDraw.current!.text = textInp.current;
            return;
          }
          diagrams.current.push(selectedDraw.current!);
          if (originalDrawState.current && selectedDraw.current && socket) {
            const action: Action = {
              type: "edit",
              originalDraw: JSON.parse(
                JSON.stringify(originalDrawState.current)
              ),
              modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current!)),
            };
            const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
              action,
              undoRedoArrayRef.current,
              undoRedoIndexRef.current,
              socket,
              user!.id,
              roomId
            );

            modifiedDrawState.current = null;
            originalDrawState.current = null;
            undoRedoArrayRef.current = undoRedoArray;
            undoRedoIndexRef.current = undoRedoIndex;
            updateUndoRedoState();
          }
          textInp.current = "";
          selectedDraw.current = null;
          setSelectedShape(null);
          shapeSelectionBox.current = null;
          setActiveAction("select");
        } else if (event.key === "Escape") {
          textInp.current = "";
          selectedDraw.current = null;
          setSelectedShape(null);
          setActiveAction("select");
        } else if (event.key === "Backspace") {
          textInp.current = textInp.current.slice(0, -1);
          selectedDraw.current.text = textInp.current;
        } else if (event.key.length === 1) {
          textInp.current += event.key;
          selectedDraw.current.text = textInp.current;
        }
      }

      if (activeActionRef.current === "edit") {
        if (selectedDraw.current?.shape === "text") {
          shapeSelectionBox.current = handleShapeSelectionBox(
            selectedDraw.current!,
            ctx
          );
          return;
        }
        shapeSelectionBox.current = null;
      }
    };

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();

      if (activeActionRef.current === "zoom" || event.ctrlKey) {
        const zoomSensitivity = 0.03;
        const newScale = scale.current - event.deltaY * zoomSensitivity;
        zoomToPoint(newScale);
      } else {
        panOffset.current.x -= event.deltaX;
        panOffset.current.y -= event.deltaY;
      }
    };

    canvasCurrent.addEventListener("mousedown", handleMouseDown);
    canvasCurrent.addEventListener("mouseup", handleMouseUp);
    canvasCurrent.addEventListener("mousemove", handleMouseMove);
    canvasCurrent.addEventListener("keydown", handleKeyDown);
    canvasCurrent.addEventListener("wheel", handleScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasCurrent.removeEventListener("mousedown", handleMouseDown);
      canvasCurrent.removeEventListener("mouseup", handleMouseUp);
      canvasCurrent.removeEventListener("mousemove", handleMouseMove);
      canvasCurrent.removeEventListener("keydown", handleKeyDown);
      canvasCurrent.removeEventListener("wheel", handleScroll);
    };
  }, [socket, serverReady, isLoading, isError]);

  const zoomToPoint = (newScale: number) => {
    const canvasCurrent = canvasRef.current;
    if (!canvasCurrent) return;

    const clampedScale = Math.max(0.1, Math.min(newScale, 10));

    const screenCenterX = canvasCurrent.width / 2;
    const screenCenterY = canvasCurrent.height / 2;

    const worldPointX = (screenCenterX - panOffset.current.x) / scale.current;
    const worldPointY = (screenCenterY - panOffset.current.y) / scale.current;

    panOffset.current.x = screenCenterX - worldPointX * clampedScale;
    panOffset.current.y = screenCenterY - worldPointY * clampedScale;

    scale.current = clampedScale;
    setZoomLevel(clampedScale);
  };

  const changeActiveFillStyle = (color: string) => {
    setActiveFillStyle(color);
    if (selectedDraw.current) {
      selectedDraw.current.fillStyle = color;
      if (
        originalDrawState.current &&
        originalDrawState.current.fillStyle !== selectedDraw.current.fillStyle &&
        socket
      ) {
        const action: Action = {
          type: "edit",
          originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
          modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current)),
        };
        const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
          action,
          undoRedoArrayRef.current,
          undoRedoIndexRef.current,
          socket,
          user!.id,
          roomId
        );
        undoRedoArrayRef.current = undoRedoArray;
        undoRedoIndexRef.current = undoRedoIndex;
        updateUndoRedoState();
        originalDrawState.current = JSON.parse(
          JSON.stringify(selectedDraw.current)
        );
      }
    }
  };

  const changeActiveStrokeStyle = (color: string) => {
    setActiveStrokeStyle(color);
    if (selectedDraw.current) {
      selectedDraw.current.strokeStyle = color;
      if (
        originalDrawState.current &&
        originalDrawState.current.strokeStyle !==
          selectedDraw.current.strokeStyle &&
        socket
      ) {
        const action: Action = {
          type: "edit",
          originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
          modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current)),
        };
        const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
          action,
          undoRedoArrayRef.current,
          undoRedoIndexRef.current,
          socket,
          user!.id,
          roomId
        );
        undoRedoArrayRef.current = undoRedoArray;
        undoRedoIndexRef.current = undoRedoIndex;
        updateUndoRedoState();
        originalDrawState.current = JSON.parse(
          JSON.stringify(selectedDraw.current)
        );
      }
    }
  };

  const changeActiveLineWidth = (width: number) => {
    setActiveLineWidth(width);
    if (selectedDraw.current) {
      selectedDraw.current.lineWidth = width;
      if (
        originalDrawState.current &&
        originalDrawState.current.lineWidth !==
          selectedDraw.current.lineWidth &&
        socket
      ) {
        const action: Action = {
          type: "edit",
          originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
          modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current)),
        };
        const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
          action,
          undoRedoArrayRef.current,
          undoRedoIndexRef.current,
          socket,
          user!.id,
          roomId
        );
        undoRedoArrayRef.current = undoRedoArray;
        undoRedoIndexRef.current = undoRedoIndex;
        updateUndoRedoState();
        originalDrawState.current = JSON.parse(
          JSON.stringify(selectedDraw.current)
        );
      }
    }
  };

  const changeActiveFont = (font: string) => {
    setActiveFont(font);
    if (selectedDraw.current) {
      selectedDraw.current.font = font;
      if (
        originalDrawState.current &&
        originalDrawState.current.font !== selectedDraw.current.font &&
        socket
      ) {
        const action: Action = {
          type: "edit",
          originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
          modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current)),
        };
        const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
          action,
          undoRedoArrayRef.current,
          undoRedoIndexRef.current,
          socket,
          user!.id,
          roomId
        );
        undoRedoArrayRef.current = undoRedoArray;
        undoRedoIndexRef.current = undoRedoIndex;
        updateUndoRedoState();
        originalDrawState.current = JSON.parse(
          JSON.stringify(selectedDraw.current)
        );
      }
    }
  };

  const changeActiveFontSize = (size: number) => {
    setActiveFontSize(size.toString());
    if (selectedDraw.current) {
      selectedDraw.current.fontSize = size.toString();
      if (
        originalDrawState.current &&
        originalDrawState.current.fontSize !== selectedDraw.current.fontSize &&
        socket
      ) {
        const action: Action = {
          type: "edit",
          originalDraw: JSON.parse(JSON.stringify(originalDrawState.current)),
          modifiedDraw: JSON.parse(JSON.stringify(selectedDraw.current)),
        };
        const { undoRedoArray, undoRedoIndex } = pushToUndoRedoArray(
          action,
          undoRedoArrayRef.current,
          undoRedoIndexRef.current,
          socket,
          user!.id,
          roomId
        );
        undoRedoArrayRef.current = undoRedoArray;
        undoRedoIndexRef.current = undoRedoIndex;
        updateUndoRedoState();
        originalDrawState.current = JSON.parse(
          JSON.stringify(selectedDraw.current)
        );
      }
    }
  };

  if (isError) {
    return (
      <div className="h-screen w-screen relative flex items-center justify-center bg-neutral-900">
        <p className="text-white">Faced some Errors, Please Refresh</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen relative flex items-center justify-center bg-neutral-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen relative">
        <div className="fixed z-2 w-fit h-fit left-3 top-3 flex items-center gap-2">
          <div className="bg-neutral-900 rounded-md">
            <div className="bg-green-400/25 z-1 rounded-lg px-1.5 py-1 flex gap-1.5 items-center">
              <Button
                size="icon"
                className={`bg-transparent relative p-2 hover:bg-green-600/20 cursor-pointer`}
                onClick={() => {
                  closeSocket();
                  router.replace("/home");
                }}
              >
                <AiOutlineHome className="text-white" size="18" />
              </Button>
            </div>
          </div>
        </div>

        <div className="fixed z-2 w-fit h-fit bg-black rounded-lg right-3 top-3">
          <div className="bg-green-400/25 z-1 rounded-lg px-1.5 py-1 flex gap-1.5 items-center">
            <Button
              size="icon"
              className={`bg-transparent relative p-2 hover:bg-green-600/20 cursor-pointer ${showChatBar ? "bg-green-600/40" : ""} ${unreadMessagesRef.current ? "bg-green-600/5" : ""}`}
              onClick={() => {
                setShowChatBar(!showChatBar);
                unreadMessagesRef.current = false;
              }}
            >
              <PiChatsCircle className="text-white" size="18" />
              {unreadMessagesRef.current && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {showChatBar && (
          <ChatBar
            closeChat={() => setShowChatBar(false)}
            messages={chatMessages}
            user={user!}
            onSendMessage={handleSendMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
            isLoadingMore={isLoadingMoreMessages}
            chatMessageInputRef={chatMessageInputRef}
          />
        )}

        <div className="fixed z-2 w-fit h-fit bg-black rounded-lg left-1/2 top-3 transform -translate-x-1/2">
          <div className="bg-green-400/25 z-1 rounded-lg px-1.5 py-1 flex gap-1.5 items-center">
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "select" || activeAction === "move" || activeAction === "resize" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("select");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "select" ||
              activeAction === "move" ||
              activeAction === "resize" ? (
                <PiCursorFill className="text-white" size="18" />
              ) : (
                <PiCursor className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                1
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "rectangle" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("rectangle");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "rectangle" ? (
                <PiSquareFill className="text-white" size="18" />
              ) : (
                <PiSquare className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                2
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "diamond" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("diamond");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "diamond" ? (
                <PiDiamondFill className="text-white" size="18" />
              ) : (
                <PiDiamond className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                3
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "circle" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("circle");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "circle" ? (
                <PiCircleFill className="text-white" size="18" />
              ) : (
                <PiCircle className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                4
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "line" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("line");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <PiLineVertical className="text-white rotate-90" size="18" />
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                5
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "arrow" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("arrow");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <PiArrowRight className="text-white" size="18" />
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                6
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "draw" && activeShape === "freeHand" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("freeHand");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "draw" && activeShape === "freeHand" ? (
                <PiPencilFill className="text-white" size="18" />
              ) : (
                <PiPencil className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                7
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${(activeAction === "draw" && activeShape === "text") || activeAction === "edit" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("draw");
                setActiveShape("text");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <BsFonts className="text-white" size="20" />
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                8
              </p>
            </Button>
            <Button
              size="icon"
              className={`bg-transparent relative p-2 ${activeAction === "erase" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("erase");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "erase" ? (
                <PiEraserFill className="text-white" size="18" />
              ) : (
                <PiEraser className="text-white" size="18" />
              )}
              <p className="text-white font-mono absolute text-[8px] right-1 bottom-1">
                9
              </p>
            </Button>
            <PiLineVerticalLight size="20" />
            <Button
              size="icon"
              className={`bg-transparent -ml-1 relative p-2 ${activeAction === "pan" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("pan");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              {activeAction === "pan" && isDragging ? (
                <LiaHandRock className="text-white" />
              ) : (
                <LiaHandPaper className="text-white" />
              )}
            </Button>
            <Button
              size="icon"
              className={`bg-transparent -ml-0.5 relative p-2 ${activeAction === "zoom" ? "bg-green-600 hover:bg-green-600" : "hover:bg-green-600/20"} cursor-pointer`}
              onClick={() => {
                setActiveAction("zoom");
                if (activeDraw.current?.shape === "text") {
                  activeDraw.current = null;
                  shapeSelectionBox.current = null;
                }
              }}
            >
              <TbZoom className="text-white" />
            </Button>
          </div>
        </div>

        {activeAction === "draw" ||
        (activeAction === "select" && selectedShape !== null) ? (
          activeShape === "text" || selectedShape === "text" ? (
            <div className="fixed px-3 py-2 z-2 w-fit h-fit border border-neutral-600 left-3 top-1/2 transform -translate-y-1/2 bg-black rounded-md">
              <div className="space-y-2 items-center rounded-md text-white">
                <div className="text-sm">
                  <h3>Color</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#eeeeee] hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1"
                      style={{ backgroundColor: activeStrokeStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Font</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white font-[Arial] -mr-1 ${activeFont === "Arial" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFont("Arial")}
                    >
                      Abc
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white font-[Verdana] -mr-1 ${activeFont === "Verdana" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFont("Verdana")}
                    >
                      Abc
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white font-[ComicSansMS] -mr-1 ${activeFont === "Comic Sans MS" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFont("Comic Sans MS")}
                    >
                      Abc
                    </Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Font Size</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "20" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(20)}
                    >
                      S
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "40" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(40)}
                    >
                      M
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeFontSize === "60" ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => changeActiveFontSize(60)}
                    >
                      L
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeShape === "freeHand" ||
            activeShape === "arrow" ||
            activeShape === "line" ||
            selectedShape === "freeHand" ||
            selectedShape === "arrow" ||
            selectedShape === "line" ? (
            <div className="fixed px-3 py-2 z-2 w-fit h-fit border border-neutral-600 left-3 top-1/2 transform -translate-y-1/2 bg-black rounded-md">
              <div className="space-y-2 items-center rounded-md">
                <div className="text-sm">
                  <h3>Stroke</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#eeeeee] hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1"
                      style={{ backgroundColor: activeStrokeStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Stroke Width</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 2 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(2);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M4.167 10h11.666"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 3 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(3);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 4 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(4);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="3.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed px-3 py-2 z-2 w-fit h-fit border border-neutral-600 left-3 top-1/2 transform -translate-y-1/2 bg-black rounded-md">
              <div className="space-y-2 items-center rounded-md">
                <div className="text-sm">
                  <h3>Stroke</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-[#eeeeee] hover:bg-[#eeeeee] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#eeeeee");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD586] hover:bg-[#FFD586] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FFD586");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF9898] hover:bg-[#FF9898] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#FF9898");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA] hover:bg-[#B9D4AA] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#B9D4AA");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF] hover:bg-[#8DD8FF] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveStrokeStyle("#8DD8FF");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1"
                      style={{ backgroundColor: activeStrokeStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Background</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="relative cursor-pointer -mr-1 text-transparent hover:bg-transparent bg-transparent border border-gray-400/20"
                      onClick={() => {
                        changeActiveFillStyle("#eeeeee00");
                      }}
                    >
                      .
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FFD58660] hover:bg-[#FFD58660] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#FFD58660");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#FF989860] hover:bg-[#FF989860] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#FF989860");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#B9D4AA60] hover:bg-[#B9D4AA60] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#B9D4AA60");
                      }}
                    >
                      ..
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#8DD8FF60] hover:bg-[#8DD8FF60] relative cursor-pointer -mr-1 text-transparent"
                      onClick={() => {
                        changeActiveFillStyle("#8DD8FF60");
                      }}
                    >
                      ..
                    </Button>
                    <PiLineVerticalLight size="20" />
                    <Button
                      size="icon"
                      className="relative cursor-default -mr-1 border"
                      style={{ backgroundColor: activeFillStyle }}
                    ></Button>
                  </div>
                </div>
                <div className="text-sm">
                  <h3>Stroke Width</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 3 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(3);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M4.167 10h11.666"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 6 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(6);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      className={`relative cursor-pointer text-white -mr-1 ${activeLineWidth === 9 ? "bg-green-600/40 hover:bg-green-600/40" : "bg-neutral-900 hover:bg-neutral-800"}`}
                      onClick={() => {
                        changeActiveLineWidth(9);
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          d="M5 10h10"
                          stroke="currentColor"
                          strokeWidth="3.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <></>
        )}

        <div className={`fixed z-[2] w-fit h-fit right-3 bottom-3 flex items-center gap-2 ${showChatBar ? "hidden sm:flex sm:right-[340px]" : "flex"} transition-all duration-300`}>
          <div className="bg-neutral-900 border border-neutral-800 rounded-md flex items-center h-[36px] px-3 py-1.5 gap-2 group cursor-pointer hover:bg-neutral-800 transition-colors shadow-sm"
               onClick={() => {
                 if (room?.joinCode) {
                   navigator.clipboard.writeText(room.joinCode);
                   toast.info("Join code copied!");
                 }
               }}
          >
            <span className="text-[11px] text-neutral-500 font-medium select-none uppercase tracking-wider hidden sm:block">Join Code</span>
            <span className="text-sm text-neutral-300 font-mono tracking-wider">
              {isFetchingRoom ? "•••" : (room?.joinCode || "Error")}
            </span>
            <BiCopy size={16} className="text-neutral-500 group-hover:text-neutral-300 transition-colors ml-1" />
          </div>
        </div>

        <div className="fixed flex gap-2 z-2 w-fit h-fit left-3 bottom-3 bg-neutral-900 rounded-md">
          <div className="bg-neutral-900 rounded-md">
            <div className="bg-green-400/25 p-1 flex items-center rounded-md">
              <Button
                size="icon"
                className="bg-transparent relative cursor-pointer -mr-1 hover:bg-green-600/40"
                onClick={() => zoomToPoint(scale.current - 0.1)}
              >
                <PiMinus className="text-white" size="18" />
              </Button>
              <PiLineVerticalLight size="20" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-transparent relative cursor-pointer px-1 py-2 text-white font-mono text-sm h-auto hover:bg-green-600/40"
                    onClick={() => zoomToPoint(1)}
                  >
                    {(zoomLevel * 100).toFixed(0)}%
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset Zoom</p>
                </TooltipContent>
              </Tooltip>
              <PiLineVerticalLight size="20" />
              <Button
                size="icon"
                className="bg-transparent relative cursor-pointer -ml-1 hover:bg-green-600/40"
                onClick={() => zoomToPoint(scale.current + 0.1)}
              >
                <PiPlus className="text-white" size="18" />
              </Button>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-md">
            <div className="bg-green-400/25 p-1 flex gap-2 items-center rounded-md">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="relative cursor-pointer border-r border-green-900 -mr-1 rounded-r-none bg-green-600/40 hover:bg-green-600/60"
                    onClick={executeUndo}
                    disabled={!canUndo}
                  >
                    <GrUndo className="text-white" size="18" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="relative cursor-pointer border-l border-green-900 -ml-1 rounded-l-none bg-green-600/40 hover:bg-green-600/60"
                    onClick={executeRedo}
                    disabled={!canRedo}
                  >
                    <GrRedo className="text-white" size="18" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {isClient ? (
          <canvas
            tabIndex={0}
            ref={canvasRef}
            className="bg-neutral-900 absolute top-0 left-0 z-1"
            width={window.innerWidth}
            height={window.innerHeight}
          ></canvas>
        ) : (
          <canvas
            tabIndex={0}
            ref={canvasRef}
            className="bg-neutral-900"
          ></canvas>
        )}

        {Object.entries(cursors).map(([id, pos]) => (
          <div
            key={id}
            className="absolute z-10 pointer-events-none flex flex-col items-start justify-center"
            style={{
              left: `${pos.x * scale.current + panOffset.current.x}px`,
              top: `${pos.y * scale.current + panOffset.current.y}px`,
            }}
          >
            <PiCursorFill
              className="drop-shadow-md"
              size="20"
              style={{
                color: pos.color,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div
              className="px-2 py-0.5 mt-[-2px] ml-[10px] rounded-md text-white text-xs font-medium whitespace-nowrap drop-shadow-md"
              style={{ backgroundColor: pos.color }}
            >
              {pos.username || "Anonymous"}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default Canvas;
