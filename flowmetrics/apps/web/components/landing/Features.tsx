export function Features() {
  const secondaryFeatures = [
    {
      title: "Burnout risk detection",
      description:
        "Detect persistent overtime patterns, late-night commit spikes, and excessive review loads before they lead to engineer turnover.",
    },
    {
      title: "Workload capacity heatmaps",
      description:
        "Compare team allocation across active repositories and distributed time zones to spot allocation bottlenecks in seconds.",
    },
    {
      title: "Direct developer tool integrations",
      description:
        "Connects directly to GitHub, GitLab, Linear, Jira, and Slack. No custom scripts, no manual data entry, no process interruption.",
    },
    {
      title: "Client and executive reporting",
      description:
        "Generate clean project summaries and audit-ready data exports for stakeholders with a single click.",
    },
    {
      title: "Privacy-first architecture",
      description:
        "Designed strictly for systemic workflow analysis. Tracks project momentum and team bottlenecks, never keystrokes or screens.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Designed for clear management decisions
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Flowmetrics turns standard engineering activity into objective metrics, helping leaders support their teams without surveillance.
          </p>
        </div>

        {/* Asymmetric Layout: 1 Expanded Hero Card + Supporting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Expanded Featured Card */}
          <div className="lg:col-span-5 rounded-lg border border-border bg-surface p-7 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-accent mb-2">Core data engine</div>
              <h3 className="text-xl font-bold text-ink tracking-tight mb-3">
                Automated Time Analytics
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-6">
                Captures engineering effort passively by aggregating pull requests, code review turnarounds, and ticket state transitions. Eliminates the weekly ritual of manual timesheets while giving managers higher accuracy.
              </p>
            </div>

            <div className="border-t border-border pt-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">Timesheet overhead</span>
                <span className="font-semibold text-ink">0 hours / week</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">Data freshness</span>
                <span className="font-semibold text-ink">Live updates on git events</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">Signal source</span>
                <span className="font-semibold text-ink">Commits, PRs & issues</span>
              </div>
            </div>
          </div>

          {/* Plainer List Treatment for Remaining Features */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface p-5 flex flex-col justify-start"
              >
                <h4 className="text-sm font-semibold text-ink mb-1.5">{feat.title}</h4>
                <p className="text-xs text-ink-muted leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
