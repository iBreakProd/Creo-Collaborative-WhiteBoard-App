import { useEffect, useState } from "react";

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!url || url.includes("undefined")) {
      setIsError(true);
      setIsLoading(false);
      console.log("url is undefined");
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setSocket(null);

    const ws = new WebSocket(url);

    let pingInterval: NodeJS.Timeout;

    ws.onopen = () => {
      setIsLoading(false);
      setIsError(false);
      setSocket(ws);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 30000); // 30 seconds heartbeat
    };

    ws.onclose = (event) => {
      if (pingInterval) clearInterval(pingInterval);
      setSocket(null);
      if (!event.wasClean) {
        setIsError(true);
      }
      setIsLoading(false);
    };

    ws.onerror = (error) => {
      if (pingInterval) clearInterval(pingInterval);
      setIsError(true);
      setIsLoading(false);
      setSocket(null);
    };

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [url]);

  return { socket, isLoading, isError };
};
