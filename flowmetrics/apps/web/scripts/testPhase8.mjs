import assert from "node:assert";

const API_BASE = "http://localhost:5000/api";
const WEB_BASE = "http://localhost:3000";

let adminToken = "";
let createdPlanId = "";
let createdPostId = "";

console.log("=== Flowmetrics Phase 8 Verification Test Suite ===\n");

async function runTests() {
  // Test 1: Admin Login
  console.log("1. Testing Admin Login (POST /api/auth/login)...");
  {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@flowmetrics.io",
        password: "AdminFlowmetrics2026!",
      }),
    });
    assert.strictEqual(res.status, 200, "Login must return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true, "Response must be success: true");
    assert.ok(json.data.token, "Response must contain JWT token");
    adminToken = json.data.token;
    console.log("   ✓ Admin login succeeded, JWT token retrieved.");
  }

  // Test 2: Fetch Admin Plans (includes drafts)
  console.log("2. Testing Fetch Admin Plans (GET /api/admin/plans)...");
  {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200, "Admin plans route must return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true, "Response must be success: true");
    assert.ok(Array.isArray(json.data), "data must be an array");
    const hasPublished = json.data.some((p) => p.published === true);
    const hasDraft = json.data.some((p) => p.published === false);
    assert.ok(hasPublished, "Admin list must include published plans");
    assert.ok(hasDraft, "Admin list must include draft plans");
    console.log(`   ✓ Admin plans retrieved (${json.data.length} plans total: published + drafts).`);
  }

  // Test 3: Create Plan via Admin API
  console.log("3. Testing Create Plan (POST /api/admin/plans)...");
  {
    const newPlan = {
      name: "Phase 8 Custom Test Tier",
      price: 149,
      billingCycle: "monthly",
      features: [
        "Dedicated Success Architect",
        "Linear & Jira two-way sync",
        "Custom Workload Alerts",
      ],
      highlighted: false,
      published: false, // created as draft initially
      order: 99,
    };
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newPlan),
    });
    assert.strictEqual(res.status, 201, "Creating plan must return 201");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.name, newPlan.name);
    assert.strictEqual(json.data.features.length, 3);
    assert.strictEqual(json.data.published, false);
    createdPlanId = json.data._id;
    console.log(`   ✓ Plan created with ID ${createdPlanId} (draft status verified).`);
  }

  // Test 4: Verify draft isolation on public GET /api/plans
  console.log("4. Verifying draft isolation on public GET /api/plans...");
  {
    const res = await fetch(`${API_BASE}/plans`);
    const json = await res.json();
    const found = json.data.find((p) => p._id === createdPlanId);
    assert.strictEqual(found, undefined, "Draft plan MUST NOT appear on public endpoint");
    console.log("   ✓ Confirmed: draft plan is strictly excluded from public API.");
  }

  // Test 5: Update plan to published: true and modify features
  console.log("5. Testing Update Plan & nested features (PUT /api/admin/plans/:id)...");
  {
    const updatedFeatures = [
      "Custom Workload Alerts",
      "Linear & Jira two-way sync",
      "Dedicated Success Architect",
      "Unlimited Webhooks & API Keys",
    ];
    const res = await fetch(`${API_BASE}/admin/plans/${createdPlanId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        published: true,
        features: updatedFeatures,
      }),
    });
    assert.strictEqual(res.status, 200, "Updating plan must return 200");
    const json = await res.json();
    assert.strictEqual(json.data.published, true);
    assert.strictEqual(json.data.features.length, 4);
    assert.strictEqual(json.data.features[0], "Custom Workload Alerts");
    console.log("   ✓ Plan updated: published=true, features reordered and expanded to 4 items.");
  }

  // Test 6: Verify immediately visible on public site
  console.log("6. Verifying published plan appears on public GET /api/plans...");
  {
    const res = await fetch(`${API_BASE}/plans`);
    const json = await res.json();
    const found = json.data.find((p) => p._id === createdPlanId);
    assert.ok(found, "Published plan MUST now appear on public endpoint");
    assert.strictEqual(found.features.length, 4);
    console.log("   ✓ Confirmed: plan immediately visible publicly with all 4 reordered features.");
  }

  // Test 7: Delete Plan
  console.log("7. Testing Delete Plan (DELETE /api/admin/plans/:id)...");
  {
    const res = await fetch(`${API_BASE}/admin/plans/${createdPlanId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200, "Deleting plan must return 200");
    const publicRes = await fetch(`${API_BASE}/plans`);
    const publicJson = await publicRes.json();
    const found = publicJson.data.find((p) => p._id === createdPlanId);
    assert.strictEqual(found, undefined, "Deleted plan must not exist on public API");
    console.log("   ✓ Plan successfully deleted and removed from public listing.");
  }

  // Test 8: Create Blog Post with rich text & auto-slug
  console.log("8. Testing Create Blog Post with rich text (POST /api/admin/posts)...");
  {
    const newPost = {
      title: "Testing TipTap Rich Text Integration",
      slug: "testing-tiptap-rich-text-integration",
      excerpt: "Demonstrating serialized HTML content and sanitization in Phase 8.",
      content:
        "<h2>Engineering Focus Metrics</h2><p>Real-time visibility reduces burnout.</p><blockquote>Keep meetings under 15% of sprint capacity.</blockquote>",
      coverImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      published: true,
    };
    const res = await fetch(`${API_BASE}/admin/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newPost),
    });
    assert.strictEqual(res.status, 201, "Creating post must return 201");
    const json = await res.json();
    assert.strictEqual(json.data.slug, newPost.slug);
    assert.ok(json.data.publishedAt, "publishedAt must be populated on publish");
    createdPostId = json.data._id;
    console.log(`   ✓ Post created with ID ${createdPostId} and publishedAt timestamp.`);
  }

  // Test 9: Verify Blog Post Detail and SSR Rendering
  console.log("9. Testing Blog Post detail and SSR page (/blog/[slug])...");
  {
    const publicRes = await fetch(`${API_BASE}/posts/testing-tiptap-rich-text-integration`);
    assert.strictEqual(publicRes.status, 200);
    const publicJson = await publicRes.json();
    assert.ok(publicJson.data.content.includes("<h2>Engineering Focus Metrics</h2>"));

    const webRes = await fetch(`${WEB_BASE}/blog/testing-tiptap-rich-text-integration`);
    assert.strictEqual(webRes.status, 200);
    const html = await webRes.text();
    assert.ok(html.includes("Testing TipTap Rich Text Integration"), "Title in HTML");
    assert.ok(html.includes("Engineering Focus Metrics"), "Rich text h2 in HTML");
    assert.ok(html.includes("Keep meetings under 15%"), "Rich text blockquote in HTML");
    console.log("   ✓ Post rendered seamlessly on SSR /blog/[slug] with rich-text HTML styling.");
  }

  // Test 10: Clean up created post
  console.log("10. Testing Delete Blog Post (DELETE /api/admin/posts/:id)...");
  {
    const res = await fetch(`${API_BASE}/admin/posts/${createdPostId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const checkRes = await fetch(`${API_BASE}/posts/testing-tiptap-rich-text-integration`);
    assert.strictEqual(checkRes.status, 404, "Deleted post must 404");
    console.log("   ✓ Post cleanly deleted and confirmed 404.");
  }

  // Test 11: Verify Admin Frontend Routes
  console.log("11. Verifying Next.js Admin routes respond with HTTP 200...");
  {
    const routes = ["/admin/login", "/admin/plans", "/admin/posts"];
    for (const route of routes) {
      const res = await fetch(`${WEB_BASE}${route}`);
      assert.strictEqual(res.status, 200, `${route} must return 200`);
      console.log(`   ✓ ${route} -> HTTP 200 OK`);
    }
  }

  console.log("\n All Phase 8 tests passed successfully!");
}

runTests().catch((err) => {
  console.error("\n❌ Test failed:", err);
  process.exit(1);
});
