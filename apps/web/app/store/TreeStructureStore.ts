import {create} from "zustand";
import {QueryClient} from "@tanstack/react-query";
import { getProjectTree } from "@/apis/project";
export const useTreeStructureStore = create((set)=>{
  const queryClient = new QueryClient();
  return {
    treeStructure : null,
    setTreeStructure : async(projectId)=>{
      const data = await queryClient.fetchQuery({
        queryFn : ()=````````> getProjectTree({projectId}),

      });
      console.log(data);
    }
  }
})