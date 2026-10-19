import express from "express";
import projectRouter from "./project.routes.js";
import previewRouter from "./preview.routes.js";
import integrationRouter from "./integration.routes.js";

const router = express.Router();

router.use("/projects", projectRouter);
router.use("/api/preview", previewRouter);
router.use("/preview", previewRouter);
router.use("/api/integrations", integrationRouter);
router.use("/integrations", integrationRouter);

export default router;
