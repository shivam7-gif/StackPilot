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

export const getProjectTree = async ({ projectId }) => {
  try {
    const response = await axios.get(`projects/${projectId}/tree`);
    console.log("API Response:", response.data);
    return response.data.data; // Extract the tree data from the response wrapper
  } catch (error) {
    console.error("Error fetching project tree:", error);
    throw error;
  }
};
