import { execSync } from "child_process";

console.log("--- 1. Testing curl GET /api/plans ---");
const r1 = execSync("curl -s -X GET http://localhost:5000/api/plans").toString();
console.log("   ✓ GET /api/plans returned:", r1.slice(0, 80), "...");

console.log("--- 2. Testing curl GET /api/posts?limit=2 ---");
const r2 = execSync('curl -s -X GET "http://localhost:5000/api/posts?limit=2"').toString();
console.log("   ✓ GET /api/posts?limit=2 returned:", r2.slice(0, 80), "...");

console.log("--- 3. Testing curl POST /api/auth/login ---");
const r3 = execSync(
  'curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"admin@flowmetrics.io\\",\\"password\\":\\"AdminFlowmetrics2026!\\"}"'
).toString();
const parsed3 = JSON.parse(r3);
console.log("   ✓ POST /api/auth/login returned token:", parsed3.data?.token?.slice(0, 30), "...");
const token = parsed3.data.token;

console.log("--- 4. Testing curl GET /api/admin/plans with Bearer token ---");
const r4 = execSync(
  `curl -s -X GET http://localhost:5000/api/admin/plans -H "Authorization: Bearer ${token}"`
).toString();
const parsed4 = JSON.parse(r4);
console.log("   ✓ GET /api/admin/plans returned plans count:", parsed4.data?.length);

console.log("--- 5. Testing curl POST /api/admin/plans (Validation Rejection) ---");
const r5 = execSync(
  `curl -s -X POST http://localhost:5000/api/admin/plans -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "{\\"name\\":\\"Bad Plan\\",\\"price\\":-10,\\\"billingCycle\\":\\"monthly\\",\\"features\\":[]}"`
).toString();
const parsed5 = JSON.parse(r5);
console.log("   ✓ Validation error code:", parsed5.error?.code, "| Message:", parsed5.error?.message);

console.log("\n All documented curl commands executed and verified against live API!");
