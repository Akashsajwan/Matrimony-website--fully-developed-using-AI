const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(root, "data", "db.json");
const dbDir = path.dirname(dbPath);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const MASTER_ADMIN_EMAIL = "akash241511@gmail.com";

const seedProfiles = [
  { id: 1, name: "Aaradhya Sharma", email: "aaradhya@example.com", age: 26, gender: "Woman", city: "Delhi", job: "Doctor", religion: "Hindu", community: "Brahmin", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80", about: "Warm, family-oriented, and loves classical music.", verified: true },
  { id: 2, name: "Rohan Mehta", email: "rohan@example.com", age: 29, gender: "Man", city: "Mumbai", job: "Product Manager", religion: "Hindu", community: "Gujarati", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80", about: "Calm, ambitious, and looking for a thoughtful life partner.", verified: true },
  { id: 3, name: "Naina Verma", email: "naina@example.com", age: 25, gender: "Woman", city: "Jaipur", job: "Architect", religion: "Hindu", community: "Rajput", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", about: "Creative, respectful, and close to family values.", verified: true },
  { id: 4, name: "Arjun Kapoor", email: "arjun@example.com", age: 31, gender: "Man", city: "Bengaluru", job: "Software Engineer", religion: "Hindu", community: "Punjabi", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80", about: "Tech professional who enjoys travel and meaningful conversations.", verified: true },
  { id: 5, name: "Meera Iyer", email: "meera@example.com", age: 27, gender: "Woman", city: "Chennai", job: "CA", religion: "Hindu", community: "Tamil", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=900&q=80", about: "Balanced, practical, and searching for a respectful match.", verified: true },
  { id: 6, name: "Kabir Sinha", email: "kabir@example.com", age: 30, gender: "Man", city: "Kolkata", job: "Entrepreneur", religion: "Hindu", community: "Kayastha", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80", about: "Business minded, optimistic, and family-first.", verified: true },
  { id: 7, name: "Ananya Rao", email: "ananya@example.com", age: 24, gender: "Woman", city: "Pune", job: "Designer", religion: "Hindu", community: "Marathi", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80", about: "Gentle, artistic, and values honesty above all.", verified: true },
  { id: 8, name: "Vivaan Joshi", email: "vivaan@example.com", age: 28, gender: "Man", city: "Ahmedabad", job: "Civil Engineer", religion: "Hindu", community: "Gujarati", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80", about: "Grounded, sincere, and ready for marriage.", verified: true }
];

const plans = [
  { name: "Free", price: "Rs 0", note: "Current plan", features: ["Browse profiles", "Send 2 interests daily", "Basic search", "Limited message preview"], restricted: true },
  { name: "Silver", price: "Rs 149/month", note: "For active search", features: ["Send 25 interests daily", "Direct chat unlock", "See phone requests", "Priority profile listing"] },
  { name: "Gold", price: "Rs 349/month", note: "Rs 3000/year option", features: ["Unlimited interests", "Unlimited messages", "Verified badge highlight", "Family contact access", "Relationship manager support"], featured: true }
];

function seedDb() {
  return {
    users: [
      { id: 1, name: "Akash Admin", email: MASTER_ADMIN_EMAIL, password: "123456", role: "admin", plan: "Gold", canDeleteAdmins: true, createdAt: new Date().toISOString() }
    ],
    profiles: seedProfiles,
    plans,
    sessions: {},
    interests: [],
    shortlists: [],
    contacts: [],
    notifications: [],
    passwordResets: [],
    resetEmails: [],
    messages: {},
    settings: defaultSettings(),
    views: 1284,
    paired: 11406
  };
}

function defaultSettings() {
  return {
    siteName: "Shubhh Rishtey",
    heroHeading: "Find your Right Match here",
    heroSubheading: "Find genuine, verified profiles and start your journey toward a happy marriage",
    heroTrust: "Most trusted metromonly website",
    phone: "+91 98765 43210",
    email: "care@shubbhrishtey.com",
    country: "India"
  };
}

function ensureDb() {
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
  if (!fs.existsSync(dbPath)) writeDb(seedDb());
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  let changed = false;
  for (const key of ["shortlists", "contacts", "notifications", "passwordResets", "resetEmails"]) {
    if (!Array.isArray(db[key])) {
      db[key] = [];
      changed = true;
    }
  }
  if (!Array.isArray(db.interests)) {
    db.interests = [];
    changed = true;
  }
  if (!db.messages || typeof db.messages !== "object") {
    db.messages = {};
    changed = true;
  }
  if (!db.settings || typeof db.settings !== "object") {
    db.settings = defaultSettings();
    changed = true;
  }
  const master = db.users.find(user => String(user.email).toLowerCase() === MASTER_ADMIN_EMAIL);
  if (master) {
    if (master.role !== "admin") {
      master.role = "admin";
      changed = true;
    }
    if (!master.canDeleteAdmins) {
      master.canDeleteAdmins = true;
      changed = true;
    }
  }
  if (changed) writeDb(db);
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Body too large"));
      }
    });
    request.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  safeUser.profileVisibility = safeUser.profileVisibility || "Members only";
  safeUser.photoPrivacy = safeUser.photoPrivacy || "Approved interests";
  safeUser.contactPrivacy = safeUser.contactPrivacy || "After approval";
  safeUser.loginAlerts = safeUser.loginAlerts !== false;
  safeUser.twoStep = Boolean(safeUser.twoStep);
  return safeUser;
}

function currentUser(request, db) {
  const auth = request.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const userId = db.sessions[token];
  return userId ? db.users.find(user => user.id === userId) : null;
}

function newToken() {
  return crypto.randomBytes(24).toString("hex");
}

function stats(db) {
  const memberUsers = db.users.filter(user => user.role === "member");
  return {
    currentUsers: db.users.length,
    registered: db.users.length,
    dailyViewers: db.views,
    paired: db.paired,
    women: db.profiles.filter(profile => profile.gender === "Woman").length,
    men: db.profiles.filter(profile => profile.gender === "Man").length,
    profiles: db.profiles.length,
    interests: db.interests.length,
    shortlists: db.shortlists ? db.shortlists.length : 0,
    contacts: db.contacts ? db.contacts.length : 0,
    paidUsers: memberUsers.filter(user => user.plan !== "Free").length
  };
}

function nextId(items) {
  return items.length ? Math.max(...items.map(item => Number(item.id) || 0)) + 1 : 1;
}

function profileForUser(user, db) {
  return db.profiles.find(profile => profile.id === user.profileId);
}

async function handleApi(request, response, url) {
  const db = readDb();
  const user = currentUser(request, db);

  if (request.method === "GET" && url.pathname === "/api/bootstrap") {
    db.views += 1;
    writeDb(db);
    return sendJson(response, 200, { user: publicUser(user), profiles: db.profiles, plans: db.plans, stats: stats(db), settings: db.settings || defaultSettings() });
  }

  if (request.method === "GET" && url.pathname === "/api/profiles") {
    const q = String(url.searchParams.get("q") || "").toLowerCase();
    const gender = String(url.searchParams.get("gender") || "");
    const city = String(url.searchParams.get("city") || "");
    const results = db.profiles.filter(profile => {
      const text = `${profile.name} ${profile.city} ${profile.job} ${profile.religion} ${profile.community}`.toLowerCase();
      return (!q || text.includes(q)) && (!gender || profile.gender === gender) && (!city || profile.city === city);
    });
    return sendJson(response, 200, { profiles: results, stats: stats(db) });
  }

  if (request.method === "GET" && url.pathname === "/api/profile") {
    const profile = db.profiles.find(item => item.id === Number(url.searchParams.get("id")));
    if (!profile) return sendJson(response, 404, { error: "Profile not found." });
    return sendJson(response, 200, { profile });
  }

  if (request.method === "POST" && url.pathname === "/api/contact") {
    const body = await parseBody(request);
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    if (!name || !email || !message) return sendJson(response, 400, { error: "Name, email, and message are required." });
    if (!Array.isArray(db.contacts)) db.contacts = [];
    db.contacts.push({ id: nextId(db.contacts), name, email, message, status: "new", createdAt: new Date().toISOString() });
    writeDb(db);
    return sendJson(response, 201, { ok: true, stats: stats(db) });
  }

  if (request.method === "POST" && url.pathname === "/api/login") {
    const body = await parseBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    if (!email || !password) return sendJson(response, 400, { error: "Email and password are required." });

    const loginUser = db.users.find(item => item.email.toLowerCase() === email);
    if (!loginUser) return sendJson(response, 404, { error: "no user found, create account first" });
    if (loginUser.password !== password) return sendJson(response, 401, { error: "Incorrect password." });

    const token = newToken();
    db.sessions[token] = loginUser.id;
    writeDb(db);
    return sendJson(response, 200, { token, user: publicUser(loginUser), profiles: db.profiles, plans: db.plans, stats: stats(db), settings: db.settings || defaultSettings() });
  }

  if (request.method === "POST" && url.pathname === "/api/forgot-password") {
    const body = await parseBody(request);
    const name = String(body.name || "").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || !email) return sendJson(response, 400, { error: "Name and email are required." });
    const resetUser = db.users.find(item => item.email.toLowerCase() === email && item.name.toLowerCase() === name);
    if (!resetUser) return sendJson(response, 404, { error: "no user found, create account first" });
    const token = newToken();
    const resetUrl = `/index.html#reset-password/${token}`;
    db.passwordResets = (db.passwordResets || []).filter(item => item.userId !== resetUser.id);
    db.passwordResets.push({ token, userId: resetUser.id, createdAt: new Date().toISOString(), used: false });
    db.resetEmails = db.resetEmails || [];
    db.resetEmails.push({ id: nextId(db.resetEmails), to: resetUser.email, name: resetUser.name, resetUrl, createdAt: new Date().toISOString(), status: "queued" });
    writeDb(db);
    return sendJson(response, 200, { ok: true, message: "Password reset link sent to your email.", resetUrl });
  }

  if (request.method === "POST" && url.pathname === "/api/reset-password") {
    const body = await parseBody(request);
    const token = String(body.token || "").trim();
    const password = String(body.password || "").trim();
    if (!token || !password) return sendJson(response, 400, { error: "Reset token and new password are required." });
    if (password.length < 4) return sendJson(response, 400, { error: "Password must be at least 4 characters." });
    const reset = (db.passwordResets || []).find(item => item.token === token && !item.used);
    if (!reset) return sendJson(response, 404, { error: "Reset link is invalid or already used." });
    const resetUser = db.users.find(item => item.id === reset.userId);
    if (!resetUser) return sendJson(response, 404, { error: "no user found, create account first" });
    resetUser.password = password;
    reset.used = true;
    reset.usedAt = new Date().toISOString();
    writeDb(db);
    return sendJson(response, 200, { ok: true, message: "Password reset successfully. Please login with your new password." });
  }

  if (request.method === "POST" && url.pathname === "/api/register") {
    const body = await parseBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const password = String(body.password || "").trim();
    if (!email || !name || !password) return sendJson(response, 400, { error: "Name, email, and password are required." });
    if (password.length < 4) return sendJson(response, 400, { error: "Password must be at least 4 characters." });
    if (db.users.some(item => item.email.toLowerCase() === email)) return sendJson(response, 409, { error: "This email is already registered." });

    const profile = {
      id: nextId(db.profiles),
      name,
      email,
      age: Number(body.age) || 18,
      gender: body.gender || "Woman",
      city: body.city || "India",
      job: body.profession || body.job || "Not specified",
      religion: body.religion || "Not specified",
      community: body.community || "Not specified",
      about: body.about || "New member looking for a genuine marriage match.",
      image: body.gender === "Man" ? seedProfiles[3].image : seedProfiles[0].image,
      verified: false
    };
    const newUser = {
      id: nextId(db.users),
      name,
      email,
      password,
      role: "member",
      plan: "Free",
      profileId: profile.id,
      createdAt: new Date().toISOString()
    };

    db.profiles.push(profile);
    db.users.push(newUser);
    const token = newToken();
    db.sessions[token] = newUser.id;
    writeDb(db);
    return sendJson(response, 201, { token, user: publicUser(newUser), profiles: db.profiles, plans: db.plans, stats: stats(db) });
  }

  if (request.method === "POST" && url.pathname === "/api/logout") {
    const auth = request.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token) delete db.sessions[token];
    writeDb(db);
    return sendJson(response, 200, { ok: true });
  }

  if (!user) return sendJson(response, 401, { error: "Please login first." });

  if (request.method === "POST" && url.pathname === "/api/change-password") {
    const body = await parseBody(request);
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (!newPassword || newPassword.length < 4) return sendJson(response, 400, { error: "New password must be at least 4 characters." });
    if (user.password !== currentPassword) return sendJson(response, 401, { error: "Current password is incorrect." });
    user.password = newPassword;
    writeDb(db);
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "PUT" && url.pathname === "/api/privacy-settings") {
    const body = await parseBody(request);
    user.profileVisibility = body.profileVisibility || user.profileVisibility || "Members only";
    user.photoPrivacy = body.photoPrivacy || user.photoPrivacy || "Approved interests";
    user.contactPrivacy = body.contactPrivacy || user.contactPrivacy || "After approval";
    user.loginAlerts = Boolean(body.loginAlerts);
    user.twoStep = Boolean(body.twoStep);
    user.searchVisibility = body.searchVisibility || user.searchVisibility || "Visible in search";
    user.dataSharing = body.dataSharing || user.dataSharing || "Do not share outside Shubhh Rishtey";
    writeDb(db);
    return sendJson(response, 200, { user: publicUser(user) });
  }

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    const myProfile = profileForUser(user, db);
    const incoming = db.interests.filter(interest => interest.toProfileId === user.profileId);
    const sent = db.interests.filter(interest => interest.fromUserId === user.id);
    const shortlistRows = (db.shortlists || []).filter(item => item.userId === user.id);
    const shortlistedProfiles = shortlistRows.map(item => db.profiles.find(profile => profile.id === item.profileId)).filter(Boolean);
    const suggestions = db.profiles.filter(profile => profile.id !== user.profileId).slice(0, 4);
    return sendJson(response, 200, {
      user: publicUser(user),
      profile: myProfile,
      counts: {
        incoming: incoming.length,
        sent: sent.length,
        shortlist: shortlistedProfiles.length,
        messages: Object.keys(db.messages).filter(key => key.startsWith(`${user.id}:`)).length
      },
      incoming,
      sent,
      shortlistedProfiles,
      suggestions,
      stats: stats(db)
    });
  }

  if (request.method === "PUT" && url.pathname === "/api/profile") {
    const body = await parseBody(request);
    user.name = body.name || user.name;
    user.email = body.email || user.email;
    let profile = profileForUser(user, db);
    if (!profile && user.role === "member") {
      profile = { id: nextId(db.profiles), name: user.name, email: user.email, age: 18, gender: "Woman", city: "India", job: "Not specified", religion: "Not specified", community: "Not specified", about: "", image: seedProfiles[0].image, verified: false };
      user.profileId = profile.id;
      db.profiles.push(profile);
    }
    if (profile) {
      const fields = ["name", "email", "phone", "country", "state", "city", "age", "gender", "dob", "height", "maritalStatus", "motherTongue", "religion", "community", "education", "job", "profession", "income", "familyType", "fatherOccupation", "motherOccupation", "siblings", "diet", "manglik", "birthTime", "birthPlace", "about", "partnerPreference"];
      fields.forEach(field => {
        if (body[field] !== undefined) profile[field] = field === "age" ? Number(body[field]) || profile[field] : body[field];
      });
      if (body.profilePhoto) profile.image = body.profilePhoto;
      if (body.profession) profile.job = body.profession;
      user.name = profile.name || user.name;
      user.email = profile.email || user.email;
      user.phone = profile.phone || user.phone;
      user.city = profile.city || user.city;
      user.profileComplete = true;
    }
    writeDb(db);
    return sendJson(response, 200, { user: publicUser(user), profile, profiles: db.profiles, stats: stats(db) });
  }

  if (request.method === "POST" && url.pathname === "/api/plan") {
    const body = await parseBody(request);
    const selected = db.plans.find(plan => plan.name === body.plan);
    if (!selected) return sendJson(response, 400, { error: "Invalid plan." });
    user.plan = selected.name;
    writeDb(db);
    return sendJson(response, 200, { user: publicUser(user), stats: stats(db) });
  }

  if (request.method === "POST" && url.pathname === "/api/interests") {
    const body = await parseBody(request);
    const targetProfile = db.profiles.find(profile => profile.id === Number(body.profileId));
    if (!targetProfile) return sendJson(response, 404, { error: "Profile not found." });
    db.interests.push({ id: nextId(db.interests), fromUserId: user.id, toProfileId: targetProfile.id, status: "pending", createdAt: new Date().toISOString() });
    writeDb(db);
    return sendJson(response, 201, { ok: true, interests: db.interests.filter(interest => interest.fromUserId === user.id) });
  }

  if (request.method === "PATCH" && url.pathname === "/api/interests") {
    const body = await parseBody(request);
    const interest = db.interests.find(item => item.id === Number(body.id));
    if (!interest) return sendJson(response, 404, { error: "Request not found." });
    if (interest.toProfileId !== user.profileId && user.role !== "admin") return sendJson(response, 403, { error: "You cannot update this request." });
    interest.status = ["accepted", "declined", "pending"].includes(body.status) ? body.status : interest.status;
    interest.updatedAt = new Date().toISOString();
    writeDb(db);
    return sendJson(response, 200, { ok: true, interest });
  }

  if (request.method === "POST" && url.pathname === "/api/shortlist") {
    const body = await parseBody(request);
    const profileId = Number(body.profileId);
    const targetProfile = db.profiles.find(profile => profile.id === profileId);
    if (!targetProfile) return sendJson(response, 404, { error: "Profile not found." });
    if (!Array.isArray(db.shortlists)) db.shortlists = [];
    const existingIndex = db.shortlists.findIndex(item => item.userId === user.id && item.profileId === profileId);
    let shortlisted = true;
    if (existingIndex >= 0) {
      db.shortlists.splice(existingIndex, 1);
      shortlisted = false;
    } else {
      db.shortlists.push({ id: nextId(db.shortlists), userId: user.id, profileId, createdAt: new Date().toISOString() });
    }
    writeDb(db);
    return sendJson(response, 200, { shortlisted, shortlists: db.shortlists.filter(item => item.userId === user.id), stats: stats(db) });
  }

  if (request.method === "GET" && url.pathname === "/api/requests") {
    const incoming = db.interests
      .filter(interest => interest.toProfileId === user.profileId)
      .map(interest => ({ ...interest, from: publicUser(db.users.find(item => item.id === interest.fromUserId)), profile: db.profiles.find(profile => profile.id === db.users.find(item => item.id === interest.fromUserId)?.profileId) }));
    const sent = db.interests
      .filter(interest => interest.fromUserId === user.id)
      .map(interest => ({ ...interest, to: db.profiles.find(profile => profile.id === interest.toProfileId) }));
    const suggested = db.profiles.filter(profile => profile.id !== user.profileId).slice(0, 3);
    return sendJson(response, 200, { incoming, sent, suggested });
  }

  if (request.method === "GET" && url.pathname === "/api/messages") {
    const profileId = Number(url.searchParams.get("profileId"));
    const key = messageKey(user.id, profileId);
    if (!db.messages[key]) db.messages[key] = defaultMessages(db, profileId);
    writeDb(db);
    return sendJson(response, 200, { messages: db.messages[key] });
  }

  if (request.method === "POST" && url.pathname === "/api/messages") {
    const body = await parseBody(request);
    const profileId = Number(body.profileId);
    const text = String(body.text || "").trim();
    if (!text) return sendJson(response, 400, { error: "Message cannot be blank." });
    const key = messageKey(user.id, profileId);
    if (!db.messages[key]) db.messages[key] = defaultMessages(db, profileId);
    db.messages[key].push({ from: "me", text, createdAt: new Date().toISOString() });
    db.messages[key].push({ from: "match", text: "Thanks for your message. I will discuss with my family and reply soon.", createdAt: new Date().toISOString() });
    writeDb(db);
    return sendJson(response, 201, { messages: db.messages[key] });
  }

  if (request.method === "GET" && url.pathname === "/api/admin/stats") {
    if (user.role !== "admin") return sendJson(response, 403, { error: "Admin only." });
    return sendJson(response, 200, {
      stats: stats(db),
      users: db.users.map(publicUser),
      interests: db.interests,
      profiles: db.profiles,
      contacts: db.contacts || [],
      shortlists: db.shortlists || [],
      settings: db.settings || defaultSettings(),
      masterAdminEmail: MASTER_ADMIN_EMAIL
    });
  }

  if (request.method === "POST" && url.pathname === "/api/admin/admins") {
    if (user.role !== "admin") return sendJson(response, 403, { error: "Admin only." });
    const body = await parseBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const name = String(body.name || email.split("@")[0]).trim();
    if (!email || !password) return sendJson(response, 400, { error: "Admin email and password are required." });
    let admin = db.users.find(item => item.email.toLowerCase() === email);
    if (admin) {
      admin.role = "admin";
      admin.password = password;
      admin.name = name || admin.name;
      admin.plan = "Gold";
      admin.canDeleteAdmins = Boolean(body.canDeleteAdmins) && user.email.toLowerCase() === MASTER_ADMIN_EMAIL;
    } else {
      admin = { id: nextId(db.users), name, email, password, role: "admin", plan: "Gold", canDeleteAdmins: Boolean(body.canDeleteAdmins) && user.email.toLowerCase() === MASTER_ADMIN_EMAIL, createdAt: new Date().toISOString() };
      db.users.push(admin);
    }
    writeDb(db);
    return sendJson(response, 201, { user: publicUser(admin), users: db.users.map(publicUser), stats: stats(db) });
  }

  if (request.method === "PATCH" && url.pathname === "/api/admin/admins") {
    if (user.role !== "admin") return sendJson(response, 403, { error: "Admin only." });
    if (user.email.toLowerCase() !== MASTER_ADMIN_EMAIL) return sendJson(response, 403, { error: "Only the master admin can decide delete-admin access." });
    const body = await parseBody(request);
    const admin = db.users.find(item => item.id === Number(body.id) && item.role === "admin");
    if (!admin) return sendJson(response, 404, { error: "Admin not found." });
    admin.canDeleteAdmins = Boolean(body.canDeleteAdmins);
    if (admin.email.toLowerCase() === MASTER_ADMIN_EMAIL) admin.canDeleteAdmins = true;
    writeDb(db);
    return sendJson(response, 200, { user: publicUser(admin), users: db.users.map(publicUser), stats: stats(db) });
  }

  if (request.method === "DELETE" && url.pathname === "/api/admin/admins") {
    if (user.role !== "admin") return sendJson(response, 403, { error: "Admin only." });
    const targetId = Number(url.searchParams.get("id"));
    const target = db.users.find(item => item.id === targetId && item.role === "admin");
    if (!target) return sendJson(response, 404, { error: "Admin not found." });
    const actingIsMaster = user.email.toLowerCase() === MASTER_ADMIN_EMAIL;
    const targetIsSelf = target.id === user.id;
    const targetIsMaster = target.email.toLowerCase() === MASTER_ADMIN_EMAIL;

    if (targetIsSelf && !actingIsMaster) return sendJson(response, 403, { error: "Only the master admin can delete himself as admin." });
    if (targetIsMaster && !actingIsMaster) return sendJson(response, 403, { error: "Only the master admin can change his own admin access." });
    if (!actingIsMaster && !user.canDeleteAdmins) return sendJson(response, 403, { error: "You do not have access to delete other admins." });

    if (targetIsSelf && actingIsMaster) {
      target.role = "member";
      target.canDeleteAdmins = false;
      target.plan = "Free";
    } else {
      db.users = db.users.filter(item => item.id !== target.id);
      for (const token of Object.keys(db.sessions)) {
        if (db.sessions[token] === target.id) delete db.sessions[token];
      }
    }
    writeDb(db);
    return sendJson(response, 200, { ok: true, users: db.users.map(publicUser), stats: stats(db) });
  }

  if (request.method === "PUT" && url.pathname === "/api/admin/settings") {
    if (user.role !== "admin") return sendJson(response, 403, { error: "Admin only." });
    const body = await parseBody(request);
    db.settings = { ...defaultSettings(), ...(db.settings || {}) };
    for (const key of Object.keys(db.settings)) {
      if (body[key] !== undefined) db.settings[key] = String(body[key]);
    }
    writeDb(db);
    return sendJson(response, 200, { settings: db.settings });
  }

  return sendJson(response, 404, { error: "API route not found." });
}

function messageKey(userId, profileId) {
  return `${userId}:${profileId}`;
}

function defaultMessages(db, profileId) {
  const profile = db.profiles.find(item => item.id === Number(profileId));
  return [{ from: "match", text: `Namaste, I am ${profile ? profile.name : "a Shubhh Rishtey member"}. Thank you for viewing my profile.`, createdAt: new Date().toISOString() }];
}

function serveStatic(request, response, url) {
  const urlPath = decodeURIComponent(url.pathname);
  const filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (fallbackError, fallbackData) => {
        if (fallbackError) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[".html"] });
        response.end(fallbackData);
      });
      return;
    }
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
});

ensureDb();
server.listen(port, () => {
  console.log(`Shubhh Rishtey dynamic site running at http://localhost:${port}`);
});
