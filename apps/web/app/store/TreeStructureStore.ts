import { create } from "zustand";
import { QueryClient } from "@tanstack/react-query";
import { getProjectTree } from "@/apis/project";

const queryClient = new QueryClient();

interface TreeStructureState {
  projectId: string | null;
  treeStructure: any;
  isLoading: boolean;
  error: string | null;
  collapseAllVersion: number;
  expandedPaths: Record<string, boolean>;
  newFileInput: { parentPath: string; isFolder: boolean } | null;
  setProjectId: (projectId: string | null) => void;
  setTreeStructure: (projectId: string | null, silent?: boolean) => Promise<void>;
  toggleFolder: (path: string, currentExpanded?: boolean) => void;
  setFolderExpanded: (path: string, expanded: boolean) => void;
  triggerCollapseAll: () => void;
  setNewFileInput: (input: { parentPath: string; isFolder: boolean } | null) => void;
}

export const useTreeStructureStore = create<TreeStructureState>((set, get) => ({
  projectId: null,
  treeStructure: null,
  isLoading: false,
  error: null,
  collapseAllVersion: 0,
  expandedPaths: {},
  newFileInput: null,

  triggerCollapseAll: () => {
    set((state) => ({
      collapseAllVersion: state.collapseAllVersion + 1,
      expandedPaths: {},
    }));
  },

  toggleFolder: (path, currentExpanded = false) => {
    set((state) => {
      const current = state.expandedPaths[path] ?? currentExpanded;
      return {
        expandedPaths: {
          ...state.expandedPaths,
          [path]: !current,
        },
      };
    });
  },

  setFolderExpanded: (path, expanded) => {
    set((state) => ({
      expandedPaths: {
        ...state.expandedPaths,
        [path]: expanded,
      },
    }));
  },

  setNewFileInput: (newFileInput) => {
    set({ newFileInput });
  },

  setProjectId: (projectId) => {
    const isNewProject = get().projectId !== projectId;
    set({
      projectId,
      ...(isNewProject ? { treeStructure: null, expandedPaths: {}, collapseAllVersion: 0 } : {}),
    });
  },

  setTreeStructure: async (projectId, silent = false) => {
    if (!projectId) {
      const msg = "projectId is undefined";
      console.error(msg);
      set({ error: msg, isLoading: false });
      return;
    }

    const currentProjectId = get().projectId;
    const isNewProject = currentProjectId !== projectId;
    const hasData = get().treeStructure !== null && !isNewProject;

    try {
      if (!silent && !hasData) {
        set({
          isLoading: true,
          error: null,
          projectId,
          ...(isNewProject ? { expandedPaths: {}, collapseAllVersion: 0 } : {}),
        });
      } else {
        set({
          error: null,
          projectId,
          ...(isNewProject ? { expandedPaths: {}, collapseAllVersion: 0 } : {}),
        });
      }

      const data = await queryClient.fetchQuery({
        queryKey: ["projectTree", projectId],
        queryFn: () => getProjectTree({ projectId }),
        staleTime: 0,
      });

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
        treeStructure: hasData ? get().treeStructure : null,
      });
    }
  },
}));
