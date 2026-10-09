"use client";

import { apiFetch } from "@/app/utils/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
  email: z
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
});

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting)
      return

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget)

    const result = signUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    })

    if (!result.success) {
      const err = result.error.issues[0]?.message;

      toast.error(err || "Please check your input");
      return;
    }

    try {
      await apiFetch(
        "/api/users/signup",
        {
          method: "POST",
          body: JSON.stringify({
            email: result.data.email,
            password: result.data.password,
            role: "customer"
          })
        }
      )
      router.push(`/verify-otp/?email=${encodeURIComponent(result.data.email)}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create your account")
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Create an account</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </div>
    </main>
  );
}