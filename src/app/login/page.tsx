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
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      <form action={loginAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <label className="block">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </label>
        <label className="block">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
        >
          Sign in
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/register" className="text-green-700 hover:underline">
          Create an account
        </Link>
        <Link href="/staff/login" className="text-gray-600 hover:text-green-800 hover:underline">
          Staff / Owner Portal
        </Link>
      </div>
    </main>
  );
}
