#!/usr/bin/env node
/**
 * Automated Documentation Sync Script
 * Syncs package versions, README content, and API docs with the static site
 * Following best practices from Next.js, Vite, and Vercel documentation sites
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const siteDir = path.resolve(__dirname, '..');

class DocumentationSync {
  constructor() {
    this.mainVersion = process.env.MAIN_VERSION || '1.1.0';
    this.mcpVersion = process.env.MCP_VERSION || '1.1.0';
    this.lastSync = new Date().toISOString();
  }

  async run() {
    console.log('🔄 Starting documentation sync...');
    console.log(`📦 Main package: v${this.mainVersion}`);
    console.log(`🔧 MCP server: v${this.mcpVersion}`);

    try {
      await this.syncPackageVersions();
      await this.syncReadmeContent();
      await this.syncAPIDocumentation();
      await this.syncMCPDocumentation();
      await this.syncChangelog();
      await this.updateSiteMetadata();
      await this.generateSitemap();

      console.log('✅ Documentation sync completed successfully!');
    } catch (error) {
      console.error('❌ Documentation sync failed:', error);
      process.exit(1);
    }
  }

  async syncPackageVersions() {
    console.log('📝 Syncing package versions...');

    // Update site package.json with latest versions
    const sitePackagePath = path.join(siteDir, 'package.json');
    const sitePackage = JSON.parse(await fs.readFile(sitePackagePath, 'utf8'));
    
    sitePackage.version = this.mainVersion;
    sitePackage.dependencies.jpglens = `^${this.mainVersion}`;
    
    await fs.writeFile(sitePackagePath, JSON.stringify(sitePackage, null, 2));

    // Update version references in HTML files
    const htmlFiles = ['index.html', 'docs/index.html', 'mcp/index.html'];
    
    for (const file of htmlFiles) {
      const filePath = path.join(siteDir, file);
      if (await this.fileExists(filePath)) {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Replace version placeholders
        content = content.replace(/v\d+\.\d+\.\d+/g, `v${this.mainVersion}`);
        content = content.replace(/jpglens@\d+\.\d+\.\d+/g, `jpglens@${this.mainVersion}`);
        content = content.replace(/jpglens-mcp-server@\d+\.\d+\.\d+/g, `jpglens-mcp-server@${this.mcpVersion}`);
        
        await fs.writeFile(filePath, content);
      }
    }
  }

  async syncReadmeContent() {
    console.log('📚 Syncing README content...');

    // Try multiple possible paths for README.md
    const possiblePaths = [
      path.join(rootDir, 'README.md'),
      path.join(process.cwd(), '../README.md'),
      path.join(process.cwd(), '../../README.md'),
      '/vercel/source0/README.md', // Vercel build path
      process.env.README_PATH || ''
    ].filter(Boolean);

    let readmeContent = '';
    let foundPath = '';

    for (const readmePath of possiblePaths) {
      try {
        readmeContent = await fs.readFile(readmePath, 'utf8');
        foundPath = readmePath;
        console.log(`✅ Found README at: ${readmePath}`);
        break;
      } catch (error) {
        console.log(`❌ README not found at: ${readmePath}`);
        continue;
      }
    }

    if (!readmeContent) {
      console.log('⚠️ README.md not found, using fallback content...');
      readmeContent = `# jpglens\n\nUniversal AI-Powered UI Testing\n\nPlease visit [GitHub](https://github.com/tahabahrami/jpglens) for the latest documentation.`;
    }

    // Extract sections from README
    const sections = this.extractReadmeSections(readmeContent);

    // Update homepage with latest README content
    await this.updateHomepageContent(sections);
    
    // Update docs page with technical content
    await this.updateDocsContent(sections);
  }

  extractReadmeSections(content) {
    const sections = {};
    
    // Extract quick start section
    const quickStartMatch = content.match(/## ⚡ \*\*Quick Start[\s\S]*?(?=## |$)/);
    if (quickStartMatch) {
      sections.quickStart = quickStartMatch[0];
    }

    // Extract features section
    const featuresMatch = content.match(/## 🌟 \*\*What is jpglens\?[\s\S]*?(?=## |$)/);
    if (featuresMatch) {
      sections.features = featuresMatch[0];
    }

    // Extract MCP section
    const mcpMatch = content.match(/## 🎭 \*\*GitHub Demonstration - MCP v6 Integration[\s\S]*?(?=<!-- BEGIN: MCP SECTION -->)/);
    if (mcpMatch) {
      sections.mcpDemo = mcpMatch[0];
    }

    // Extract installation section
    const installMatch = content.match(/```bash[^`]*npm install[^`]*```/g);
    if (installMatch) {
      sections.installation = installMatch;
    }

    return sections;
  }

  async updateHomepageContent(sections) {
    const indexPath = path.join(siteDir, 'index.html');
    if (!await this.fileExists(indexPath)) return;

    let content = await fs.readFile(indexPath, 'utf8');

    // Update quick start section
    if (sections.quickStart) {
      const quickStartHtml = this.markdownToHtml(sections.quickStart);
      content = content.replace(
        /<!-- QUICK_START_BEGIN -->[\s\S]*?<!-- QUICK_START_END -->/,
        `<!-- QUICK_START_BEGIN -->\n${quickStartHtml}\n<!-- QUICK_START_END -->`
      );
    }

    // Update installation commands with latest versions
    content = content.replace(
      /npm install -D jpglens@[\d.]+/g,
      `npm install -D jpglens@${this.mainVersion}`
    );

    await fs.writeFile(indexPath, content);
  }

  async updateDocsContent(sections) {
    const docsPath = path.join(siteDir, 'docs/index.html');
    
    // Check if docs page exists
    if (!await this.fileExists(docsPath)) {
      console.log('⚠️  Docs page not found, skipping docs content update');
      return;
    }

    let docsContent = await fs.readFile(docsPath, 'utf8');

    // Update API documentation if available
    if (sections.api) {
      const apiHtml = this.markdownToHtml(sections.api);
      docsContent = docsContent.replace(
        /<!-- API_SECTION -->[\s\S]*?<!-- \/API_SECTION -->/,
        `<!-- API_SECTION -->\n${apiHtml}\n<!-- /API_SECTION -->`
      );
    }

    // Update MCP documentation if available
    if (sections.mcp) {
      const mcpHtml = this.markdownToHtml(sections.mcp);
      docsContent = docsContent.replace(
        /<!-- MCP_SECTION -->[\s\S]*?<!-- \/MCP_SECTION -->/,
        `<!-- MCP_SECTION -->\n${mcpHtml}\n<!-- /MCP_SECTION -->`
      );
    }

    await fs.writeFile(docsPath, docsContent);
    console.log('✅ Docs content updated');
  }

  async syncAPIDocumentation() {
    console.log('📖 Syncing API documentation...');

    const apiDocPath = path.join(rootDir, 'API.md');
    if (!await this.fileExists(apiDocPath)) return;

    const apiContent = await fs.readFile(apiDocPath, 'utf8');
    const apiHtml = this.markdownToHtml(apiContent);

    // Update docs page with API content
    const docsPath = path.join(siteDir, 'docs/index.html');
    if (await this.fileExists(docsPath)) {
      let docsContent = await fs.readFile(docsPath, 'utf8');
      
      docsContent = docsContent.replace(
        /<!-- API_DOCS_BEGIN -->[\s\S]*?<!-- API_DOCS_END -->/,
        `<!-- API_DOCS_BEGIN -->\n${apiHtml}\n<!-- API_DOCS_END -->`
      );

      await fs.writeFile(docsPath, docsContent);
    }
  }

  async syncMCPDocumentation() {
    console.log('🔧 Syncing MCP documentation...');

    // Create/update MCP landing page
    const mcpDir = path.join(siteDir, 'mcp');
    await fs.mkdir(mcpDir, { recursive: true });

    const mcpContent = await this.generateMCPPage();
    await fs.writeFile(path.join(mcpDir, 'index.html'), mcpContent);
  }

  async generateMCPPage() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jpglens MCP Integration - AI Agent Vision for UI Testing</title>
    <meta name="description" content="Transform AI agents into UI testing experts with jpglens MCP v6 integration. Complete Model Context Protocol support with 8 tools, retry logic, and production-ready architecture.">
    <meta name="keywords" content="MCP, Model Context Protocol, AI agents, Cursor IDE, UI testing, jpglens, AI vision">
    
    <!-- Open Graph -->
    <meta property="og:title" content="jpglens MCP - AI Agent Vision for UI Testing">
    <meta property="og:description" content="Enable AI agents to perform sophisticated UI analysis through standardized MCP protocol. Production-ready with 100% test coverage.">
    <meta property="og:image" content="https://jpglens.dev/mcp-og-image.png">
    <meta property="og:url" content="https://jpglens.dev/mcp">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="jpglens MCP - AI Agent Vision for UI Testing">
    <meta name="twitter:description" content="Transform AI agents into UI testing experts with complete MCP v6 integration.">
    <meta name="twitter:image" content="https://jpglens.dev/mcp-og-image.png">

    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="stylesheet" href="/src/styles/main.css">
    <link rel="stylesheet" href="/src/styles/mcp.css">
</head>
<body class="mcp-page">
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <a href="/" class="brand-link">
                    <span class="brand-icon">🔍</span>
                    <span class="brand-text">jpglens</span>
                </a>
            </div>
            <div class="nav-menu">
                <a href="/" class="nav-link">Home</a>
                <a href="/docs/" class="nav-link">Docs</a>
                <a href="/mcp/" class="nav-link active">MCP</a>
                <a href="/examples/" class="nav-link">Examples</a>
                <button class="add-to-cursor-btn" onclick="addToCursor()">
                    <span class="btn-icon">⚡</span>
                    Add to Cursor
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="mcp-hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-badge">
                    <span class="badge-text">🚀 MCP v6 Integration</span>
                    <span class="badge-status">Production Ready</span>
                </div>
                
                <h1 class="hero-title">
                    Transform AI Agents into 
                    <span class="gradient-text">UI Testing Experts</span>
                </h1>
                
                <p class="hero-description">
                    jpglens MCP integration enables AI agents to perform sophisticated UI analysis 
                    through standardized Model Context Protocol interfaces. Give your AI agents 
                    the power of vision-based UI testing with production-grade architecture.
                </p>

                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-number">8</div>
                        <div class="stat-label">MCP v6 Tools</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">100%</div>
                        <div class="stat-label">Test Coverage</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">2</div>
                        <div class="stat-label">Transport Modes</div>
                    </div>
                </div>

                <div class="hero-actions">
                    <button class="cta-button primary" onclick="addToCursor()">
                        <span class="btn-icon">⚡</span>
                        Add to Cursor IDE
                    </button>
                    <button class="cta-button secondary" onclick="copyInstallCommand()">
                        <span class="btn-icon">📦</span>
                        Install MCP Server
                    </button>
                </div>
            </div>

            <div class="hero-visual">
                <div class="terminal-window">
                    <div class="terminal-header">
                        <div class="terminal-buttons">
                            <span class="btn red"></span>
                            <span class="btn yellow"></span>
                            <span class="btn green"></span>
                        </div>
                        <div class="terminal-title">jpglens MCP Server</div>
                    </div>
                    <div class="terminal-body">
                        <div class="terminal-line">
                            <span class="prompt">$</span>
                            <span class="command">npx jpglens-mcp-server</span>
                        </div>
                        <div class="terminal-line output">
                            <span class="success">🚀 jpglens MCP server started successfully</span>
                        </div>
                        <div class="terminal-line output">
                            <span class="info">📡 Ready to receive analysis requests via MCP protocol</span>
                        </div>
                        <div class="terminal-line output">
                            <span class="tools">🔧 8 v6 tools loaded: run_playwright_analysis, batch_analyze...</span>
                        </div>
                        <div class="terminal-cursor">_</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="mcp-features">
        <div class="container">
            <h2 class="section-title">AI Agent Vision Capabilities</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎭</div>
                    <h3>Complete MCP v6 Integration</h3>
                    <p>8 production-ready tools including run_playwright_analysis, batch_analyze, run_journey, and more. Full Model Context Protocol compliance.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🧠</div>
                    <h3>AI Agent Vision</h3>
                    <p>Enable AI agents to "see" and analyze user interfaces just like humans do. Understand context, accessibility, and user experience patterns.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Dual Transport Support</h3>
                    <p>Stdio for direct integration and SSE HTTP bridge for web-based agents. Choose the transport that fits your architecture.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Smart Retry Logic</h3>
                    <p>Exponential backoff with jitter for robust operations. Configurable retries (0-5) with graceful error handling.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Pluggable Reporters</h3>
                    <p>JSONL for local analysis and S3 for cloud storage. Structured issues format for automated fixes by AI agents.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🏭</div>
                    <h3>Production Architecture</h3>
                    <p>Docker support, CI/CD pipelines, comprehensive testing, and enterprise-grade error handling. Ready for scale.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Installation Section -->
    <section class="installation-section">
        <div class="container">
            <h2 class="section-title">Quick Integration</h2>
            
            <div class="install-tabs">
                <button class="tab-button active" data-tab="cursor">Cursor IDE</button>
                <button class="tab-button" data-tab="global">Global Install</button>
                <button class="tab-button" data-tab="docker">Docker</button>
            </div>

            <div class="tab-content active" id="cursor-tab">
                <div class="install-step">
                    <h3>1. Install MCP Server</h3>
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyCode('install-cmd')">Copy</button>
                        <pre><code id="install-cmd">npm install -g jpglens-mcp-server@${this.mcpVersion}</code></pre>
                    </div>
                </div>
                
                <div class="install-step">
                    <h3>2. Add to Cursor IDE</h3>
                    <p>Cursor → Settings → Features → MCP → Add Server</p>
                    <div class="code-block">
                        <button class="copy-btn" onclick="copyCode('cursor-config')">Copy</button>
                        <pre><code id="cursor-config">{
  "servers": {
    "jpglens": {
      "command": "npx",
      "args": ["jpglens-mcp-server"],
      "transport": "stdio"
    }
  }
}</code></pre>
                    </div>
                </div>

                <div class="install-step">
                    <h3>3. Start Using AI Vision</h3>
                    <p>Your AI agents can now perform UI analysis through natural language!</p>
                    <div class="example-usage">
                        <div class="usage-example">
                            <div class="example-label">You ask:</div>
                            <div class="example-text">"Analyze the checkout page for accessibility issues"</div>
                        </div>
                        <div class="usage-example">
                            <div class="example-label">AI agent runs:</div>
                            <div class="example-text">run_playwright_analysis with comprehensive analysis</div>
                        </div>
                        <div class="usage-example">
                            <div class="example-label">You get:</div>
                            <div class="example-text">Structured report with specific recommendations</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-content" id="global-tab">
                <div class="code-block">
                    <button class="copy-btn" onclick="copyCode('global-install')">Copy</button>
                    <pre><code id="global-install">npm install -g jpglens-mcp-server@${this.mcpVersion}
npx jpglens-mcp-server  # Start stdio server
npx jpglens-mcp-server-sse  # Start SSE HTTP bridge</code></pre>
                </div>
            </div>

            <div class="tab-content" id="docker-tab">
                <div class="code-block">
                    <button class="copy-btn" onclick="copyCode('docker-install')">Copy</button>
                    <pre><code id="docker-install">docker run -p 3333:3333 \\
  -e JPGLENS_API_KEY=your_key \\
  -e JPGLENS_REPORTER=both \\
  jpglens-mcp-server:${this.mcpVersion}</code></pre>
                </div>
            </div>
        </div>
    </section>

    <!-- Add to Cursor Modal -->
    <div class="modal" id="cursor-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add jpglens to Cursor IDE</h3>
                <button class="modal-close" onclick="closeCursorModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Install MCP Server</h4>
                        <div class="code-block small">
                            <button class="copy-btn" onclick="copyCode('modal-install')">Copy</button>
                            <pre><code id="modal-install">npm install -g jpglens-mcp-server</code></pre>
                        </div>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Open Cursor Settings</h4>
                        <p>Cursor → Settings → Features → MCP → Add Server</p>
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Add Configuration</h4>
                        <div class="code-block small">
                            <button class="copy-btn" onclick="copyCode('modal-config')">Copy</button>
                            <pre><code id="modal-config">{
  "servers": {
    "jpglens": {
      "command": "npx",
      "args": ["jpglens-mcp-server"],
      "transport": "stdio"
    }
  }
}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn secondary" onclick="closeCursorModal()">Close</button>
                <button class="btn primary" onclick="openCursorSettings()">Open Cursor Settings</button>
            </div>
        </div>
    </div>

    <script src="/src/scripts/mcp.js"></script>
</body>
</html>`;
  }

  async syncChangelog() {
    console.log('📝 Syncing changelog...');

    const changelogPath = path.join(rootDir, 'CHANGELOG.md');
    if (!await this.fileExists(changelogPath)) return;

    const changelogContent = await fs.readFile(changelogPath, 'utf8');
    
    // Extract latest version changes
    const latestChanges = this.extractLatestChanges(changelogContent);
    
    // Update site with latest changes
    await this.updateChangelogDisplay(latestChanges);
  }

  extractLatestChanges(content) {
    const versionMatch = content.match(/## \[[\d.]+\][\s\S]*?(?=## \[|$)/);
    return versionMatch ? versionMatch[0] : '';
  }

  async updateChangelogDisplay(latestChanges) {
    if (!latestChanges) {
      console.log('⚠️  No latest changes found in changelog');
      return;
    }

    const indexPath = path.join(siteDir, 'index.html');
    if (!await this.fileExists(indexPath)) {
      console.log('⚠️  Homepage not found, skipping changelog display update');
      return;
    }

    let content = await fs.readFile(indexPath, 'utf8');
    const changesHtml = this.markdownToHtml(latestChanges);

    // Update changelog section on homepage
    content = content.replace(
      /<!-- CHANGELOG_SECTION -->[\s\S]*?<!-- \/CHANGELOG_SECTION -->/,
      `<!-- CHANGELOG_SECTION -->\n${changesHtml}\n<!-- /CHANGELOG_SECTION -->`
    );

    await fs.writeFile(indexPath, content);
    console.log('✅ Changelog display updated');
  }

  async updateSiteMetadata() {
    console.log('🏷️ Updating site metadata...');

    const metadataPath = path.join(siteDir, 'src/data/metadata.json');
    const metadata = {
      version: this.mainVersion,
      mcpVersion: this.mcpVersion,
      lastSync: this.lastSync,
      buildTime: new Date().toISOString(),
      features: {
        mcpIntegration: true,
        aiAgentSupport: true,
        dualTransport: true,
        productionReady: true
      }
    };

    await fs.mkdir(path.dirname(metadataPath), { recursive: true });
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  async generateSitemap() {
    console.log('🗺️ Generating sitemap...');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jpglens.dev/</loc>
    <lastmod>${this.lastSync}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://jpglens.dev/docs/</loc>
    <lastmod>${this.lastSync}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jpglens.dev/mcp/</loc>
    <lastmod>${this.lastSync}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://jpglens.dev/examples/</loc>
    <lastmod>${this.lastSync}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://jpglens.dev/comparison/</loc>
    <lastmod>${this.lastSync}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    await fs.writeFile(path.join(siteDir, 'public/sitemap.xml'), sitemap);
  }

  markdownToHtml(markdown) {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```([\\s\\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/\\n/g, '<br>');
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Run the sync
const sync = new DocumentationSync();
await sync.run();
