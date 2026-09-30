"use server";

import { signIn, signOut } from "@/auth";

export type OAuthProvider = "google" | "github";

export async function signInWithProvider(provider: OAuthProvider) {
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
