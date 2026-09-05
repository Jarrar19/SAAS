import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { config } from "../config/env.js";
import { signToken } from "../utils/token.js";
import { BlogPost } from "../models/BlogPost.js";
import { PricingPlan } from "../models/PricingPlan.js";
import { Server } from "http";

async function runPhase4Tests(): Promise<void> {
  console.log("=== Starting Phase 4 Verification Tests ===");
  await connectDB();

  const app = createApp();
  const testPort = 5057;
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
    const adminToken = signToken("test-admin-id", "admin");
    const adminHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    };

    // --- CHECK 1: GET Admin Plans & Posts (sees all, including drafts) ---
    const allPlansRes = await fetch(`${baseUrl}/admin/plans`, { headers: adminHeaders });
    const allPlansJson = await allPlansRes.json() as any;
    assert(allPlansRes.status === 200, "GET /api/admin/plans returns 200");
    assert(allPlansJson.data.length >= 4, "Admin sees all plans including drafts (at least 4 plans)");

    const allPostsRes = await fetch(`${baseUrl}/admin/posts`, { headers: adminHeaders });
    const allPostsJson = await allPostsRes.json() as any;
    assert(allPostsRes.status === 200, "GET /api/admin/posts returns 200");
    assert(allPostsJson.data.length >= 5, "Admin sees all blog posts including drafts (at least 5 posts)");

    // --- CHECK 2: ZOD VALIDATION REJECTIONS (Empty / malformed features, negative price, invalid enum) ---
    // Test 2a: Empty features array
    const emptyFeaturesRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: 49,
        billingCycle: "monthly",
        features: [],
      }),
    });
    const emptyFeaturesJson = await emptyFeaturesRes.json() as any;
    assert(emptyFeaturesRes.status === 400, "Reject empty features array: HTTP 400");
    assert(emptyFeaturesJson.error?.code === "VALIDATION_ERROR", "Error code is VALIDATION_ERROR");

    // Test 2b: Features array with empty string [""]
    const emptyStringFeatureRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: 49,
        billingCycle: "monthly",
        features: [""],
      }),
    });
    assert(emptyStringFeatureRes.status === 400, "Reject features array with empty string: HTTP 400");

    // Test 2c: Features array with whitespace string ["   "]
    const whitespaceFeatureRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: 49,
        billingCycle: "monthly",
        features: ["   "],
      }),
    });
    assert(whitespaceFeatureRes.status === 400, "Reject features array with whitespace-only string: HTTP 400");

    // Test 2d: Features array with non-string item [123]
    const nonStringFeatureRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: 49,
        billingCycle: "monthly",
        features: ["Valid feature", 12345],
      }),
    });
    assert(nonStringFeatureRes.status === 400, "Reject features array with non-string item: HTTP 400");

    // Test 2e: Negative price
    const negPriceRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: -25,
        billingCycle: "monthly",
        features: ["Feature 1"],
      }),
    });
    assert(negPriceRes.status === 400, "Reject negative price: HTTP 400");

    // Test 2f: Invalid billing cycle enum
    const badCycleRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Invalid Plan",
        price: 25,
        billingCycle: "weekly",
        features: ["Feature 1"],
      }),
    });
    assert(badCycleRes.status === 400, "Reject invalid billing cycle enum ('weekly'): HTTP 400");

    // --- CHECK 3: PRICING PLAN CRUD LIFECYCLE ---
    // Create Plan
    const createPlanRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Pro Growth Tier",
        price: 129,
        billingCycle: "monthly",
        features: ["100 team seats", "Audit logging", "Priority SLA"],
        highlighted: false,
        published: true,
        order: 5,
      }),
    });
    const createPlanJson = await createPlanRes.json() as any;
    assert(createPlanRes.status === 201, "Create plan returns 201 Created");
    const createdPlanId = createPlanJson.data._id;

    // Update Plan (replacing features array)
    const updatePlanRes = await fetch(`${baseUrl}/admin/plans/${createdPlanId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        name: "Pro Growth Tier (Updated)",
        price: 139,
        features: ["Updated Seat Count (150 seats)", "Dedicated Support", "Custom Exports"],
      }),
    });
    const updatePlanJson = await updatePlanRes.json() as any;
    assert(updatePlanRes.status === 200, "Update plan returns 200 OK");
    assert(updatePlanJson.data.features.length === 3, "Features array correctly replaced on update");
    assert(updatePlanJson.data.name === "Pro Growth Tier (Updated)", "Plan name updated");

    // Delete Plan
    const deletePlanRes = await fetch(`${baseUrl}/admin/plans/${createdPlanId}`, {
      method: "DELETE",
      headers: adminHeaders,
    });
    assert(deletePlanRes.status === 200, "DELETE plan returns 200 OK");

    // --- CHECK 4: DUPLICATE SLUG & SELF-SLUG UPDATE BEHAVIOR ---
    // 4a. Attempt to create a post with an already existing slug -> 409
    const duplicateSlugRes = await fetch(`${baseUrl}/admin/posts`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "Duplicate Slug Attempt",
        slug: "5-signs-your-team-is-overloaded", // Already exists in seeded data
        excerpt: "This should conflict and fail cleanly.",
        content: "<p>Some content</p>",
        coverImage: "https://example.com/cover.jpg",
        published: true,
      }),
    });
    const duplicateSlugJson = await duplicateSlugRes.json() as any;
    assert(duplicateSlugRes.status === 409, `Duplicate slug returns HTTP 409 Conflict (got ${duplicateSlugRes.status})`);
    assert(duplicateSlugJson.error?.code === "CONFLICT", "Duplicate slug error code is CONFLICT");

    // 4b. Update an existing post keeping its EXACT SAME slug -> MUST SUCCEED (200 OK, not 409!)
    const targetPost = allPostsJson.data.find((p: any) => p.slug === "5-signs-your-team-is-overloaded");
    assert(Boolean(targetPost), "Found seeded post '5-signs-your-team-is-overloaded'");
    const updateSameSlugRes = await fetch(`${baseUrl}/admin/posts/${targetPost._id}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "5 Signs Your Team Is Overloaded (Title Updated)",
        slug: "5-signs-your-team-is-overloaded", // Passed explicitly unchanged
        excerpt: targetPost.excerpt,
      }),
    });
    const updateSameSlugJson = await updateSameSlugRes.json() as any;
    assert(updateSameSlugRes.status === 200, `Updating post with unchanged slug returns HTTP 200 OK (got ${updateSameSlugRes.status})`);
    assert(updateSameSlugJson.data?.title === "5 Signs Your Team Is Overloaded (Title Updated)", "Post title was updated without self-409 collision");

    // --- CHECK 5: PUBLISHEDAT TRANSITION LOGIC (ONLY ON FALSE -> TRUE) ---
    // Step 5a: Create a draft post (published: false) -> publishedAt must be null
    const createDraftPostRes = await fetch(`${baseUrl}/admin/posts`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "Transition Test Post",
        slug: "transition-test-post",
        excerpt: "Testing publishedAt state machine.",
        content: "<p>Initial draft content.</p>",
        coverImage: "https://example.com/cover.jpg",
        published: false,
      }),
    });
    const createDraftJson = await createDraftPostRes.json() as any;
    assert(createDraftPostRes.status === 201, "Created draft post successfully (201)");
    const transitionPostId = createDraftJson.data._id;
    assert(createDraftJson.data.publishedAt === null, "Draft post has publishedAt === null");

    // Step 5b: Transition draft to published (false -> true) -> publishedAt MUST be set
    const publishPostRes = await fetch(`${baseUrl}/admin/posts/${transitionPostId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        published: true,
      }),
    });
    const publishJson = await publishPostRes.json() as any;
    assert(publishPostRes.status === 200, "Publish post returns 200 OK");
    assert(publishJson.data.published === true, "Post published status is true");
    assert(publishJson.data.publishedAt !== null, "publishedAt transitioned from null to a Date");
    const firstPublishedAt = publishJson.data.publishedAt;

    // Small delay to ensure any re-timestamping would differ by at least a few ms
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Step 5c: Update the ALREADY published post (true -> true) -> publishedAt MUST NOT change!
    const editPublishedPostRes = await fetch(`${baseUrl}/admin/posts/${transitionPostId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "Transition Test Post (Edited Title)",
        content: "<p>Updated content while published.</p>",
      }),
    });
    const editPublishedJson = await editPublishedPostRes.json() as any;
    assert(editPublishedJson.data.publishedAt === firstPublishedAt, "publishedAt was PRESERVED and not overwritten on re-save");

    // Step 5d: Unpublish post (true -> false) -> publishedAt set to null
    const unpublishRes = await fetch(`${baseUrl}/admin/posts/${transitionPostId}`, {
      method: "PUT",
      headers: adminHeaders,
      body: JSON.stringify({
        published: false,
      }),
    });
    const unpublishJson = await unpublishRes.json() as any;
    assert(unpublishJson.data.published === false, "Post unpublished");
    assert(unpublishJson.data.publishedAt === null, "publishedAt reset to null when post becomes draft");

    // Clean up transition post
    await fetch(`${baseUrl}/admin/posts/${transitionPostId}`, { method: "DELETE", headers: adminHeaders });

    // --- CHECK 6: SCRIPT INJECTION & XSS SANITIZATION TEST ---
    const rawDirtyHtml = `<p>Legitimate paragraph content.</p><script>alert('MALICIOUS_XSS_INJECTION')</script><img src="https://example.com/test.jpg" onerror="alert('IMAGE_XSS')"><a href="javascript:stealTokens()">Malicious Link</a><span class="highlighted">Allowed span</span>`;

    console.log("\n--- [XSS SANITIZATION TEST] ---");
    console.log("Input Dirty HTML:\n", rawDirtyHtml);

    const xssPostRes = await fetch(`${baseUrl}/admin/posts`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "XSS Sanitization Verification Post",
        slug: "xss-sanitization-verification",
        excerpt: "Post testing real HTML sanitization on the server.",
        content: rawDirtyHtml,
        coverImage: "https://example.com/cover.jpg",
        published: true,
      }),
    });
    const xssPostJson = await xssPostRes.json() as any;
    assert(xssPostRes.status === 201, "Create post with dirty HTML returns 201");
    const savedContent = xssPostJson.data.content;

    console.log("Saved Clean HTML Output:\n", savedContent);
    console.log("--------------------------------\n");

    assert(!savedContent.includes("<script>"), "Sanitization stripped <script> tag completely");
    assert(!savedContent.includes("alert("), "Sanitization stripped script execution bodies");
    assert(!savedContent.includes("onerror"), "Sanitization stripped inline 'onerror' attribute");
    assert(!savedContent.includes("javascript:"), "Sanitization stripped 'javascript:' pseudo-protocol from link href");
    assert(savedContent.includes("<p>Legitimate paragraph content.</p>"), "Sanitization preserved safe <p> tag");
    assert(savedContent.includes('src="https://example.com/test.jpg"'), "Sanitization preserved safe img src");

    // Clean up xss post
    await fetch(`${baseUrl}/admin/posts/${xssPostJson.data._id}`, { method: "DELETE", headers: adminHeaders });

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
    console.log("=== Finished Phase 4 Verification Tests ===");
  }
}

runPhase4Tests();
