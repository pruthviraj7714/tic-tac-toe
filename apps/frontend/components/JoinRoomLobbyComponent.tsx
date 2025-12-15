"use client";

import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Users, GamepadIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface IRoomMetadata {
  isPrivate: boolean;
  roomCode: number;
  id: string;
}

export default function JoinRoomLobbyComponent({ roomId }: { roomId: string }) {
  const { data, status } = useSession();
  const [isRoomPrivate, setIsRoomPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [roomMetadata, setRoomMetadata] = useState<IRoomMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchRoomMetaData = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/rooms/room-metadata/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setRoomMetadata(res.data.metadata);
      setIsRoomPrivate(res.data.metadata.isPrivate);
    } catch (error: any) {
      toast.error(
        error?.response?.data.message || "Failed to fetch room metadata"
      );
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode || roomCode.length === 0) {
      toast.error("Please enter a room code");
      return;
    }

    if (isRoomPrivate && (!password || password.length === 0)) {
      toast.error("Please enter the room password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/rooms/join-room`,
        {
          roomId,
          roomCode: Number.parseInt(roomCode),
          password: isRoomPrivate ? password : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      toast.success("Successfully joined the room!");
      router.push(`/rooms/${res.data.roomId}`);
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRoomMetaData();
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GamepadIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Join Game Room
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the room code to join the multiplayer Tic Tac Toe game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="roomCode"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-primary" />
              Room Code
            </Label>
            <Input
              id="roomCode"
              type="text"
              placeholder="Enter 6-digit room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="h-12 text-lg font-mono tracking-wider text-center border-primary/30 focus-visible:ring-primary"
              maxLength={6}
            />
          </div>

          {isRoomPrivate && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <Label
                htmlFor="password"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-primary" />
                Room Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter room password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-primary/30 focus-visible:ring-primary"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                This is a private room
              </p>
            </div>
          )}

          <Button
            onClick={handleJoinRoom}
            disabled={isLoading || status !== "authenticated"}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Joining...
              </span>
            ) : (
              "Join Room"
            )}
          </Button>

          {status !== "authenticated" && (
            <p className="text-sm text-destructive text-center">
              Please sign in to join a room
            </p>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Make sure you have the correct room code from your friend
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
