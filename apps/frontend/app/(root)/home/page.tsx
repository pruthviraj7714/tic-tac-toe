"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Eye, Users2, PlusCircle } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchRooms();
    }
  }, [status]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/rooms/all`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      setRooms(res.data.rooms);
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.message);
    }
  };

  const handleJoinByCode = async () => {
    if (!searchCode) return;
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/rooms/join-room`, {
        roomCode : Number(searchCode)
      }, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      if (res.data.roomId) {
        window.location.href = `/rooms/${res.data.roomId}`;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <section className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">🎮 Tic Tac Toe Arena</h1>
        <p className="text-neutral-400 text-lg">
          Create rooms, join matches, or watch intense battles live.
        </p>

        <div className="flex justify-center mt-6 gap-4">
          <Link href="/create-room">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Room
            </Button>
          </Link>

          <Link href="/rooms">
            <Button variant="outline" className="border-neutral-700 text-black">
              <Users2 className="mr-2 h-5 w-5" /> Browse Rooms
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-md mx-auto mb-12">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Join With Room Code</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Enter the room code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
            <Button
              disabled={loading}
              onClick={handleJoinByCode}
              className="bg-green-600 hover:bg-green-700"
            >
              Join
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">🔥 Active Rooms</h2>

        {rooms.length === 0 ? (
          <p className="text-neutral-500">No rooms created yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: any) => (
              <Card
                key={room.id}
                className="bg-neutral-900 border-neutral-800 hover:shadow-lg transition"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-white">{room.name}</span>

                    {room.status === "PENDING" && (
                      <Badge className="bg-blue-600">Waiting</Badge>
                    )}
                    {room.status === "STARTED" && (
                      <Badge className="bg-orange-600">Live</Badge>
                    )}
                    {room.status === "FULL" && (
                      <Badge className="bg-red-600">Full</Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-neutral-400 space-y-3">
                  <p>
                    Room Code:{" "}
                    <span className="text-white">{room.roomCode}</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Users2 className="w-4 h-4" />
                    Players:{" "}
                    <span className="text-white">{room.player2 ? 2 : 1}/2</span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Spectators:{" "}
                    <span className="text-white">
                      {room?.spectators?.length || 0}
                    </span>
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/room/${room.id}`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Gamepad2 className="mr-2 h-4 w-4" /> Enter
                      </Button>
                    </Link>

                    <Link href={`/spectate/${room.id}`}>
                      <Button
                        variant="outline"
                        className="border-neutral-700 text-black"
                      >
                        <Eye className="mr-2 h-4 w-4" /> Watch
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="h-20" />
    </div>
  );
}
