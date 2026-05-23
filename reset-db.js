const fs = require("node:fs");
const path = require("node:path");

const dbPath = path.join(__dirname, "data", "db.json");

const profiles = [
  { id: 1, name: "Aaradhya Sharma", email: "aaradhya@example.com", age: 26, gender: "Woman", city: "Delhi", job: "Doctor", religion: "Hindu", community: "Brahmin", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80", about: "Warm, family-oriented, and loves classical music.", verified: true },
  { id: 2, name: "Rohan Mehta", email: "rohan@example.com", age: 29, gender: "Man", city: "Mumbai", job: "Product Manager", religion: "Hindu", community: "Gujarati", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80", about: "Calm, ambitious, and looking for a thoughtful life partner.", verified: true },
  { id: 3, name: "Naina Verma", email: "naina@example.com", age: 25, gender: "Woman", city: "Jaipur", job: "Architect", religion: "Hindu", community: "Rajput", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", about: "Creative, respectful, and close to family values.", verified: true },
  { id: 4, name: "Arjun Kapoor", email: "arjun@example.com", age: 31, gender: "Man", city: "Bengaluru", job: "Software Engineer", religion: "Hindu", community: "Punjabi", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80", about: "Tech professional who enjoys travel and meaningful conversations.", verified: true },
  { id: 5, name: "Meera Iyer", email: "meera@example.com", age: 27, gender: "Woman", city: "Chennai", job: "CA", religion: "Hindu", community: "Tamil", image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=900&q=80", about: "Balanced, practical, and searching for a respectful match.", verified: true },
  { id: 6, name: "Kabir Sinha", email: "kabir@example.com", age: 30, gender: "Man", city: "Kolkata", job: "Entrepreneur", religion: "Hindu", community: "Kayastha", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80", about: "Business minded, optimistic, and family-first.", verified: true },
  { id: 7, name: "Ananya Rao", email: "ananya@example.com", age: 24, gender: "Woman", city: "Pune", job: "Designer", religion: "Hindu", community: "Marathi", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80", about: "Gentle, artistic, and values honesty above all.", verified: true },
  { id: 8, name: "Vivaan Joshi", email: "vivaan@example.com", age: 28, gender: "Man", city: "Ahmedabad", job: "Civil Engineer", religion: "Hindu", community: "Gujarati", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80", about: "Grounded, sincere, and ready for marriage.", verified: true }
];

const db = {
  users: [{ id: 1, name: "Akash Admin", email: "akash241511@gmail.com", password: "123456", role: "admin", plan: "Gold", canDeleteAdmins: true, createdAt: new Date().toISOString() }],
  profiles,
  plans: [
    { name: "Free", price: "Rs 0", note: "Current plan", features: ["Browse profiles", "Send 2 interests daily", "Basic search", "Limited message preview"], restricted: true },
    { name: "Silver", price: "Rs 149/month", note: "For active search", features: ["Send 25 interests daily", "Direct chat unlock", "See phone requests", "Priority profile listing"] },
    { name: "Gold", price: "Rs 349/month", note: "Rs 3000/year option", features: ["Unlimited interests", "Unlimited messages", "Verified badge highlight", "Family contact access", "Relationship manager support"], featured: true }
  ],
  sessions: {},
  interests: [],
  shortlists: [],
  contacts: [],
  notifications: [],
  messages: {},
  settings: {
    siteName: "Shubhh Rishtey",
    heroHeading: "Find your Right Match here",
    heroSubheading: "Find genuine, verified profiles and start your journey toward a happy marriage",
    heroTrust: "Most trusted matrimonial website",
    phone: "+91 98765 43210",
    email: "care@shubbhrishtey.com",
    country: "India"
  },
  views: 0,
  paired: 0
};

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Reset database at ${dbPath}`);
