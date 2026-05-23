const app = document.querySelector("#app");
const sideMenu = document.querySelector("#sideMenu");
const menuScrim = document.querySelector("#menuScrim");
const menuButton = document.querySelector("#menuButton");
const closeMenu = document.querySelector("#closeMenu");

let profiles = [];
let plans = [];

const locationDirectory = {
  India: {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
    "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri"]
  }
};

const cityStateMap = Object.entries(locationDirectory.India).reduce((map, [state, cities]) => {
  cities.forEach(city => map[city.toLowerCase()] = state);
  return map;
}, {});

const state = {
  user: JSON.parse(localStorage.getItem("subhrishteUser") || "null"),
  token: localStorage.getItem("subhrishteToken") || "",
  stats: null,
  settings: null
};

const pageData = {
  about: {
    title: "About Us",
    eyebrow: "Our promise",
    body: ["Shubhh Rishtey is a dynamic matrimonial platform for people who want serious, respectful, family-aware matchmaking. Registration, profile updates, plans, interests, messages, and admin numbers now come from the local server database.", "Members can create detailed profiles, explore compatible matches, shortlist people, and begin conversations after login."]
  },
  contact: {
    title: "Contact Us",
    eyebrow: "We are here",
    body: ["Phone: +91 98765 43210", "Email: care@shubbhrishtey.com", "Country: India", "Support hours: 9:00 AM to 8:00 PM, Monday to Saturday."]
  },
  "success-stories": {
    title: "Success Stories",
    eyebrow: "Real journeys",
    body: ["Thousands of families use Shubhh Rishtey to find trusted matches. Our success stories highlight compatible values, careful introductions, and happy weddings.", "Featured: Riya and Kunal from Delhi, Mehak and Arpit from Jaipur, and Sneha and Varun from Bengaluru found their match through verified profiles and respectful conversations."]
  },
  safety: {
    title: "Safety Center",
    eyebrow: "Stay protected",
    body: ["We encourage every member to verify identity, avoid sharing financial information, meet families before final decisions, and report suspicious behavior.", "Paid features never replace personal judgment. Shubhh Rishtey gives tools, privacy controls, and reporting flows to support safer matchmaking."]
  },
  "wedding-services": {
    title: "Wedding Services",
    eyebrow: "After the match",
    body: ["Explore venue planning, photography, makeup, invitation ideas, and ceremony coordination. This page is prepared for future vendor listings and booking support.", "Members can use Shubhh Rishtey as a complete marriage journey hub from discovery to celebration."]
  },
  horoscope: {
    title: "Horoscope Match",
    eyebrow: "Compatibility",
    body: ["Add birth date, birth time, and birth place in your profile to prepare horoscope compatibility details.", "This demo page shows where kundli and preference matching can be integrated later."]
  },
  help: {
    title: "Help",
    eyebrow: "Quick answers",
    body: ["Run the site with node server.js, then register, login, search by name or city, send interest, and use messages from your dashboard.", "Free plan users can browse and search. Upgrade to Silver or Gold to unlock richer contact options."]
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Your data",
    body: ["Shubhh Rishtey stores demo users, profiles, interests, plans, and messages in data/db.json on this computer.", "For production, passwords should be hashed and the JSON database should be replaced by MongoDB, MySQL, PostgreSQL, or another real database."]
  },
  terms: {
    title: "Terms",
    eyebrow: "Using Shubhh Rishtey",
    body: ["Members must provide truthful details, use respectful communication, and avoid misuse of profile information.", "Shubhh Rishtey may restrict accounts that send spam, harassment, fake identity details, or unsafe requests."]
  }
};

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

async function bootstrap() {
  app.innerHTML = `<section class="section page-hero small-hero"><p class="eyebrow">Loading</p><h1>Preparing Shubhh Rishtey</h1><p>Connecting to the dynamic server...</p></section>`;
  try {
    const data = await api("/api/bootstrap");
    applyServerData(data);
    updateHeader();
    route();
  } catch (error) {
    app.innerHTML = `<section class="section page-hero small-hero"><p class="eyebrow">Server needed</p><h1>Start the dynamic backend</h1><p>${error.message}</p><p>Run <strong>node server.js</strong> in this folder, then open <strong>http://localhost:4173</strong>.</p></section>`;
  }
}

function applyServerData(data) {
  if (data.profiles) profiles = data.profiles;
  if (data.plans) plans = data.plans;
  if (data.stats) state.stats = data.stats;
  if (data.settings) state.settings = data.settings;
  if (data.user !== undefined) state.user = data.user;
  if (data.token) state.token = data.token;
  persistSession();
}

function persistSession() {
  if (state.user) localStorage.setItem("subhrishteUser", JSON.stringify(state.user));
  else localStorage.removeItem("subhrishteUser");
  if (state.token) localStorage.setItem("subhrishteToken", state.token);
  else localStorage.removeItem("subhrishteToken");
}

function route() {
  closeSideMenu();
  const hash = location.hash.replace("#", "") || "home";
  const [page, child] = hash.split("/");
  const scrollAfterRender = () => requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }));

  if (page === "home") renderHome();
  else if (page === "login") renderLogin();
  else if (page === "register") renderRegister();
  else if (page === "forgot-password") renderForgotPassword();
  else if (page === "reset-password") renderResetPassword(child);
  else if (page === "membership") renderMembership();
  else if (page === "profiles") renderProfiles();
  else if (page === "search") renderSearchPage();
  else if (page === "profile") renderProfileDetail(child);
  else if (page === "dashboard") renderDashboard(child || "overview");
  else if (page === "admin") renderAdmin(child || "overview");
  else if (pageData[page]) renderInfoPage(page);
  else renderInfoPage("help");
  scrollAfterRender();
}

function cloneTemplate(id) {
  const template = document.querySelector(`#${id}`);
  app.innerHTML = "";
  app.append(template.content.cloneNode(true));
}

function renderHome() {
  cloneTemplate("homeTemplate");
  applySiteSettings();
  renderProfileCards(document.querySelector("[data-featured-profiles]"), profiles.slice(0, 3));
  document.querySelector("[data-route-form]").addEventListener("submit", event => {
    event.preventDefault();
    location.hash = "search";
  });
  updateFooterStats();
}

