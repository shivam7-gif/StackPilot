import Link from "next/link";

export default function SignupPage() {
    return (
        <main className="grid min-h-screen w-full bg-white md:grid-cols-2">
            {/* Left: blank media panel */}
            <div className="hidden min-h-screen items-center justify-center border-r border-black/10 bg-black/[0.02] md:flex">
                <span className="text-sm text-black/40">Image / video goes here</span>
            </div>

            {/* Right: signup form */}
            <div className="flex flex-col justify-center gap-6 px-10 py-12 sm:px-16 lg:px-24">
                <div>
                    <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
                    <p className="mt-2 text-sm text-ink/50">
                        Start building with StackPilot in seconds.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button className="flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-black/[0.03]">
                        <GoogleIcon />
                        Continue with Google
                    </button>
                    <button className="flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-black/[0.03]">
                        <GithubIcon />
                        Continue with GitHub
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-black/10" />
                    <span className="text-xs text-ink/40">or sign up with email</span>
                    <div className="h-px flex-1 bg-black/10" />
                </div>

                <form className="flex flex-col gap-4">
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
                        className="mt-1 w-full rounded-full bg-teal-400 px-5 py-3 text-sm font-medium text-ink transition hover:bg-teal-300"
                    >
                        Sign up
                    </button>
                </form>

                <p className="text-center text-sm text-ink/50">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-ink underline underline-offset-4">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
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