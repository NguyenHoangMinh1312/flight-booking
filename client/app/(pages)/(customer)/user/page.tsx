"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaEnvelope,
  FaExclamationCircle,
  FaIdBadge,
  FaUserCircle,
  FaUserShield,
} from "react-icons/fa";
import { CurrentUser } from "@/app/types/current-user";
import { apiFetch } from "@/app/utils/api-client";

type CurrentUserResponse = {
  currentUser: CurrentUser | null;
};

export default function UserPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch<CurrentUserResponse>(
          "/api/users/currentuser",
          { credentials: "include" }
        );
        setCurrentUser(data.currentUser);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user information"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your Information
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            View your account details and role.
          </p>
        </div>

        {isLoading && (
          <div
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            aria-label="Loading user information"
          />
        )}

        {!isLoading && error && (
          <div
            className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"
            role="alert"
          >
            <FaExclamationCircle className="mt-0.5 shrink-0 text-xl text-red-500" />
            <div className="flex-1">
              <h2 className="font-semibold text-red-900">
                Unable to load user information
              </h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !currentUser && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FaUserCircle className="text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Not signed in</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Please sign in to view your account information.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-sky-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !error && currentUser && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <FaUserCircle className="text-2xl" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Account Profile
                </h2>
                <p className="text-xs text-slate-500">
                  Personal credentials associated with your session
                </p>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 px-6">
              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                  <FaIdBadge className="text-slate-400" />
                  User ID
                </dt>
                <dd className="font-mono text-sm font-medium text-slate-900">
                  {currentUser.id}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                  <FaEnvelope className="text-slate-400" />
                  Email
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  {currentUser.email}
                </dd>
              </div>

              <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <dt className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                  <FaUserShield className="text-slate-400" />
                  Role
                </dt>
                <dd>
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold capitalize text-sky-700 ring-1 ring-sky-600/20 ring-inset">
                    {currentUser.role}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