function renderLogin() {
  cloneTemplate("authTemplate");
  document.querySelector("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password")).trim();
    if (!email || !password) return toast("Please enter email and password.");

    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      applyServerData(data);
      updateHeader();
      toast(state.user.role === "admin" ? "Admin login successful." : "Login successful. Welcome to your dashboard.");
      location.hash = state.user.role === "admin" ? "admin" : "dashboard";
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderRegister() {
  cloneTemplate("registerTemplate");
  document.querySelector("#registerForm").addEventListener("submit", async event => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api("/api/register", {
        method: "POST",
        body: JSON.stringify(body)
      });
      profiles = data.profiles || profiles;
      plans = data.plans || plans;
      state.stats = data.stats || state.stats;
      state.user = null;
      state.token = "";
      persistSession();
      updateHeader();
      toast("Account created successfully. Please login.");
      location.hash = "login";
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderForgotPassword() {
  app.innerHTML = `
    <section class="auth-wrap forgot-wrap">
      <div class="forgot-bg" aria-hidden="true">
        <div class="hero-slide hero-slide-one"></div>
        <div class="hero-slide hero-slide-two"></div>
        <div class="hero-slide hero-slide-three"></div>
      </div>
      <form class="auth-card" id="forgotForm">
        <p class="eyebrow">Account recovery</p>
        <h1>Forgot password</h1>
        <p>Enter your registered name and email. We will send a reset link for your Shubhh Rishtey account.</p>
        <label>Name<input name="name" required placeholder="Your registered name" /></label>
        <label>Email<input type="email" name="email" required placeholder="your@email.com" /></label>
        <button type="submit">Send reset link</button>
        <p class="small"><a href="#login">Back to login</a></p>
        <div class="reset-result" id="resetResult"></div>
      </form>
    </section>`;
  document.querySelector("#forgotForm").addEventListener("submit", async event => {
    event.preventDefault();
    const result = document.querySelector("#resetResult");
    result.innerHTML = "";
    try {
      const data = await api("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
      });
      result.innerHTML = `<div class="locked success-note">${escapeHtml(data.message)}<br><a href="${escapeHtml(data.resetUrl)}">Open reset link</a></div>`;
      toast("Password reset link sent.");
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderResetPassword(token) {
  app.innerHTML = `
    <section class="auth-wrap forgot-wrap">
      <div class="forgot-bg" aria-hidden="true">
        <div class="hero-slide hero-slide-one"></div>
        <div class="hero-slide hero-slide-two"></div>
        <div class="hero-slide hero-slide-three"></div>
      </div>
      <form class="auth-card" id="resetPasswordForm">
        <p class="eyebrow">Secure reset</p>
        <h1>Create new password</h1>
        <p>Choose a new password, then login again with your updated details.</p>
        <label>New Password<input type="password" name="password" required minlength="4" placeholder="New password" /></label>
        <label>Confirm Password<input type="password" name="confirmPassword" required minlength="4" placeholder="Confirm password" /></label>
        <button type="submit">Reset password</button>
        <p class="small"><a href="#login">Back to login</a></p>
      </form>
    </section>`;
  document.querySelector("#resetPasswordForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password !== confirmPassword) return toast("Passwords do not match.");
    try {
      await api("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      toast("Password reset successfully. Please login.");
      location.hash = "login";
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderMembership() {
  cloneTemplate("membershipTemplate");
  renderPlans(document.querySelector("[data-plans]"));
}

function renderPlans(container) {
  const currentPlan = state.user?.plan || "Free";
  container.innerHTML = plans.map(plan => `
    <article class="plan-card ${plan.featured ? "featured" : ""}">
      <p class="eyebrow">${plan.note}</p>
      <h2>${plan.name}</h2>
      <div class="price">${plan.price}</div>
      <ul>${plan.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
      ${plan.restricted ? `<div class="locked">Restrictions: no unlimited chat, no phone access, limited daily interests.</div>` : ""}
      <button data-plan="${plan.name}">${currentPlan === plan.name ? "Current Plan" : "Choose Plan"}</button>
    </article>
  `).join("");
  container.querySelectorAll("[data-plan]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!state.user) {
        toast("Please login before choosing a plan.");
        location.hash = "login";
        return;
      }
      try {
        const data = await api("/api/plan", {
          method: "POST",
          body: JSON.stringify({ plan: button.dataset.plan })
        });
        applyServerData(data);
        toast(`${state.user.plan} plan activated and saved.`);
        renderMembership();
      } catch (error) {
        toast(error.message);
      }
    });
  });
}

function renderProfiles() {
  app.innerHTML = pageHeader("Available Profiles", "Verified profiles", "Browse active members and send interest after login.") + `<section class="section"><div class="profile-grid"></div></section>`;
  renderProfileCards(document.querySelector(".profile-grid"), profiles);
}

async function renderProfileDetail(id) {
  app.innerHTML = pageHeader("Profile Details", "Member profile", "Loading member details from server...");
  try {
    const data = await api(`/api/profile?id=${Number(id)}`);
    const profile = data.profile;
    app.innerHTML = `
      <section class="profile-detail-hero">
        <div class="profile-detail-photo" style="background-image:url('${profile.image}')"></div>
        <div class="profile-detail-copy">
          <p class="eyebrow">${profile.verified ? "Verified profile" : "New profile"}</p>
          <h1>${escapeHtml(profile.name)}</h1>
          <p>${escapeHtml(profile.about || "")}</p>
          <div class="profile-meta detail-meta">
            <span>${profile.age} years</span><span>${escapeHtml(profile.gender)}</span><span>${escapeHtml(profile.city)}</span><span>${escapeHtml(profile.job)}</span><span>${escapeHtml(profile.religion)}</span><span>${escapeHtml(profile.community)}</span>
          </div>
          <div class="profile-actions detail-actions">
            <button data-interest-id="${profile.id}">Send Interest</button>
            <button data-shortlist-id="${profile.id}">Shortlist</button>
            <button data-message="${profile.id}">Message</button>
          </div>
        </div>
      </section>
      <section class="section cards-grid">
        <article class="info-card profile-body"><h3>Family Preference</h3><p>Looking for a respectful match with shared values and clear marriage intent.</p></article>
        <article class="info-card profile-body"><h3>Education & Career</h3><p>${escapeHtml(profile.job)} based in ${escapeHtml(profile.city)}.</p></article>
        <article class="info-card profile-body"><h3>Membership Safety</h3><p>Use interest requests and chat before sharing personal contact information.</p></article>
      </section>`;
    wireProfileButtons(app);
    wireShortlistButtons(app);
  } catch (error) {
    app.innerHTML = pageHeader("Profile Not Found", "Member profile", error.message);
  }
}

function renderSearchPage() {
  const profileCities = [...new Set(profiles.map(p => p.city).filter(Boolean))];
  const allCities = [...new Set([...Object.values(locationDirectory.India).flat(), ...profileCities])].sort();
  app.innerHTML = pageHeader("Search Matches", "Find by name", "Search people by username, country, state, city, gender, profession, religion, or community.") + `
    <section class="section">
      <div class="search-tools">
        <input id="searchInput" placeholder="Search by user name, city, profession" />
        <select id="genderFilter"><option value="">Any gender</option><option>Woman</option><option>Man</option></select>
        <select id="countryFilter"><option value="">Any country</option><option>India</option><option>Other</option></select>
        <select id="stateFilter"><option value="">Any state</option>${Object.keys(locationDirectory.India).map(state => `<option>${state}</option>`).join("")}</select>
        <select id="cityFilter"><option value="">Any city</option>${allCities.map(city => `<option>${city}</option>`).join("")}<option value="__other">My city is not listed</option></select>
        <input id="customCityFilter" class="custom-city-filter" placeholder="Write your city" hidden />
      </div>
      <div class="profile-grid" id="searchResults"></div>
    </section>`;
  const searchInput = document.querySelector("#searchInput");
  const genderFilter = document.querySelector("#genderFilter");
  const countryFilter = document.querySelector("#countryFilter");
  const stateFilter = document.querySelector("#stateFilter");
  const cityFilter = document.querySelector("#cityFilter");
  const customCityFilter = document.querySelector("#customCityFilter");
  const update = () => {
    const q = searchInput.value.toLowerCase();
    const gender = genderFilter.value;
    const country = countryFilter.value;
    const selectedState = stateFilter.value;
    const city = cityFilter.value === "__other" ? customCityFilter.value.trim() : cityFilter.value;
    customCityFilter.hidden = cityFilter.value !== "__other";
    const result = profiles.filter(profile => {
      const profileState = cityStateMap[String(profile.city || "").toLowerCase()] || "";
      const profileCountry = profileState ? "India" : "";
      const text = `${profile.name} ${profileCountry} ${profileState} ${profile.city} ${profile.job} ${profile.religion} ${profile.community}`.toLowerCase();
      return text.includes(q)
        && (!gender || profile.gender === gender)
        && (!country || country === "Other" || profileCountry === country)
        && (!selectedState || profileState === selectedState)
        && (!city || String(profile.city || "").toLowerCase().includes(city.toLowerCase()));
    });
    renderProfileCards(document.querySelector("#searchResults"), result);
  };
  [searchInput, genderFilter, countryFilter, stateFilter, cityFilter, customCityFilter].forEach(input => input.addEventListener("input", update));
  update();
}

function renderDashboard(tab) {
  if (!requireLogin()) return;
  if (state.user.role === "admin") {
    location.hash = "admin";
    return;
  }
  cloneTemplate("dashboardTemplate");
  document.querySelector("[data-user-name]").textContent = state.user.name || "My Account";
  document.querySelector("[data-logout]").addEventListener("click", logout);
  document.querySelectorAll("[data-dash-link]").forEach(link => {
    if (link.dataset.dashLink === tab) link.classList.add("active");
  });
  const main = document.querySelector("#dashboardMain");
  if (tab === "requests") return renderRequests(main);
  if (tab === "shortlist") return renderShortlist(main);
  if (tab === "profile") return renderMyProfile(main);
  if (tab === "messages") return renderMessages(main);
  if (tab === "search") return renderSearchPage();
  if (tab === "settings") return renderMemberSettings(main);
  renderOverview(main);
}

function renderOverview(main) {
  main.innerHTML = `<p class="eyebrow">Dashboard</p><h1>Loading your dashboard</h1>`;
  api("/api/dashboard").then(data => {
    applyServerData(data);
    main.innerHTML = `
    <p class="eyebrow">Dashboard</p>
    <h1>Welcome, ${titleCase(state.user.name)}</h1>
    <div class="stats-band">
      <article><strong>${profiles.length}</strong><span>Available profiles</span></article>
      <article><strong>${data.counts.incoming}</strong><span>Incoming requests</span></article>
      <article><strong>${data.counts.shortlist}</strong><span>Shortlisted</span></article>
      <article><strong>${state.user.plan || "Free"}</strong><span>Current plan</span></article>
    </div>
    <div class="dash-grid">
      <article class="dash-panel"><h2>Suggested matches</h2><div class="profile-grid">${data.suggestions.slice(0,2).map(profileCard).join("")}</div></article>
      <article class="dash-panel"><h2>${state.user.plan || "Free"} plan limits</h2><p>You can browse and send interests. Upgrade from the Plan option to unlock more contact options and priority visibility.</p><a class="primary-btn" href="#membership">View Plans</a></article>
    </div>`;
    wireProfileButtons(main);
    wireShortlistButtons(main);
  }).catch(error => {
    main.innerHTML = `<p class="eyebrow">Dashboard</p><h1>Dashboard unavailable</h1><p>${error.message}</p>`;
  });
}

async function renderRequests(main) {
  main.innerHTML = `<p class="eyebrow">Requests</p><h1>Interest Requests</h1><p>Loading requests from server...</p>`;
  try {
    const data = await api("/api/requests");
    const incoming = data.incoming.length
      ? data.incoming.map(item => `<article class="request-card profile-body"><h3>${item.from?.name || "Member"}</h3><p>Status: ${item.status}. Sent you an interest request.</p><button class="primary-btn" data-interest-action="${item.id}" data-status="accepted">Accept</button> <button class="outline-btn" data-interest-action="${item.id}" data-status="declined">Decline</button></article>`).join("")
      : data.suggested.map(p => `<article class="request-card profile-body"><h3>${p.name}</h3><p>${p.about}</p><button class="primary-btn" data-interest-id="${p.id}">Send Interest</button></article>`).join("");
    const sent = data.sent.length ? data.sent.map(item => `<article class="request-card profile-body"><h3>${item.to?.name || "Profile"}</h3><p>Your request status: <strong>${item.status}</strong></p></article>`).join("") : `<p>No sent requests yet.</p>`;
    main.innerHTML = `<p class="eyebrow">Requests</p><h1>Interest Requests</h1><h2>Incoming</h2><div class="cards-grid">${incoming}</div><h2>Sent</h2><div class="cards-grid">${sent}</div>`;
    wireInterestButtons(main);
    main.querySelectorAll("[data-interest-action]").forEach(button => {
      button.addEventListener("click", async () => {
        try {
          await api("/api/interests", { method: "PATCH", body: JSON.stringify({ id: Number(button.dataset.interestAction), status: button.dataset.status }) });
          toast(`Request ${button.dataset.status}.`);
          renderRequests(main);
        } catch (error) {
          toast(error.message);
        }
      });
    });
  } catch (error) {
    main.innerHTML = `<p class="eyebrow">Requests</p><h1>Interest Requests</h1><p>${error.message}</p>`;
  }
}

async function renderShortlist(main) {
  main.innerHTML = `<p class="eyebrow">Shortlist</p><h1>Your Shortlisted Profiles</h1><p>Loading shortlist from server...</p>`;
  try {
    const data = await api("/api/dashboard");
    main.innerHTML = `<p class="eyebrow">Shortlist</p><h1>Your Shortlisted Profiles</h1><div class="profile-grid">${data.shortlistedProfiles.length ? data.shortlistedProfiles.map(profileCard).join("") : "<p>No profiles shortlisted yet.</p>"}</div>`;
    wireProfileButtons(main);
    wireShortlistButtons(main);
  } catch (error) {
    main.innerHTML = `<p class="eyebrow">Shortlist</p><h1>Your Shortlisted Profiles</h1><p>${error.message}</p>`;
  }
}

async function renderMyProfile(main) {
  main.innerHTML = `<p class="eyebrow">Profile</p><h1>Loading your profile</h1>`;
  try {
    const data = await api("/api/dashboard");
    applyServerData(data);
    const profile = data.profile || {};
    main.innerHTML = `<p class="eyebrow">Profile</p><h1>Complete Your Marriage Profile</h1>
      <form class="wide-form complete-profile-form" id="profileForm">
        <div class="profile-editor-head">
          <label class="photo-picker" for="profilePhotoInput">
            <span class="profile-preview" style="background-image:url('${escapeHtml(profile.image || "")}')"></span>
            <strong>Click to add profile photo</strong>
            <small>Upload a clear photo for better matches.</small>
            <input id="profilePhotoInput" type="file" accept="image/*" hidden />
            <input id="profilePhotoData" type="hidden" name="profilePhoto" value="${escapeHtml(profile.image || "")}" />
          </label>
          <div>
            <p class="eyebrow">Profile strength</p>
            <h2>${profile.name ? "Keep your details updated" : "Start with your basics"}</h2>
            <p>Members with photo, phone, family details, and partner preferences get more relevant interests.</p>
          </div>
        </div>

        <h2>Basic Details</h2>
        <div class="form-grid">
          <label>Full Name<input name="name" required value="${escapeHtml(profile.name || state.user.name || "")}" /></label>
          <label>Email<input type="email" name="email" required value="${escapeHtml(profile.email || state.user.email || "")}" /></label>
          <label>Phone Number<input name="phone" inputmode="tel" placeholder="+91 98765 43210" value="${escapeHtml(profile.phone || state.user.phone || "")}" /></label>
          <label>Age<input type="number" min="18" name="age" value="${escapeHtml(profile.age || "")}" /></label>
          <label>Gender<select name="gender">${option("Woman", profile.gender)}${option("Man", profile.gender)}</select></label>
          <label>Date of Birth<input type="date" name="dob" value="${escapeHtml(profile.dob || "")}" /></label>
          <label>Height<input name="height" placeholder="5 ft 6 in" value="${escapeHtml(profile.height || "")}" /></label>
          <label>Marital Status<select name="maritalStatus">${["Never Married", "Divorced", "Widowed", "Awaiting Divorce"].map(v => option(v, profile.maritalStatus)).join("")}</select></label>
        </div>

        <h2>Location</h2>
        <div class="form-grid">
          <label>Country<input name="country" value="${escapeHtml(profile.country || "India")}" /></label>
          <label>State<input name="state" value="${escapeHtml(profile.state || cityStateMap[String(profile.city || "").toLowerCase()] || "")}" /></label>
          <label>City<input name="city" required value="${escapeHtml(profile.city || state.user.city || "")}" /></label>
          <label>Mother Tongue<input name="motherTongue" placeholder="Hindi" value="${escapeHtml(profile.motherTongue || "")}" /></label>
        </div>

        <h2>Education & Career</h2>
        <div class="form-grid">
          <label>Highest Education<input name="education" placeholder="MBA, B.Tech, MBBS" value="${escapeHtml(profile.education || "")}" /></label>
          <label>Profession<input name="profession" value="${escapeHtml(profile.profession || profile.job || "")}" /></label>
          <label>Annual Income<input name="income" placeholder="Rs 8-12 LPA" value="${escapeHtml(profile.income || "")}" /></label>
          <label>Diet<select name="diet">${["Vegetarian", "Non-vegetarian", "Eggetarian", "Vegan", "No preference"].map(v => option(v, profile.diet)).join("")}</select></label>
        </div>

        <h2>Community & Family</h2>
        <div class="form-grid">
          <label>Religion<input name="religion" value="${escapeHtml(profile.religion || "")}" /></label>
          <label>Community / Caste<input name="community" value="${escapeHtml(profile.community || "")}" /></label>
          <label>Family Type<select name="familyType">${["Nuclear", "Joint", "Extended", "Flexible"].map(v => option(v, profile.familyType)).join("")}</select></label>
          <label>Father's Occupation<input name="fatherOccupation" value="${escapeHtml(profile.fatherOccupation || "")}" /></label>
          <label>Mother's Occupation<input name="motherOccupation" value="${escapeHtml(profile.motherOccupation || "")}" /></label>
          <label>Siblings<input name="siblings" placeholder="1 brother, 1 sister" value="${escapeHtml(profile.siblings || "")}" /></label>
        </div>

        <h2>Astro Details</h2>
        <div class="form-grid">
          <label>Manglik<select name="manglik">${["No", "Yes", "Don't know", "Doesn't matter"].map(v => option(v, profile.manglik)).join("")}</select></label>
          <label>Birth Time<input name="birthTime" placeholder="08:30 AM" value="${escapeHtml(profile.birthTime || "")}" /></label>
          <label>Birth Place<input name="birthPlace" placeholder="Delhi" value="${escapeHtml(profile.birthPlace || "")}" /></label>
        </div>

        <h2>About & Preferences</h2>
        <label>About You<textarea name="about" placeholder="Write about your personality, values, family, and expectations.">${escapeHtml(profile.about || "")}</textarea></label>
        <label>Partner Preference<textarea name="partnerPreference" placeholder="Write what kind of partner/family you are looking for.">${escapeHtml(profile.partnerPreference || "")}</textarea></label>
        <button type="submit">Save Complete Profile</button>
      </form>`;

    const fileInput = document.querySelector("#profilePhotoInput");
    const photoData = document.querySelector("#profilePhotoData");
    const preview = document.querySelector(".profile-preview");
    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        photoData.value = String(reader.result || "");
        preview.style.backgroundImage = `url('${photoData.value}')`;
      };
      reader.readAsDataURL(file);
    });
    document.querySelector("#profileForm").addEventListener("submit", async event => {
      event.preventDefault();
      try {
        const saved = await api("/api/profile", {
          method: "PUT",
          body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
        });
        applyServerData(saved);
        updateHeader();
        toast("Complete profile saved.");
        renderMyProfile(main);
      } catch (error) {
        toast(error.message);
      }
    });
  } catch (error) {
    main.innerHTML = `<p class="eyebrow">Profile</p><h1>Your Profile</h1><p>${error.message}</p>`;
  }
}

function renderMemberSettings(main) {
  main.innerHTML = `
    <p class="eyebrow">Settings</p>
    <h1>Privacy & Security</h1>
    <div class="settings-grid">
      <form class="dash-panel admin-form" id="memberPasswordForm">
        <h2>Change Password</h2>
        <label>Current Password<input type="password" name="currentPassword" required /></label>
        <label>New Password<input type="password" name="newPassword" required minlength="4" /></label>
        <button type="submit">Update Password</button>
      </form>
      <form class="dash-panel admin-form" id="privacyForm">
        <h2>Profile Visibility</h2>
        <label>Who can see your profile<select name="profileVisibility">
          ${option("Everyone", state.user.profileVisibility)}
          ${option("Members only", state.user.profileVisibility)}
          ${option("Hidden from search", state.user.profileVisibility)}
        </select></label>
        <label>Photo privacy<select name="photoPrivacy">
          ${option("Everyone", state.user.photoPrivacy)}
          ${option("Approved interests", state.user.photoPrivacy)}
          ${option("Only me", state.user.photoPrivacy)}
        </select></label>
        <label>Contact details<select name="contactPrivacy">
          ${option("After approval", state.user.contactPrivacy)}
          ${option("Paid members only", state.user.contactPrivacy)}
          ${option("Never show automatically", state.user.contactPrivacy)}
        </select></label>
        <label>Search visibility<select name="searchVisibility">
          ${option("Visible in search", state.user.searchVisibility)}
          ${option("Only suggested matches", state.user.searchVisibility)}
          ${option("Pause profile discovery", state.user.searchVisibility)}
        </select></label>
        <label>Data sharing<select name="dataSharing">
          ${option("Do not share outside Shubhh Rishtey", state.user.dataSharing)}
          ${option("Allow partner recommendations", state.user.dataSharing)}
        </select></label>
        <label class="check-row"><input type="checkbox" name="loginAlerts" ${state.user.loginAlerts !== false ? "checked" : ""} /> Email me about new logins</label>
        <label class="check-row"><input type="checkbox" name="twoStep" ${state.user.twoStep ? "checked" : ""} /> Ask for extra verification on sensitive changes</label>
        <button type="submit">Save Privacy Settings</button>
      </form>
      <article class="dash-panel settings-note">
        <h2>More Controls</h2>
        <p>Review blocked profiles from Shortlist and Requests, keep contact sharing manual, and report suspicious profiles before moving conversations outside Shubhh Rishtey.</p>
        <p>Your profile is safest when photos, phone details, and family contacts are shared only after interest approval.</p>
      </article>
    </div>`;
  document.querySelector("#memberPasswordForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await api("/api/change-password", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      event.currentTarget.reset();
      toast("Password changed successfully.");
    } catch (error) {
      toast(error.message);
    }
  });
  document.querySelector("#privacyForm").addEventListener("submit", async event => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    body.loginAlerts = Boolean(body.loginAlerts);
    body.twoStep = Boolean(body.twoStep);
    try {
      const data = await api("/api/privacy-settings", { method: "PUT", body: JSON.stringify(body) });
      applyServerData(data);
      toast("Privacy and security settings saved.");
      renderMemberSettings(main);
    } catch (error) {
      toast(error.message);
    }
  });
}

