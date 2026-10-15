export const dynamic = "force-dynamic";

import Link from "next/link";
import { loginAction } from "../actions";

export const metadata = {
  title: "Sign in | Furrowmark",
  description:
    "Sign in to your Furrowmark customer account to manage agricultural orders and track consignments.",
};

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  return (
    <main className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold mx-auto text-lg">
            FM
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sign in to Furrowmark
          </h1>
          <p className="text-xs text-gray-500">
            Access your agricultural orders, invoices, and dispatch tracking.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Registered Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="e.g. farmer@example.com or owner@furrowmark.pk"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-xs font-bold text-gray-700">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold py-3 px-4 rounded-xl transition shadow-xs text-xs sm:text-sm"
          >
            Sign in
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-xs text-center text-gray-600">
          <div className="flex items-center justify-between">
            <Link href="/register" className="text-emerald-800 font-semibold hover:underline">
              Create customer account
            </Link>
            <Link href="/staff/login" className="text-gray-500 hover:text-emerald-800 hover:underline">
              Staff / Owner Desk
            </Link>
          </div>
          <div className="pt-2">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
