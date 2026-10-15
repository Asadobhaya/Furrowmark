export const dynamic = "force-dynamic";

import Link from "next/link";
import { registerAction } from "../actions";

export const metadata = {
  title: "Create Account | Furrowmark",
  description:
    "Register for a Furrowmark customer account to order genuine agrochemicals, certified seeds, and fertilizers.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold mx-auto text-lg">
            FM
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-gray-500">
            Join Furrowmark to order verified agricultural formulations with FEFO dispatch.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        <form action={registerAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="farmer@example.com"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              Password (12+ characters) *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              minLength={12}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition shadow-xs text-xs sm:text-sm"
          >
            Create Customer Account
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-600 space-y-2">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-800 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
          <p>
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              ← Back to Homepage
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
