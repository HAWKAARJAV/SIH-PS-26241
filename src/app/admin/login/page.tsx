import { signIn } from "@/lib/auth";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  }
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="font-display text-4xl">Staff sign in</h1>
      <p className="mt-2 text-sm">Demo mode only. Password nourish-demo-admin.</p>
      <form action={login} className="mt-4 space-y-3">
        <label className="block">Email<input name="email" type="email" required className="mt-1 min-h-12 w-full rounded-xl border px-3" defaultValue="admin@nourish.local" /></label>
        <label className="block">Password<input name="password" type="password" required className="mt-1 min-h-12 w-full rounded-xl border px-3" /></label>
        <button className="min-h-12 rounded-full bg-primary px-5 text-white" type="submit">Sign in</button>
      </form>
      <p className="mt-6 text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
    </main>
  );
}
