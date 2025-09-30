export default function TrackingServerPage() {
  return (
    <div className="h-screen w-full bg-background flex items-center justify-center">
      {/* Hero Section */}
      <section className="w-full px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block px-4 py-1.5 text-sm font-mono text-muted-foreground border border-border rounded-full">
            TRACKING SERVER
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl text-balance">
            Performance Tracking
          </h1>

          <p className="mb-4 text-xl text-muted-foreground md:text-2xl text-balance">
            The ultimate performance marketing platform.
          </p>

          <p className="text-lg text-muted-foreground md:text-xl">
            This server handles <span className="font-semibold">billions of events per day</span>.
          </p>
        </div>
      </section>
    </div>
  )
}
