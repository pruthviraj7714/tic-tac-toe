"use client"

import { useSocket } from "@/hooks/useSocket"
import { BACKEND_URL } from "@/lib/config"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Trophy, Clock, Lock, Unlock } from "lucide-react"
import GameBoard from "./game-board"

interface IPlayer {
  email: string
  username: string
  id: string
}

interface IRoomData {
  id: string
  name: string
  isPrivate: boolean
  roomCode: number
  password: string | null
  status: "PENDING" | "FULL" | "STARTED"
  createdAt: Date
  player1Id: string
  player2Id: string | null
  player1: IPlayer
  player2: IPlayer | null
  spectators: []
}

interface IGame {
  player1: IPlayer
  player2: IPlayer
  roomId: string
  id: string
  player1Id: string
  player2Id: string
  winner: "X" | "O" | "draw" | null
  boardState: string
  moves: string[]
  currentTurn: "X" | "O"
  symbolPlayer1: "X" | "O"
  symbolPlayer2: "X" | "O"
  status: "PENDING" | "FULL" | "STARTED" | "ENDED"
  createdAt: Date
  updatedAt: Date
}

export default function RoomPageComponent({ roomId }: { roomId: string }) {
  const { socket, error, isConnected, isConnecting } = useSocket({ roomId })
  const [roomInfo, setRoomInfo] = useState<IRoomData | null>(null)
  const [games, setGames] = useState<IGame[]>([])
  const [activeGame, setActiveGame] = useState<IGame | null>(null)
  const { data, status } = useSession()

  const fetchRoomInfo = async () => {
    if (!data || !data.accessToken) return

    try {
      const res = await axios.get(`${BACKEND_URL}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      })
      setRoomInfo(res.data)
    } catch (error: any) {
      toast.error(error?.response?.data.message || error.message)
    }
  }

  const fetchGames = async () => {
    if (!data || !data.accessToken) return
    try {
      const res = await axios.get(`${BACKEND_URL}/games/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      })
      setGames(res.data)

      const active = res.data.find((game: IGame) => game.status === "STARTED")
      if (active) setActiveGame(active)
    } catch (error: any) {
      toast.error(error?.response?.data.message || error.message)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchRoomInfo()
      fetchGames()
    }
  }, [status, roomId])

  useEffect(() => {
    if (!isConnected || !socket) return

    socket.send(
      JSON.stringify({
        type: "room:join",
        roomId,
      }),
    )

    socket.onmessage = ({ data }) => {
      const payload = JSON.parse(data.toString())

      switch (payload.type) {
        case "room:joined": {
          console.log("room joined")
          toast.success("Connected to room")
        }
      }
    }

    return () => {
      socket.close()
    }
  }, [socket, isConnected, isConnecting])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "STARTED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "ENDED":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">{roomInfo?.name || "Game Room"}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getStatusColor(roomInfo?.status || "")}>
                  {roomInfo?.status || "Loading..."}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {roomInfo?.isPrivate ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Private Room</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>Public Room</span>
                    </>
                  )}
                </div>
                {isConnected && (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                    Connected
                  </Badge>
                )}
              </div>
            </div>
            {roomInfo?.isPrivate && (
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Room Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-mono font-bold text-primary">{roomInfo?.roomCode}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeGame ? (
              <GameBoard game={activeGame} currentUserId={data?.user?.id} />
            ) : (
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="py-24 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Active Game</h3>
                  <p className="text-muted-foreground">Waiting for players to start a game...</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Game History
                </CardTitle>
                <CardDescription>Past games in this room</CardDescription>
              </CardHeader>
              <CardContent>
                {games.length > 0 ? (
                  <div className="space-y-3">
                    {games.slice(0, 5).map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border-2 border-blue-500">
                              <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">
                                {getInitials(game.player1.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{game.player1.username}</span>
                          </div>
                          <span className="text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8 border-2 border-red-500">
                              <AvatarFallback className="text-xs bg-red-500/20 text-red-400">
                                {getInitials(game.player2.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{game.player2.username}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getStatusColor(game.status)}>
                            {game.status}
                          </Badge>
                          {game.winner && game.winner !== "draw" && <Trophy className="w-4 h-4 text-amber-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No games played yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players
                </CardTitle>
                <CardDescription>Currently in this room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomInfo?.player1 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Avatar className="w-12 h-12 border-2 border-blue-500">
                      <AvatarFallback className="bg-blue-500/20 text-blue-400 font-semibold">
                        {getInitials(roomInfo.player1.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{roomInfo.player1.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{roomInfo.player1.email}</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      P1
                    </Badge>
                  </div>
                )}

                {roomInfo?.player2 ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Avatar className="w-12 h-12 border-2 border-red-500">
                      <AvatarFallback className="bg-red-500/20 text-red-400 font-semibold">
                        {getInitials(roomInfo.player2.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{roomInfo.player2.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{roomInfo.player2.email}</p>
                    </div>
                    <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-500/30">
                      P2
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                    <Avatar className="w-12 h-12 border-2 border-muted">
                      <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground">Waiting for player...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border">
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Games Played</span>
                  <span className="font-semibold">{games.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-semibold text-sm">
                    {roomInfo?.createdAt ? new Date(roomInfo.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
