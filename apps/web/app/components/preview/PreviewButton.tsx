"use client";

import { ActivePreviewStore } from "@/store/activePreviewStore";
import { useTreeStructureStore } from "@/store/TreeStructureStore";
import { API_BASE_URL } from "@/config/socket";

export default function PreviewButton() {
  const openPreview = ActivePreviewStore((state) => state.openPreview);
  const previewUrl = ActivePreviewStore((state) => state.previewUrl);
  const projectId = useTreeStructureStore((state) => state.projectId);

  const handlePreview = () => {
    const url =
      previewUrl ||
      (projectId
        ? `${API_BASE_URL}/api/preview/${projectId}/`
        : `${API_BASE_URL}/api/preview/default/`);
    openPreview(url);
  };

  return (
    <button
      onClick={handlePreview}
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-sky-500 hover:bg-sky-400 text-white transition-colors"
    >
      Preview
    </button>
  );
}