import {create} from "zustand";
export const useTreeStructureStore = create((set)=>{
  const {isLoading , isError , treeStructure , error} = useProjectTree();
  return{
    treeStructure : null,
    setTreeStructure : ()=>{

    }
  }
})