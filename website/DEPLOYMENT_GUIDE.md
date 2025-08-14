# 🌐 JPGLens Website Deployment Guide

## ✅ **Status: AUTOMATED DEPLOYMENT READY**

Your website is now configured for **fully automated deployment**! 

## 🚀 **What Happens Automatically**

### **Triggers Automatic Deployment:**
- ✅ Any change to `website/` directory
- ✅ Updates to `README.md` (syncs to website)
- ✅ Version bumps in `package.json`
- ✅ Updates to `packages/mcp-server/package.json`

### **Automatic Features:**
- 🔄 **Documentation Sync**: README, API docs, versions
- 🏗️ **Website Build**: Vite production build
- 🚀 **Production Deploy**: Live website updates
- 🔍 **Preview Deploys**: PR previews for testing

## ⚙️ **Required Setup (One-Time)**

### **Step 1: Create Vercel Project**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `website`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### **Step 2: Get Required Values**

**Vercel Token:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token
3. Copy the value

**Project IDs:**
```bash
cd website
npx vercel link
npx vercel env ls
```
Or check your Vercel project settings dashboard.

### **Step 3: Add GitHub Secrets**
1. Go to **Your Repo → Settings → Secrets → Actions**
2. Click **"New repository secret"**
3. Add these three secrets:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

## 🎯 **Testing the Deployment**

After setup, test by making a small change:

```bash
# Make a test change
echo "<!-- Test deployment -->" >> website/index.html

# Commit and push
git add .
git commit -m "test: trigger website deployment"
git push origin main
```

**Check GitHub Actions:**
- Go to your repo → Actions tab
- Look for "🌐 Deploy Website to Vercel" workflow
- Should show green ✅ when successful

## 📊 **Deployment Workflow Details**

### **Production Deployments**
- **Trigger**: Push to `main` branch
- **Process**: Sync docs → Build → Deploy to production
- **URL**: Your live website URL

### **Preview Deployments**  
- **Trigger**: Pull requests
- **Process**: Build → Deploy to preview URL
- **URL**: Unique preview URL (commented on PR)

### **Documentation Sync**
- **Trigger**: Commits with "chore(release)" or "version bump"
- **Process**: Extract versions → Update content → Deploy
- **Result**: Website reflects latest package versions

## 🔍 **Monitoring & Troubleshooting**

### **Check Deployment Status:**
- GitHub Actions tab shows workflow runs
- Vercel dashboard shows deployment logs
- Each deployment gets a unique URL

### **Common Issues:**
1. **Missing Secrets**: Add all three Vercel secrets
2. **Build Errors**: Check `npm run build` works locally
3. **Sync Errors**: Verify `node scripts/sync-docs.js` works

### **Manual Deployment:**
```bash
cd website
npm run build
npx vercel --prod
```

## 🎉 **You're All Set!**

Your website now:
- ✅ **Auto-deploys** on every change
- ✅ **Syncs documentation** automatically  
- ✅ **Provides previews** for testing
- ✅ **Handles versions** seamlessly

**Next time you update your README or package version, your website will automatically reflect the changes within minutes!**

---

**Need help?** Check the GitHub Actions logs or Vercel deployment dashboard for detailed information.
