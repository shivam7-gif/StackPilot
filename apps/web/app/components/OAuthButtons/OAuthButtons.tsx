"use client";

import { useFormStatus } from "react-dom";
import { signInWithProvider, type OAuthProvider } from "@/lib/actions/auth";

const buttonClass =
    "flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-black/[0.03] disabled:cursor-progress disabled:opacity-60";

function ProviderButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className={buttonClass}>
            {icon}
            {pending ? "Redirecting…" : label}
        </button>
    );
}

export default function OAuthButtons() {
    const providers: { id: OAuthProvider; label: string; icon: React.ReactNode }[] = [
        { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
        { id: "github", label: "Continue with GitHub", icon: <GithubIcon /> },
    ];

    return (
        <div className="flex flex-col gap-3">
            {providers.map((p) => (
                <form key={p.id} action={signInWithProvider.bind(null, p.id)}>
                    <ProviderButton icon={p.icon} label={p.label} />
                </form>
            ))}
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.57.1.78-.25.78-.55v-2c-3.2.7-3.88-1.4-3.88-1.4-.52-1.32-1.28-1.67-1.28-1.67-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.53-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.8 1.19 1.82 1.19 3.08 0 4.43-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.15v3.19c0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
        </svg>
    );
}