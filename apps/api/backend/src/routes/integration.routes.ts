import express from "express";
import { credentialService } from "../services/credentialService.js";

const router = express.Router();

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:3000";
const getBackendCallbackUrl = () =>
  process.env.OPENROUTER_CALLBACK_URL ||
  "http://localhost:5000/api/integrations/openrouter/callback";

/**
 * GET /api/integrations/openrouter/auth-url
 * Generates PKCE code_verifier, code_challenge, and state, then returns the official OpenRouter OAuth URL.
 */
router.get("/openrouter/auth-url", (req, res) => {
  const userId = (req.query.userId as string) || "default-user";
  const { state, codeChallenge } = credentialService.createOAuthState(userId);

  const callbackUrl = getBackendCallbackUrl();
  const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
    callbackUrl
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

  res.json({
    authUrl,
    state,
  });
});

/**
 * GET /api/integrations/openrouter/callback
 * Validates OAuth state and exchanges PKCE code for OpenRouter API key.
 * Stores the key server-side in encrypted form.
 * Never passes the API key in the URL or to browser JavaScript.
 */
router.get("/openrouter/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const frontendUrl = getFrontendUrl();

  if (error || error_description) {
    const errorMsg = String(error_description || error || "Authorization cancelled");
    return res.redirect(`${frontendUrl}/setup/ai?error=${encodeURIComponent(errorMsg)}`);
  }

  if (!code || !state) {
    return res.redirect(`${frontendUrl}/setup/ai?error=missing_code_or_state`);
  }

  const pending = credentialService.consumeOAuthState(String(state));
  if (!pending) {
    return res.redirect(
      `${frontendUrl}/setup/ai?error=${encodeURIComponent(
        "Invalid or expired authorization session. Please try again."
      )}`
    );
  }

  try {
    const exchangeBody: any = {
      code: String(code),
      code_verifier: pending.codeVerifier,
      code_challenge_method: "S256",
    };

    const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exchangeBody),
    });

    const data = (await response.json()) as { key?: string; error?: any };

    if (!response.ok || !data.key) {
      const err =
        data.error?.message ||
        (typeof data.error === "string" ? data.error : "Failed to exchange OpenRouter code");
      return res.redirect(`${frontendUrl}/setup/ai?error=${encodeURIComponent(String(err))}`);
    }

    // Encrypt and persist the key associated with the user
    await credentialService.saveUserOpenRouterKey(pending.userId, data.key);

    // Redirect to frontend setup with success status - NO KEY IN URL!
    return res.redirect(`${frontendUrl}/setup/ai?status=connected`);
  } catch (err: any) {
    console.error("[OpenRouter Callback] Exchange failed:", err);
    return res.redirect(
      `${frontendUrl}/setup/ai?error=${encodeURIComponent(err?.message || "Exchange failed")}`
    );
  }
});

/**
 * GET /api/integrations/openrouter/status
 * Returns connection status and masked key without revealing secret.
 */
router.get("/openrouter/status", async (req, res) => {
  const userId = (req.query.userId as string) || "default-user";
  const status = await credentialService.getUserStatus(userId);
  res.json(status);
});

/**
 * POST /api/integrations/openrouter/key
 * Accepts manual BYOK key, validates against OpenRouter API, and saves encrypted.
 */
router.post("/openrouter/key", async (req, res) => {
  const { key, userId = "default-user" } = req.body;
  const trimmed = (key || "").trim();

  if (!trimmed || !trimmed.startsWith("sk-or-")) {
    return res.status(400).json({ error: "Invalid OpenRouter API Key format (expected sk-or-...)" });
  }

  try {
    // Validate with OpenRouter
    const verifyRes = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        Authorization: `Bearer ${trimmed}`,
      },
    });

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      return res.status(401).json({
        error: errData.error?.message || "OpenRouter rejected the provided API key.",
      });
    }

    const keyMasked = await credentialService.saveUserOpenRouterKey(userId, trimmed);
    res.json({ success: true, keyMasked });
  } catch (err: any) {
    console.error("[OpenRouter Key Save] Validation failed:", err);
    res.status(500).json({ error: err.message || "Failed to verify key with OpenRouter" });
  }
});

/**
 * POST /api/integrations/openrouter/disconnect
 * Deletes the encrypted key.
 */
router.post("/openrouter/disconnect", async (req, res) => {
  const { userId = "default-user" } = req.body;
  const removed = await credentialService.removeUserOpenRouterKey(userId);
  res.json({ success: removed });
});

/**
 * GET /api/integrations/openrouter/models
 * Fetches available models from OpenRouter using user's key if available, or free catalog.
 */
router.get("/openrouter/models", async (req, res) => {
  const userId = (req.query.userId as string) || "default-user";
  const userKey = await credentialService.getUserOpenRouterKey(userId);

  try {
    const headers: Record<string, string> = {};
    if (userKey) {
      headers["Authorization"] = `Bearer ${userKey}`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/models", { headers });
    if (!response.ok) {
      throw new Error(`OpenRouter returned status ${response.status}`);
    }

    const data = await response.json();
    const formatted = (data.data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      context_length: m.context_length,
      pricing: m.pricing,
      is_free: m.pricing?.prompt === "0" && m.pricing?.completion === "0",
    }));

    res.json({ models: formatted });
  } catch (err: any) {
    console.warn("[OpenRouter Models] Falling back to default list:", err.message);
    res.json({
      models: [
        { id: "openrouter/free", name: "Auto (Free Router)", context_length: 128000, is_free: true },
        { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", context_length: 200000, is_free: false },
        { id: "openai/gpt-4o", name: "GPT-4o", context_length: 128000, is_free: false },
        { id: "deepseek/deepseek-r1", name: "DeepSeek R1", context_length: 64000, is_free: false },
      ],
    });
  }
});

export default router;
