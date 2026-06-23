import Docker from "dockerode";
import type { ContainerInspectInfo } from "dockerode";
import { resolveProjectHostPath } from "./resolveProjectHostPath.js";

const docker = new Docker();
const SANDBOX_IMAGE = "sandbox";
const CONTAINER_PORT = "5173/tcp";

export interface ProjectContainer {
  container: Docker.Container;
  containerId: string;
  hostPort5173: string | null;
}

function containerNameForProject(projectId: string): string {
  const safeId = projectId.replace(/[^a-zA-Z0-9_.-]/g, "-");
  return `stackpilot-${safeId}`;
}

function readHostPort5173(info: ContainerInspectInfo): string | null {
  const bindings = info.NetworkSettings.Ports?.[CONTAINER_PORT];
  return bindings?.[0]?.HostPort ?? null;
}

async function getOrCreateContainer(
  projectId: string,
  hostProjectPath: string,
): Promise<ProjectContainer> {
  const name = containerNameForProject(projectId);
  const existing = docker.getContainer(name);

  try {
    const info = await existing.inspect();
    if (!info.State.Running) {
      await existing.start();
    }
    const refreshed = await existing.inspect();
    return {
      container: existing,
      containerId: refreshed.Id,
      hostPort5173: readHostPort5173(refreshed),
    };
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode !== 404) {
      throw err;
    }
  }

  const container = await docker.createContainer({
    name,
    Image: SANDBOX_IMAGE,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    User: "sandbox",
    WorkingDir: "/home/sandbox/app",
    Cmd: ["sleep", "infinity"],
    ExposedPorts: {
      [CONTAINER_PORT]: {},
    },
    Env: ["HOST=0.0.0.0"],
    HostConfig: {
      Binds: [`${hostProjectPath}:/home/sandbox/app`],
      PortBindings: {
        [CONTAINER_PORT]: [{ HostPort: "0" }],
      },
    },
    Labels: {
      "stackpilot.projectId": projectId,
    },
  });

  console.log(`Container created for ${projectId}: ${container.id}`);
  await container.start();
  console.log(`Container started for ${projectId}`);

  const info = await container.inspect();
  return {
    container,
    containerId: info.Id,
    hostPort5173: readHostPort5173(info),
  };
}

export async function ensureProjectContainer(
  projectId: string,
): Promise<ProjectContainer> {
  console.log("Ensuring sandbox container for project", projectId);
  const hostProjectPath = await resolveProjectHostPath(projectId);
  return getOrCreateContainer(projectId, hostProjectPath);
}

/** @deprecated Use ensureProjectContainer */
export const handleContainerCreate = ensureProjectContainer;
