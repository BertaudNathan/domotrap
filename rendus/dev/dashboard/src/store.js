import { randomUUID } from "crypto";

const state = {
  babyfoots: [
    {
      id: randomUUID(),
      name: "Table A",
      location: "Souk – zone A",
      status: "OK",
      lastActiveAt: new Date().toISOString(),
      firmware: "1.0.0",
      conditions: ["good", "needs cleaning"]
    },
    {
      id: randomUUID(),
      name: "Table B",
      location: "Souk – zone B",
      status: "BUSY",
      lastActiveAt: new Date().toISOString(),
      firmware: "1.0.1",
      conditions: ["out of alignment", "sticky handles", "scratched"]
    },
    {
      id: randomUUID(),
      name: "Table C",
      location: "Souk – zone C",
      status: "DOWN",
      lastActiveAt: null,
      firmware: "0.9.9",
      conditions: ["broken leg", "missing screw", "beer stains", "worn"]
    }
  ],

  // Catalogue global (avec gravité)
  // level ∈ "OK" | "WARN" | "ERROR"
  conditionsCatalog: [
    { id: randomUUID(), label: "good",             level: "OK" },
    { id: randomUUID(), label: "needs cleaning",   level: "WARN" },
    { id: randomUUID(), label: "out of alignment", level: "WARN" },
    { id: randomUUID(), label: "sticky handles",   level: "WARN" },
    { id: randomUUID(), label: "scratched",        level: "WARN" },
    { id: randomUUID(), label: "broken leg",       level: "ERROR" },
    { id: randomUUID(), label: "missing screw",    level: "ERROR" },
    { id: randomUUID(), label: "beer stains",      level: "WARN" },
    { id: randomUUID(), label: "worn",             level: "WARN" }
  ],

  users: [
    { id: randomUUID(), email: "superadmin@ynov.fr", password: "super123",   displayName: "Super Admin", role: "SUPERADMIN", active: true, createdAt: new Date().toISOString() },
    { id: randomUUID(), email: "admin@ynov.fr",      password: "admin123",   displayName: "Admin",       role: "ADMIN",      active: true, createdAt: new Date().toISOString() },
    { id: randomUUID(), email: "etudiant@ynov.fr",   password: "student123", displayName: "Étudiant",    role: "STUDENT",    active: true, createdAt: new Date().toISOString() }
  ]
};

const paginate = (items, page = 1, limit = 50) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 50);
  const start = (p - 1) * l;
  return { items: items.slice(start, start + l), total: items.length, page: p, limit: l };
};

/* --------- Helpers --------- */
function levelForLabel(label) {
  const lbl = String(label).toLowerCase();
  const hit = state.conditionsCatalog.find(c => c.label.toLowerCase() === lbl);
  if (hit) return hit.level;
  if (lbl.includes("good") || lbl.includes("new")) return "OK";
  if (lbl.includes("broken") || lbl.includes("missing") || lbl.includes("crack")) return "ERROR";
  return "WARN";
}
const levelOrder = lvl => (lvl === "OK" ? 0 : lvl === "WARN" ? 1 : 2);

