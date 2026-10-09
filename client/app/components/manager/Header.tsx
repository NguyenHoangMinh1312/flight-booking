"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { FaChevronDown } from "react-icons/fa";

type CurrentUser = { email: string };
type CurrentUserResponse = { currentUser: CurrentUser | null };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export default function Header() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {

    fetch(`${backendUrl}/api/users/currentuser`, { credentials: "include" })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Unable to load the current user");
        return response.json() as Promise<CurrentUserResponse>;
      })
      .then(({ currentUser: user }) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoading(false));
  }, [pathname]);

  const signOut = async () => {
    await fetch(`${backendUrl}/api/users/signout`, {
      method: "POST",
      credentials: "include",
    });
    setCurrentUser(null);
    router.push("/manager/signin")
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-sky-600">FlightBooking Management</Link>
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
                    href="/manager/create-flight"
                    className="block px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-sky-600"
                  >
                    Create a flight
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
            <Link href="/manager/signin" className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700">Sign in</Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}