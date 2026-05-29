export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">
          Coral Compass
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-zinc-950">
          Discord agent shell is ready.
        </h1>
      </div>
      <p className="text-lg leading-8 text-zinc-700">
        This service hosts the Discord interaction endpoint for Coral Compass.
        The next milestone is wiring these commands to Coral SQL evidence.
      </p>
      <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
        {`/ping
/pulse
/blockers
/source-requests
/release-risk`}
      </pre>
    </main>
  );
}
