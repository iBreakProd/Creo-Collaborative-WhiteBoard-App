"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { toast } from "@workspace/ui/components/sonner";
import { setHomeView } from "@/lib/features/meetdraw/appSlice";
import { useWebSocket } from "@/lib/hooks/websocket";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface RequestCookie {
  name: string;
  value: string;
}
import { Button } from "@workspace/ui/components/button";
import { IoSend } from "react-icons/io5";
import { WebSocketMessage } from "@workspace/common";
import { Message } from "@/types";
import {
  fetchAllChatMessages,
  fetchMoreChatMessages,
} from "@/actions/chatActions";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Link from "next/link";
import { GoArrowUpRight, GoInfo } from "react-icons/go";
import { RxCross1 } from "react-icons/rx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { BiCopy } from "react-icons/bi";
import { Loader2 } from "lucide-react";

const ChatRoom = ({ jwtCookie }: { jwtCookie: RequestCookie }) => {
  const activeRoom = useAppSelector((state) => state.app.activeRoom);
  const userState = useAppSelector((state) => state.app.user);
  const [serverReady, setServerReady] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>();
  const chatDivRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState<"down" | "up" | null>(null);
  const [showBadge, setShowBadge] = useState<boolean>(false);
  const [lastSrNo, setLastSrNo] = useState<number>();
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    const fetchMoreMessages = async (): Promise<void> => {
      setIsLoadingMore(true);
      const messages = await fetchMoreChatMessages(activeRoom!.id, lastSrNo!);
      setMessages((prev) => {
        return [...messages, ...(prev || [])];
      });

      if (messages.length === 0) {
        setLastSrNo(0);
        setIsLoadingMore(false);
        return;
      }

      setLastSrNo(messages[0]?.serialNumber || 0);
      setIsLoadingMore(false);
      return;
    };

    if (
      chatDivRef.current?.scrollHeight &&
      chatDivRef.current?.clientHeight &&
      chatDivRef.current.scrollHeight > chatDivRef.current.clientHeight
    ) {
      const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isAtBottom) {
        setShowArrow("up");
      } else {
        setShowArrow("down");
        setShowBadge(true);
      }
    } else {
      setShowArrow(null);
    }

    const handleScroll = () => {
      if (
        chatDivRef.current?.scrollHeight &&
        chatDivRef.current?.clientHeight &&
        chatDivRef.current.scrollHeight > chatDivRef.current.clientHeight
      ) {
        const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        const isAtTop = scrollTop === 0;

        if (isAtTop) {
          fetchMoreMessages();
          return;
        }

        if (isAtBottom) {
          setShowArrow("up");
          setShowBadge(false);
        } else {
          setShowArrow("down");
        }
      } else {
        setShowArrow(null);
      }
    };

    chatDivRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      chatDivRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [messages]);

  useEffect(() => {
    if (chatDivRef.current && !isLoadingMore) {
      const { scrollTop, scrollHeight, clientHeight } = chatDivRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        chatDivRef.current.scrollTo({
          top: chatDivRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        setShowBadge(true);
      }
    }
  }, [messages, isLoadingMore]);

  if (!userState) {
    toast.error("Please sign in to chat", {
      description: "You must be signed in to chat",
    });
    router.replace("/signin");
    return null;
  }

  if (!activeRoom) {
    toast.error("No active room", {
      description: "Please select a room to chat",
    });
    dispatch(setHomeView("meetdraws"));
    return null;
  }

  const { socket, isLoading, isError } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}?token=${jwtCookie.value}`
  );

  useEffect(() => {
    async function fetchMessage() {
      if (activeRoom !== null) {
        const fetchedMessages = await fetchAllChatMessages(activeRoom.id);
        setMessages(fetchedMessages);
        setLastSrNo(fetchedMessages[0]?.serialNumber);
        chatDivRef.current?.scrollTo({
          top: chatDivRef.current?.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    fetchMessage();

    return () => {
      setMessages([]);
    };
  }, [activeRoom]);

  const handleSendMessage = () => {
    if (!socket) {
      toast.error("Connection failed, please refresh and try again");
      return;
    }

    if (socket && serverReady && inputRef.current) {
      const chatMessage: WebSocketMessage = {
        type: "chat_message",
        roomId: activeRoom.id,
        userId: userState.id,
        content: inputRef.current.value,
      };
      socket.send(JSON.stringify(chatMessage));
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (socket && !isLoading && !isError) {
      if (serverReady) {
        const connectMessage: WebSocketMessage = {
          type: "connect_room",
          roomId: activeRoom.id,
          userId: userState.id,
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
          case "chat_message":
            const message = JSON.parse(data.content);
            if (!messages) {
              toast.error("Some error occured please refresh");
              return;
            }
            setMessages((prev) => {
              return [...(prev || []), message];
            });
            break;
        }
      };
    }
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }
    };
    document.addEventListener("keydown", handleShortcuts);

    return () => {
      if (socket && serverReady) {
        const disconnectMessage: WebSocketMessage = {
          type: "disconnect_room",
          roomId: activeRoom.id,
          userId: userState.id,
        };
        socket.send(JSON.stringify(disconnectMessage));
      }
      document.removeEventListener("keydown", handleShortcuts);
    };
  }, [
    socket,
    isLoading,
    isError,
    activeRoom.id,
    userState.id,
    serverReady,
    messages,
    lastSrNo,
  ]);

  if (isError) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="text-red-500">
          WebSocket connection error. Please refresh the page.
        </div>
      </div>
    );
  }

  if (isLoading || !serverReady) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div>
          {!serverReady ? "Verifying connection..." : "Connecting to chat..."}
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div>No connection available</div>
      </div>
    );
  }

  const handleCopyJoinCode = () => {
    navigator.clipboard.writeText(activeRoom.joinCode);
    toast.info("Join code copied!");
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <h1 className="text-2xl font-bold">{activeRoom.title}</h1>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-900 border border-neutral-700/50 rounded-md w-fit">
            <span className="text-xs text-neutral-400 font-medium select-none uppercase tracking-wider">Join Code</span>
            <span className="text-sm text-green-400 font-bold tracking-wider">{activeRoom.joinCode}</span>
            <button
              onClick={handleCopyJoinCode}
              className="ml-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Join Code"
            >
              <BiCopy size={15} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger>
              <GoInfo className="text-neutral-500" />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-sm border text-neutral-700"
            >
              <div>
                <h3>Admin: {activeRoom.admin.username}</h3>
              </div>
            </TooltipContent>
          </Tooltip>
          <Link
            href={`/canvas/${activeRoom.id}`}
            className="flex items-center gap-1 py-0.5 px-3 bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50 rounded-sm"
          >
            Canvas
            <GoArrowUpRight />
          </Link>

          <button
            onClick={() => dispatch(setHomeView("meetdraws"))}
            className="cursor-pointer text-neutral-500"
          >
            <RxCross1 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2 flex-1 min-h-0 border backdrop-blur-md bg-black/30 rounded-lg overflow-hidden">
        <div
          ref={chatDivRef}
          className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        >
          {isLoadingMore && (
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-white/60 text-sm">Loading more messages...</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {messages &&
              messages.map((message, index) => {
                const time = new Date(message.createdAt);
                return (
                  <div
                    key={`${index}`}
                    className={`${
                      message.userId === userState.id
                        ? "self-end rounded-tr-none bg-green-600/15"
                        : "rounded-tl-none bg-neutral-800/50"
                    } w-fit py-2 px-4 rounded-xl max-w-3/4 backdrop-blur-sm`}
                  >
                    <div className="flex justify-between items-center gap-10">
                      <h3 className="text-white/60 text-xs">
                        {message.user.username}
                      </h3>
                      <p className="text-xs text-white/40">
                        {time.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </div>
                    <p className="text-lg tracking-wide text-white">
                      {message.content}
                    </p>
                  </div>
                );
              })}
          </div>
          {showArrow === "down" && (
            <button
              onClick={() => {
                chatDivRef.current!.scrollTo({
                  top: chatDivRef.current!.scrollHeight,
                  behavior: "smooth",
                });
              }}
              className="absolute bottom-0 right-0 rounded-full bg-neutral-900 p-2 m-1 cursor-pointer flex item-center justify-center"
            >
              <FaChevronDown className="text-2xl text-neutral-400" size={12} />
              {showBadge && (
                <div className="bg-green-500 w-[5px] h-[5px] absolute rounded-full z-1 top-0 right-0" />
              )}
            </button>
          )}
          {showArrow === "up" && (
            <button
              onClick={() => {
                chatDivRef.current!.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="absolute bottom-0 right-0 rounded-full bg-neutral-900 p-2 m-1 cursor-pointer flex item-center justify-center"
            >
              <FaChevronUp className="text-2xl text-neutral-400" size={12} />
            </button>
          )}
        </div>
      </div>
      <form
        action={handleSendMessage}
        className="w-full flex items-center gap-2"
      >
        <textarea
          ref={inputRef}
          placeholder="Type your message"
          className="w-full border rounded-md p-2 [&::-webkit-scrollbar]:hidden max-h-[45px] resize-none"
        />
        <Button
          type="submit"
          className="cursor-pointer rounded-md bg-neutral-500 hover:bg-neutral-400"
        >
          <IoSend className="" />
        </Button>
      </form>
    </div>
  );
};

export default ChatRoom;
