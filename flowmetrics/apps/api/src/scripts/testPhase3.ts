import { createApp } from "../app.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { config } from "../config/env.js";
import { signToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import { Server } from "http";

async function runPhase3Tests(): Promise<void> {
  console.log("=== Starting Phase 3 Verification Tests ===");
  await connectDB();

  const app = createApp();
  const testPort = 5056;
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
    const adminEmail = config.ADMIN_EMAIL;
    const adminPassword = config.ADMIN_PASSWORD;

    // Test 1: Successful Admin Login
    const validLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const validLoginJson = await validLoginRes.json() as any;
    assert(validLoginRes.status === 200, "POST /api/auth/login with correct credentials returns HTTP 200");
    assert(typeof validLoginJson.data?.token === "string", "Login returns a valid JWT string in data.token");
    const adminToken = validLoginJson.data.token;

    // Test 2: Token Payload verification (strictly minimal)
    const decoded = jwt.decode(adminToken) as any;
    assert(Boolean(decoded.sub), "JWT payload contains 'sub' (userId)");
    assert(decoded.role === "admin", "JWT payload contains role === 'admin'");
    assert(decoded.passwordHash === undefined, "JWT payload does NOT contain passwordHash");
    assert(decoded.password === undefined, "JWT payload does NOT contain password");
    assert(decoded.email === undefined, "JWT payload does NOT leak email");

    // Test 3: Bad Password Login
    const wrongPasswordRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: "IncorrectPassword123!" }),
    });
    const wrongPasswordJson = await wrongPasswordRes.json() as any;
    assert(wrongPasswordRes.status === 401, "POST /api/auth/login with wrong password returns HTTP 401");
    assert(wrongPasswordJson.error?.code === "UNAUTHORIZED", "Wrong password error code is UNAUTHORIZED");
    assert(wrongPasswordJson.error?.message === "Invalid email or password.", "Wrong password error message is generic");

    // Test 4: Unknown Email Login
    const wrongEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@flowmetrics.io", password: adminPassword }),
    });
    const wrongEmailJson = await wrongEmailRes.json() as any;
    assert(wrongEmailRes.status === 401, "POST /api/auth/login with non-existent email returns HTTP 401");
    assert(wrongEmailJson.error?.code === "UNAUTHORIZED", "Wrong email error code is UNAUTHORIZED");
    assert(wrongEmailJson.error?.message === "Invalid email or password.", "Wrong email error message is generic");

    // Test 5: Exact equality check between wrong email & wrong password responses
    assert(
      JSON.stringify(wrongPasswordJson) === JSON.stringify(wrongEmailJson),
      "401 error response JSON shape and message are 100% identical between wrong email and wrong password"
    );

    // Test 6: Access protected admin route without token -> 401
    const noTokenRes = await fetch(`${baseUrl}/admin/verify`);
    const noTokenJson = await noTokenRes.json() as any;
    assert(noTokenRes.status === 401, "Admin route without Authorization header returns HTTP 401");
    assert(noTokenJson.error?.code === "UNAUTHORIZED", "Missing token returns UNAUTHORIZED code");

    // Test 7: Access protected admin route with malformed/garbage token -> 401
    const badTokenRes = await fetch(`${baseUrl}/admin/verify`, {
      headers: { Authorization: "Bearer garbage_invalid_jwt_token" },
    });
    const badTokenJson = await badTokenRes.json() as any;
    assert(badTokenRes.status === 401, "Admin route with malformed token returns HTTP 401");
    assert(badTokenJson.error?.code === "UNAUTHORIZED", "Malformed token returns UNAUTHORIZED code");
    assert(badTokenJson.error?.message === "Invalid authentication token.", "Malformed token returns clear error message");

    // Test 7b: Access protected admin route with EXPIRED token (TokenExpiredError) -> 401
    const expiredToken = jwt.sign({ sub: "test-admin", role: "admin" }, config.JWT_SECRET, {
      expiresIn: "-10s", // Expired 10 seconds ago
    });
    const expiredTokenRes = await fetch(`${baseUrl}/admin/verify`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const expiredTokenJson = await expiredTokenRes.json() as any;
    assert(expiredTokenRes.status === 401, "Admin route with expired token specifically returns HTTP 401 (not 500 crash)");
    assert(expiredTokenJson.error?.code === "UNAUTHORIZED", "Expired token returns UNAUTHORIZED code");
    assert(expiredTokenJson.error?.message === "Token has expired.", "Expired token message specifically distinguishes expiry");

    // Test 8: Access protected admin route with a valid token having wrong role ("user") -> 403 Forbidden
    const userRoleToken = signToken("fake-user-id-123", "user");
    const userRoleRes = await fetch(`${baseUrl}/admin/verify`, {
      headers: { Authorization: `Bearer ${userRoleToken}` },
    });
    const userRoleJson = await userRoleRes.json() as any;
    assert(userRoleRes.status === 403, "Admin route with valid token but non-admin role returns HTTP 403 (Forbidden)");
    assert(userRoleJson.error?.code === "FORBIDDEN", "Wrong role returns FORBIDDEN code");

    // Test 9: Access protected admin route with valid admin token -> 200 OK
    const adminRes = await fetch(`${baseUrl}/admin/verify`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminJson = await adminRes.json() as any;
    assert(adminRes.status === 200, "Admin route with valid admin token returns HTTP 200");
    assert(adminJson.data.user.role === "admin", "Admin route receives decoded req.user with role === 'admin'");

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
    console.log("=== Finished Phase 3 Verification Tests ===");
  }
}

runPhase3Tests();
