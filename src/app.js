import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { Store } from "./store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ---------- Middlewares ---------- */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Session ---------- */
app.use(session({
  name: "Dashboard.sid",
  secret: "CHANGE_THIS_SECRET_IN_PROD",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

/* ---------- Auth helpers ---------- */
const isAdmin = (u) => u?.role === "ADMIN" || u?.role === "SUPERADMIN";
const isSuper = (u) => u?.role === "SUPERADMIN";
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (!isAdmin(req.session.user)) return res.status(403).send("Accès refusé.");
  next();
}
function guardUserMutation(req, res, next) {
  const actor = req.session.user;
  const target = Store.getUserById(req.params.id);
  if (!target) return next();
  if (target.role === "SUPERADMIN")
    return res.status(403).json({ error: "Impossible de modifier/supprimer un SUPERADMIN." });
  if (target.role === "ADMIN" && !isSuper(actor))
    return res.status(403).json({ error: "Seul le SUPERADMIN peut modifier un ADMIN." });
  const nextRole = req.body?.role;
  if (nextRole && (nextRole === "ADMIN" || nextRole === "SUPERADMIN") && !isSuper(actor))
    return res.status(403).json({ error: "Seul le SUPERADMIN peut attribuer un rôle ADMIN/SUPERADMIN." });
  next();
}

/* ---------- Public assets ---------- */
app.use(express.static(path.join(__dirname, "..", "public")));

/* ---------- Auth pages ---------- */
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = Store.findUserByEmail(email);
  if (!Store.validatePassword(user, password)) return res.redirect("/login?error=1");
  req.session.user = { id: user.id, email: user.email, role: user.role, displayName: user.displayName };
  res.redirect("/admin/");
});
app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("Dashboard.sid");
    res.redirect("/login");
  });
});
app.get("/auth/me", requireAuth, (req, res) => res.json(req.session.user));

/* ---------- Page dédiée /admin/tables/:id ---------- */
app.get("/admin/tables/:id", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin", "babyfoot.html"));
});

/* ---------- Dossier admin protégé ---------- */
app.use("/admin", requireAuth, express.static(path.join(__dirname, "..", "public", "admin")));

/* ---------- APIs mock ---------- */
// Overview
app.get("/mock/stats/overview", requireAuth, (req, res) => res.json(Store.getOverview()));

// Babyfoots
app.get("/mock/babyfoots", requireAuth, (req, res) => {
  const { q = "", status = "", page = 1, limit = 50 } = req.query;
  res.json(Store.listBabyfoots({ q, status, page, limit }));
});
app.get("/mock/babyfoots/:id", requireAuth, (req, res) => {
  const one = Store.getBabyfoot(req.params.id);
  if (!one) return res.status(404).json({ error: "Not found" });
  res.json(one);
});
app.post("/mock/babyfoots", requireAuth, (req, res) => {
  const { name, location, status } = req.body;
  const created = Store.createBabyfoot({ name, location, status });
  res.status(201).json(created);
});
app.patch("/mock/babyfoots/:id", requireAuth, (req, res) => {
  const updated = Store.updateBabyfoot(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});
app.delete("/mock/babyfoots/:id", requireAuth, (req, res) => {
  const ok = Store.deleteBabyfoot(req.params.id);
  res.status(ok ? 204 : 404).end();
});

// Patch conditions d'une table
app.patch("/mock/babyfoots/:id/conditions", requireAuth, (req, res) => {
  const updated = Store.patchBabyfootConditions(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// Catalogue de conditions
app.get("/mock/conditions", requireAuth, (req, res) => {
  res.json(Store.listConditions());
});
app.post("/mock/conditions", requireAuth, (req, res) => {
  const { label, level } = req.body;
  if (!label) return res.status(400).json({ error: "label requis" });
  const created = Store.addCondition({ label, level });
  res.status(201).json(created);
});
app.patch("/mock/conditions/:id", requireAuth, (req, res) => {
  const updated = Store.updateCondition(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});
app.delete("/mock/conditions/:id", requireAuth, (req, res) => {
  const ok = Store.deleteCondition(req.params.id);
  res.status(ok ? 204 : 404).end();
});

// Users
app.get("/mock/users", requireAuth, (req, res) => {
  const { role = "", q = "", page = 1, limit = 50 } = req.query;
  res.json(Store.listUsers({ role, q, page, limit }));
});
app.patch("/mock/users/:id", requireAuth, guardUserMutation, (req, res) => {
  const updated = Store.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});
app.delete("/mock/users/:id", requireAuth, guardUserMutation, (req, res) => {
  const ok = Store.deleteUser(req.params.id);
  res.status(ok ? 204 : 404).end();
});

/* ---------- Root ---------- */
app.get("/", (req, res) => {
  if (isAdmin(req.session.user)) return res.redirect("/admin/");
  return res.redirect("/login");
});

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => console.log(`Dashboard (auth) : http://localhost:${PORT}/login`));
