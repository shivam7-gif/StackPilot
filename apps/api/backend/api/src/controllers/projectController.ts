import express, { type Request, type Response } from "express";
import util from "util";
import child_process from "child_process";
import fs from "fs/promises";
import uuid4 from "uuid4";

const execPromisified = util.promisify(child_process.exec);

export const CreateProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = uuid4();
    const projectPath = `../../projects/${projectId}`;
    console.log("New project id is", projectId);

    await fs.mkdir(projectPath, { recursive: true });

    // after this  call the npm create vite command in the newly created project folder

    const response = await execPromisified(
      `npm create vite@latest sandbox -- --template react`,{
        cwd : `../../projects/${projectId}`
      }
    );

    return res.json({
      message: "Project created successfully",
      path: projectPath,
      data : projectId,
      date : new Date()
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
};
