"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useTreeStructureStore } from "@/store/TreeStructureStore";
import IdeShell from "@/components/ide/IdeShell";

export default function Ide() {
  const { id } = useParams();
  const { setProjectId } = useTreeStructureStore();
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    if (!id) return;
    setProjectId(id as string);
  }, [id, setProjectId]);

  useEffect(() => {
    async function fetchMeta() {
      if (!id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/projects/${id}/meta`,
        );
        setProjectName(res.data.projectName ?? "");
      } catch (err) {
        console.error(err);
      }
    }
    fetchMeta();
  }, [id]);

  if (!id) return null;

  return <IdeShell projectName={projectName} />;
}
