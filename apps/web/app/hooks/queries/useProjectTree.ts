import { useQuery } from "@tanstack/react-query";
import { getProjectTree } from "../services/projectService";
import {useTreeStructureStore} from "../stores/treeStructureStore";
export const useProjectTree = (projectId: string) => {

  const store = useTreeStructureStore();
  const {isLoading , isError , data : projectTree , error} = useQuery({
    queryfn : ()=> getProjectTree({projectId}),
    
  })

  return {
    isLoading,
    isError,
    projectTree,
    error,
  };
};