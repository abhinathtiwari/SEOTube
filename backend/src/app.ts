/** Main Express application setup and middleware configuration. */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authYoutube.routes";
import youtubeRoutes from "./routes/youtube.routes";
import aiRoutes from "./routes/ai.routes";
import authUserRoutes from "./routes/authUser.routes";
import youtubeCronRoutes from "./routes/youtube.cron.routes";
import userRoutes from "./routes/user.routes";
import { globalErrorHandler, AppError } from "./utils/errorHandler";

export const app = express();

app.use(cors({
  origin: process.env.FRONTEND_BASE!,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/youtubecron", youtubeCronRoutes);
app.use("/ai", aiRoutes);
app.use("/auth/user", authUserRoutes);
app.use("/users", userRoutes);

app.use(express.static("public"));

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);