/**
 * MCP Landing Page Interactive Features
 */

// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      button.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
});

// Add to Cursor functionality
function addToCursor() {
  const modal = document.getElementById('cursor-modal');
  modal.classList.add('active');
  
  // Track event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cursor_clicked', {
      event_category: 'mcp_integration',
      event_label: 'cursor_modal_opened'
    });
  }
}

function closeCursorModal() {
  const modal = document.getElementById('cursor-modal');
  modal.classList.remove('active');
}

function openCursorSettings() {
  // Try to open Cursor settings (this will only work if user has Cursor installed)
  window.open('cursor://settings/features/mcp', '_blank');
  
  // Fallback: show instructions
  setTimeout(() => {
    alert('If Cursor didn\'t open automatically:\n\n1. Open Cursor IDE\n2. Go to Settings → Features → MCP\n3. Click "Add Server"\n4. Use the configuration shown in the modal');
  }, 1000);
  
  // Track event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'cursor_settings_opened', {
      event_category: 'mcp_integration',
      event_label: 'settings_link_clicked'
    });
  }
}

// Copy code functionality
function copyCode(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent || element.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    // Show success feedback
    const button = element.parentNode.querySelector('.copy-btn');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.background = 'rgba(16, 185, 129, 0.2)';
    button.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.borderColor = '';
    }, 2000);
    
    // Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'code_copied', {
        event_category: 'mcp_integration',
        event_label: elementId
      });
    }
  }).catch(err => {
    console.error('Failed to copy text: ', err);
    
    // Fallback: select text
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

// Copy install command (for hero button)
function copyInstallCommand() {
  const command = 'npm install -g jpglens-mcp-server';
  
  navigator.clipboard.writeText(command).then(() => {
    // Show success feedback
    const button = event.target.closest('.cta-button');
    const originalHtml = button.innerHTML;
    button.innerHTML = '<span class="btn-icon">✅</span>Copied!';
    
    setTimeout(() => {
      button.innerHTML = originalHtml;
    }, 2000);
    
    // Track event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'install_command_copied', {
        event_category: 'mcp_integration',
        event_label: 'hero_button'
      });
    }
  }).catch(err => {
    console.error('Failed to copy install command: ', err);
    // Show fallback
    alert(`Copy this command:\n\n${command}`);
  });
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('cursor-modal');
  if (event.target === modal) {
    closeCursorModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeCursorModal();
  }
});

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

// Add intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe feature cards for animations
document.addEventListener('DOMContentLoaded', function() {
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
  });
});

// Terminal typing animation
function startTerminalAnimation() {
  const terminal = document.querySelector('.terminal-body');
  if (!terminal) return;
  
  const lines = terminal.querySelectorAll('.terminal-line');
  lines.forEach(line => line.style.opacity = '0');
  
  lines.forEach((line, index) => {
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.animation = 'fadeInUp 0.5s ease forwards';
    }, index * 1000);
  });
}

// Start terminal animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      startTerminalAnimation();
      heroObserver.unobserve(entry.target);
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const hero = document.querySelector('.mcp-hero');
  if (hero) {
    heroObserver.observe(hero);
  }
});

// Add CSS animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
