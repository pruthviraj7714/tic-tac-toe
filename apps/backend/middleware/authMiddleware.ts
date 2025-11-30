import type { NextFunction, Request, Response } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    const decoded = verify(token, JWT_SECRET) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch (error : any) {
    if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired, please log in again",
        });
      }
  
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token, authentication failed",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal authentication error",
      });
  

  }
};

export default authMiddleware;
