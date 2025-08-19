import { Router } from "express";
import { chatWithBot } from "./chatbot.controller";

const router = Router();

router.post("/", chatWithBot);

export default router;
