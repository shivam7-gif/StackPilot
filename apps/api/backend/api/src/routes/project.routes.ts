import { Router } from "express";
import { CreateProjectController } from "../controllers/projectController.js";

const router = Router();

router.post("/createProjects", CreateProjectController);
export default router;
