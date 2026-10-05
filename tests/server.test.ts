import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";

process.env.VERCEL = "1";
process.env.NODE_TEST = "1";
process.env.ADMIN_PASSWORD = "test-only-admin-password";
process.env.SESSION_SECRET = "test-only-session-signing-key-with-more-than-32-bytes";

const { app, calculateRealisticStudentCount } = await import("../server.ts");
const server = createServer(app);
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("administrator authentication", () => {
  it("does not expose student records to an unauthenticated request", async () => {
    const response = await fetch(`${baseUrl}/api/admin/students`);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  });

  it("rejects an incorrect password", async () => {
    const response = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "incorrect-test-password" }),
    });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("set-cookie"), null);
  });

  it("creates a signed, HTTP-only session and authorizes protected records", async () => {
    const login = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    assert.equal(login.status, 200);
    const loginData = await login.json() as {
      authenticated: boolean;
      user: { id: string; role: string };
    };
    assert.equal(loginData.authenticated, true);
    assert.equal(loginData.user.id, "root-admin");
    assert.equal(loginData.user.role, "admin");

    const setCookie = login.headers.get("set-cookie");
    assert.ok(setCookie);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Strict/i);
    assert.match(setCookie, /Secure/i);
    const cookie = setCookie.split(";")[0];

    const records = await fetch(`${baseUrl}/api/admin/students`, {
      headers: { Cookie: cookie },
    });
    assert.equal(records.status, 200);
    assert.equal(records.headers.get("cache-control"), "private, no-store");
    assert.ok(Array.isArray(await records.json()));

    const parentReport = await fetch(`${baseUrl}/api/admin/parent-report`, {
      headers: { Cookie: cookie },
    });
    assert.equal(parentReport.status, 200);

    const logout = await fetch(`${baseUrl}/api/admin/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });

  it("reports no administrator session when the root password is empty", async () => {
    const configuredPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_PASSWORD = "";
    try {
      const response = await fetch(`${baseUrl}/api/admin/session`);
      assert.equal(response.status, 200);
      assert.equal((await response.json() as { authenticated: boolean }).authenticated, false);
    } finally {
      process.env.ADMIN_PASSWORD = configuredPassword;
    }
  });
});

describe("registered accounts and role permissions", () => {
  it("creates student-only accounts and enforces server-owned role changes", async () => {
    const firstEmail = `test-${randomUUID()}@example.test`;
    const secondEmail = `test-${randomUUID()}@example.test`;
    const password = "safe-test-password-123";

    const registerAccount = async (email: string, name: string) => fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "admin" }),
    });

    const registration = await registerAccount(firstEmail, "Test Student");
    assert.equal(registration.status, 201);
    const created = await registration.json() as { user: { id: string; role: string; email: string } };
    assert.equal(created.user.role, "student");
    assert.equal(created.user.email, firstEmail);
    assert.equal(JSON.stringify(created).includes("password"), false);
    const studentCookie = registration.headers.get("set-cookie")?.split(";")[0];
    assert.ok(studentCookie);

    const duplicate = await registerAccount(firstEmail, "Test Student");
    assert.equal(duplicate.status, 409);
    const secondRegistration = await registerAccount(secondEmail, "Second Test Student");
    assert.equal(secondRegistration.status, 201);

    const failedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: firstEmail, password: "wrong-test-password" }),
    });
    assert.equal(failedLogin.status, 401);

    const accountLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: firstEmail, password }),
    });
    assert.equal(accountLogin.status, 200);
    const signedInCookie = accountLogin.headers.get("set-cookie")?.split(";")[0];
    assert.ok(signedInCookie);
    const me = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: signedInCookie } });
    assert.equal((await me.json() as { user: { id: string } }).user.id, created.user.id);
    const denied = await fetch(`${baseUrl}/api/admin/users`, { headers: { Cookie: studentCookie } });
    assert.equal(denied.status, 403);

    const rootLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    });
    const rootCookie = rootLogin.headers.get("set-cookie")?.split(";")[0];
    assert.equal(rootLogin.status, 200);
    assert.ok(rootCookie);

    const rootPromote = await fetch(`${baseUrl}/api/admin/users/${created.user.id}/role`, {
      method: "PATCH",
      headers: { Cookie: rootCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });
    assert.equal(rootPromote.status, 200);
    const promotedSession = await fetch(`${baseUrl}/api/admin/session`, {
      headers: { Cookie: studentCookie },
    });
    assert.equal((await promotedSession.json() as { authenticated: boolean }).authenticated, true);

    const secondUser = await secondRegistration.json() as { user: { id: string } };
    const peerPromotion = await fetch(`${baseUrl}/api/admin/users/${secondUser.user.id}/role`, {
      method: "PATCH",
      headers: { Cookie: studentCookie, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });
    assert.equal(peerPromotion.status, 403);

    const adminList = await fetch(`${baseUrl}/api/admin/users`, { headers: { Cookie: studentCookie } });
    assert.equal(adminList.status, 200);
    const accounts = await adminList.json() as Array<{ email: string; role: string }>;
    assert.equal(accounts.find((account) => account.email === firstEmail)?.role, "admin");

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: studentCookie },
    });
    assert.equal(logout.status, 204);
  });
});

describe("public platform stats", () => {
  it("caps every hourly increase at three and exposes the requested 12+ experience", async () => {
    const epoch = Date.UTC(2026, 9, 5, 0, 0, 0);
    let previousCount = calculateRealisticStudentCount(epoch).count;

    for (let hour = 1; hour <= 24 * 30; hour += 1) {
      const stats = calculateRealisticStudentCount(epoch + hour * 60 * 60 * 1000);
      const increase = stats.count - previousCount;
      assert.ok(increase >= 0 && increase <= 3, `hour ${hour} increased by ${increase}`);
      assert.ok(stats.lastHourIncrease >= 0 && stats.lastHourIncrease <= 3);
      previousCount = stats.count;
    }

    const response = await fetch(`${baseUrl}/api/stats`);
    assert.equal(response.status, 200);
    const stats = await response.json() as { experienceYears: string; lastHourIncrease: number };
    assert.equal(stats.experienceYears, "12+");
    assert.ok(stats.lastHourIncrease >= 0 && stats.lastHourIncrease <= 3);
  });
});
