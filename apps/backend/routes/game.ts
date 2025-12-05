import { Router, type Request, type Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { prisma } from "@repo/db";

const gameRouter = Router();

gameRouter.post(
  "/create-game",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;
      const roomId = req.body.roomId;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      if (!room) {
        res.status(404).json({
          message: "Room not found",
        });
        return;
      }

      if (room.player1Id === userId) {
        res.status(400).json({
          message: "You are already a player in this room",
        });
        return;
      }
      if (room.player2Id === userId) {
        res.status(400).json({
          message: "You are already a player in this room",
        });
        return;
      }
      if (room.player1Id && room.player2Id) {
        res.status(400).json({
          message: "Room is already full",
        });
        return;
      }

      const game = await prisma.game.create({
        data: {
          roomId,
          player1Id: userId,
          player2Id: room.player2Id!,
          status: "ONGOING",
          boardState: "_________",
          moves: [],
          currentTurn: "PLAYER1",
          winner: null,
        },
      });

      res.status(201).json({
        message: "Game created successfully",
        game,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

gameRouter.get("/get-game", authMiddleware, async (req: Request, res: Response) => {
  try {
    const roomId = req.body.roomId;
    const game = await prisma.game.findFirst({
      where: {
        roomId,

      },
    });
    if (!game) {
      return res.status(404).json({
        message: "Game not found",
      });
    }
    return res.status(200).json({
      message: "Game found",
      game,
    });
  }
  catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default gameRouter;