export const Store = {
  // === Auth
  findUserByEmail(email) {
    return state.users.find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null;
  },
  validatePassword(user, password) {
    return !!user && user.password === password && user.active;
  },
  getUserById(id) {
    return state.users.find(u => u.id === id) || null;
  },

  // === Overview
  getOverview() {
    const totalTables = state.babyfoots.length;
    const down = state.babyfoots.filter(b => b.status === "DOWN").length;
    const active = totalTables - down;
    const occupancyRate = state.babyfoots.filter(b => b.status === "BUSY").length / Math.max(1, totalTables);
    const avgMatchDuration = 12;
    const peakHours = [12, 13, 18];
    return { totalTables, active, down, occupancyRate, avgMatchDuration, peakHours };
  },

  // === Conditions catalog
  listConditions() {
    // 👉 Tri par niveau (OK → WARN → ERROR) puis alpha
    return [...state.conditionsCatalog].sort((a, b) => {
      const lo = levelOrder(a.level) - levelOrder(b.level);
      return lo !== 0 ? lo : a.label.localeCompare(b.label, "fr", { sensitivity: "base" });
    });
  },
  addCondition({ label, level = "WARN" }) {
    const exists = state.conditionsCatalog.find(c => c.label.toLowerCase() === String(label).toLowerCase());
    if (exists) return exists;
    const cond = { id: randomUUID(), label: String(label), level: level === "OK" ? "OK" : level === "ERROR" ? "ERROR" : "WARN" };
    state.conditionsCatalog.push(cond);
    return cond;
  },
  updateCondition(id, payload) {
    const idx = state.conditionsCatalog.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const lvl = payload.level ? (payload.level === "OK" ? "OK" : payload.level === "ERROR" ? "ERROR" : "WARN") : undefined;
    state.conditionsCatalog[idx] = { ...state.conditionsCatalog[idx], ...payload, ...(lvl ? { level: lvl } : {}) };
    return state.conditionsCatalog[idx];
  },
  deleteCondition(id) {
    const before = state.conditionsCatalog.length;
    state.conditionsCatalog = state.conditionsCatalog.filter(c => c.id !== id);
    return state.conditionsCatalog.length < before;
  },

  // === Babyfoots
  listBabyfoots({ q = "", status = "", page = 1, limit = 50 } = {}) {
    let arr = [...state.babyfoots];
    if (q) {
      const qq = q.toLowerCase();
      arr = arr.filter(b => b.name.toLowerCase().includes(qq) || b.location.toLowerCase().includes(qq));
    }
    if (status) arr = arr.filter(b => b.status === status);
    return paginate(arr, page, limit);
  },
  getBabyfoot(id) {
    return state.babyfoots.find(b => b.id === id) || null;
  },
  createBabyfoot({ name, location, status = "OK", firmware }) {
    const b = { id: randomUUID(), name, location, status, firmware, lastActiveAt: null, conditions: ["new"] };
    state.babyfoots.unshift(b);
    return b;
  },
  updateBabyfoot(id, payload) {
    const idx = state.babyfoots.findIndex(b => b.id === id);
    if (idx === -1) return null;
    state.babyfoots[idx] = { ...state.babyfoots[idx], ...payload };
    if (payload.status === "BUSY") state.babyfoots[idx].lastActiveAt = new Date().toISOString();
    return state.babyfoots[idx];
  },
  deleteBabyfoot(id) {
    const before = state.babyfoots.length;
    state.babyfoots = state.babyfoots.filter(b => b.id !== id);
    return state.babyfoots.length < before;
  },

  // Règles auto statut en fonction des conditions
  patchBabyfootConditions(id, { add = [], remove = [], set = null } = {}) {
    const idx = state.babyfoots.findIndex(b => b.id === id);
    if (idx === -1) return null;

    let cur = new Set(state.babyfoots[idx].conditions || []);
    if (Array.isArray(set)) {
      cur = new Set(set.map(String));
    } else {
      add.forEach(x => cur.add(String(x)));
      remove.forEach(x => cur.delete(String(x)));
    }

    const nextConditions = Array.from(cur);
    state.babyfoots[idx].conditions = nextConditions;

    const hasCritical = nextConditions.some(label => levelForLabel(label) === "ERROR");
    state.babyfoots[idx].status = hasCritical ? "DOWN" : "OK";

    return state.babyfoots[idx];
  },

  // === Users
  listUsers({ role = "", q = "", page = 1, limit = 50 } = {}) {
    let arr = [...state.users];
    if (q) {
      const qq = q.toLowerCase();
      arr = arr.filter(u => u.displayName.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq));
    }
    if (role) arr = arr.filter(u => u.role === role);
    return paginate(arr, page, limit);
  },
  updateUser(id, payload) {
    const idx = state.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    state.users[idx] = { ...state.users[idx], ...payload };
    return state.users[idx];
  },
  deleteUser(id) {
    const before = state.users.length;
    state.users = state.users.filter(u => u.id !== id);
    return state.users.length < before;
  }
};
