"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

interface CurrentUserResponse {
  currentUser: CurrentUser | null;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export function ManagerAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // 1. Skip auth check for the signin page
  const isSignInPage = pathname === "/manager/signin";
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(() => (isSignInPage ? true : null));

  useEffect(() => {
    if (isSignInPage) {
      return;
    }

    let isMounted = true;

    async function checkRole() {
      try {
        const response = await fetch(`${backendUrl}/api/users/currentuser`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to check auth state");
        }

        const data: CurrentUserResponse = await response.json();

        if (isMounted) {
          if (data.currentUser && data.currentUser.role === "manager") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            router.replace("/manager/signin");
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
          router.replace("/manager/signin");
        }
      }
    }

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [pathname, isSignInPage, router]);

  // While checking auth on protected routes, render a spinner/loading skeleton
  // (Prevents flashing unauthorized manager UI)
  if (!isSignInPage && isAuthorized === null) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  // If unauthorized and currently redirecting, don't render children
  if (!isSignInPage && !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}