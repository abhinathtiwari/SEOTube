import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/Users";

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).send("Unauthorized");
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized");
  }
};
