import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import youtubeRoutes from "./routes/youtube.routes";
import aiRoutes from "./routes/ai.routes";
import authUserRoutes from "./routes/authUser.routes";
import { authMiddleware } from "./middleware/auth";
import youtubeCronRoutes from "./routes/youtube.cron.routes";

export const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173",credentials: true}));
app.use("/auth", authRoutes);
app.use("/youtube", youtubeRoutes);          
app.use("/youtubecron", youtubeCronRoutes); 
app.use("/ai", aiRoutes);
app.use("/auth/user", authUserRoutes);
app.use(express.static("public"));