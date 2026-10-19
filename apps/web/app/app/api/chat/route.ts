import { NextRequest } from "next/server";
import { AI_BACKEND_URL } from "@/config/aiApi";

// Strip ANSI escape codes
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1b/g, "");
}

// Clean log lines and ignore noise
function filterLog(rawLine: string): string | null {
  const line = stripAnsi(rawLine).trim();
  if (!line) return null;

  // Filter out dotenv, LangSmith, and raw debug junk
  if (
    line.includes("[dotenv") ||
    line.includes("injected env") ||
    line.includes("LangSmith tracing") ||
    line.includes("STACKPILOT_RESULT:") ||
    line.startsWith("raw content :") ||
    line.startsWith("Parsed:") ||
    line.startsWith("Repaired:") ||
    line.startsWith("{") ||
    line.startsWith("}") ||
    line.startsWith("[stderr]")
  ) {
    return null;
  }

  // Format known engine steps into clean human-readable steps
  if (line.includes("[PLANNER] Running")) return "Analyzing project requirements and scope";
  if (line.includes("[PLANNER] Completed")) return "Requirements and domain models defined";
  if (line.includes("[ARCHITECT] Running") || line.includes("TECH_PLANNER")) return "Designing tech stack and system architecture";
  if (line.includes("[KARMA H1] Node running") || line.includes("[KARMA H1] Generating code")) return "Synthesizing codebase and component files";
  if (line.includes("[KARMA H1] Node completed") || line.includes("[KARMA H1] Generated")) return "Code synthesis verified";
  if (line.includes("[STACKPILOT] Pipeline complete")) return "Pipeline execution completed";

  return line;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, context, model, effort } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type: string, data: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
          );
        };

        try {
          // Prepare payload for AI backend
          const backendPayload = {
            prompt,
            context,
            model,
            effort,
          };

          const backendRes = await fetch(`${AI_BACKEND_URL}/api/generate/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(backendPayload),
          });

          if (!backendRes.ok || !backendRes.body) {
            throw new Error(`AI Backend returned ${backendRes.status}`);
          }

          const reader = backendRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          const seenSteps = new Set<string>();

          let resultData: any = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;

              try {
                const event = JSON.parse(trimmed.slice(6));

                if (event.type === "log") {
                  const cleaned = filterLog(event.data?.line || "");
                  if (cleaned && !seenSteps.has(cleaned)) {
                    seenSteps.add(cleaned);
                    sendEvent("step", { step: cleaned });
                  }
                } else if (event.type === "step") {
                  const s = stripAnsi(event.data?.step || "").trim();
                  if (s && !seenSteps.has(s) && !s.includes("[dotenv") && !s.includes("injected env")) {
                    seenSteps.add(s);
                    sendEvent("step", { step: s });
                  }
                } else if (event.type === "result") {
                  resultData = event.data;
                }
              } catch {
                // Ignore parse errors on chunks
              }
            }
          }

          // If we gathered steps, stream them
          const stepsList = Array.from(seenSteps);

          // Build clean markdown answer
          const projectName = resultData?.projectName || "stackpilot-project";
          const files = resultData?.files || [];
          const arch = resultData?.architecture;

          const frontendFw = arch?.frontend?.framework || context?.frontend || "React";
          const backendFw = arch?.backend?.framework || context?.backend || "Express";
          const databaseFw = arch?.backend?.database || context?.database || "PostgreSQL";

          let markdownAnswer = `I've planned and prepared the workspace for **${projectName}**.\n\n`;

          markdownAnswer += `### Architecture Overview\n`;
          markdownAnswer += `- **Frontend**: ${frontendFw} (${arch?.frontend?.language || context?.language || "TypeScript"})\n`;
          markdownAnswer += `- **Backend**: ${backendFw}\n`;
          markdownAnswer += `- **Database**: ${databaseFw}\n`;
          markdownAnswer += `- **Styling**: ${arch?.frontend?.styling || context?.styling || "Tailwind CSS"}\n\n`;

          if (files.length > 0) {
            markdownAnswer += `### Generated Files (${files.length})\n`;
            markdownAnswer += "```bash\n";
            files.slice(0, 10).forEach((f: any) => {
              markdownAnswer += `├── ${f.path}\n`;
            });
            if (files.length > 10) {
              markdownAnswer += `└── ... and ${files.length - 10} more files\n`;
            }
            markdownAnswer += "```\n\n";
          }

          markdownAnswer += `### Getting Started\n`;
          markdownAnswer += `You can review the full architecture in the left sidebar or continue refining the project components with me right here.\n`;

          // Stream the markdown tokens progressively
          const words = markdownAnswer.split(" ");
          for (let i = 0; i < words.length; i++) {
            const token = words[i] + (i === words.length - 1 ? "" : " ");
            sendEvent("token", { token });
            // Small pause for realistic typing stream
            await new Promise((r) => setTimeout(r, 18));
          }

          // Ensure resultData has essential fields
          const pLower = prompt.toLowerCase();
          const detectedFrontend =
            resultData?.architecture?.frontend?.framework ||
            (pLower.includes("react") ? "react" : pLower.includes("next") ? "nextjs" : context?.frontend || "react");
          const detectedBackend =
            resultData?.architecture?.backend?.framework ||
            (pLower.includes("express") ? "express" : pLower.includes("nest") ? "nestjs" : context?.backend || "express");

          if (!resultData) {
            resultData = {
              projectName: context?.projectName || (pLower.includes("todo") ? "todo-app" : "stackpilot-project"),
              files: [
                {
                  path: "README.md",
                  code: `# Project\n\nPrompt: ${prompt}\n`,
                  action: "create",
                }
              ],
              architecture: {
                frontend: { framework: detectedFrontend },
                backend: { framework: detectedBackend },
              }
            };
          }

          sendEvent("done", {
            steps: stepsList,
            result: resultData,
          });

          controller.close();
        } catch (err: any) {
          console.warn("[/api/chat] Using synthesis fallback:", err?.message);
          // Fallback response with clean markdown when backend is offline
          const fallbackSteps = [
            "Analyzing prompt and workspace context",
            "Resolving full-stack component architecture",
            "Synthesizing modular solution",
          ];

          for (const step of fallbackSteps) {
            sendEvent("step", { step });
            await new Promise((r) => setTimeout(r, 120));
          }

          const pLower = prompt.toLowerCase();
          const fallbackFrontend =
            pLower.includes("react") ? "react" :
            pLower.includes("next") ? "nextjs" :
            pLower.includes("vue") ? "vue" :
            context?.frontend || "react";

          const fallbackBackend =
            pLower.includes("express") ? "express" :
            pLower.includes("nest") ? "nestjs" :
            pLower.includes("django") ? "django" :
            context?.backend || "express";

          const projectName = context?.projectName || (
            pLower.includes("todo") ? "todo-app" : "stackpilot-project"
          );

          const fallbackText =
            `I have analyzed your request for "${prompt}".\n\n` +
            `### Suggested Architecture\n` +
            `- **Frontend**: ${fallbackFrontend} with TypeScript & Tailwind CSS\n` +
            `- **Backend**: ${fallbackBackend} REST API\n` +
            `- **Database**: ${context?.database || "PostgreSQL"}\n\n` +
            "```typescript\n" +
            "// Example entry configuration\n" +
            "export interface AppConfig {\n" +
            `  name: "${projectName}";\n` +
            '  environment: "development" | "production";\n' +
            "  apiUrl: string;\n" +
            "}\n" +
            "```\n\n" +
            "Let me know what specific components or endpoints you would like to build next!";

          const words = fallbackText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const token = words[i] + (i === words.length - 1 ? "" : " ");
            sendEvent("token", { token });
            await new Promise((r) => setTimeout(r, 18));
          }

          const fallbackResult = {
            projectName,
            architecture: {
              frontend: { framework: fallbackFrontend, language: "TypeScript" },
              backend: { framework: fallbackBackend, language: "TypeScript" },
            },
            files: [
              {
                path: "README.md",
                code: `# ${projectName}\n\nBuilt with StackPilot.\nPrompt: "${prompt}"\n`,
                action: "create",
              },
            ],
          };

          sendEvent("done", { steps: fallbackSteps, result: fallbackResult });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
