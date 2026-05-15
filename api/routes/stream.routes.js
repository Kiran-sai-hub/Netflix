import express from "express";
import { unlockStream, serveStream } from "../controllers/stream.controller.js";

const router = express.Router();

router.post("/unlock", unlockStream);
router.get("/embed", serveStream);

export default router;
