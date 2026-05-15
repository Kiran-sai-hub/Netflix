import express from "express";
import { unlockStream } from "../controllers/stream.controller.js";

const router = express.Router();

router.post("/unlock", unlockStream);

export default router;