async function renderMessages(main) {
  const available = profiles.filter(profile => profile.email !== state.user.email);
  const active = available[0] || profiles[0];
  main.innerHTML = `<p class="eyebrow">Messages</p><h1>Chat with matches</h1>
    ${state.user.plan === "Free" ? `<div class="locked">Free plan restriction: unlimited chat and contact details unlock with Silver or Gold.</div>` : ""}
    <div class="chat-layout">
      <div class="chat-list">${available.slice(0, 5).map((p, index) => `<button data-chat="${p.id}" class="${index === 0 ? "active" : ""}">${p.name}<br><small>${p.city}</small></button>`).join("")}</div>
      <div class="chat-window" id="chatWindow"></div>
    </div>`;

  const showChat = async id => {
    const profile = profiles.find(p => p.id === Number(id));
    document.querySelectorAll("[data-chat]").forEach(button => button.classList.toggle("active", button.dataset.chat === String(id)));
    const chatWindow = document.querySelector("#chatWindow");
    chatWindow.innerHTML = `<div class="chat-head"><strong>${profile.name}</strong><br><small>${profile.job}, ${profile.city}</small></div><div class="chat-feed"><p>Loading messages...</p></div>`;
    try {
      const data = await api(`/api/messages?profileId=${profile.id}`);
      chatWindow.innerHTML = chatMarkup(profile, data.messages);
      document.querySelector(".chat-send").addEventListener("submit", async event => {
        event.preventDefault();
        const input = event.currentTarget.querySelector("input");
        try {
          const sent = await api("/api/messages", {
            method: "POST",
            body: JSON.stringify({ profileId: profile.id, text: input.value })
          });
          chatWindow.innerHTML = chatMarkup(profile, sent.messages);
          showChat(profile.id);
        } catch (error) {
          toast(error.message);
        }
      });
    } catch (error) {
      chatWindow.innerHTML = `<div class="chat-head"><strong>${profile.name}</strong></div><div class="chat-feed"><p>${error.message}</p></div>`;
    }
  };

  document.querySelectorAll("[data-chat]").forEach(button => button.addEventListener("click", () => showChat(button.dataset.chat)));
  if (active) showChat(active.id);
}

