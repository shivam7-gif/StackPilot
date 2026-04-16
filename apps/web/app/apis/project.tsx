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
