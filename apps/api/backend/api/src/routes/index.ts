import express from "express";
import projectRouter from "./project.routes.js";
const router = express.Router();

router.use("/projects", projectRouter);
export default router;
