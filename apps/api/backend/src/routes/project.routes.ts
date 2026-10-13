import { Router } from "express";
import {
  CreateProjectController,
  AiScaffoldController,
  AiScaffoldStreamController,
  checkAiHealthController,
  getProjectTree,
  getProjectMeta,
} from "../controllers/projectController.js";

const router = Router();

// Standard CLI scaffolding
router.post("/createProjects", CreateProjectController);

// AI Engine Scaffolding (handles both raw AI JSON files response and direct prompt generation)
router.post("/scaffold-ai", AiScaffoldController);
router.post("/scaffold-from-ai", AiScaffoldController); // alias for clarity
router.post("/scaffold-ai/stream", AiScaffoldStreamController);
router.get("/ai-health", checkAiHealthController);

// Project tree and metadata
router.get("/:projectId/tree", getProjectTree);
router.get("/:projectId/meta", getProjectMeta);

export default router;

