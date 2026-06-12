"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  type: "file" | "folder";
}

const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div key={node.path}>
      <div
        style={{
          paddingLeft: `${level * 20}px`,
          cursor: hasChildren ? "pointer" : "default",
          color: node.type === "folder" ? "#4A90E2" : "#666",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          marginBottom: "4px",
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span style={{ marginRight: "6px", minWidth: "12px" }}>
            {expanded ? "▼" : "▶"}
          </span>
        )}
        {!hasChildren && <span style={{ marginRight: "6px", minWidth: "12px" }} />}
        <span>{node.type === "folder" ? "📁" : "📄"}</span>
        <span style={{ marginLeft: "6px" }}>{node.name}</span>
      </div>

      {expanded && node.children && node.children.map((child) => <TreeNodeComponent key={child.path} node={child} level={level + 1} />)}
    </div>
  );
};

export default function TreePage() {
  const params = useParams();
  const id = params?.id as string;
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch the project tree from our local API endpoint
        const response = await fetch(`/api/projects/${id}/tree`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tree: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setTree(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tree:", err);
        setError(err instanceof Error ? err.message : "Failed to load project tree");
        setTree(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading project tree...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  if (!tree) {
    return <div style={{ padding: "20px" }}>No project tree found</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Project: {id}</h1>
      <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "4px", backgroundColor: "#f9f9f9" }}>
        <TreeNodeComponent node={tree} />
      </div>
    </div>
  );
}
