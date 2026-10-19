import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/config/axiosConfig";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectName, frontend, backend } = body;

    // Attempt to proxy to the backend if reachable
    try {
      const backendRes = await fetch(`${API_BASE_URL}/projects/createProjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: projectName || "stackpilot-project",
          frontend: frontend && frontend !== "none" ? frontend : undefined,
          backend: backend && backend !== "none" ? backend : undefined,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json({
          success: true,
          projectId: data.projectId || crypto.randomUUID(),
          ...body,
        });
      }
    } catch {
      // Backend offline or timeout: fall back gracefully to local mock project
    }

    const projectId = crypto.randomUUID();
    return NextResponse.json({
      success: true,
      projectId,
      ...body,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
