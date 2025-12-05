import { Router, type Request, type Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { CreateRoomSchema } from "@repo/common";
import { prisma } from "@repo/db";

const roomRouter = Router();

roomRouter.post(
  "/create-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const { success, data, error } = CreateRoomSchema.safeParse(req.body);

      if (!success) {
        res.status(400).json({
          message: "Invalid Inputs",
          error: error.flatten(),
        });
        return;
      }

      const { isPrivate, maxSpectators, name } = data;

      const roomCode = 123346;

      const room = await prisma.room.create({
        data: {
          name,
          maxSpectators,
          roomCode,
          isPrivate,
          player1Id: userId,
        },
      });

      res.status(201).json({
        message: "Room successfully Created",
        id: room.id,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.get("/all", authMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const rooms = await prisma.room.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalRooms = await prisma.room.count();

    res.status(200).json({
      page,
      limit,
      rooms,
      totalRooms,
      totalPages: Math.ceil(totalRooms / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

roomRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;

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

    res.status(200).json({
      message: "Room found",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

roomRouter.post(
  "/join-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;
      const userId = req.userId!;

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

      if (room.player2Id) {
        res.status(400).json({
          message: "Room is already full",
        });
        return;
      }

      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          player2Id: userId,
        },
      });

      res.status(200).json({
        message: "Room joined successfully",
        room,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/leave-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;
      const userId = req.userId!;

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

      if (room.player2Id !== userId) {
        res.status(400).json({
          message: "You are not the player2 of this room",
        });
        return;
      }

      await prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          player2Id: null,
        },
      });

      res.status(200).json({
        message: "Room left successfully",
        room,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/spectate-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;
      const userId = req.userId!;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      const spectators = await prisma.spectator.count({
        where: {
          roomId,
        },
      });

      if (!room) {
        res.status(404).json({
          message: "Room not found",
        });
        return;
      }

      if (room.maxSpectators <= spectators) {
        res.status(400).json({
          message: "Room is already full",
        });
        return;
      }

      await prisma.spectator.create({
        data : {
          roomId,
          userId
        }
      })

      res.status(200).json({
        message: "Room spectated successfully",
        room,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/unspectate-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;
      const userId = req.userId!;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
      });

      const spectator = await prisma.spectator.findFirst({
        where : {
          userId,
          roomId
        }
      })

      if (!room) {
        res.status(404).json({
          message: "Room not found",
        });
        return;
      }

      if (!spectator) {
        res.status(400).json({
          message: "You are not a spectator of this room",
        });
        return;
      }

      await prisma.spectator.delete({
        where : {
          id : spectator.id
        }
      })

      return res.status(200).json({
        message: "Room unspectated successfully",
        room,
        spectator
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/get-spectators",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;

      const spectators = await prisma.spectator.findMany({
        where: {
          roomId,
        },
      });

      return res.status(200).json({
        spectators: spectators || [],
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/get-players",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.body.roomId;

      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          player1: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          player2: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!room) {
        return res.status(404).json({
          message: "Room not found",
        });
      }

      return res.status(200).json({
        message: "Players found",
        players: [room.player1, room.player2],
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default roomRouter;
