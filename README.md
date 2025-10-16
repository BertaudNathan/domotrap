# Hackathon (Admin statique + Auth + Fiche détail)

HTML/CSS/JS **statiques** servis par **Express** + endpoints **mock JSON** en mémoire.  
Auth par **session**. Rôles : **SUPERADMIN** et **ADMIN** accèdent au dashboard.  
Seul le **SUPERADMIN** peut modifier/supprimer des **ADMIN**. Détail des babyfoots avec **conditions/dégâts**.

> Ce README a été **complété** pour faciliter l’**intégration d’une API réelle** en lieu et place des mocks.

---

## 🚀 Démarrage rapide

```bash
cd Hackathon
npm install
npm run dev
# → http://localhost:5173/login
# Comptes démo :
#   superadmin@ynov.fr / super123
#   admin@ynov.fr      / admin123
```

Variables utiles (optionnelles) :

- `PORT` (défaut : `5173`)
- `SESSION_SECRET` (sinon `CHANGE_THIS_SECRET_IN_PROD`)

---

## 🧱 Architecture minimale

```
Hackathon/
├─ public/                 # Front statique (HTML/CSS/vanilla JS)
│  ├─ login.html           # Form POST → /auth/login
│  └─ admin/               # Zone protégée par session
│     ├─ index.html        # Vue stats
│     ├─ babyfoots.html    # Liste/CRUD tables
│     ├─ babyfoot.html     # Détail + conditions/dégâts
│     └─ users.html        # Liste/CRUD users (règles de rôle)
├─ src/
│  ├─ app.js               # Serveur Express + routes /mock + auth + static
│  └─ store.js             # Données en mémoire (mocks)
└─ package.json
```

---

## 🔐 Auth & sessions (comportement attendu côté API)

- **Login** : `POST /auth/login` (form-urlencoded) avec `{ email, password }`
  - En cas d’échec → **redirect** `302` vers `/login?error=1` (comportement actuel).
  - En cas de succès → **redirect** vers `/admin/` **et** création d’une **session** (cookie `Dashboard.sid` httpOnly).
- **Me** : `GET /auth/me` → retourne l’utilisateur connecté `{ id, email, role, displayName? }`.
- **Logout** : `POST /auth/logout` → détruit la session + redirect `/login`.

> ⚠️ Le frontend attend une **session serveur** (pas de JWT côté front). Si vous remplacez par un **JWT**, vous devrez aussi adapter les fetchs et les guards côté serveur **et** côté front.

### Rôles attendus

- `SUPERADMIN` et `ADMIN` → accès admin.
- Mises à jour / suppressions d’utilisateurs :
  - **Interdit** de modifier/supprimer un `SUPERADMIN`.
  - Modifier/supprimer un `ADMIN` nécessite d’être `SUPERADMIN`.
  - Attribuer `ADMIN` ou `SUPERADMIN` nécessite d’être `SUPERADMIN`.

Ces règles sont **enforcées côté serveur** via les middlewares `requireAuth` et `guardUserMutation` (cf. `src/app.js`).

---

## 🔁 Endpoints **mock** existants (à remplacer)

| Domaine       | Méthode | Route                                 | Corps / Query                            | Réponse (extrait) |
|---------------|---------|----------------------------------------|------------------------------------------|-------------------|
| Auth          | POST    | `/auth/login`                          | `email`, `password` (form)               | 302 redirect + cookie session |
| Auth          | GET     | `/auth/me`                             | —                                        | `{ id, email, role, displayName? }` |
| Auth          | POST    | `/auth/logout`                         | —                                        | 302 redirect |
| Stats         | GET     | `/mock/stats/overview`                 | —                                        | `{ totalTables, active, down, occupancyRate, avgMatchDuration, peakHours }` |
| Babyfoots     | GET     | `/mock/babyfoots`                      | `q`, `status`, `page`, `limit`           | `{ items:[…], page, total, hasMore }` |
| Babyfoots     | GET     | `/mock/babyfoots/:id`                  | —                                        | `{ id, name, location, status, lastActiveAt, firmware, conditions:[…] }` |
| Babyfoots     | POST    | `/mock/babyfoots`                      | `{ name, location, status }`             | `201` + objet créé |
| Babyfoots     | PATCH   | `/mock/babyfoots/:id`                  | champs partiels                          | objet maj ou `404` |
| Babyfoots     | DELETE  | `/mock/babyfoots/:id`                  | —                                        | `204` ou `404` |
| Conditions    | GET     | `/mock/conditions`                     | —                                        | liste `{ id, label, level: "OK"|"WARN"|"ERROR" }` triée |
| Conditions    | POST    | `/mock/conditions`                     | `{ label, level? }`                      | `201` + objet |
| Conditions    | PATCH   | `/mock/conditions/:id`                 | champs partiels                          | objet maj ou `404` |
| Conditions↔Tab| PATCH   | `/mock/babyfoots/:id/conditions`       | `{ add?:string[], remove?:string[] }`    | objet table maj |
| Users         | GET     | `/mock/users`                          | `q`, `role`, `page`, `limit`             | `{ items:[…], page, total, hasMore }` |
| Users         | PATCH   | `/mock/users/:id`                      | champs partiels                          | objet maj / `403` / `404` |
| Users         | DELETE  | `/mock/users/:id`                      | —                                        | `204` / `403` / `404` |

> Les pages front consomment **exactement** ces routes avec `fetch()` (voir `public/admin/*.html`).

