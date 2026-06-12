import { useTreeStructureStore} from "../../store/TreeStructureStore"
import {useParams} from "react-router-dom";
import {useEffect} from "react";
export const TreeStructure = ()=>{
  const { treeStructure , setTreeStructure} = useTreeStructureStore();
  const{projectId} = useParams();

  useEffect(()=>{
    setTreeStructure(projectId);
  },[projectId,setTreeStructure]);
  return (
    <div>
      <h1>Tree Structure</h1>
    </div>
  )
}