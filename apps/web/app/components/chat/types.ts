export type StageStatus = "queued" | "running" | "completed" | "failed";

export interface ActivityStep {
  id: string;
  label: string;
  status: StageStatus;
  timestamp?: string;
  details?: string[];
}

export interface ProjectFileChange {
  path: string;
  code?: string;
  action?: "create" | "modify" | "delete";
  size?: number;
  language?: string;
}

export interface ProjectArchitecture {
  frontend?: {
    framework?: string;
    language?: string;
    styling?: string;
  };
  backend?: {
    framework?: string;
    language?: string;
    database?: string;
  };
}

export interface EngineeringResult {
  projectName?: string;
  projectId?: string;
  architecture?: ProjectArchitecture;
  files?: ProjectFileChange[];
  commands?: string[];
  summary?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  activitySteps?: ActivityStep[];
  engineeringResult?: EngineeringResult;
  model?: string;
  status?: "queued" | "running" | "completed" | "failed" | "cancelled";
  createdAt: string;
  error?: boolean;
}
