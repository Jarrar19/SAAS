import { connectDB, disconnectDB } from "../config/db.js";
import { PricingPlan } from "../models/PricingPlan.js";
import { BlogPost } from "../models/BlogPost.js";
import { Testimonial } from "../models/Testimonial.js";

async function seedContent(): Promise<void> {
  console.log("--- Starting Sample Content Seed Script ---");
  await connectDB();

  try {
    // 1. Seed Pricing Plans
    await PricingPlan.deleteMany({});
    const plans = await PricingPlan.insertMany([
      {
        name: "Starter",
        price: 29,
        billingCycle: "monthly",
        features: [
          "Up to 10 team members",
          "Automated time tracking",
          "Weekly workload dashboards",
          "Basic integrations (Slack, GitHub)",
          "Community support",
        ],
        highlighted: false,
        published: true,
        order: 1,
      },
      {
        name: "Team",
        price: 79,
        billingCycle: "monthly",
        features: [
          "Up to 50 team members",
          "Real-time burnout risk alerts",
          "Advanced workload heatmaps",
          "Custom progress reports & CSV exports",
          "Jira, Linear, Asana & Slack integrations",
          "Priority email & chat support",
        ],
        highlighted: true, // Core evaluated highlighted plan
        published: true,
        order: 2,
      },
      {
        name: "Business",
        price: 199,
        billingCycle: "monthly",
        features: [
          "Unlimited team members",
          "Cross-department capacity planning",
          "Custom reporting API & webhooks",
          "Dedicated customer success manager",
          "SSO / SAML authentication",
          "99.9% uptime SLA",
        ],
        highlighted: false,
        published: true,
        order: 3,
      },
      {
        name: "Enterprise Custom (Draft)",
        price: 499,
        billingCycle: "monthly",
        features: ["Custom on-prem deployment", "Full compliance review", "Custom contract terms"],
        highlighted: false,
        published: false, // Draft plan to test access rules
        order: 4,
      },
    ]);
    console.log(`[Seed] Seeded ${plans.length} pricing plans (including 1 draft).`);

    // 2. Seed Blog Posts
    await BlogPost.deleteMany({});
    const posts = await BlogPost.insertMany([
      {
        title: "5 Signs Your Team Is Overloaded (and How to Spot Them Early)",
        slug: "5-signs-your-team-is-overloaded",
        excerpt:
          "Burnout rarely happens overnight. Learn the subtle behavioral patterns and workload velocity shifts that indicate team fatigue.",
        content: `
          <h2>Recognizing the Subtle Warning Signs</h2>
          <p>When high-performing distributed teams suddenly hit a slump, leadership often attributes it to shifting requirements or lack of focus. But in 80% of cases, the underlying culprit is sustained micro-overload.</p>
          <h3>1. Spikes in PR Review Latency</h3>
          <p>When developers are juggling too many context switches, review queues are the first thing to stall. Code reviews require uninterrupted cognitive bandwidth.</p>
          <h3>2. Uneven Distribution in Sprint Heatmaps</h3>
          <p>Check your team dashboard: are 20% of your engineers carrying 60% of critical path tasks? Flowmetrics workload dashboards make these bottlenecks glaringly obvious before burnout sets in.</p>
          <h3>3. Creeping After-Hours Activity</h3>
          <p>Async work easily bleeds into nights and weekends. Consistent activity outside standard core hours is a flashing indicator of unsustainable workload.</p>
          <p>By monitoring team velocity holistically rather than just measuring lines of code, managers can proactively rebalance assignments.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
        featured: true, // Highlighted featured post
        published: true,
        publishedAt: new Date("2026-08-15T10:00:00Z"),
      },
      {
        title: "Async vs. Sync: Finding the Right Balance for Distributed Teams",
        slug: "async-vs-sync-finding-the-right-balance",
        excerpt:
          "Constant Zoom calls drain energy, but pure async communication can slow down critical alignment. Here is our data-backed framework.",
        content: `
          <h2>The Fallacy of All-or-Nothing Collaboration</h2>
          <p>Remote work advocates frequently tout total asynchronous freedom. While minimizing useless status meetings is essential, complex architectural decisions and sensitive interpersonal feedback still require high-fidelity synchronous conversation.</p>
          <h3>The 70/30 Rule</h3>
          <p>Top-performing remote engineering teams reserve 70% of their operational cadence for structured asynchronous updates (PRDs, ticket tracking, Loom summaries) and 30% for tightly scoped synchronous collaboration.</p>
          <p>With Flowmetrics automated focus-time tracking, teams protect 4-hour deep work blocks every day while retaining key sync touchpoints.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        featured: false,
        published: true,
        publishedAt: new Date("2026-08-20T14:30:00Z"),
      },
      {
        title: "Flowmetrics 2.0: New Workload Heatmaps and Slack Integration",
        slug: "flowmetrics-2-workload-heatmaps-slack-integration",
        excerpt:
          "Today we are rolling out our biggest update yet: live capacity heatmaps and automated daily workload digests delivered directly into Slack.",
        content: `
          <h2>Built for Engineering Managers Who Value Clarity</h2>
          <p>We spent the last four months listening to agency owners and engineering leaders. The recurring feedback was simple: 'Give us a single screen that shows team capacity without demanding manual timesheets.'</p>
          <h3>Live Workload Heatmaps</h3>
          <p>Our updated heatmap interface visualizes capacity across projects in real-time, pulling signals directly from GitHub commits, Linear issues, and Jira boards.</p>
          <h3>Contextual Slack Bot</h3>
          <p>No one wants another dashboard to check. Flowmetrics now sends managers a concise 9:00 AM Slack digest showing blocked tasks and potential over-allocation.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        featured: false,
        published: true,
        publishedAt: new Date("2026-08-28T09:15:00Z"),
      },
      {
        title: "How Apex Digital Agency Cut Reporting Time by 60% with Flowmetrics",
        slug: "how-apex-agency-cut-reporting-time-by-60-percent",
        excerpt:
          "Case study: Discover how a 45-person agency transformed client delivery and saved 18 hours per manager each month.",
        content: `
          <h2>The Agency Challenge</h2>
          <p>Apex Digital manages client campaigns across 12 time zones. Every Friday, project directors spent 4 hours aggregating billable hours and milestones into client spreadsheets.</p>
          <h2>The Solution</h2>
          <p>By connecting Flowmetrics directly to their project management stack, automated client utilization reports are generated with a single click, providing clients with transparent burndown charts.</p>
        `,
        coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        featured: false,
        published: true,
        publishedAt: new Date("2026-09-01T11:00:00Z"),
      },
      {
        title: "Internal Draft: Q4 Roadmap & AI Estimation Preview",
        slug: "internal-draft-q4-roadmap-ai-estimation",
        excerpt:
          "Confidential internal notes regarding upcoming AI estimation features and beta rollout schedule.",
        content: "<p>This is an internal unpublished draft. It must NEVER appear on public routes.</p>",
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        featured: false,
        published: false, // Draft post to test access rules
        publishedAt: null,
      },
    ]);
    console.log(`[Seed] Seeded ${posts.length} blog posts (including 1 draft).`);

    // 3. Seed Testimonials
    await Testimonial.deleteMany({});
    const testimonials = await Testimonial.insertMany([
      {
        name: "Sarah Lin",
        role: "VP of Engineering at Synthetix",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        quote:
          "Flowmetrics gave our managers immediate visibility into sprint bottlenecks without forcing developers into micro-reporting. It's the cleanest tool we've used.",
        published: true,
        order: 1,
      },
      {
        name: "Marcus Vance",
        role: "Founder & CEO, Apex Digital",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        quote:
          "We slashed client reporting overhead by over 60%. Our project leads get hours back each week, and our clients love the transparent capacity data.",
        published: true,
        order: 2,
      },
      {
        name: "Elena Rostova",
        role: "Head of Product at CloudScale",
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        quote:
          "The burnout alert heatmaps alone paid for the entire platform in the first month. We caught key engineer overload weeks before it affected our sprint delivery.",
        published: true,
        order: 3,
      },
      {
        name: "David K. (Draft Testimonial)",
        role: "Beta Tester, Confidential Corp",
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        quote: "This is an unpublished draft testimonial. It must NEVER be returned by public endpoints.",
        published: false, // Explicit draft testimonial to test access rules
        order: 4,
      },
    ]);
    console.log(`[Seed] Seeded ${testimonials.length} testimonials (including 1 draft).`);

    // Ensure Mongoose unique indexes are synchronized in MongoDB
    await PricingPlan.init();
    await BlogPost.init();
    await Testimonial.init();
    console.log("[Seed] Model indexes synchronized.");

    console.log("[Seed] Content seeding completed successfully.");
  } catch (error) {
    console.error("[Seed] Error seeding content:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log("--- Finished Sample Content Seed Script ---");
  }
}

seedContent();
