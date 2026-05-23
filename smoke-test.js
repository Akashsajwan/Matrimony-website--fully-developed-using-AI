const { spawn } = require("node:child_process");
const path = require("node:path");

const testPort = String(5100 + Math.floor(Math.random() * 1000));
const testDb = path.join(__dirname, "data", `smoke-test-${Date.now()}.json`);
const server = spawn(process.execPath, ["server.js"], { cwd: __dirname, env: { ...process.env, PORT: testPort, DB_PATH: testDb }, stdio: ["ignore", "pipe", "pipe"] });
const base = `http://127.0.0.1:${testPort}`;

function waitForServer() {
  return new Promise((resolve, reject) => {
    const started = setTimeout(() => reject(new Error("Server did not start in time")), 6000);
    server.stdout.on("data", data => {
      if (String(data).includes("Shubhh Rishtey dynamic site running")) {
        clearTimeout(started);
        resolve();
      }
    });
    server.stderr.on("data", data => reject(new Error(String(data))));
  });
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `${response.status} ${path}`);
  return data;
}

async function requestError(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json();
  if (response.ok) throw new Error(`Expected ${path} to fail`);
  return data;
}

(async () => {
  try {
    await waitForServer();
    const bootstrap = await request("/api/bootstrap");
    const missingLogin = await requestError("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: `missing${Date.now()}@example.com`, password: "none" })
    });
    if (missingLogin.error !== "no user found, create account first") throw new Error("Missing user login error changed.");
    const email = `demo${Date.now()}@subhrishte.test`;
    const testPassword = "test1234";
    const registered = await request("/api/register", {
      method: "POST",
      body: JSON.stringify({ name: "Dynamic Demo User", email, password: testPassword, age: 27, gender: "Woman", city: "Lucknow", profession: "Teacher", religion: "Hindu", community: "Kayastha", about: "Testing the dynamic site." })
    });
    const token = registered.token;
    await request("/api/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone: "+91 90000 00000", country: "India", state: "Uttar Pradesh", city: "Lucknow", education: "M.A.", profession: "Teacher", income: "Rs 6-8 LPA", familyType: "Nuclear", partnerPreference: "Respectful family-oriented match." })
    });
    const plan = await request("/api/plan", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan: "Silver" }) });
    const interest = await request("/api/interests", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ profileId: bootstrap.profiles[0].id }) });
    await request("/api/shortlist", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ profileId: bootstrap.profiles[1].id }) });
    const chat = await request("/api/messages", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ profileId: bootstrap.profiles[0].id, text: "Hello, nice to meet you." }) });
    const dashboard = await request("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } });
    const forgot = await request("/api/forgot-password", {
      method: "POST",
      body: JSON.stringify({ name: "Dynamic Demo User", email })
    });
    const resetToken = forgot.resetUrl.split("/").at(-1);
    await request("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, password: "newpass123" })
    });
    await request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password: "newpass123" })
    });
    await request("/api/privacy-settings", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ profileVisibility: "Members only", photoPrivacy: "Approved interests", contactPrivacy: "After approval", searchVisibility: "Visible in search", dataSharing: "Do not share outside Shubhh Rishtey", loginAlerts: true, twoStep: true })
    });
    await request("/api/contact", { method: "POST", body: JSON.stringify({ name: "Smoke Visitor", email: "visitor@example.com", message: "Testing contact form." }) });
    const admin = await request("/api/login", { method: "POST", body: JSON.stringify({ email: "akash241511@gmail.com", password: "123456" }) });
    const adminStats = await request("/api/admin/stats", { headers: { Authorization: `Bearer ${admin.token}` } });
    const addedAdmin = await request("/api/admin/admins", { method: "POST", headers: { Authorization: `Bearer ${admin.token}` }, body: JSON.stringify({ name: "Second Admin", email: `second${Date.now()}@gmail.com`, password: "admin2", canDeleteAdmins: true }) });
    await request("/api/admin/admins", { method: "PATCH", headers: { Authorization: `Bearer ${admin.token}` }, body: JSON.stringify({ id: addedAdmin.user.id, canDeleteAdmins: false }) });
    await request(`/api/admin/admins?id=${addedAdmin.user.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${admin.token}` } });
    await request("/api/admin/settings", { method: "PUT", headers: { Authorization: `Bearer ${admin.token}` }, body: JSON.stringify({ heroTrust: "Most trusted matrimonial website" }) });
    await request("/api/interests", { method: "PATCH", headers: { Authorization: `Bearer ${admin.token}` }, body: JSON.stringify({ id: interest.interests.at(-1).id, status: "accepted" }) }).catch(() => null);
    console.log(JSON.stringify({ ok: true, profiles: bootstrap.profiles.length, registered: registered.user.email, plan: plan.user.plan, messages: chat.messages.length, shortlist: dashboard.counts.shortlist, contacts: adminStats.contacts.length, users: adminStats.stats.currentUsers }, null, 2));
  } finally {
    server.kill();
  }
})().catch(error => {
  server.kill();
  console.error(error);
  process.exit(1);
});
