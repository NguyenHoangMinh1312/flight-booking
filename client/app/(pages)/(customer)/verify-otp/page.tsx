"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/app/utils/api-client";
import { toast } from "sonner";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // 1-minute countdown timer for the resend button
  useEffect(() => {
    if (cooldown <= 0)
      return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting || !email)
      return;

    const formData = new FormData(e.currentTarget);
    const otp = (formData.get("otp") as string)?.trim();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/api/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      toast.success("Account verified successfully!");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || cooldown > 0 || !email) return;

    setIsResending(true);

    try {
      await apiFetch("/api/users/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      toast.success("A new OTP has been sent to your email");
      setCooldown(60); // Reset cooldown to 1 minute
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Missing Email</h1>
        <p className="mb-6 text-sm text-slate-600">
          No email address found to verify. Please complete the registration form first.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700"
        >
          Go to Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mb-6 text-sm text-slate-600">
        We sent a 6-digit confirmation code to{" "}
        <span className="font-semibold text-slate-800">{email}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="mb-2 block text-sm font-medium text-slate-700">
            Verification code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-center text-2xl font-semibold tracking-[0.3em] text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Confirm & Sign in"}
        </button>

        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-slate-500">Didn&apos;t receive code?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || isResending}
            className="font-medium text-sky-600 transition hover:text-sky-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">
        Wrong email address?{" "}
        <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700">
          Back to Sign up
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}