# jpglens Website

Official website for jpglens - Universal AI-Powered UI Testing tool with MCP v6 integration.

## 🚀 Features

- **Optimized for Vercel**: Production-ready configuration with proper caching, redirects, and security headers
- **Automated Documentation Sync**: GitHub Actions workflow automatically syncs package updates with website content
- **MCP Integration Landing Page**: Dedicated section showcasing AI agent vision capabilities
- **Modern Build System**: Vite-powered with optimized assets and code splitting
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox

## 📁 Structure

```
jpglensdev/
├── public/                 # Static assets
├── src/
│   ├── styles/            # CSS modules
│   ├── scripts/           # JavaScript functionality
│   └── data/             # Metadata and configuration
├── docs/                  # Documentation pages
├── examples/              # Example implementations
├── comparison/            # Feature comparisons
├── mcp/                   # MCP integration landing page
├── scripts/               # Build and sync scripts
└── .github/workflows/     # CI/CD automation
```

## 🛠 Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build  # Syncs docs + builds + optimizes
\`\`\`

### Deployment
\`\`\`bash
npm run deploy  # Build + deploy to Vercel
\`\`\`

## 🔄 Automated Documentation Sync

The website automatically stays in sync with the main jpglens packages:

### Triggers
- Package version updates (`package.json` changes)
- README.md updates
- API documentation changes
- CHANGELOG updates

### Process
1. **GitHub Actions** detects changes
2. **sync-docs.js** extracts content from main repo
3. **Vite** builds optimized static site
4. **Vercel** deploys automatically

### Manual Sync
\`\`\`bash
npm run sync  # Manual documentation sync
\`\`\`

## 🎭 MCP Integration Features

### Landing Page (/mcp/)
- **AI Agent Vision** showcase
- **Interactive terminal** demonstration  
- **Add to Cursor** button with modal
- **Installation tabs** (Cursor IDE, Global, Docker)
- **Copy-to-clipboard** functionality

### Homepage Integration
- **MCP highlight** in navigation
- **AI Agents with Vision** section
- **Production ready** badges
- **Quick install** buttons

## 📊 Performance Optimizations

### Vercel Configuration
- **Smart caching**: Static assets (1 year), images (30 days)
- **Security headers**: CSP, XSS protection, frame options
- **Redirects**: SEO-friendly shortcuts (/github, /npm, /mcp-server)
- **Rewrites**: SPA-style routing for docs sections

### Build Optimizations
- **Code splitting**: Vendor chunks separated
- **Asset optimization**: Minified CSS/JS, optimized images
- **Tree shaking**: Unused code elimination
- **Source maps**: Disabled in production

### Runtime Features
- **Intersection Observer**: Lazy loading animations
- **Service Worker**: (Future) Offline support
- **Web Vitals**: Performance monitoring ready

## 🎨 Design System

### Colors
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple) 
- **Accent**: #06b6d4 (Cyan)
- **Success**: #10b981 (Emerald)

### Typography
- **Sans**: Inter (UI text)
- **Mono**: JetBrains Mono (Code blocks)

### Components
- **Gradient buttons**: MCP integration CTAs
- **Feature cards**: Hover animations
- **Code blocks**: Syntax highlighting
- **Terminal**: Typing animations

## 📈 Analytics & Tracking

Ready for analytics integration:
- **Google Analytics**: Event tracking for MCP interactions
- **Vercel Analytics**: Performance monitoring
- **Copy events**: Install command tracking
- **Navigation**: Page view tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables (if needed)

### Manual Deploy
\`\`\`bash
npm run build
npx vercel --prod
\`\`\`

## 🔧 Environment Variables

### Required for Full Functionality
- `VERCEL_TOKEN`: For automated deployments
- `VERCEL_ORG_ID`: Organization ID
- `VERCEL_PROJECT_ID`: Project ID
- `REVALIDATE_TOKEN`: Cache invalidation

### Optional
- `MAIN_VERSION`: Override main package version
- `MCP_VERSION`: Override MCP server version

## 📝 Content Management

### Automatic Sync Sources
- `../README.md` → Homepage content
- `../API.md` → Documentation sections  
- `../CHANGELOG.md` → Version history
- `../packages/mcp-server/` → MCP documentation

### Manual Content
- `index.html` → Homepage structure
- `mcp/index.html` → MCP landing page
- `docs/index.html` → Documentation hub
- `examples/index.html` → Usage examples

## 🤝 Contributing

1. **Development**: Make changes in `src/` directories
2. **Testing**: `npm run dev` for local preview
3. **Documentation**: Update README if adding features
4. **Deployment**: Changes auto-deploy via GitHub Actions

## 📄 License

MIT - Same as main jpglens project