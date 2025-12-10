"use client"

import { useState } from "react"
import { toast } from "sonner"

const INITIAL_BOARD_STATE = ["-", "-", "-", "-", "-", "-", "-", "-", "-"]

const winningIndexsArray = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export default function GamePage() {
  const [boardState, setBoardState] = useState(INITIAL_BOARD_STATE)
  const [currSymbol, setCurrSymbol] = useState("O")
  const [isWinner, setIsWinner] = useState<string | null>(null)

  const checkWinner = (currSymbol: string, newBoard: string[]): string | null => {
    let isWin = false
    for (let i = 0; i < winningIndexsArray.length; i++) {
      const arr = winningIndexsArray[i]
      let sum = 0
      for (let j = 0; j < arr.length; j++) {
        if (newBoard[arr[j]] === currSymbol) {
          sum += 1
        }
      }
      isWin = sum === 3 ? true : false
      if (isWin) break
    }

    return isWin ? currSymbol : null
  }

  const handleCellClick = (index: number) => {
    if (boardState[index] !== "-" || isWinner) return

    const newBoardState = boardState.map((cell, idx) => (idx === index ? currSymbol : cell))
    setBoardState(newBoardState)
    setCurrSymbol((prev) => (prev === "O" ? "X" : "O"))

    const winner = checkWinner(currSymbol, newBoardState)

    if (winner) {
      toast.success(`${winner} is winner 🏆`, {
        position: "top-center",
      })
      setIsWinner(currSymbol)
      return
    }
  }

  const handleResetBoard = () => {
    setBoardState(INITIAL_BOARD_STATE)
    setIsWinner(null)
    setCurrSymbol("O")
  }

  const isBoardFull = boardState.every((cell) => cell !== "-")

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 mb-2">
          TIC TAC TOE
        </h1>
        <p className="text-lg text-slate-300">
          {isWinner ? (
            <span className="text-emerald-400 font-semibold">🏆 Player {isWinner} Won!</span>
          ) : isBoardFull ? (
            <span className="text-amber-400 font-semibold">It's a Draw!</span>
          ) : (
            <span>
              Current Player:{" "}
              <span className={currSymbol === "X" ? "text-red-400" : "text-blue-400"}>{currSymbol}</span>
            </span>
          )}
        </p>
      </div>

      <div className="mb-8 p-8 bg-slate-800/50 backdrop-blur rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="grid grid-cols-3 gap-3">
          {boardState.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={isWinner != null || cell !== "-"}
              className="w-24 h-24 flex items-center justify-center rounded-2xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-cyan-400 transition-all duration-300 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
            >
              <span
                className={`text-5xl font-bold transition-all duration-200 ${
                  cell === "X"
                    ? "text-red-400 drop-shadow-lg drop-shadow-red-500/50"
                    : cell === "O"
                      ? "text-blue-400 drop-shadow-lg drop-shadow-blue-500/50"
                      : "text-slate-500"
                }`}
              >
                {cell === "-" ? "" : cell}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleResetBoard}
        className="px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:scale-105 active:scale-95"
      >
        Reset Board
      </button>
    </div>
  )
}
