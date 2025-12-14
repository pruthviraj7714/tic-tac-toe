import { WS_URL } from "@/lib/config";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const useSocket = ({roomId} : {roomId : string}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data, status } = useSession();

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!data || !data.accessToken || status !== "authenticated") return;

    setIsConnecting(true);
    setIsConnected(false);
    setError(null);

    const ws = new WebSocket(`${WS_URL}?token=${data.accessToken}&roomId=${roomId}`);

    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnecting(false);
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onerror = (err) => {
      setError("Websocket error");
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
    };

    return () => {
      wsRef.current = null;
      ws.close();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(true);
    };
  }, [status, roomId]);

  return {
    socket,
    isConnecting,
    error,
    isConnected,
  };
};

export { useSocket };
