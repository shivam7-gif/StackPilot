import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_DIR = path.join(__dirname, "../../data");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials.json");

// Derive a 32-byte key from encryption secret
const SECRET_SEED =
  process.env.OPENROUTER_ENCRYPTION_SECRET ||
  process.env.AUTH_SECRET ||
  "stackpilot-production-secret-encryption-seed-2026";
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_SEED, "stackpilot-auth-salt", 32);

interface StoredCredential {
  userId: string;
  iv: string; // base64
  authTag: string; // base64
  encryptedData: string; // base64
  keyMasked: string;
  connectedAt: string;
  provider: "openrouter";
}

interface OAuthPendingState {
  userId: string;
  codeVerifier: string;
  createdAt: number;
}

// In-memory single-use pending states map: state -> OAuthPendingState (expires after 10 mins)
const pendingStates = new Map<string, OAuthPendingState>();

function encrypt(text: string): { iv: string; authTag: string; encryptedData: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return {
    iv: iv.toString("base64"),
    authTag,
    encryptedData: encrypted,
  };
}

function decrypt(encryptedData: string, ivBase64: string, authTagBase64: string): string {
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  const prefix = key.slice(0, 8);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

async function ensureStoreExists(): Promise<void> {
  try {
    await fs.mkdir(CREDENTIALS_DIR, { recursive: true });
    await fs.access(CREDENTIALS_FILE);
  } catch {
    await fs.writeFile(CREDENTIALS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

async function readCredentials(): Promise<StoredCredential[]> {
  await ensureStoreExists();
  try {
    const raw = await fs.readFile(CREDENTIALS_FILE, "utf8");
    return JSON.parse(raw || "[]") as StoredCredential[];
  } catch {
    return [];
  }
}

async function writeCredentials(list: StoredCredential[]): Promise<void> {
  await ensureStoreExists();
  const tmp = `${CREDENTIALS_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await fs.rename(tmp, CREDENTIALS_FILE);
}

export const credentialService = {
  // Store pending PKCE state for authorization code exchange
  createOAuthState(userId: string): { state: string; codeVerifier: string; codeChallenge: string } {
    const state = crypto.randomBytes(24).toString("hex");
    // Generate code_verifier (43-128 unreserved chars)
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    // S256 code_challenge
    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    // Clean up stale states (> 10 mins)
    const now = Date.now();
    for (const [s, data] of pendingStates.entries()) {
      if (now - data.createdAt > 600_000) {
        pendingStates.delete(s);
      }
    }

    pendingStates.set(state, {
      userId,
      codeVerifier,
      createdAt: now,
    });

    return { state, codeVerifier, codeChallenge };
  },

  // Consume and validate state
  consumeOAuthState(state: string): OAuthPendingState | null {
    const found = pendingStates.get(state);
    if (!found) return null;
    pendingStates.delete(state);
    // Expire after 10 minutes
    if (Date.now() - found.createdAt > 600_000) {
      return null;
    }
    return found;
  },

  // Save encrypted API key
  async saveUserOpenRouterKey(userId: string, plainKey: string): Promise<string> {
    const trimmed = plainKey.trim();
    const { iv, authTag, encryptedData } = encrypt(trimmed);
    const keyMasked = maskKey(trimmed);

    const list = await readCredentials();
    const idx = list.findIndex((c) => c.userId === userId && c.provider === "openrouter");

    const record: StoredCredential = {
      userId,
      provider: "openrouter",
      iv,
      authTag,
      encryptedData,
      keyMasked,
      connectedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }

    await writeCredentials(list);
    return keyMasked;
  },

  // Retrieve decrypted key (strictly server-side, for calling OpenRouter API)
  async getUserOpenRouterKey(userId: string): Promise<string | null> {
    const list = await readCredentials();
    const cred = list.find((c) => c.userId === userId && c.provider === "openrouter");
    if (!cred) return null;

    try {
      return decrypt(cred.encryptedData, cred.iv, cred.authTag);
    } catch (err) {
      console.error("[credentialService] Decryption error:", err);
      return null;
    }
  },

  // Get masked status without exposing key
  async getUserStatus(userId: string): Promise<{ connected: boolean; keyMasked?: string; connectedAt?: string }> {
    const list = await readCredentials();
    const cred = list.find((c) => c.userId === userId && c.provider === "openrouter");
    if (!cred) return { connected: false };
    return {
      connected: true,
      keyMasked: cred.keyMasked,
      connectedAt: cred.connectedAt,
    };
  },

  // Disconnect OpenRouter key
  async removeUserOpenRouterKey(userId: string): Promise<boolean> {
    const list = await readCredentials();
    const initialLen = list.length;
    const filtered = list.filter((c) => !(c.userId === userId && c.provider === "openrouter"));
    if (filtered.length !== initialLen) {
      await writeCredentials(filtered);
      return true;
    }
    return false;
  },
};
