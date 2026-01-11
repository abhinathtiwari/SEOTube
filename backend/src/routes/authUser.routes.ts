import { Router } from "express";
import { User } from "../models/Users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../utils/middlewares";
import axios from "axios";

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
  res.clearCookie("token");
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email and password required");

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: false,
    sameSite: "lax",
    secure: false
  });
  res.json({ message: "Signup successful" });
});

// Login
router.post("/login", async (req, res) => {
  res.clearCookie("token");
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Email and password required");

  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.clearCookie("token");
    return res.status(401).send("Invalid credentials");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: false,
    sameSite: "lax",
    secure: false
  });
  res.json({ message: "Login successful" });
});

//delete user's account
router.delete("/deleteaccount", authMiddleware, async (req: any, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "User not authenticated",
    });
  }

  try {
    const result = await User.deleteOne({ email: user.email });
    if (user.youtubeRefreshToken) {
      const res = await axios.post(
        "https://oauth2.googleapis.com/revoke",
        null,
        {
          params: {
            token: user.youtubeRefreshToken,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: `Account for ${user.email} was not found`,
      });
    }
    return res.status(200).json({
      message: `Account for ${user.email} has been deleted! All YouTube permissions have been revoked.
      ${res}
      `,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Account for ${user.email} was not completely deleted`,
    });
  }
});

export default router;
