"use client";

import Image from "next/image";
import signupPic from "@/public/auth/Signup.png";
import { usePageTransition, TransitionLink } from "@/components/Loadingscreen/PageTransitionContext";
import OAuthButtons from "@/components/auth/OAuthButtons";

export default function SignupPage() {
    const { transitionTo } = usePageTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // TODO: replace with real email/password signup (needs Credentials provider + database).
        transitionTo("/dashboard", "StackPilot");
    }

    return (
        <main className="grid min-h-screen w-full bg-white md:grid-cols-2">
            {/* Left: media panel */}
            <div className="hidden min-h-screen items-center justify-center border-r border-black/10 bg-black/[0.02] p-8 md:flex">
                <Image
                    src={signupPic}
                    alt="StackPilot Signup"
                    priority
                    className="max-h-[80vh] w-auto max-w-full object-contain"
                />
            </div>

            {/* Right: signup form */}
            <div className="flex flex-col justify-center gap-6 px-10 py-12 sm:px-16 lg:px-24">
                <div>
                    <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
                    <p className="mt-2 text-sm text-ink/50">
                        Start building with StackPilot in seconds.
                    </p>
                </div>

                <OAuthButtons />

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-black/10" />
                    <span className="text-xs text-ink/40">or sign up with email</span>
                    <div className="h-px flex-1 bg-black/10" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-ink placeholder-ink/40 outline-none transition focus:border-black/30"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-ink placeholder-ink/40 outline-none transition focus:border-black/30"
                    />
                    <button
                        type="submit"
                        className="mt-1 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-teal-300"
                    >
                        Sign up
                    </button>
                </form>

                <p className="text-center text-sm text-ink/50">
                    Already have an account?{" "}
                    <TransitionLink href="/auth/login" text="StackPilot" className="text-ink underline underline-offset-4">
                        Log in
                    </TransitionLink>
                </p>
            </div>
        </main>
    );
}