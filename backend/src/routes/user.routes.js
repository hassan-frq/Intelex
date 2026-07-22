import { Router } from "express";
import { getMe, updateMe, updateMyPassword } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/me/password", updateMyPassword);

export default router;