function chatMarkup(profile, messages) {
  return `
    <div class="chat-head"><strong>${profile.name}</strong><br><small>${profile.job}, ${profile.city}</small></div>
    <div class="chat-feed">${messages.map(msg => `<div class="bubble ${msg.from === "me" ? "me" : ""}">${escapeHtml(msg.text)}</div>`).join("")}</div>
    <form class="chat-send"><input placeholder="Write a message" required /><button>Send</button></form>`;
}

async function renderAdmin(tab = "overview") {
  if (!requireLogin()) return;
  if (state.user.role !== "admin") {
    toast("Admin page is only for the admin account.");
    location.hash = "dashboard";
    return;
  }
  cloneTemplate("adminTemplate");
  document.querySelector("[data-logout]").addEventListener("click", logout);
  try {
    const data = await api("/api/admin/stats");
    state.stats = data.stats;
    document.querySelector(".admin-stats").innerHTML = `
      <article><strong>${data.stats.currentUsers}</strong><span>Current Users</span></article>
      <article><strong>${data.stats.dailyViewers}</strong><span>Daily Viewers</span></article>
      <article><strong>${data.stats.registered}</strong><span>Registered People</span></article>
      <article><strong>${data.stats.paidUsers}</strong><span>Paid Members</span></article>`;
    const host = document.querySelector(".admin-grid");
    const recentUsers = data.users.slice(-8).reverse().map(user => `<p><strong>${escapeHtml(user.name)}</strong><br>${escapeHtml(user.email)} - ${user.role} - ${user.plan || "Free"}</p>`).join("");
    document.querySelector("[data-admin-users]").innerHTML = recentUsers;
    if (tab === "overview") host.innerHTML = `
      <article><h3>Registered users by plan</h3>${planBreakdown(data.users)}</article>
      <article><h3>Recent registrations</h3>${recentUsers}</article>
      <article><h3>Daily activity</h3><p class="big-number">${data.stats.dailyViewers}</p><p>Daily viewers tracked from page loads.</p><p>${data.stats.currentUsers} users, ${data.stats.profiles} profiles, ${data.stats.contacts} contact inquiries.</p></article>`;
    if (tab === "users") host.innerHTML = `<article><h3>All Users</h3>${data.users.map(user => `<p><strong>${escapeHtml(user.name)}</strong><br>${escapeHtml(user.email)} - ${user.role} - ${user.plan || "Free"}</p>`).join("")}</article>`;
    if (tab === "profiles") host.innerHTML = `<article><h3>Profiles</h3>${data.profiles.map(profile => `<p><strong>${escapeHtml(profile.name)}</strong><br>${escapeHtml(profile.city)} - ${escapeHtml(profile.job)} - ${profile.verified ? "Verified" : "Pending"}</p>`).join("")}</article>`;
    if (tab === "requests") host.innerHTML = `<article><h3>Interest Requests</h3>${data.interests.length ? data.interests.map(item => `<p>Request #${item.id}: user ${item.fromUserId} to profile ${item.toProfileId} - ${item.status}</p>`).join("") : "<p>No requests yet.</p>"}</article>`;
    if (tab === "contacts") host.innerHTML = `<article><h3>Contact Inquiries</h3>${data.contacts.length ? data.contacts.slice().reverse().map(item => `<p><strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.email)}<br>${escapeHtml(item.message)}</p>`).join("") : "<p>No contact inquiries yet.</p>"}</article>`;
    if (tab === "admins") renderAdminManager(host, data.users, data.masterAdminEmail);
    if (tab === "settings") renderSiteSettings(host, data.settings);
    if (tab === "password") renderPasswordChange(host);
    if (tab === "reports") host.innerHTML = `<article><h3>Reports</h3><p>No critical reports. ${data.profiles.filter(profile => !profile.verified).length} profiles are pending verification.</p></article>`;
  } catch (error) {
    toast(error.message);
  }
}

