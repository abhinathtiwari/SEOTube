import { Router } from "express";
import { User } from "../models/Users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    httpOnly: true,
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
    httpOnly: true,
    sameSite: "lax",   
    secure: false      
    });
  res.json({ message: "Login successful" });
});

export default router;
