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
  return `stackpilot-${projectId.replace(/[^a-zA-Z0-9_.-]/g, "-")}`;
}

function readHostPort5173(info: ContainerInspectInfo): string | null {
  const bindings = info.NetworkSettings.Ports?.[CONTAINER_PORT];

  return bindings?.[0]?.HostPort ?? null;
}

async function getExistingContainer(
  name: string
): Promise<ProjectContainer | null> {
  const container = docker.getContainer(name);

  try {
    const info = await container.inspect();

    if (!info.State.Running) {
      console.log(`Starting existing container ${name}`);
      await container.start();
    }

    const refreshed = await container.inspect();

    return {
      container,
      containerId: refreshed.Id,
      hostPort5173: readHostPort5173(refreshed),
    };
  } catch (err: unknown) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 404) {
      return null;
    }

    throw err;
  }
}

async function createContainer(
  projectId: string,
  hostProjectPath: string
): Promise<ProjectContainer> {
  const name = containerNameForProject(projectId);

  const container = await docker.createContainer({
    name,

    Image: SANDBOX_IMAGE,

    Tty: true,

    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,

    User: "sandbox",

    WorkingDir: "/home/sandbox/app",

    Cmd: ["sleep", "infinity"],

    Env: ["HOST=0.0.0.0"],

    ExposedPorts: {
      [CONTAINER_PORT]: {},
    },

    HostConfig: {
      Binds: [`${hostProjectPath}:/home/sandbox/app`],

      PortBindings: {
        [CONTAINER_PORT]: [
          {
            HostPort: "0",
          },
        ],
      },
      // Restrict sandbox resources to prevent DOS
      Memory: 512 * 1024 * 1024, // 512MB RAM limit
      NanoCPUs: 1 * 10e8, // 1 CPU core limit
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

async function getOrCreateContainer(
  projectId: string,
  hostProjectPath: string
): Promise<ProjectContainer> {
  const name = containerNameForProject(projectId);

  const existing = await getExistingContainer(name);

  if (existing) {
    return existing;
  }

  return createContainer(projectId, hostProjectPath);
}

export async function ensureProjectContainer(
  projectId: string
): Promise<ProjectContainer> {
  console.log("Ensuring sandbox container for project", projectId);

  const hostProjectPath = await resolveProjectHostPath(projectId);

  return getOrCreateContainer(projectId, hostProjectPath);
}

/** @deprecated */
export const handleContainerCreate = ensureProjectContainer;