function planBreakdown(users) {
  const counts = users.reduce((all, user) => {
    const key = user.role === "admin" ? "Admin" : (user.plan || "Free");
    all[key] = (all[key] || 0) + 1;
    return all;
  }, {});
  return Object.entries(counts).map(([name, count]) => `<p><strong>${escapeHtml(name)}</strong>: ${count}</p>`).join("");
}

function renderAdminManager(host, users, masterAdminEmail) {
  const currentIsMaster = state.user?.email?.toLowerCase() === masterAdminEmail;
  host.innerHTML = `
    <article>
      <h3>Add Another Admin</h3>
      <form class="admin-form" id="addAdminForm">
        <label>Name<input name="name" placeholder="Admin name" /></label>
        <label>Gmail / Email<input type="email" name="email" required placeholder="admin@gmail.com" /></label>
        <label>Password<input type="password" name="password" required placeholder="Set password" /></label>
        ${currentIsMaster ? `<label class="check-row"><input type="checkbox" name="canDeleteAdmins" value="true" /> Can delete other admins</label>` : ""}
        <button class="primary-btn">Add Admin</button>
      </form>
    </article>
    <article>
      <h3>Current Admins</h3>
      ${users.filter(user => user.role === "admin").map(user => adminRow(user, masterAdminEmail, currentIsMaster)).join("")}
    </article>`;
  document.querySelector("#addAdminForm").addEventListener("submit", async event => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    formData.canDeleteAdmins = Boolean(formData.canDeleteAdmins);
    try {
      await api("/api/admin/admins", { method: "POST", body: JSON.stringify(formData) });
      toast("Admin added successfully.");
      renderAdmin("admins");
    } catch (error) {
      toast(error.message);
    }
  });
  host.querySelectorAll("[data-admin-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this admin access?")) return;
      try {
        await api(`/api/admin/admins?id=${button.dataset.adminDelete}`, { method: "DELETE" });
        toast("Admin access removed.");
        renderAdmin("admins");
      } catch (error) {
        toast(error.message);
      }
    });
  });
  host.querySelectorAll("[data-admin-toggle-delete]").forEach(input => {
    input.addEventListener("change", async () => {
      try {
        await api("/api/admin/admins", { method: "PATCH", body: JSON.stringify({ id: Number(input.dataset.adminToggleDelete), canDeleteAdmins: input.checked }) });
        toast("Admin delete access updated.");
        renderAdmin("admins");
      } catch (error) {
        toast(error.message);
        input.checked = !input.checked;
      }
    });
  });
}

