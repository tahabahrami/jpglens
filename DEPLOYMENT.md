# 🚀 JPGLens Website Deployment Guide

This guide covers deploying the JPGLens website to Vercel with automated CI/CD.

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your repo should be connected to GitHub
3. **Vercel CLI** (optional): `npm i -g vercel`

## 🔧 **Step 1: Vercel Project Setup**

### Option A: Web Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository: `your-username/jpglens`
4. **Configure Project Settings**:
   ```
   Framework Preset: Vite
   Root Directory: website
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### Option B: Vercel CLI
```bash
cd website
vercel
# Follow the prompts
```

## 🔑 **Step 2: Get Required Variables**

After creating the project, you'll need these values:

### **Get Vercel Token**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

### **Get Project & Org IDs**
```bash
cd website
vercel env ls
```
Or from project settings in Vercel dashboard.

## ⚙️ **Step 3: GitHub Secrets Setup**

Add these secrets to your GitHub repository:

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
```

## 🤖 **Step 4: Automated Deployment Workflow**

The workflow will automatically:
- Deploy on every push to `main`
- Deploy preview builds for PRs
- Update documentation when packages are published
- Invalidate cache when needed

## 🌐 **Step 5: Custom Domain (Optional)**

1. In Vercel dashboard → **Project Settings** → **Domains**
2. Add your custom domain: `jpglens.dev` or `docs.jpglens.com`
3. Configure DNS records as shown

## 📊 **Deployment Monitoring**

- **Vercel Dashboard**: Monitor deployments, analytics, logs
- **GitHub Actions**: View workflow runs and build logs
- **Performance**: Vercel provides built-in performance monitoring

## 🔄 **Manual Deployment**

If needed, you can deploy manually:

```bash
cd website
npm run build
vercel --prod
```

## 🐛 **Troubleshooting**

### Build Fails
```bash
# Check build locally
cd website
npm install
npm run build
```

### Environment Issues
- Verify all GitHub secrets are set correctly
- Check Vercel project settings match the configuration above

### Cache Issues
- Clear Vercel cache in dashboard
- Or redeploy: `vercel --prod --force`

## 📈 **Best Practices**

1. **Preview Deployments**: Every PR gets a preview URL
2. **Performance**: Vercel automatically optimizes images and assets
3. **Analytics**: Enable Vercel Analytics for visitor insights
4. **Security**: All connections are HTTPS by default
5. **Global CDN**: Content served from edge locations worldwide

## 🎯 **Next Steps**

After deployment:
1. ✅ Test all pages and functionality
2. ✅ Verify MCP documentation is accessible
3. ✅ Test "Add to Cursor" button
4. ✅ Check mobile responsiveness
5. ✅ Monitor performance metrics

Your JPGLens website will be live at: `https://your-project-name.vercel.app`
