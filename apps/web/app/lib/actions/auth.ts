"use server";

import { signIn, signOut } from "@/auth";

export type OAuthProvider = "google" | "github";

export async function signInWithProvider(provider: OAuthProvider, redirectTo: string = "/onboarding") {
  await signIn(provider, { redirectTo });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
