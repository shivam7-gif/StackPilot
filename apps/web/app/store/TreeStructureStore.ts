import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import { getProjectTree } from "@/apis/project";

const queryClient = new QueryClient();

interface TreeStructureState {
  projectId: string | null;
  treeStructure: any;
  isLoading: boolean;
  error: string | null;
  setProjectId: (projectId: string | null) => void;
  setTreeStructure: (projectId: string | null) => Promise<void>;
}

export const useTreeStructureStore = create<TreeStructureState>((set) => ({
  projectId: null,
  treeStructure: null,
  isLoading: false,
  error: null,

  setProjectId: (projectId) => {
    set({
      projectId,
    });
  },

  setTreeStructure: async (projectId) => {
    if (!projectId) {
      const msg = "projectId is undefined";
      console.error(msg);
      set({ error: msg, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await queryClient.fetchQuery({
        queryKey: ["projectTree", projectId],
        queryFn: () => getProjectTree({ projectId }),
      });

      console.log("Tree structure fetched:", data);

      set({
        treeStructure: data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch tree structure";
      console.error("Error fetching tree structure:", errorMsg);
      set({
        error: errorMsg,
        isLoading: false,
        treeStructure: null,
      });
    }
  },
}));
