import { Router } from "express";
import { authMiddleware } from "../utils/middlewares";
import * as userController from "../controllers/user.controller";

const router = Router();

router.get("/me", authMiddleware, userController.getMe);
router.get("/channel", authMiddleware, userController.getChannel);
router.post("/toggle-updates", authMiddleware, userController.toggleUpdates);

export default router;
