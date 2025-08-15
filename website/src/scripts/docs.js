// Documentation-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initDocsNavigation();
    initTableOfContents();
    initSearchFunctionality();
    initCodeExamples();
    initMobileSidebar();
});

// Documentation navigation
function initDocsNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.docs-section');
    
    // Update active nav item based on scroll position
    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    
    // Smooth scroll for nav items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Auto-generate table of contents
function initTableOfContents() {
    const tocContainer = document.querySelector('.docs-toc ul');
    if (!tocContainer) return;
    
    const headings = document.querySelectorAll('.docs-content h2, .docs-content h3');
    
    headings.forEach(heading => {
        const id = heading.id || heading.textContent.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        
        if (!heading.id) {
            heading.id = id;
        }
        
        const tocItem = document.createElement('li');
        const tocLink = document.createElement('a');
        tocLink.href = `#${id}`;
        tocLink.textContent = heading.textContent;
        tocLink.className = heading.tagName === 'H3' ? 'toc-sub-item' : '';
        
        tocItem.appendChild(tocLink);
        tocContainer.appendChild(tocItem);
        
        // Add click handler
        tocLink.addEventListener('click', function(e) {
            e.preventDefault();
            heading.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active state
            document.querySelectorAll('.docs-toc a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Search functionality
function initSearchFunctionality() {
    const searchInput = document.querySelector('.docs-search input');
    if (!searchInput) return;
    
    let searchIndex = [];
    
    // Build search index
    function buildSearchIndex() {
        const sections = document.querySelectorAll('.docs-section');
        sections.forEach(section => {
            const title = section.querySelector('h2')?.textContent || '';
            const content = section.textContent.toLowerCase();
            const id = section.id;
            
            searchIndex.push({
                title,
                content,
                id,
                element: section
            });
        });
    }
    
    // Search function
    function performSearch(query) {
        if (!query || query.length < 2) {
            clearSearchResults();
            return;
        }
        
        const results = searchIndex.filter(item => 
            item.content.includes(query.toLowerCase()) ||
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        
        displaySearchResults(results, query);
    }
    
    // Display search results
    function displaySearchResults(results, query) {
        // Highlight matching sections
        document.querySelectorAll('.docs-section').forEach(section => {
            section.classList.remove('search-highlight');
        });
        
        results.forEach(result => {
            result.element.classList.add('search-highlight');
        });
        
        // Show/hide sections based on search
        if (results.length > 0) {
            document.querySelectorAll('.docs-section').forEach(section => {
                section.style.display = 'none';
            });
            
            results.forEach(result => {
                result.element.style.display = 'block';
            });
        }
    }
    
    // Clear search results
    function clearSearchResults() {
        document.querySelectorAll('.docs-section').forEach(section => {
            section.style.display = 'block';
            section.classList.remove('search-highlight');
        });
    }
    
    // Initialize search
    buildSearchIndex();
    
    // Search input handler
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
    
    // Clear search on escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearSearchResults();
        }
    });
}

// Code examples functionality
function initCodeExamples() {
    // Add line numbers to code blocks
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const lines = codeBlock.textContent.split('\n');
        if (lines.length > 3) {
            const numberedLines = lines.map((line, index) => {
                if (index === lines.length - 1 && line.trim() === '') return '';
                return `<span class="line-number">${(index + 1).toString().padStart(2, ' ')}</span>${line}`;
            }).join('\n');
            
            codeBlock.innerHTML = numberedLines;
            codeBlock.parentElement.classList.add('has-line-numbers');
        }
    });
    
    // Add "Try it" buttons to interactive examples
    document.querySelectorAll('.example-code').forEach(example => {
        const tryButton = document.createElement('button');
        tryButton.className = 'try-button';
        tryButton.innerHTML = '▶️ Try this example';
        tryButton.addEventListener('click', function() {
            // This could open CodeSandbox or similar
            console.log('Opening interactive example...');
        });
        
        example.appendChild(tryButton);
    });
}

// Mobile sidebar functionality
function initMobileSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('docs-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!sidebarToggle || !sidebar || !overlay) return;
    
    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Update toggle button icon
        const icon = sidebarToggle.querySelector('svg');
        if (sidebar.classList.contains('open')) {
            icon.innerHTML = `
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            `;
        } else {
            icon.innerHTML = `
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            `;
        }
    }
    
    // Close sidebar
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        
        // Reset toggle button icon
        const icon = sidebarToggle.querySelector('svg');
        icon.innerHTML = `
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        `;
    }
    
    // Event listeners
    sidebarToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking on nav items (mobile)
    const navItems = sidebar.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
}

// Add CSS for search and code enhancements
const additionalDocsStyles = `
    .search-highlight {
        background: rgba(59, 130, 246, 0.1);
        border-left: 4px solid var(--color-primary);
        padding-left: var(--spacing-4);
        margin-left: -var(--spacing-4);
    }
    
    .has-line-numbers {
        position: relative;
        padding-left: 40px;
    }
    
    .line-number {
        position: absolute;
        left: 0;
        width: 30px;
        text-align: right;
        color: var(--color-text-tertiary);
        font-size: var(--font-size-xs);
        user-select: none;
    }
    
    .try-button {
        position: absolute;
        top: var(--spacing-2);
        right: var(--spacing-2);
        background: var(--color-primary);
        color: white;
        border: none;
        padding: var(--spacing-1) var(--spacing-3);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-xs);
        cursor: pointer;
        opacity: 0;
        transition: var(--transition-fast);
    }
    
    .example-code:hover .try-button {
        opacity: 1;
    }
    
    .try-button:hover {
        background: var(--color-primary-hover);
    }
    
    .toc-sub-item {
        padding-left: var(--spacing-4);
        font-size: var(--font-size-xs);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalDocsStyles;
document.head.appendChild(styleSheet);
