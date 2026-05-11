import { Router } from "express";
import { CreateProjectController,getProjectTree } from "../controllers/projectController.js";

const router = Router();

router.post("/createProjects", CreateProjectController);
router.get("/:projectId/tree", getProjectTree);
export default router;
