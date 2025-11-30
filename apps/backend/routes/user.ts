import { Router } from "express";
import { SignInSchema, SignUpSchema } from "@repo/common";
import { prisma } from "@repo/db";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const { success, data, error } = SignUpSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      message: "Invalid Inputs",
    });
    return;
  }

  const { email, password, username } = data;

  try {
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
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { success, data, error } = SignInSchema.safeParse(req.body);

  if (!success) {
    res.status(401).json({
      message: "Invalid Inputs",
    });
    return;
  }

  const { username, password } = data;

  try {
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
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default userRouter;
