# Deploying to Vercel (auto-deploy on git push)

This is a monorepo, so it deploys as **two Vercel projects** from the same GitHub
repo. Once connected, every `git push` to `main` auto-deploys both.

Repo: https://github.com/im-coderavi/bizmart-clone

---

## Step 0 — MongoDB Atlas: allow Vercel
Vercel serverless uses dynamic IPs, so in Atlas:
**Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)**.

---

## Project 1 — Backend (API)

1. Go to https://vercel.com → **Add New → Project** → import `bizmart-clone`.
2. **Root Directory:** `server`
3. Framework Preset: **Other** (vercel.json handles it).
4. **Environment Variables** (copy from your local `server/.env`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `30d`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL` = your frontend URL (set after Project 2 is created)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
   - (optional) `SMTP_*`, `MAIL_FROM`
5. **Deploy**. You'll get a URL like `https://bizmart-clone-api.vercel.app`.
6. Test: open `https://<backend-url>/api/health` → should return `{"ok":true}`.

> Seeding: run `npm run seed` locally (it writes to the same Atlas DB), or
> temporarily hit your local seed. The deployed API reads the same database.

---

## Project 2 — Frontend (site)

1. **Add New → Project** → import the **same** repo again.
2. **Root Directory:** `client`
3. Framework Preset: **Vite** (auto-detected). Build: `npm run build`, Output: `dist`.
4. **Environment Variable:**
   - `VITE_API_URL` = `https://<your-backend-url>/api`  (from Project 1)
5. **Deploy**. You'll get the public site URL.
6. Go back to **Project 1 → Settings → Env** and set `CLIENT_URL` to this site URL
   (used for password-reset email links), then redeploy backend.

---

## Auto-deploy
Both projects are now linked to the repo. Any push:
```bash
git add -A
git commit -m "your change"
git push
```
→ Vercel automatically rebuilds & deploys both frontend and backend. 🎉

---

## Notes
- Image/QR/screenshot uploads go to **Cloudinary** (works on serverless — no disk needed).
- The backend runs as a Vercel **serverless function** (`server/api/index.js`), with a
  cached Mongo connection for warm starts.
- Local dev is unchanged: `npm run dev` (root) runs server :5000 + client :5173.
