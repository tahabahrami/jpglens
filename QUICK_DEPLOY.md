# 🚀 Quick Deploy Commands

Copy and paste these commands to deploy your JPGLens website:

## 1️⃣ **Vercel Setup** (One-time)

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Or use web dashboard:
# https://vercel.com/dashboard → New Project → Import from GitHub
```

**Vercel Project Settings:**
- Framework: `Vite`
- Root Directory: `website`
- Build Command: `npm run build`
- Output Directory: `dist`

## 2️⃣ **GitHub Secrets** (One-time)

Go to: **Your Repo → Settings → Secrets → Actions**

Add these secrets:
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

Get tokens from:
- VERCEL_TOKEN: https://vercel.com/account/tokens
- Project IDs: Vercel project settings or `cd website && vercel env ls`

## 3️⃣ **Deploy Commands**

```bash
# Commit and push (triggers automatic deployment)
git add .
git commit -m "feat: add website deployment with automated CI/CD"
git push origin main

# Your website will be live at:
# https://your-project-name.vercel.app
```

## 🧪 **Test Locally First**

```bash
# Test everything works
cd website
npm install
npm run build
npm run preview

# Verify deployment readiness
node scripts/verify-deployment.js
```

## ⚡ **Manual Deploy** (if needed)

```bash
cd website
npm run deploy
```

## 🎯 **That's It!**

Your website will have:
- ✅ Automatic deployments on push
- ✅ Preview builds for PRs
- ✅ Documentation auto-sync
- ✅ Global CDN + HTTPS
- ✅ Performance optimization

**Website URL**: `https://your-project-name.vercel.app`
