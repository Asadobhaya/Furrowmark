export const dynamic = "force-dynamic";

import Link from "next/link";
import { registerAction } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      <form action={registerAction} className="space-y-4">
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
          Password (12+ characters)
          <input
            type="password"
            name="password"
            required
            minLength={12}
            autoComplete="new-password"
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
        >
          Create account
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/login" className="text-green-700 hover:underline">
          Already registered? Sign in
        </Link>
      </p>
    </main>
  );
}
