import { LoginForm } from "@/components/marketing/login-form";
import { Crown } from "lucide-react";

function EnvBanner({
  oauthError,
  reason
}: {
  oauthError: boolean;
  reason?: string | string[];
}) {
  if (oauthError) {
    return (
      <p className="mb-6 rounded-2xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-center text-sm text-red-100">
        Sign-in was cancelled or denied. Try again — or verify Google OAuth redirects in Supabase.
      </p>
    );
  }
  if (reason === "env") {
    return (
      <p className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-400/15 px-4 py-3 text-center text-sm text-amber-50">
        Server environment is incomplete. Configure <span className="font-mono">NEXT_PUBLIC_SUPABASE_*</span> in{" "}
        <span className="font-mono">.env.local</span> and restart dev.
      </p>
    );
  }
  if (reason === "profile") {
    return (
      <p className="mb-6 rounded-2xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-center text-sm text-red-100">
        We couldn&apos;t create your profile row. Confirm RLS/schema from <span className="font-mono">schema.sql</span>.
      </p>
    );
  }
  return null;
}

export default function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const reason = searchParams?.reason;
  const oauth = searchParams?.oauth_error;
  const oauthError = oauth === "1" || oauth === "true";

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl border border-gold/30 bg-gold/10 shadow-gold">
            <Crown className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-4xl font-black text-white">Enter the Vanguard</h1>
          <p className="mt-2 text-zinc-400">Begin your hero&apos;s journey in under 30 seconds.</p>
        </div>
        <EnvBanner oauthError={oauthError} reason={reason} />
        <LoginForm />
      </div>
    </main>
  );
}