function adminRow(user, masterAdminEmail, currentIsMaster) {
  const isMaster = user.email.toLowerCase() === masterAdminEmail;
  const canDelete = currentIsMaster || state.user?.canDeleteAdmins;
  const canDeleteThis = canDelete && (!isMaster || currentIsMaster);
  return `
    <div class="admin-row">
      <p><strong>${escapeHtml(user.name)}</strong><br>${escapeHtml(user.email)}${isMaster ? " - Master Admin" : ""}</p>
      <div class="admin-row-actions">
        ${currentIsMaster ? `<label class="mini-check"><input type="checkbox" data-admin-toggle-delete="${user.id}" ${user.canDeleteAdmins ? "checked" : ""} ${isMaster ? "disabled" : ""} /> Delete access</label>` : `<span>${user.canDeleteAdmins ? "Can delete admins" : "No delete access"}</span>`}
        ${canDeleteThis ? `<button class="outline-btn" data-admin-delete="${user.id}">${isMaster ? "Remove myself" : "Delete"}</button>` : ""}
      </div>
    </div>`;
}

function renderSiteSettings(host, settings = {}) {
  host.innerHTML = `
    <article>
      <h3>Change Site Content</h3>
      <form class="admin-form" id="settingsForm">
        <label>Site Name<input name="siteName" value="${escapeHtml(settings.siteName || "Shubhh Rishtey")}" /></label>
        <label>Hero Heading<input name="heroHeading" value="${escapeHtml(settings.heroHeading || "")}" /></label>
        <label>Hero Subheading<textarea name="heroSubheading">${escapeHtml(settings.heroSubheading || "")}</textarea></label>
        <label>Trust Line<input name="heroTrust" value="${escapeHtml(settings.heroTrust || "")}" /></label>
        <label>Phone<input name="phone" value="${escapeHtml(settings.phone || "")}" /></label>
        <label>Email<input name="email" value="${escapeHtml(settings.email || "")}" /></label>
        <label>Country<input name="country" value="${escapeHtml(settings.country || "")}" /></label>
        <button class="primary-btn">Save Site Changes</button>
      </form>
    </article>`;
  document.querySelector("#settingsForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      const data = await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      state.settings = data.settings;
      toast("Site changes saved.");
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderPasswordChange(host) {
  host.innerHTML = `
    <article>
      <h3>Change Password</h3>
      <form class="admin-form" id="passwordForm">
        <label>Current Password<input type="password" name="currentPassword" required /></label>
        <label>New Password<input type="password" name="newPassword" required /></label>
        <button class="primary-btn">Change Password</button>
      </form>
    </article>`;
  document.querySelector("#passwordForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await api("/api/change-password", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      event.currentTarget.reset();
      toast("Password changed successfully.");
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderInfoPage(key) {
  const page = pageData[key];
  if (key === "contact") return renderContactPage(page);
  app.innerHTML = pageHeader(page.title, page.eyebrow, page.body[0]) + `
    <section class="section content-prose">
      ${page.body.map(paragraph => `<p>${paragraph}</p>`).join("")}
      <div class="cards-grid">
        <article class="info-card profile-body"><h3>Verified Profiles</h3><p>Identity-aware profile creation and member reporting.</p></article>
        <article class="info-card profile-body"><h3>Smart Search</h3><p>Find matches by name, city, profession, and preferences.</p></article>
        <article class="info-card profile-body"><h3>Dynamic Server</h3><p>Profiles, users, interests, plans, and messages are saved through API routes.</p></article>
      </div>
    </section>`;
}

function renderContactPage(page) {
  app.innerHTML = pageHeader(page.title, page.eyebrow, page.body[0]) + `
    <section class="section split-section">
      <div class="content-prose">${page.body.map(paragraph => `<p>${paragraph}</p>`).join("")}</div>
      <form class="wide-form contact-form" id="contactForm">
        <label>Name<input name="name" required placeholder="Your name" /></label>
        <label>Email<input type="email" name="email" required placeholder="your@email.com" /></label>
        <label>Message<textarea name="message" required placeholder="How can we help?"></textarea></label>
        <button>Send Message</button>
      </form>
    </section>`;
  document.querySelector("#contactForm").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      await api("/api/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      event.currentTarget.reset();
      toast("Contact message saved. Admin can view it.");
    } catch (error) {
      toast(error.message);
    }
  });
}

function pageHeader(title, eyebrow, body) {
  return `<section class="page-band"><div class="section page-hero small-hero"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${body}</p></div></section>`;
}

function renderProfileCards(container, list) {
  container.innerHTML = list.length ? list.map(profileCard).join("") : `<p>No profiles found. Try a different search.</p>`;
  wireProfileButtons(container);
}

function profileCard(profile) {
  return `<article class="profile-card">
    <div class="profile-photo" style="background-image:url('${profile.image}')"></div>
    <div class="profile-body">
      <h3>${escapeHtml(profile.name)}</h3>
      <p>${escapeHtml(profile.about || "")}</p>
      <div class="profile-meta"><span>${profile.age || ""}</span><span>${escapeHtml(profile.city || "")}</span><span>${escapeHtml(profile.job || "")}</span><span>${escapeHtml(profile.community || "")}</span></div>
      <div class="profile-actions"><a class="outline-btn" href="#profile/${profile.id}">View</a><button data-interest-id="${profile.id}">Interest</button><button data-shortlist-id="${profile.id}">Shortlist</button><button data-message="${profile.id}">Message</button></div>
    </div>
  </article>`;
}

function wireProfileButtons(scope) {
  wireInterestButtons(scope);
  wireShortlistButtons(scope);
  scope.querySelectorAll("[data-message]").forEach(button => {
    button.addEventListener("click", () => {
      if (!state.user) {
        toast("Please login to message members.");
        location.hash = "login";
        return;
      }
      location.hash = "dashboard/messages";
    });
  });
}

function wireShortlistButtons(scope) {
  scope.querySelectorAll("[data-shortlist-id]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!state.user) {
        toast("Please login to shortlist profiles.");
        location.hash = "login";
        return;
      }
      try {
        const data = await api("/api/shortlist", {
          method: "POST",
          body: JSON.stringify({ profileId: Number(button.dataset.shortlistId) })
        });
        toast(data.shortlisted ? "Profile added to shortlist." : "Profile removed from shortlist.");
      } catch (error) {
        toast(error.message);
      }
    });
  });
}

