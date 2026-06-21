# Digital Product Membership Marketplace (MERN)

A membership-based digital marketplace (themes, plugins, templates, courses) with a
public site, member dashboard, and full **Admin Panel** at `/admin`.

```
clnt new pro/
├── client/   React + Vite frontend (public site, dashboard, admin panel)
├── server/   Express + MongoDB API (auth, products, membership, payments, blog)
└── package.json  (root scripts to run both together)
```

## Tech Stack
- **Frontend:** React 19, React Router 6, Axios, Vite
- **Backend:** Node, Express, MongoDB (Mongoose), JWT auth, Multer uploads, Nodemailer
- **DB:** MongoDB Atlas (configured in `server/.env`)

---

## Quick Start

### 1. Install dependencies
```bash
npm run install:all      # installs both server and client
# (root deps for the combined dev script)
npm install
```

### 2. Configure environment
`server/.env` is already set up with your MongoDB Atlas URI. Key values:
```
MONGO_URI=...           # MongoDB Atlas connection
JWT_SECRET=...          # change for production
ADMIN_EMAIL=admin@blizmatt.com
ADMIN_PASSWORD=admin123
```

### 3. Seed the database (admin user, categories, 24 products, plans, blogs)
```bash
npm run seed
```

### 4. Run everything
```bash
npm run dev              # runs server (:5000) + client (:5173/5174) together
```
Or run separately:
```bash
npm run dev:server       # API on http://localhost:5000
npm run dev:client       # site on http://localhost:5173
```

---

## Logins (from seed)
| Role   | Email                | Password  |
|--------|----------------------|-----------|
| Admin  | admin@blizmatt.com   | admin123  |
| Member | member@demo.com      | demo123   |

- **Admin panel:** http://localhost:5173/admin
- **Member dashboard:** http://localhost:5173/dashboard

---

## Features

### Public site
- Home (dynamic featured products + pricing from DB)
- Product listing with filters (category, type, sort) + pagination
- Instant AJAX search with suggestions
- Product detail (gallery, features, changelog, related, download)
- Membership / pricing page with checkout
- Blog + post pages with comments
- Login / Register / Forgot + Reset password

### Member
- Dashboard: overview, download history, favorites, membership status, profile edit
- Download protection (active membership required)

### Admin (`/admin`)
- Dashboard stats (users, members, revenue, downloads, top products)
- Products CRUD (with image/file upload)
- Categories CRUD
- Membership plans CRUD
- Users management (block, promote, grant membership, delete)
- Blog CRUD (SEO meta)
- Download tracking
- Payments management (filter, refund)

---

## Payments
Runs in **mock/test mode** by default — membership activates end-to-end so flows are
testable. To go live, add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` to `server/.env`
and complete the signature verification in `server/src/controllers/paymentController.js`.

## Email
If SMTP vars are blank in `.env`, emails (welcome, payment, reset) are logged to the
server console. Add SMTP credentials to send real mail.
