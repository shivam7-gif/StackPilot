"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link, { LinkProps } from "next/link";
import LoadingScreen from "./Loading";
import AuthToDashboardLoader from "@/components/LoadingBar/AuthToDashboardLoader";

export type TransitionOptions =
  | string
  | {
      text?: string;
      variant?: "default" | "authToDashboard";
      duration?: number;
    };

interface PageTransitionContextType {
  /** Trigger smooth transition to a target URL with optional loading label or options */
  transitionTo: (url: string, options?: TransitionOptions) => void;
  /** Whether the transition is currently active */
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(
  null
);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within a PageTransitionProvider"
    );
  }
  return context;
}

/** Check if a route is a project/editor route */
export function isProjectRoute(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/project") || path.startsWith("/editor");
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState("StackPilot");
  const [transitionDuration, setTransitionDuration] = useState(1600);
  const [transitionVariant, setTransitionVariant] = useState<
    "default" | "authToDashboard"
  >("default");
  const targetUrlRef = useRef<string | null>(null);

  const transitionTo = useCallback(
    (url: string, options?: TransitionOptions) => {
      // Rule: Do NOT show loading animation when navigating to or inside projects
      if (isProjectRoute(url) || isProjectRoute(pathname)) {
        router.push(url);
        return;
      }

      // If already on the same page, do nothing
      if (pathname === url) return;

      // Extract options
      const text =
        typeof options === "string" ? options : options?.text || "StackPilot";
      const customDuration =
        typeof options === "object" ? options?.duration : undefined;

      // Detect if this is an auth to dashboard routing transition
      const isAuthRoute = pathname?.startsWith("/auth");
      const isDashboardTarget = url === "/dashboard" || url.startsWith("/dashboard");
      const requestedVariant =
        typeof options === "object" ? options?.variant : undefined;

      const variant: "default" | "authToDashboard" =
        requestedVariant ||
        (isAuthRoute && isDashboardTarget) ||
        isDashboardTarget
          ? "authToDashboard"
          : "default";

      // Start prefetching the target route immediately for zero-lag mounting
      router.prefetch(url);
      targetUrlRef.current = url;
      setTransitionText(text);
      setTransitionVariant(variant);
      setTransitionDuration(customDuration || (variant === "authToDashboard" ? 1800 : 1400));
      setIsTransitioning(true);
    },
    [pathname, router]
  );

  const handleExitStart = useCallback(() => {
    if (targetUrlRef.current) {
      router.push(targetUrlRef.current);
    }
  }, [router]);

  const handleComplete = useCallback(() => {
    setIsTransitioning(false);
    targetUrlRef.current = null;
  }, []);

  // Safety: If pathname changes to a project route or reaches target, finish transition
  useEffect(() => {
    if (isProjectRoute(pathname)) {
      setIsTransitioning(false);
      targetUrlRef.current = null;
    } else if (targetUrlRef.current && pathname === targetUrlRef.current) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        targetUrlRef.current = null;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ transitionTo, isTransitioning }}>
      {isTransitioning &&
        (transitionVariant === "authToDashboard" ? (
          <AuthToDashboardLoader
            text={transitionText}
            duration={transitionDuration}
            onExitStart={handleExitStart}
            onComplete={handleComplete}
          />
        ) : (
          <LoadingScreen
            text={transitionText}
            duration={transitionDuration}
            onExitStart={handleExitStart}
            onComplete={handleComplete}
          />
        ))}
      {children}
    </PageTransitionContext.Provider>
  );
}

/**
 * Drop-in Link replacement that plays the smooth loading transition
 * on marketing/auth/dashboard pages, but routes immediately for project routes.
 */
interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  text?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({
  href,
  children,
  className,
  text = "StackPilot",
  onClick,
  ...props
}: TransitionLinkProps) {
  const { transitionTo } = usePageTransition();
  const urlString = typeof href === "string" ? href : href.pathname || "";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented && urlString) {
      e.preventDefault();
      transitionTo(urlString, text);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
