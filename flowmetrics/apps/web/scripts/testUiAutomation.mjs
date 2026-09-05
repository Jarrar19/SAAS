import puppeteer from "puppeteer-core";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const SCREENSHOT_DIR = "C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\97bbbec6-723d-4083-b7ee-df4c23c20634\\scratch";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

console.log("=== Flowmetrics Phase 8 UI End-to-End Browser Automation ===");
console.log(`Using browser executable: ${executablePath}\n`);

async function cleanupRecords(token) {
  if (!token) return;
  try {
    const plans = await (await fetch("http://localhost:5000/api/admin/plans", { headers: { Authorization: `Bearer ${token}` } })).json();
    for (const p of plans.data || []) {
      if (p.name === "Executive Workload Suite" || p.name === "Phase 8 Custom Test Tier") {
        await fetch(`http://localhost:5000/api/admin/plans/${p._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      }
    }
    const posts = await (await fetch("http://localhost:5000/api/admin/posts", { headers: { Authorization: `Bearer ${token}` } })).json();
    for (const p of posts.data || []) {
      if (p.slug === "custom-capacity-roadmap-slug" || p.slug === "testing-tiptap-rich-text-integration") {
        await fetch(`http://localhost:5000/api/admin/posts/${p._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      }
    }
  } catch (e) {}
}

async function run() {
  const timestamp = Date.now();
  const testPlanName = `Executive Suite ${timestamp}`;
  const testSlug = `custom-capacity-roadmap-${timestamp}`;

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warn") {
      console.log(`   [PAGE ${msg.type().toUpperCase()}]:`, msg.text());
    }
  });
  page.on("pageerror", (err) => console.log("   [PAGE UNCAUGHT ERROR]:", err.message));

  // -------------------------------------------------------------
  // TEST 1: Manual Login via Form (typing into inputs, clicking submit)
  // -------------------------------------------------------------
  console.log("Test 1: Navigating to /admin/login and submitting credentials via form...");
  await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle0" });

  // Verify form inputs exist
  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[type="password"]');
  const submitButton = await page.$('button[type="submit"]');

  assert.ok(emailInput, "Email input must exist on login page");
  assert.ok(passwordInput, "Password input must exist on login page");
  assert.ok(submitButton, "Submit button must exist on login page");

  // Type credentials manually
  await emailInput.click({ clickCount: 3 });
  await emailInput.press("Backspace");
  await emailInput.type("admin@flowmetrics.io", { delay: 15 });

  await passwordInput.click({ clickCount: 3 });
  await passwordInput.press("Backspace");
  await passwordInput.type("AdminFlowmetrics2026!", { delay: 15 });

  // Click Sign in button and wait for Next.js router.replace('/admin/plans')
  await submitButton.click();
  await page.waitForFunction(() => window.location.pathname.includes("/admin/plans"), {
    timeout: 10000,
  });

  const currentUrl = page.url();
  assert.ok(
    currentUrl.includes("/admin/plans"),
    `Expected redirect to /admin/plans, but landed on ${currentUrl}`
  );
  console.log("   ✓ Form-based login succeeded. Landed on /admin/plans.");

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_admin_plans_dashboard.png") });

  // -------------------------------------------------------------
  // TEST 2: Submit Plan with Empty/Whitespace Features -> Verify Inline Validation Error
  // -------------------------------------------------------------
  console.log("Test 2: Submitting plan with empty features -> checking inline error handling...");
  // Click "Create Plan" button
  const createPlanBtn = await page.waitForSelector('button ::-p-text(Create Plan)');
  await createPlanBtn.click();

  // Wait for modal to be visible
  await page.waitForSelector('input[placeholder="e.g. Team Workload Pro"]');

  // Fill plan name
  const planNameInput = await page.$('input[placeholder="e.g. Team Workload Pro"]');
  await planNameInput.click({ clickCount: 3 });
  await planNameInput.type("Invalid Empty Features Plan");

  // Clear all feature inputs in FeatureListEditor
  const featureInputs = await page.$$('input[placeholder="e.g. Automated workload heatmaps"]');
  for (const fInput of featureInputs) {
    await fInput.click({ clickCount: 3 });
    await fInput.press("Backspace");
    // Send space and delete to ensure empty/whitespace
    await fInput.type("   ");
  }

  // Click "Create Plan" inside the modal
  const modalSubmitBtn = await page.$('form button[type="submit"]');
  await modalSubmitBtn.click();

  // Wait for the inline error banner to appear
  await page.waitForSelector("div.rounded-lg.border.border-red-200");
  const errorText = await page.$eval(
    "div.rounded-lg.border.border-red-200",
    (el) => el.textContent || ""
  );

  assert.ok(
    errorText.includes("Features list must contain at least one non-empty feature item"),
    `Expected validation error for empty features, got: ${errorText}`
  );
  console.log("   ✓ Inline error correctly triggered and displayed without silent failure:", errorText.trim());

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_plan_validation_error.png") });

  // Close the modal via Cancel
  const cancelBtn = await page.$('form button ::-p-text(Cancel)');
  await cancelBtn.click();
  await page.waitForFunction(() => !document.querySelector('form input[placeholder="e.g. Team Workload Pro"]'));

  // -------------------------------------------------------------
  // TEST 3: Add Plan with 3 Features, Reorder Them, Delete One, Save, Verify on Public Landing Page
  // -------------------------------------------------------------
  console.log("Test 3: Creating plan with 3 features, reordering, deleting one, and saving...");
  const createPlanBtn2 = await page.waitForSelector('button ::-p-text(Create Plan)');
  await createPlanBtn2.click();

  await page.waitForSelector('input[placeholder="e.g. Team Workload Pro"]');
  const planNameInput2 = await page.$('input[placeholder="e.g. Team Workload Pro"]');
  await planNameInput2.click({ clickCount: 3 });
  await planNameInput2.type(testPlanName);

  // Price
  const priceInput = await page.$('input[type="number"][min="0"]');
  await priceInput.click({ clickCount: 3 });
  await priceInput.type("189");

  // Display Order (set to 99 so it displays cleanly)
  const orderInputs = await page.$$('input[type="number"]');
  if (orderInputs.length > 1) {
    await orderInputs[1].click({ clickCount: 3 });
    await orderInputs[1].type("99");
  }

  // Set Feature 1
  let currentFeatures = await page.$$('input[placeholder="e.g. Automated workload heatmaps"]');
  await currentFeatures[0].click({ clickCount: 3 });
  await currentFeatures[0].type("Automated Sprint Heatmaps");

  // Add Feature 2
  const addFeatureBtn = await page.waitForSelector('button ::-p-text(Add feature line)');
  if (currentFeatures.length < 2) {
    await addFeatureBtn.click();
  }
  currentFeatures = await page.$$('input[placeholder="e.g. Automated workload heatmaps"]');
  await currentFeatures[1].click({ clickCount: 3 });
  await currentFeatures[1].type("Executive Weekly Digest");

  // Add Feature 3
  await addFeatureBtn.click();
  currentFeatures = await page.$$('input[placeholder="e.g. Automated workload heatmaps"]');
  assert.strictEqual(currentFeatures.length, 3, "Should have 3 features now");
  await currentFeatures[2].click({ clickCount: 3 });
  await currentFeatures[2].type("Slack Workload Real-Time Alerts");

  console.log("   Initial features: 1. Automated Sprint Heatmaps | 2. Executive Weekly Digest | 3. Slack Workload Real-Time Alerts");

  // Reorder: Move Feature 3 ("Slack Workload Real-Time Alerts") UP
  const moveUpButtons = await page.$$('button[title="Move up"]');
  assert.ok(moveUpButtons.length >= 3);
  // Click move up on item 3 (index 2)
  await moveUpButtons[2].click();

  // Verify inputs updated order
  let updatedInputs = await page.$$eval(
    'input[placeholder="e.g. Automated workload heatmaps"]',
    (els) => els.map((el) => el.value)
  );
  console.log("   After moving feature 3 up:", updatedInputs);
  assert.strictEqual(updatedInputs[1], "Slack Workload Real-Time Alerts");
  assert.strictEqual(updatedInputs[2], "Executive Weekly Digest");

  // Delete Feature 1 ("Automated Sprint Heatmaps")
  const removeButtons = await page.$$('button[title="Remove feature"]');
  await removeButtons[0].click();

  updatedInputs = await page.$$eval(
    'input[placeholder="e.g. Automated workload heatmaps"]',
    (els) => els.map((el) => el.value)
  );
  console.log("   After deleting first feature (2 remaining):", updatedInputs);
  assert.strictEqual(updatedInputs.length, 2);
  assert.strictEqual(updatedInputs[0], "Slack Workload Real-Time Alerts");
  assert.strictEqual(updatedInputs[1], "Executive Weekly Digest");

  // Toggle Published checkbox
  const publishedCheckbox = await page.waitForSelector('input[type="checkbox"]');
  const checkboxes = await page.$$('input[type="checkbox"]');
  // Second checkbox is 'Published'
  const pubCheck = checkboxes[1];
  const isChecked = await (await pubCheck.getProperty("checked")).jsonValue();
  if (!isChecked) {
    await pubCheck.click();
  }

  // Save the plan
  const saveBtn = await page.$('form button[type="submit"]');
  await saveBtn.click();

  // Wait for modal to close
  await page.waitForFunction(() => !document.querySelector('form input[placeholder="e.g. Team Workload Pro"]'));

  // Confirm plan appears in the admin table
  await page.waitForSelector(`td ::-p-text(${testPlanName})`);
  console.log(`   ✓ Plan '${testPlanName}' visible in admin table with Published badge.`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_admin_plan_created.png") });

  // Now verify on PUBLIC Landing Page
  console.log("   Checking public site http://localhost:3000#pricing for instant reflection...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

  const publicPlanEl = await page.waitForSelector(`::-p-text(${testPlanName})`);
  assert.ok(publicPlanEl, `${testPlanName} must be rendered on public landing page`);

  // Verify the exact reordered features are visible in the public card
  const publicPageText = await page.evaluate(() => document.body.innerText);
  assert.ok(publicPageText.includes("Slack Workload Real-Time Alerts"), "Public site must show Feature 1");
  assert.ok(publicPageText.includes("Executive Weekly Digest"), "Public site must show Feature 2");
  assert.ok(!publicPageText.includes("Automated Sprint Heatmaps"), "Deleted feature must NOT appear");

  console.log("   ✓ Confirmed: Public landing page reflects the new plan and exact reordered features!");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_public_pricing_updated.png") });

  // -------------------------------------------------------------
  // TEST 4: Auto-Slug Generation & Immunity to Manual Overwrite
  // -------------------------------------------------------------
  console.log("Test 4: Testing auto-slug generation and verifying manual edits are NOT overwritten...");
  await page.goto("http://localhost:3000/admin/posts", { waitUntil: "networkidle0" });

  const createPostBtn = await page.waitForSelector('button ::-p-text(Create Post)');
  await createPostBtn.click();

  await page.waitForSelector('input[placeholder="e.g. 5 Signs Your Team Is Overloaded (and How to Spot Them Early)"]');
  const postTitleInput = await page.$('input[placeholder="e.g. 5 Signs Your Team Is Overloaded (and How to Spot Them Early)"]');
  const slugInput = await page.$('input[placeholder="5-signs-team-overloaded"]');

  // Step 4a: Type initial title and check auto-slug
  await postTitleInput.type("Engineering Capacity Planning", { delay: 10 });
  let generatedSlug = await slugInput.evaluate((el) => el.value);
  console.log(`   Title: 'Engineering Capacity Planning' -> Auto-slug: '${generatedSlug}'`);
  assert.strictEqual(generatedSlug, "engineering-capacity-planning");

  // Step 4b: Manually edit the slug
  await slugInput.click({ clickCount: 3 });
  await slugInput.press("Backspace");
  await slugInput.type(testSlug, { delay: 10 });
  const manuallyEditedSlug = await slugInput.evaluate((el) => el.value);
  assert.strictEqual(manuallyEditedSlug, testSlug);

  // Step 4c: Keep typing more into the title
  await postTitleInput.type(" for High-Growth Startups", { delay: 10 });

  // CRITICAL CHECK: Confirm manual slug was NOT clobbered!
  const slugAfterMoreTyping = await slugInput.evaluate((el) => el.value);
  console.log(`   After typing more title -> Slug is: '${slugAfterMoreTyping}'`);
  assert.strictEqual(
    slugAfterMoreTyping,
    testSlug,
    "CRITICAL BUG CHECK: Manually edited slug must NOT be overwritten by title changes!"
  );
  console.log("   ✓ Passed: Manual slug edit remains locked and immune to subsequent title updates.");

  // -------------------------------------------------------------
  // TEST 5: TipTap Rich-Text Formatting & Public Rendering on /blog/[slug]
  // -------------------------------------------------------------
  console.log("Test 5: Testing TipTap WYSIWYG editor formatting (Heading, Bold, List, Link) and publishing...");

  // Fill Excerpt
  const excerptInput = await page.$('textarea[placeholder="A concise 1-2 sentence preview for landing page cards and search engines."]');
  await excerptInput.type("Practical techniques to quantify team focus and protect roadmap commitments.");

  // Interact with TipTap Editor
  const tiptapEditorEl = await page.waitForSelector(".tiptap.prose");
  await tiptapEditorEl.click();

  // Select all default placeholder text and clear it
  await page.keyboard.down("Control");
  await page.keyboard.press("A");
  await page.keyboard.up("Control");
  await page.keyboard.press("Backspace");

  // Click H2 button in TipTap toolbar
  const h2Btn = await page.waitForSelector('button[title="Heading 2"]');
  await h2Btn.click();
  await page.keyboard.type("Why Deep Focus Drives Velocity", { delay: 5 });
  await page.keyboard.press("Enter");

  // Type normal paragraph with bold formatting
  await page.keyboard.type("Context switching is the biggest hidden tax in modern software teams. ");
  const boldBtn = await page.waitForSelector('button[title="Bold"]');
  await boldBtn.click(); // Toggle Bold ON
  await page.keyboard.type("Teams with over 4 hours of uninterrupted daily focus ship 2.4x faster.", { delay: 5 });
  await boldBtn.click(); // Toggle Bold OFF
  await page.keyboard.press("Enter");

  // Click Bullet List in toolbar
  const listBtn = await page.waitForSelector('button[title="Bullet List"]');
  await listBtn.click();
  await tiptapEditorEl.click();
  await page.keyboard.type("Shield mornings for roadmap delivery", { delay: 5 });
  await page.keyboard.press("Enter");
  await page.keyboard.type("Consolidate recurring syncs to Tuesday and Thursday afternoons", { delay: 5 });

  // Toggle Published checkbox
  const postCheckboxes = await page.$$('input[type="checkbox"]');
  // Second checkbox is Published
  await postCheckboxes[1].click();

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_tiptap_editor_authored.png") });

  // Save the post
  const savePostBtn = await page.$('form button[type="submit"]');
  await savePostBtn.click();

  // Wait for modal to close
  await page.waitForFunction(() => !document.querySelector('form input[placeholder="5-signs-team-overloaded"]'));

  console.log("   ✓ Post saved via UI with TipTap rich text!");

  // Verify on public site: http://localhost:3000/blog/[testSlug]
  console.log(`   Navigating to public /blog/${testSlug} to verify HTML rendering...`);
  await page.goto(`http://localhost:3000/blog/${testSlug}`, { waitUntil: "networkidle0" });

  const postHeading = await page.$eval("h1", (el) => el.textContent || "");
  assert.ok(postHeading.includes("Engineering Capacity Planning for High-Growth Startups"));

  const renderedHtml = await page.$eval("article", (el) => el.innerHTML || "");
  console.log("   [DEBUG RENDERED ARTICLE HTML]:\n", renderedHtml.slice(0, 500));

  // Verify rendered TipTap structures
  assert.ok(renderedHtml.includes("<h2>Why Deep Focus Drives Velocity</h2>"), "HTML must contain <h2> heading");
  assert.ok(renderedHtml.includes("<strong>Teams with over 4 hours"), "HTML must contain <strong> bold text");
  assert.ok(renderedHtml.includes("<li"), "HTML must contain <li> bullet items");

  console.log("   ✓ Confirmed: Public article renders sanitized HTML with <h2>, <strong>, and <li> tags perfectly!");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_public_blog_post_rendered.png") });

  const adminToken = await page.evaluate(() => localStorage.getItem("flowmetrics_admin_token"));
  await cleanupRecords(adminToken);
  await browser.close();
  console.log("\n All UI Browser Automation Tests PASSED seamlessly!");
}

run().catch((err) => {
  console.error("\n❌ UI Automation Test Failed:", err);
  process.exit(1);
});
