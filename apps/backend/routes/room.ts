import { Router, type Request, type Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  CreateRoomSchema,
  JoinRoomSchema,
  RenameRoomSchema,
  UpdateRoomSettingSchema,
} from "@repo/common";
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

      const { isPrivate, name, password } = data;

      const roomCode = Math.floor(100000 + Math.random() * 900000);

      const room = await prisma.room.create({
        data: {
          name,
          roomCode,
          isPrivate,
          password: password ?? null,
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

roomRouter.post(
  "/join-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.userId!;

      const { success, data, error } = JoinRoomSchema.safeParse(req.body);

      if (!success) {
        res.status(400).json({
          message: "Invalid Inputs",
          error: error.flatten(),
        });
        return;
      }

      const { roomCode, password } = data;

      const room = await prisma.room.findUnique({
        where: {
          roomCode,
        },
      });

      if (!room) {
        res.status(404).json({
          message: "Room not found",
        });
        return;
      }

      if (room.isPrivate && room.password !== password) {
        res.status(401).json({
          message: "Incorrect Room Password",
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
          id: room.id,
        },
        data: {
          player2Id: userId,
        },
      });

      res.status(200).json({
        message: "Room joined successfully",
        roomId : room.id,
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
  "/spectate-room/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId!;
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

      await prisma.spectator.create({
        data: {
          roomId,
          userId,
          
        },
      });

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
  "/unspectate-room/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;
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

      const spectator = await prisma.spectator.findFirst({
        where: {
          userId,
          roomId,
        },
      });

      if (!spectator) {
        res.status(400).json({
          message: "You are not a spectator of this room",
        });
        return;
      }

      await prisma.spectator.delete({
        where: {
          id: spectator.id,
        },
      });

      return res.status(200).json({
        message: "Room unspectated successfully",
        room,
        spectatorId: spectator.id,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.post(
  "/:roomId/players",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;

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

roomRouter.get(
  "/rooms",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const rooms = await prisma.room.findMany({
        where: {
          isPrivate: false,
        },
      });

      res.status(200).json(rooms || []);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.get(
  "/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;

      const room = await prisma.room.findFirst({
        where: {
          id: roomId,
        },
        include: {
          player1: {
            select: {
              email: true,
              username: true,
              id: true,
            },
          },
          player2: {
            select: {
              username: true,
              email: true,
              id: true,
            },
          },
          spectators: {
            include: {
              user: {
                select: {
                  username: true,
                  email: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(room);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.get(
  "/:roomId/spectators",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;

      const spectators = await prisma.spectator.findMany({
        where: {
          roomId,
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      res.status(200).json(spectators || []);
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.patch(
  "/:roomId/rename",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;

      const { success, error, data } = RenameRoomSchema.safeParse(req.body);

      if (!success) {
        res.status(400).json({
          message: "Invalid Inputs",
          error: error.flatten(),
        });
        return;
      }

      const { newName } = data;

      const room = await prisma.room.findFirst({
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

      await prisma.room.update({
        where: {
          id: room.id,
        },
        data: {
          name: newName,
        },
      });

      res.status(200).json({
        message: "Room Successfully Renamed",
        room,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.patch(
  "/:roomId/update-setting",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;

      const room = await prisma.room.findFirst({
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

      const { success, data, error } = UpdateRoomSettingSchema.safeParse(
        req.body
      );

      if (!success) {
        res.status(400).json({
          message: "Invalid Inputs",
          error: error.message,
        });
        return;
      }

      const { isPrivate, password } = data;

      await prisma.room.update({
        where: {
          id: room.id,
        },
        data: {
          isPrivate: isPrivate,
          password: password ?? null,
        },
      });

      res.status(200).json({
        message: "Room Setting updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

roomRouter.delete(
  "/:roomId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId;
      const userId = req.userId!;
      const room = await prisma.room.findFirst({
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

      if (room.player1Id !== userId) {
        res.status(403).json({
          message: "You are not authorized to delete this room",
        });
        return;
      }

      await prisma.room.delete({
        where: {
          id: roomId,
        },
      });

      res.status(200).json({
        message: "Room successfully Deleted",
        id: room.id,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default roomRouter;
