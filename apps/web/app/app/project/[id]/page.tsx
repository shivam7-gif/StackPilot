"use client";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Project: {id}</h1>
    </div>
  );
}
