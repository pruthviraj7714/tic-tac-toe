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

      const isRoomWithGivenNameAlreadyExists = await prisma.room.findUnique({
        where: {
          name,
        },
      });

      if (isRoomWithGivenNameAlreadyExists) {
        res.status(409).json({
          message:
            "Room with given name already exists. Please Use Different Name",
        });
        return;
      }

      const room = await prisma.room.create({
        data: {
          name,
          maxSpectators,
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

export default roomRouter;
