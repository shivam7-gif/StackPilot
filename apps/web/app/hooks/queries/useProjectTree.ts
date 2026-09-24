import { useQuery } from "@tanstack/react-query";
import { getProjectTree } from "@/apis/project";
import { useTreeStructureStore } from "@/store/TreeStructureStore";

export const useProjectTree = (projectId: string) => {
  const store = useTreeStructureStore();
  const { isLoading, isError, data: projectTree, error } = useQuery({
    queryKey: ["projectTree", projectId],
    queryFn: () => getProjectTree({ projectId }),
    enabled: Boolean(projectId),
  });

  return {
    isLoading,
    isError,
    projectTree,
    error,
    store,
  };
};