function wireInterestButtons(scope) {
  scope.querySelectorAll("[data-interest-id]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!state.user) {
        toast("Please login to send interest.");
        location.hash = "login";
        return;
      }
      try {
        await api("/api/interests", {
          method: "POST",
          body: JSON.stringify({ profileId: Number(button.dataset.interestId) })
        });
        toast("Interest saved on the server.");
      } catch (error) {
        toast(error.message);
      }
    });
  });
}

function requireLogin() {
  if (!state.user || !state.token) {
    toast("Please login first.");
    location.hash = "login";
    return false;
  }
  return true;
}

async function logout() {
  try {
    if (state.token) await api("/api/logout", { method: "POST", body: "{}" });
  } catch {
    /* Logout should still clear local session if the server is unavailable. */
  }
  state.user = null;
  state.token = "";
  persistSession();
  updateHeader();
  toast("Logged out successfully.");
  location.hash = "home";
}

function updateHeader() {
  const authLink = document.querySelector("[data-auth-link]");
  const registerLink = document.querySelector("[data-register-link]");
  if (!authLink || !registerLink) return;
  if (state.user) {
    authLink.textContent = state.user.role === "admin" ? "Admin" : "Dashboard";
    authLink.href = state.user.role === "admin" ? "#admin" : "#dashboard";
    registerLink.textContent = "Logout";
    registerLink.href = "#home";
    registerLink.onclick = event => {
      event.preventDefault();
      logout();
    };
  } else {
    authLink.textContent = "Login";
    authLink.href = "#login";
    registerLink.textContent = "Register";
    registerLink.href = "#register";
    registerLink.onclick = null;
  }
}

