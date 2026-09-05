async function testFrontend() {
  console.log("=== Starting Phase 7 Frontend Verification Tests ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Landing Page SSR HTML
    const homeRes = await fetch("http://localhost:3000");
    assert(homeRes.status === 200, "GET http://localhost:3000 returns HTTP 200");
    const html = await homeRes.text();

    assert(html.includes("Flowmetrics"), "Landing page contains brand name 'Flowmetrics'");
    assert(html.includes("Engineering effort"), "Landing page contains Hero headline");
    assert(html.includes("Automated Time Analytics"), "Landing page contains Features section");
    assert(html.includes("Starter") && html.includes("Team") && html.includes("Business"), "Landing page contains all 3 pricing tiers");
    assert(html.includes("Most popular") || html.includes("Most Popular"), "Highlighted plan visually displays 'Most popular' badge");
    assert(html.includes("Featured story") || html.includes("Featured Story"), "Featured blog post visually displays 'Featured story' badge");
    assert(!html.includes("Enterprise Custom (Draft)"), "Draft pricing plan is strictly excluded from public landing page");
    assert(!html.includes("Internal Draft: Q4 Roadmap"), "Draft blog post is strictly excluded from public landing page");
    assert(!html.includes("David K. (Draft Testimonial)"), "Draft testimonial is strictly excluded from public landing page");

    // 2. Published Post Detail Page
    const postRes = await fetch("http://localhost:3000/blog/5-signs-your-team-is-overloaded");
    assert(postRes.status === 200, "GET /blog/5-signs-your-team-is-overloaded returns HTTP 200");
    const postHtml = await postRes.text();
    assert(postHtml.includes("5 Signs Your Team Is Overloaded"), "Post page renders correct article title");
    assert(postHtml.includes("Recognizing the Subtle Warning Signs"), "Post page renders sanitized rich text HTML content");
    assert(postHtml.includes("Return to Flowmetrics Homepage"), "Post page includes back navigation link");

    // 3. Unpublished Draft Post Detail Page (Must Return 404!)
    const draftRes = await fetch("http://localhost:3000/blog/internal-draft-q4-roadmap-ai-estimation");
    assert(draftRes.status === 404, `GET /blog/internal-draft-q4-roadmap-ai-estimation returns HTTP 404 (got ${draftRes.status})`);
    const draftHtml = await draftRes.text();
    assert(draftHtml.includes("404 — Page Not Found") || draftHtml.includes("Content Unavailable"), "Draft post renders clean 404 not found page");

    // 4. Non-existent slug returns 404
    const notFoundRes = await fetch("http://localhost:3000/blog/completely-fake-nonexistent-slug");
    assert(notFoundRes.status === 404, "Unknown slug returns HTTP 404");

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  }
}

testFrontend();
