import { Router, type Request, type Response } from "express";
import { SignInSchema, SignUpSchema } from "@repo/common";
import { prisma } from "@repo/db";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const userRouter = Router();

userRouter.post("/signup", async (req : Request, res : Response) : Promise<void> => {
  try {
    const { success, data } = SignUpSchema.safeParse(req.body);
  
    if (!success) {
      res.status(400).json({
        message: "Invalid Inputs",
      });
      return;
    }
  
    const { email, password, username } = data;
    const isUsernameOrEmailAlreadyExists = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          {
            email,
          },
        ],
      },
    });

    if (isUsernameOrEmailAlreadyExists) {
      res.status(409).json({
        message: "User with this email or username already exists"
      });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    res.status(201).json({
      message: "User Account Successfully Created",
      id: user.id,
    });
  } catch (error : any) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
      error : error.message
    });
  }
});

userRouter.post("/signin", async (req : Request, res : Response) : Promise<void> => {
  try {
    const { success, data } = SignInSchema.safeParse(req.body);
  
    if (!success) {
      res.status(400).json({
        message: "Invalid Inputs",
      });
      return;
    }
  
    const { username, password } = data;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        message: "Invalid Password",
      });
      return;
    }

    const token = sign(
      {
        userId: user.id,
      },
      JWT_SECRET, {
        expiresIn : "7d"
      }
    );

    res.status(200).json({
      message: "Successful Login",
      token,
    });
  } catch (error : any) {
    console.log(error);
    
    res.status(500).json({
      message: "Internal Server Error",
      error : error.message
    });
  }
});

export default userRouter;
