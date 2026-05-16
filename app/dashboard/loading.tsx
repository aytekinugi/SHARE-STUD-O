export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8">
      <div className="mb-5 h-14 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="h-48 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-64 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-40 animate-pulse rounded-[2rem] bg-white/5" />
        </div>
        <div className="space-y-5">
          <div className="h-56 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-48 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-white/5" />
        </div>
      </div>
    </main>
  );
}
