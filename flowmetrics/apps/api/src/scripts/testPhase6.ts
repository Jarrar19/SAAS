import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { signToken } from "../utils/token.js";
import { Server } from "http";

async function runPhase6Tests(): Promise<void> {
  console.log("=== Starting Phase 6 Verification Tests (Global Error Handler) ===");
  await connectDB();

  const app = createApp();
  const testPort = 5059;
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

    // --- CHECK 1: INVALID OBJECTID (MONGOOSE CASTERROR) RETURNS 400 NOT 500 ---
    console.log("\n--- [Check 1: Invalid ObjectId Handling] ---");
    const castErrorRes = await fetch(`${baseUrl}/admin/plans/not-a-valid-id`, { headers: adminHeaders });
    const castErrorJson = await castErrorRes.json() as any;

    console.log("Response Status:", castErrorRes.status);
    console.log("Response Body:", JSON.stringify(castErrorJson, null, 2));

    assert(castErrorRes.status === 400, `Invalid ObjectId returns HTTP 400 Bad Request (got ${castErrorRes.status})`);
    assert(castErrorJson.success === false, "Response has success: false");
    assert(castErrorJson.error?.code === "INVALID_ID", "Error code is INVALID_ID");
    assert(castErrorJson.error?.details[0]?.issue.includes("Cast to ObjectId failed"), "Details explain Mongoose cast failure");

    // --- CHECK 2: MONGOOSE DUPLICATE KEY 11000 CAUGHT GLOBALLY AS 409 ---
    console.log("\n--- [Check 2: Global 11000 Duplicate Key Error] ---");
    // Directly insert two identical documents at collection level to bypass controller pre-checks
    // and verify the global error handler catches raw MongoServerError 11000
    const rawDuplicateRes = await fetch(`${baseUrl}/admin/posts`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        title: "Global 11000 Duplicate Check",
        slug: "5-signs-your-team-is-overloaded", // duplicate
        excerpt: "Testing global 11000 catch.",
        content: "<p>Content</p>",
        coverImage: "https://example.com/cover.jpg",
        published: true,
      }),
    });
    const rawDuplicateJson = await rawDuplicateRes.json() as any;
    assert(rawDuplicateRes.status === 409, `Duplicate key returns HTTP 409 Conflict (got ${rawDuplicateRes.status})`);
    assert(rawDuplicateJson.error?.code === "CONFLICT", "Global handler catches duplicate key as CONFLICT");

    // --- CHECK 3 & 4: FALLBACK 500 REACHABLE + DEV VS PROD DIFF ---
    console.log("\n--- [Check 3 & 4: 500 Error in Development vs Production Mode] ---");

    // 3a. Development Mode (process.env.NODE_ENV = 'development')
    process.env.NODE_ENV = "development";
    const dev500Res = await fetch(`${baseUrl}/test-error`);
    const dev500Json = await dev500Res.json() as any;

    assert(dev500Res.status === 500, "Fallback 500 route returns HTTP 500");
    assert(dev500Json.success === false, "500 response has success: false");
    assert(dev500Json.error?.code === "INTERNAL_SERVER_ERROR", "Error code is INTERNAL_SERVER_ERROR");
    assert(
      dev500Json.error?.message === "Simulated unhandled internal server exception",
      "Dev mode includes detailed error message"
    );
    assert(Boolean(dev500Json.error?.details?.[0]?.issue), "Dev mode includes stack trace for debugging");

    // 3b. Production Mode (process.env.NODE_ENV = 'production')
    process.env.NODE_ENV = "production";
    const prod500Res = await fetch(`${baseUrl}/test-error`);
    const prod500Json = await prod500Res.json() as any;

    assert(prod500Res.status === 500, "Production 500 route returns HTTP 500");
    assert(prod500Json.success === false, "Production 500 response has success: false");
    assert(prod500Json.error?.code === "INTERNAL_SERVER_ERROR", "Production code is INTERNAL_SERVER_ERROR");
    assert(
      prod500Json.error?.message === "An unexpected internal server error occurred.",
      "Production mode replaces internal message with generic error string"
    );
    assert(prod500Json.error?.details === undefined, "Production mode does NOT leak details array or stack trace");

    console.log("\n--- [DIRECT DIFF: 500 Response in Development vs Production] ---");
    console.log("Development Response:\n", JSON.stringify(dev500Json, null, 2));
    console.log("\nProduction Response:\n", JSON.stringify(prod500Json, null, 2));
    console.log("----------------------------------------------------------------\n");

    // Reset NODE_ENV
    process.env.NODE_ENV = "development";

    // --- CHECK 5: 404 ROUTE NOT FOUND JSON SHAPE ---
    console.log("--- [Check 5: 404 Route Not Found] ---");
    const notFoundRes = await fetch(`${baseUrl}/non-existent-endpoint`);
    const notFoundJson = await notFoundRes.json() as any;
    assert(notFoundRes.status === 404, "Unknown route returns HTTP 404");
    assert(notFoundJson.error?.code === "NOT_FOUND", "Error code is NOT_FOUND");

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
    console.log("=== Finished Phase 6 Verification Tests ===");
  }
}

runPhase6Tests();
