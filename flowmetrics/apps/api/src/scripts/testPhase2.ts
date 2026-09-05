import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { Server } from "http";

async function runPhase2Tests(): Promise<void> {
  console.log("=== Starting Phase 2 Verification Tests ===");
  await connectDB();

  const app = createApp();
  const testPort = 5055;
  const server: Server = app.listen(testPort);
  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: GET /api/plans - published only & sorted by order
    const plansRes = await fetch(`${baseUrl}/plans`);
    const plansJson = await plansRes.json() as any;
    assert(plansRes.status === 200, "GET /api/plans returns HTTP 200");
    assert(Array.isArray(plansJson.data), "GET /api/plans data is an array");
    assert(plansJson.data.length === 3, `GET /api/plans returned exactly 3 published plans (got ${plansJson.data.length})`);
    const draftPlan = plansJson.data.find((p: any) => p.name.includes("Draft") || p.published === false);
    assert(!draftPlan, "Draft plan is excluded from GET /api/plans at DB query level");
    const isSorted = plansJson.data.every((p: any, i: number, arr: any[]) => i === 0 || arr[i - 1].order <= p.order);
    assert(isSorted, "Pricing plans are sorted by order ascending");

    // Test 2: GET /api/posts - published only & sorted by featured desc, publishedAt desc
    const postsRes = await fetch(`${baseUrl}/posts`);
    const postsJson = await postsRes.json() as any;
    assert(postsRes.status === 200, "GET /api/posts returns HTTP 200");
    assert(Array.isArray(postsJson.data), "GET /api/posts data is an array");
    assert(postsJson.data.length === 4, `GET /api/posts returned exactly 4 published posts (got ${postsJson.data.length})`);
    const draftPost = postsJson.data.find((p: any) => p.slug.includes("draft") || p.published === false);
    assert(!draftPost, "Draft post is excluded from GET /api/posts at DB query level");
    assert(postsJson.data[0].featured === true, "First post returned has featured: true");

    // Test 3: GET /api/posts?limit=2
    const limitedRes = await fetch(`${baseUrl}/posts?limit=2`);
    const limitedJson = await limitedRes.json() as any;
    assert(limitedJson.data.length === 2, "GET /api/posts?limit=2 returns exactly 2 items");

    // Test 3a: Edge case ?limit=abc (non-numeric string)
    const abcRes = await fetch(`${baseUrl}/posts?limit=abc`);
    const abcJson = await abcRes.json() as any;
    assert(abcRes.status === 200, "GET /api/posts?limit=abc returns HTTP 200 gracefully");
    assert(abcJson.data.length === 4, "GET /api/posts?limit=abc falls back safely to default full list (4 published posts)");

    // Test 3b: Edge case ?limit=-1 (negative number)
    const negRes = await fetch(`${baseUrl}/posts?limit=-1`);
    const negJson = await negRes.json() as any;
    assert(negRes.status === 200, "GET /api/posts?limit=-1 returns HTTP 200 gracefully without crashing MongoDB");
    assert(negJson.data.length === 4, "GET /api/posts?limit=-1 falls back safely to default list");

    // Test 3c: Edge case ?limit=0
    const zeroRes = await fetch(`${baseUrl}/posts?limit=0`);
    const zeroJson = await zeroRes.json() as any;
    assert(zeroRes.status === 200, "GET /api/posts?limit=0 returns HTTP 200 gracefully");
    assert(zeroJson.data.length === 4, "GET /api/posts?limit=0 falls back safely to default list");

    // Test 3d: Edge case ?limit=99999 (excessive number clamped)
    const hugeRes = await fetch(`${baseUrl}/posts?limit=99999`);
    const hugeJson = await hugeRes.json() as any;
    assert(hugeRes.status === 200, "GET /api/posts?limit=99999 returns HTTP 200 gracefully");
    assert(hugeJson.data.length === 4, "GET /api/posts?limit=99999 clamped safely without memory exhaustion");

    // Test 4: GET /api/posts/:slug for published post
    const singlePublishedRes = await fetch(`${baseUrl}/posts/5-signs-your-team-is-overloaded`);
    const singlePublishedJson = await singlePublishedRes.json() as any;
    assert(singlePublishedRes.status === 200, "GET /api/posts/:slug returns 200 for published post");
    assert(singlePublishedJson.data.slug === "5-signs-your-team-is-overloaded", "Returned correct published post");

    // Test 5: GET /api/posts/:slug for UNPUBLISHED draft post
    const draftSlugRes = await fetch(`${baseUrl}/posts/internal-draft-q4-roadmap-ai-estimation`);
    const draftSlugJson = await draftSlugRes.json() as any;
    assert(draftSlugRes.status === 404, `GET /api/posts/:slug returns 404 for draft post (got ${draftSlugRes.status})`);
    assert(draftSlugJson.error?.code === "NOT_FOUND", "Error response format contains NOT_FOUND code");

    // Test 6: GET /api/testimonials - published only & sorted by order
    const testRes = await fetch(`${baseUrl}/testimonials`);
    const testJson = await testRes.json() as any;
    assert(testRes.status === 200, "GET /api/testimonials returns HTTP 200");
    assert(Array.isArray(testJson.data), "GET /api/testimonials data is an array");
    assert(testJson.data.length === 3, `GET /api/testimonials returned exactly 3 published testimonials (got ${testJson.data.length})`);
    const draftTestimonial = testJson.data.find((t: any) => t.name.includes("Draft") || t.published === false);
    assert(!draftTestimonial, "Draft testimonial is excluded from GET /api/testimonials at DB query level");

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log("=== Finished Phase 2 Verification Tests ===");
  }
}

runPhase2Tests();
