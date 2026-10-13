import axios from "../config/axiosConfig";
export const createProjectApi = async () => {
  try {
    const response = await axios.post("/projects/createProjects");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getProjectTree = async ({ projectId }: { projectId: string }) => {
  try {
    const response = await axios.get(`projects/${projectId}/tree`);
    console.log("API Response:", response.data);
    return response.data.data; // Extract the tree data from the response wrapper
  } catch (error) {
    console.error("Error fetching project tree:", error);
    throw error;
  }
};

export interface ScaffoldAiProjectPayload {
  prompt?: string;
  projectName?: string;
  files?: Array<{ path: string; code?: string; action?: string; purpose?: string }>;
  frontend?: string;
  backend?: string;
  model?: string;
  effort?: string;
}

export const scaffoldAiProjectApi = async (payload: ScaffoldAiProjectPayload) => {
  try {
    const response = await axios.post("/projects/scaffold-ai", payload);
    return response.data;
  } catch (error) {
    console.error("Error scaffolding AI project:", error);
    throw error;
  }
};