---

## 🧩 Stratégie d’intégration d’API (recommandée)

1. **Exposez vos routes réelles** derrière un préfixe, ex. `/api`.
2. **Activez CORS** si votre API est sur un autre domaine/port (autorisez le cookie de session si nécessaire : `credentials`). 
3. **Alignez les schémas** de réponse sur ce que le front attend (voir tableau ci-dessus).
4. **Mettez un “adapter”** minimal dans `src/app.js` pour **proxy** temporairement les appels front → API réelle
   - Exemple : remplacer `app.get("/mock/babyfoots", …)` par un proxy vers `GET {API_BASE}/babyfoots` et renvoyer le même shape.
5. **Quand tout est branché**, supprimez proprement les routes `/mock/*` et l’état en mémoire (`src/store.js`).

### Exemple de proxy minimal (Express)

```js
// dans src/app.js
const API_BASE = process.env.API_BASE || "http://localhost:3000";

app.get("/mock/babyfoots", requireAuth, async (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  const r = await fetch(`${API_BASE}/babyfoots?${qs}`, { headers: { cookie: req.headers.cookie || "" }, credentials: "include" });
  const data = await r.json();
  // adapter si besoin : renommer champs pour coller au front
  res.status(r.status).json(data);
});
```

> Si votre API utilise **JWT**, renvoyez un cookie httpOnly depuis `/auth/login` ou adaptez le front pour stocker le token et l’envoyer dans `Authorization` (et modifiez `requireAuth`).

---

## 📦 Modèles attendus (exemples)

### Babyfoot
```json
{
  "id": "uuid",
  "name": "Table A",
  "location": "Souk – zone A",
  "status": "OK",
  "lastActiveAt": "2025-10-01T12:34:56.000Z",
  "firmware": "1.0.0",
  "conditions": ["good", "needs cleaning"]
}
```

### Condition (catalogue)
```json
{ "id": "uuid", "label": "missing screw", "level": "ERROR" }
```

### User (admin)
```json
{
  "id": "uuid",
  "email": "admin@domain.tld",
  "displayName": "Admin",
  "role": "ADMIN",
  "active": true,
  "createdAt": "2025-10-01T12:00:00.000Z"
}
```

### Pagination standard
Réponse type liste :
```json
{ "items": [], "page": 1, "total": 42, "hasMore": true }
```

---

## 🔧 Points d’ancrage côté Front

- `public/admin/babyfoots.html`
  - charge la liste via `GET /mock/babyfoots?q=&status=&page=`
  - crée via `POST /mock/babyfoots` (`{ name, location, status }`)
  - supprime via `DELETE /mock/babyfoots/:id`
- `public/admin/babyfoot.html`
  - détail via `GET /mock/babyfoots/:id`
  - met à jour `status` via `PATCH /mock/babyfoots/:id`
  - ajoute/retire des **conditions** via `PATCH /mock/babyfoots/:id/conditions`
  - catalogue via `GET /mock/conditions`
- `public/admin/users.html`
  - liste via `GET /mock/users?q=&role=&page=`
  - met à jour via `PATCH /mock/users/:id`
  - supprime via `DELETE /mock/users/:id` (garde-fous rôles)
- `public/admin/index.html`
  - stats via `GET /mock/stats/overview`
- `public/login.html`
  - `POST /auth/login` (form) → cookie de session

---

## ⚙️ .env d’exemple

```
PORT=5173
SESSION_SECRET=vous_devez_changer_ce_secret_en_prod
API_BASE=http://localhost:3000
```

---

## 🧪 Exemples de requêtes (cURL)

```bash
# Me (après login)
curl -i -b "Dashboard.sid=XXX" http://localhost:5173/auth/me

# Liste babyfoots
curl -b "Dashboard.sid=XXX" "http://localhost:5173/mock/babyfoots?status=OK&page=1&limit=20"

# Créer un babyfoot
curl -X POST -H "Content-Type: application/json"   -b "Dashboard.sid=XXX"   -d '{"name":"Table Z","location":"Zone D","status":"OK"}'   http://localhost:5173/mock/babyfoots
```

---

## 🛡️ Sécurité & CORS

- Servez le cookie de session avec `httpOnly`, `secure` (en prod) et éventuellement `sameSite` selon votre front.
- Si l’API est sur un autre **origin**, configurez :
  - `app.set('trust proxy', 1)` si vous êtes derrière un proxy
  - `cors({ origin: FRONT_URL, credentials: true })`
  - et côté fetch : `fetch(url, { credentials: "include" })`

---

## 🧹 Nettoyage final (quand l’API est branchée)

- Supprimez les routes `/mock/*` de `src/app.js`.
- Supprimez `src/store.js`.
- Remplacez les appels front (`/mock/...`) par vos routes (ou gardez vos proxys avec le même chemin).

---

## ✅ Checklist d’intégration

- [ ] `/auth/login` crée une session et redirige `/admin/`
- [ ] `/auth/me` renvoie `{ id, email, role }`
- [ ] Guards rôles respectés (SUPERADMIN > ADMIN)
- [ ] Listes paginées renvoient `{ items, page, total, hasMore }`
- [ ] CRUD babyfoots ok (+ patch conditions)
- [ ] CRUD conditions ok
- [ ] CRUD users ok (403 attendus selon rôle)
- [ ] CORS + cookies configurés si API ≠ même origin
- [ ] Suppression des mocks en fin de chantier
