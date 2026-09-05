export function Hero() {
  return (
    <section className="pt-12 pb-16 md:pt-16 md:pb-20 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Left-aligned narrative */}
          <div className="lg:col-span-5 space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.12]">
              See where engineering effort actually goes.
            </h1>

            <p className="text-base text-ink-muted leading-relaxed max-w-lg">
              Flowmetrics connects with GitHub and Linear to give managers clear, automated workload visibility without manual timesheets or invasive monitoring.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Start free trial
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center text-sm font-medium text-ink-muted hover:text-ink transition-colors"
              >
                See how it works
              </a>
            </div>

            {/* Tightened spacing between CTA row and trial note */}
            <div className="pt-1.5 text-xs text-ink-muted">
              Fourteen-day free trial. Setup takes under five minutes with GitHub.
            </div>
          </div>

          {/* Right Column: Amplified Hero Data Centerpiece (Warm #FFFDFA Surface) */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-border bg-[#FFFDFA] p-7 sm:p-8 shadow-sm">
              {/* Header with Live Signal */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div>
                  <div className="text-xs font-medium text-ink-muted">Current sprint</div>
                  <div className="text-sm font-semibold text-ink">Engineering effort allocation</div>
                </div>
                {/* Meaningful real-time indicator using the teal accent dot */}
                <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span>Updated just now</span>
                </div>
              </div>

              {/* Prominent Hero Statistic */}
              <div className="my-6">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
                  418 hours
                </div>
                <div className="text-xs text-ink-muted mt-1.5">
                  Aggregated across 14 engineers in 3 distributed squads
                </div>
              </div>

              {/* Segmented allocation bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Sprint category distribution</span>
                  <span>100% capacity</span>
                </div>
                <div className="h-3.5 w-full rounded overflow-hidden flex bg-border">
                  <div className="bg-accent h-full" style={{ width: "54%" }} title="Product features: 54%" />
                  <div className="bg-[#334155] h-full" style={{ width: "22%" }} title="Architecture: 22%" />
                  <div className="bg-[#64748B] h-full" style={{ width: "14%" }} title="Bug fixes: 14%" />
                  <div className="bg-[#CBD5E1] h-full" style={{ width: "10%" }} title="Maintenance: 10%" />
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-accent shrink-0" />
                  <span className="text-ink font-medium">Features</span>
                  <span className="text-ink-muted ml-auto">54%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#334155] shrink-0" />
                  <span className="text-ink font-medium">Architecture</span>
                  <span className="text-ink-muted ml-auto">22%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#64748B] shrink-0" />
                  <span className="text-ink font-medium">Bug fixes</span>
                  <span className="text-ink-muted ml-auto">14%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#CBD5E1] shrink-0" />
                  <span className="text-ink font-medium">Maintenance</span>
                  <span className="text-ink-muted ml-auto">10%</span>
                </div>
              </div>

              {/* Scaled-up Daily Focus Hours Chart */}
              <div className="mt-7 pt-5 border-t border-border">
                <div className="flex items-center justify-between text-xs mb-3.5">
                  <span className="font-semibold text-ink">Daily uninterrupted focus time</span>
                  <span className="text-ink-muted">Squad average • Target: 4.0h / day</span>
                </div>
                <svg
                  viewBox="0 0 380 110"
                  className="w-full h-24 sm:h-28 overflow-visible"
                  aria-label="Daily focus hours bar chart"
                >
                  {/* Target reference dashed line at 4.0h (y=45) */}
                  <line x1="10" y1="45" x2="370" y2="45" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 3" />
                  <text x="372" y="48" fontSize="9" fill="#5B6270" textAnchor="start">
                    4h target
                  </text>

                  {/* Baseline */}
                  <line x1="10" y1="92" x2="370" y2="92" stroke="#E4E7EC" strokeWidth="1" />

                  {/* Confident, wider bars */}
                  {[
                    { day: "Monday", x: 24, height: 62, val: "4.8h" },
                    { day: "Tuesday", x: 96, height: 70, val: "5.1h" },
                    { day: "Wednesday", x: 168, height: 52, val: "4.2h" },
                    { day: "Thursday", x: 240, height: 74, val: "5.3h" },
                    { day: "Friday", x: 312, height: 44, val: "3.7h" },
                  ].map((bar, i) => (
                    <g key={i}>
                      <rect
                        x={bar.x}
                        y={92 - bar.height}
                        width="36"
                        height={bar.height}
                        rx="3"
                        fill="#0F766E"
                        opacity={bar.height >= 50 ? 0.95 : 0.6}
                      />
                      <text
                        x={bar.x + 18}
                        y="106"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#5B6270"
                        fontWeight="500"
                      >
                        {bar.day.slice(0, 3)}
                      </text>
                      <text
                        x={bar.x + 18}
                        y={85 - bar.height}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#12151C"
                        fontWeight="600"
                      >
                        {bar.val}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Status footer */}
              <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs text-ink-muted">
                <span>Healthy balance: 76% roadmap focus</span>
                <span className="text-accent font-semibold">Sprint on schedule</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
