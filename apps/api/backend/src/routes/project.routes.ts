import { Router } from "express";
import {
  CreateProjectController,
  AiScaffoldController,
  AiScaffoldStreamController,
  checkAiHealthController,
  getProjectTree,
  getProjectMeta,
  createDraftProjectController,
  getProjectListController,
  getProjectDetailsController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/projectController.js";

const router = Router();

// Project collections
router.get("/", getProjectListController);
router.post("/draft", createDraftProjectController);
router.post("/createProjects", CreateProjectController);

// AI Engine Scaffolding
router.post("/scaffold-ai", AiScaffoldController);
router.post("/scaffold-from-ai", AiScaffoldController);
router.post("/scaffold-ai/stream", AiScaffoldStreamController);
router.get("/ai-health", checkAiHealthController);

// Single project operations
router.get("/:projectId", getProjectDetailsController);
router.put("/:projectId", updateProjectController);
router.delete("/:projectId", deleteProjectController);

// Project tree and metadata for IDE
router.get("/:projectId/tree", getProjectTree);
router.get("/:projectId/meta", getProjectMeta);

export default router;
