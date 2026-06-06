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

export const getProjectTree = async({projectId})=>{
  try{
    const response = await axios.get(`projects/${projectId}/tree`)
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}