function applySiteSettings() {
  const settings = state.settings;
  if (!settings) return;
  document.querySelectorAll(".brand-name").forEach(item => item.textContent = settings.siteName || "Shubhh Rishtey");
  const heroTitle = document.querySelector(".hero h1");
  const heroSub = document.querySelector(".hero-sub");
  const heroMini = document.querySelector(".hero-mini");
  if (heroTitle) heroTitle.textContent = settings.heroHeading || heroTitle.textContent;
  if (heroSub) heroSub.textContent = settings.heroSubheading || heroSub.textContent;
  if (heroMini) heroMini.textContent = settings.heroTrust || heroMini.textContent;
  const footerBottom = document.querySelector(".footer-bottom");
  if (footerBottom) {
    footerBottom.innerHTML = `<span>Phone: ${escapeHtml(settings.phone || "")}</span><span>Email: ${escapeHtml(settings.email || "")}</span><span>Country: ${escapeHtml(settings.country || "")}</span>`;
  }
  const footerPhone = document.querySelector("[data-footer-phone]");
  const footerEmail = document.querySelector("[data-footer-email]");
  const footerCountry = document.querySelector("[data-footer-country]");
  if (footerPhone) footerPhone.textContent = `Phone: ${settings.phone || ""}`;
  if (footerEmail) footerEmail.textContent = `Email: ${settings.email || ""}`;
  if (footerCountry) footerCountry.textContent = `Country: ${settings.country || ""}`;
}

function updateFooterStats() {
  const footerStats = document.querySelector(".footer-stats");
  if (!footerStats || !state.stats) return;
  const pretty = value => `${Number(value || 0).toLocaleString("en-IN")}+`;
  const displayStats = {
    paired: Math.max(Number(state.stats.paired || 0), 8542),
    registered: Math.max(Number(state.stats.registered || 0), 25430),
    women: Math.max(Number(state.stats.women || 0), 13430),
    men: Math.max(Number(state.stats.men || 0), 12000)
  };
  footerStats.innerHTML = `
    <article><strong>${pretty(displayStats.paired)}</strong><span>Couples Paired</span></article>
    <article><strong>${pretty(displayStats.registered)}</strong><span>Registered Members</span></article>
    <article><strong>${pretty(displayStats.women)}</strong><span>Women</span></article>
    <article><strong>${pretty(displayStats.men)}</strong><span>Men</span></article>`;
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const note = document.createElement("div");
  note.className = "toast";
  note.textContent = message;
  document.body.append(note);
  setTimeout(() => note.remove(), 2800);
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, char => char.toUpperCase());
}

function option(value, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function openSideMenu() {
  sideMenu.classList.add("open");
  menuScrim.classList.add("open");
  menuButton.setAttribute("aria-expanded", "true");
}

function closeSideMenu() {
  sideMenu.classList.remove("open");
  menuScrim.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", openSideMenu);
closeMenu.addEventListener("click", closeSideMenu);
menuScrim.addEventListener("click", closeSideMenu);
sideMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeSideMenu));
window.addEventListener("hashchange", route);

updateHeader();
bootstrap();
