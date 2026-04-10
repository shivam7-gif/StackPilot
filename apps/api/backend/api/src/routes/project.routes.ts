import {Router} from "express";
import {CreateProject} from "../controllers/project.controller";

const router = Router();

router.post("/create",createProject)