export const dynamic = "force-dynamic";

import Link from "next/link";
import { staffLoginAction } from "../../actions";

export const metadata = {
  title: "Staff & Owner Portal | Furrowmark",
  description:
    "Internal depot order management, consignment dispatch, and FEFO inventory administration.",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function StaffLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold mx-auto text-lg">
            OD
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Depot Staff & Owner Portal
          </h1>
          <p className="text-xs text-gray-500">
            Multan Depot order fulfillment, payment verification, and batch dispatch desk.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        <form action={staffLoginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
              Staff / Owner Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              defaultValue="owner@furrowmark.pk"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1">
              Access Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter authorization password"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition shadow-xs text-xs sm:text-sm"
          >
            Authenticate to Staff Desk
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-500">
          <Link href="/login" className="text-emerald-800 hover:underline">
            ← Switch to Customer Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
