import {useQuery} from "@tanstack/react-query"
import {getProjectTree} from "../services/projectService"
export const useProjectTree = ({projectId} : {projectId}){
  const{} = useQuery({
    queryFn :()=> getProjectTree({projectId})
  })
}