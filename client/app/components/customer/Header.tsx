"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { CurrentUser } from "@/app/types/current-user";
import { apiFetch } from "@/app/utils/api-client";
import { toast } from "sonner";

export type CurrentUserResponse = { currentUser: CurrentUser | null };

export default function Header() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await apiFetch<CurrentUserResponse>(
          "/api/users/currentuser",
          { credentials: "include" }
        )
        setCurrentUser(data.currentUser)
      } catch {
        setCurrentUser(null)
        toast.error("Failed to get your credentials")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [pathname]);

  const signOut = async () => {
    try {
      await apiFetch(
        '/api/users/signout',
        {
          credentials: "include",
          method: "POST"
        }
      )
      setCurrentUser(null)
      router.push("/")
    } catch {
      toast.error("Failed to sign out")
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-sky-600">FlightBooking</Link>
        <div className="flex items-center gap-4">
          {!isLoading && currentUser ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600 focus:outline-none"
              >
                <span>{currentUser.email}</span>
                <FaChevronDown className="text-xs text-slate-400 transition-transform duration-200 group-hover:rotate-180 group-hover:text-sky-600" />
              </button>
              <div className="absolute right-0 top-full hidden w-48 pt-1 group-hover:block group-focus-within:block z-50">
                <div className="rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600"
                  >
                    Your Orders
                  </Link>
                  <Link
                    href="/user"
                    className="block px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600"
                  >
                    Your Information
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : !isLoading ? (
            <>
              <Link href="/signin" className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Sign in</Link>
              <Link href="/signup" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700">Sign up</Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}