import express from "express";
import { listMenu, getMenuItem } from "../controllers/menuController.js";

const router = express.Router();

router.get("/", listMenu);
router.get("/:id", getMenuItem);

export default router;
