// jpglens Website JavaScript
// Interactive functionality for the website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initTabs();
    initCodeTabs();
    initSyntaxHighlighting();
    initScrollEffects();
    initCopyButtons();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        navMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Tab functionality for installation section
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Code tabs functionality
function initCodeTabs() {
    const codeTabs = document.querySelectorAll('.code-tab');
    const codePanes = document.querySelectorAll('.code-pane');
    
    codeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetCode = this.getAttribute('data-code');
            
            // Remove active class from all tabs and panes
            codeTabs.forEach(t => t.classList.remove('active'));
            codePanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetCode);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Initialize syntax highlighting
function initSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
        
        // Custom highlighting for terminal output
        document.querySelectorAll('.terminal-content .code-line').forEach(line => {
            const text = line.textContent;
            if (text.includes('//')) {
                const parts = text.split('//');
                if (parts.length > 1) {
                    line.innerHTML = parts[0] + '<span class="code-comment">//' + parts.slice(1).join('//') + '</span>';
                }
            }
        });
    }
}

// Scroll effects
function initScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbar);
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .community-card, .example-content').forEach(el => {
        observer.observe(el);
    });
}

// Copy to clipboard functionality
function initCopyButtons() {
    // Add copy buttons to code blocks
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
        `;
        
        copyButton.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(codeBlock.textContent);
                copyButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Copied!
                `;
                copyButton.classList.add('copied');
                
                setTimeout(() => {
                    copyButton.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    `;
                    copyButton.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
}

// GitHub star count (optional enhancement)
async function fetchGitHubStars() {
    try {
        const response = await fetch('https://api.github.com/repos/tahabahrami/jpglens');
        const data = await response.json();
        
        const starElements = document.querySelectorAll('.github-stars');
        starElements.forEach(el => {
            el.textContent = data.stargazers_count || '0';
        });
    } catch (error) {
        console.log('Could not fetch GitHub stars:', error);
    }
}

// npm download count (optional enhancement)
async function fetchNpmDownloads() {
    try {
        const response = await fetch('https://api.npmjs.org/downloads/point/last-month/jpglens');
        const data = await response.json();
        
        const downloadElements = document.querySelectorAll('.npm-downloads');
        downloadElements.forEach(el => {
            el.textContent = data.downloads ? formatNumber(data.downloads) : '0';
        });
    } catch (error) {
        console.log('Could not fetch npm downloads:', error);
    }
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Initialize optional enhancements
setTimeout(() => {
    fetchGitHubStars();
    fetchNpmDownloads();
}, 1000);

// Add CSS for animations and copy buttons
const additionalStyles = `
    .copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        padding: 6px 12px;
        font-size: 12px;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: all 0.2s ease;
        font-family: var(--font-family-sans);
    }
    
    pre:hover .copy-button {
        opacity: 1;
    }
    
    .copy-button:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
    }
    
    .copy-button.copied {
        background: var(--color-success);
        color: white;
        border-color: var(--color-success);
    }
    
    .navbar.scrolled {
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(16px);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: var(--color-background);
            border-top: 1px solid var(--color-border);
            padding: var(--spacing-6);
            flex-direction: column;
            gap: var(--spacing-4);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
        }
        
        .nav-toggle.active .bar:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active .bar:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// MCP Integration Functions
function copyInstallCommand() {
    const command = 'npm install -g jpglens-mcp-server';
    
    navigator.clipboard.writeText(command).then(() => {
        // Show success feedback
        const button = event.target.closest('.mcp-cta-button');
        const originalHtml = button.innerHTML;
        button.innerHTML = '<span>✅</span>Copied!';
        button.style.background = 'rgba(16, 185, 129, 0.8)';
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.style.background = '';
        }, 2000);
        
        // Track event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'mcp_install_command_copied', {
                event_category: 'mcp_integration',
                event_label: 'homepage_button'
            });
        }
    }).catch(err => {
        console.error('Failed to copy install command: ', err);
        // Show fallback
        alert(`Copy this command:\n\n${command}`);
    });
}