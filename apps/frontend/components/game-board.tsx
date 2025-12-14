"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"

interface IPlayer {
  email: string
  username: string
  id: string
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

interface GameBoardProps {
  game: IGame
  currentUserId?: string
}

export default function GameBoard({ game, currentUserId }: GameBoardProps) {
  const [boardState, setBoardState] = useState<string[]>([])

  useEffect(() => {
    const parsed = game.boardState ? game.boardState.split("") : Array(9).fill("-")
    setBoardState(parsed)
  }, [game.boardState])

  const isMyTurn = () => {
    if (!currentUserId) return false
    if (game.currentTurn === game.symbolPlayer1) {
      return currentUserId === game.player1Id
    }
    return currentUserId === game.player2Id
  }

  const getCurrentPlayer = () => {
    return game.currentTurn === game.symbolPlayer1 ? game.player1 : game.player2
  }

  const handleCellClick = (index: number) => {
    if (!isMyTurn() || game.status !== "STARTED" || boardState[index] !== "-") {
      return
    }
    console.log("Move:", index)
  }

  const isBoardFull = boardState.every((cell) => cell !== "-")

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            TIC TAC TOE
          </CardTitle>
          {game.status === "ENDED" && (
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm">
            {game.winner ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {game.winner === "draw" ? "It's a Draw!" : `Winner: ${game.winner}`}
              </span>
            ) : isBoardFull ? (
              <span className="text-amber-400 font-semibold">It's a Draw!</span>
            ) : (
              <span className="text-muted-foreground">
                Current Turn:{" "}
                <span
                  className={game.currentTurn === "X" ? "text-red-400 font-semibold" : "text-blue-400 font-semibold"}
                >
                  {getCurrentPlayer().username} ({game.currentTurn})
                </span>
              </span>
            )}
          </div>
          {isMyTurn() && game.status === "STARTED" && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Your Turn</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <div className="inline-block p-8 bg-muted/30 backdrop-blur rounded-3xl border border-border">
          <div className="grid grid-cols-3 gap-3">
            {boardState.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={game.status !== "STARTED" || cell !== "-" || !isMyTurn()}
                className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-card border-2 border-border hover:border-primary transition-all duration-300 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:border-border"
              >
                <span
                  className={`text-4xl md:text-5xl font-bold transition-all duration-200 ${
                    cell === "X"
                      ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]"
                      : cell === "O"
                        ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                        : "text-muted"
                  }`}
                >
                  {cell === "-" ? "" : cell}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
