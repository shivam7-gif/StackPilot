import { Router } from "express";
import {
  CreateProjectController,
  getProjectTree,
  getProjectMeta,
} from "../controllers/projectController.js";

const router = Router();

router.post("/createProjects", CreateProjectController);
router.get("/:projectId/tree", getProjectTree);
router.get("/:projectId/meta", getProjectMeta);
export default router;
