import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { signToken } from "../utils/token.js";
import { Server } from "http";

async function runPhase5Tests(): Promise<void> {
  console.log("=== Starting Phase 5 Verification Tests (Rate Limiting) ===");
  await connectDB();

  const app = createApp();
  const testPort = 5058;
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

    // --- CHECK 1: TRIPPING THE LOGIN RATE LIMITER (MAX: 5 ATTEMPTS) ---
    console.log("\n--- [Tripping Login Rate Limiter] ---");
    let sixthResponseStatus = 0;
    let sixthResponseBody: any = null;

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@flowmetrics.io", password: "wrong-password" }),
      });

      console.log(`Attempt ${i}: HTTP ${res.status}`);

      if (i <= 5) {
        assert(res.status === 401, `Attempt ${i} allowed through to auth (got HTTP 401)`);
        assert(res.headers.get("ratelimit-limit") === "5", "RateLimit-Limit header is exposed ('5')");
        assert(Boolean(res.headers.get("ratelimit-remaining")), "RateLimit-Remaining header is exposed");
      } else {
        sixthResponseStatus = res.status;
        sixthResponseBody = await res.json() as any;
      }
    }

    assert(sixthResponseStatus === 429, `6th login attempt returns HTTP 429 (got ${sixthResponseStatus})`);
    assert(sixthResponseBody?.success === false, "429 response has success: false");
    assert(sixthResponseBody?.error?.code === "RATE_LIMIT_EXCEEDED", "429 error code is RATE_LIMIT_EXCEEDED");
    assert(
      sixthResponseBody?.error?.message?.includes("Too many login attempts"),
      "429 message provides clear guidance about rate limit"
    );
    assert(
      Array.isArray(sixthResponseBody?.error?.details),
      "429 error includes details array conforming to standard error shape"
    );

    // --- CHECK 2: GET ROUTES ARE EXEMPT FROM RATE LIMITING ---
    console.log("\n--- [Verifying GET Admin Routes Are NOT Rate-Limited] ---");
    let allGetPlansSuccessful = true;
    for (let i = 1; i <= 10; i++) {
      const getPlansRes = await fetch(`${baseUrl}/admin/plans`, { headers: adminHeaders });
      if (getPlansRes.status !== 200) {
        allGetPlansSuccessful = false;
      }
    }
    assert(allGetPlansSuccessful, "Admin GET /admin/plans remains accessible (never blocked by rate limiter)");

    let allGetPostsSuccessful = true;
    for (let i = 1; i <= 10; i++) {
      const getPostsRes = await fetch(`${baseUrl}/admin/posts`, { headers: adminHeaders });
      if (getPostsRes.status !== 200) {
        allGetPostsSuccessful = false;
      }
    }
    assert(allGetPostsSuccessful, "Admin GET /admin/posts remains accessible (never blocked by rate limiter)");

    // --- CHECK 3: AUTH RUNS BEFORE WRITELIMITER ON ADMIN ROUTES ---
    console.log("\n--- [Verifying Auth Middleware Precedes Write Limiter] ---");
    // An unauthenticated request to POST /admin/plans must receive 401 Unauthorized,
    // not consume rate-limit budget or return 429
    const unauthedPostRes = await fetch(`${baseUrl}/admin/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Unauthenticated Test", price: 10, billingCycle: "monthly", features: ["Test"] }),
    });
    const unauthedJson = await unauthedPostRes.json() as any;
    assert(unauthedPostRes.status === 401, "Unauthenticated write receives 401 UNAUTHORIZED (auth runs before writeLimiter)");
    assert(unauthedJson.error?.code === "UNAUTHORIZED", "Error code is UNAUTHORIZED");

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
    console.log("=== Finished Phase 5 Verification Tests ===");
  }
}

runPhase5Tests();
