"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  LogOut,
} from "lucide-react";
import robotPic from "@/public/auth/Transhumans - Roboto.png";

function SetupAiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const userId = session?.user?.id || (session?.user?.email ? encodeURIComponent(session.user.email) : "default-user");

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connected, setConnected] = useState(false);
  const [keyMasked, setKeyMasked] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [startingOAuth, setStartingOAuth] = useState(false);

  // Fetch current OpenRouter connection status from backend
  const checkStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(`http://localhost:5000/api/integrations/openrouter/status?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConnected(Boolean(data.connected));
        setKeyMasked(data.keyMasked || null);
      }
    } catch {
      // Backend offline or unreachable
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Check query params returned from OAuth callback
    const statusParam = searchParams.get("status");
    const errorParam = searchParams.get("error");

    if (statusParam === "connected") {
      setSuccessMsg("OpenRouter account connected successfully!");
      setConnected(true);
      checkStatus();
    }
    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
    }
  }, [searchParams, userId]);

  // Launch official PKCE OAuth flow
  const handleConnectOAuth = async () => {
    try {
      setStartingOAuth(true);
      setErrorMsg(null);
      const res = await fetch(`http://localhost:5000/api/integrations/openrouter/auth-url?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to initialize OpenRouter OAuth");
      const { authUrl } = await res.json();
      window.location.href = authUrl;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start OpenRouter connection");
      setStartingOAuth(false);
    }
  };

  // Submit manual API Key (encrypted server-side)
  const handleSaveManualKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualKey.trim();
    if (!trimmed) return;

    try {
      setSavingKey(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("http://localhost:5000/api/integrations/openrouter/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed, userId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify key with OpenRouter");
      }

      setConnected(true);
      setKeyMasked(data.keyMasked);
      setManualKey("");
      setShowManualInput(false);
      setSuccessMsg("API key verified and securely stored!");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not save OpenRouter key");
    } finally {
      setSavingKey(false);
    }
  };

  // Disconnect OpenRouter key
  const handleDisconnect = async () => {
    try {
      await fetch("http://localhost:5000/api/integrations/openrouter/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setConnected(false);
      setKeyMasked(null);
      setSuccessMsg("OpenRouter key removed.");
    } catch {}
  };

  return (
    <main className="grid min-h-screen w-full bg-white md:grid-cols-2 font-sans antialiased">
      {/* Left Media Panel */}
      <div className="hidden min-h-screen items-center justify-center border-r border-neutral-200/90 bg-neutral-50/50 p-8 md:flex">
        <Image
          src={robotPic}
          alt="StackPilot AI Architecture"
          priority
          className="max-h-[75vh] w-auto max-w-full object-contain"
        />
      </div>

      {/* Right Configuration Panel */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24 max-w-xl mx-auto w-full">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            Step 1 of 2
          </span>
          <span className="text-xs text-neutral-400 font-mono">AI Provider Configuration</span>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
          Connect your AI engine
        </h1>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Use your own OpenRouter account to power StackPilot&apos;s coding agents with the models available to you.
        </p>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Connection Notice</p>
              <p className="text-red-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Active Connection State */}
        {connected ? (
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-950">
                  OpenRouter Connected
                </span>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-[11px] font-medium text-neutral-500 hover:text-red-600 transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            <div className="font-mono text-xs text-neutral-700 bg-white px-3 py-2 rounded-lg border border-neutral-200 flex items-center justify-between">
              <span>{keyMasked || "sk-or-v1-••••••••"}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Your API key is encrypted server-side with AES-256-GCM and never exposed to the client browser.
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Continue to Project Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Unconnected State: OAuth & BYOK */
          <div className="space-y-4 mb-6">
            {/* Primary Action: 1-Click Connect OpenRouter */}
            <button
              type="button"
              disabled={startingOAuth || loadingStatus}
              onClick={handleConnectOAuth}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-neutral-900 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {startingOAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with OpenRouter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Connect with OpenRouter (OAuth PKCE)</span>
                </>
              )}
            </button>

            {/* BYOK Explanation Card */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 text-xs text-neutral-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <Key className="w-3.5 h-3.5 text-orange-600" />
                <span>Bring Your Own Key (BYOK)</span>
              </div>
              <p className="text-[12px] leading-relaxed text-neutral-500">
                StackPilot never marks up inference rates. Model usage is billed directly to your OpenRouter account at cost. Free-tier models remain completely free.
              </p>
            </div>

            {/* Toggle Manual API Key Input */}
            <div>
              {!showManualInput ? (
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
                >
                  Or enter an OpenRouter API key manually →
                </button>
              ) : (
                <form onSubmit={handleSaveManualKey} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full px-3 py-2 rounded-lg text-xs font-mono border border-neutral-300 focus:border-orange-500 outline-none text-neutral-900"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManualInput(false)}
                      className="py-2 px-3 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingKey || !manualKey.trim()}
                      className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold disabled:opacity-40"
                    >
                      {savingKey ? "Verifying key..." : "Save & Encrypt Key"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions: Skip for now */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 text-xs">
          <Link
            href="/dashboard"
            className="text-neutral-500 hover:text-neutral-900 underline underline-offset-4 transition"
          >
            Skip for now →
          </Link>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition"
          >
            <span>Get an OpenRouter Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </main>
  );
}

export default function SetupAiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-400 font-mono text-xs">
          Loading AI setup...
        </div>
      }
    >
      <SetupAiContent />
    </Suspense>
  );
}
