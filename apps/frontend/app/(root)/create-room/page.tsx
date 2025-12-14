"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Lock, Globe, Users, Loader2 } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useSession } from "next-auth/react";

export default function CreateRoomPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { data, status } = useSession();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Room name is required.");
      return;
    }

    if (isPrivate && !password.trim()) {
      toast.error("Password required for private room.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/rooms/create-room`, {
        name,
        isPrivate,
        password: isPrivate ? password : null,
      }, {
        headers : {
          Authorization : `Bearer ${data?.accessToken}`
        }
      });

      setLoading(false);

      toast.success("Room created!");
      router.push(`/rooms/${res.data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10 flex justify-center">
      <Card className="w-full max-w-lg bg-neutral-900 border-neutral-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-white font-bold text-center">
            🎮 Create a Room
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Label className="text-neutral-300">Room Name</Label>
            <Input
              placeholder="Enter room name"
              className="bg-neutral-800 border-neutral-700 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between bg-neutral-800 border border-neutral-700 p-4 rounded-xl">
            <div className="flex gap-3 items-center">
              {isPrivate ? (
                <Lock className="h-5 w-5 text-red-400" />
              ) : (
                <Globe className="h-5 w-5 text-green-400" />
              )}
              <div>
                <p className="text-white font-medium">
                  {isPrivate ? "Private Room" : "Public Room"}
                </p>
                <p className="text-sm text-neutral-400">
                  {isPrivate
                    ? "Users need a password to join"
                    : "Anyone can join this room"}
                </p>
              </div>
            </div>

            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
          {isPrivate && (
            <div className="flex flex-col space-y-2">
              <Label className="text-neutral-300">Password</Label>
              <Input
                placeholder="Room password"
                type="password"
                className="bg-neutral-800 border-neutral-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          x
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Create Room"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
