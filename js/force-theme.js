// Add smooth transitions for theme changes
function initThemeTransitions() {
    // Set transition styles with !important to ensure they take precedence
    const style = document.createElement('style');
    style.id = 'theme-transition-styles';
    style.textContent = `
        html, body, main, header, footer, article, .post, .entry, .content, 
        .post-content, .post-title, .entry-content, .entry-title, 
        .post-meta, .post-tags, .post-footer, .post-nav,
        .page-header, .page-content, .page-footer {
            transition: 
                background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important,
                color 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important,
                border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important,
                box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Force transitions to work on all properties */
        * {
            transition: inherit !important;
        }
    `;
    
    // Remove any existing transition styles
    const existingStyle = document.getElementById('theme-transition-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    document.head.appendChild(style);
    
    // Handle transition end
    const onTransitionEnd = () => {
        document.documentElement.classList.remove('is-changing-theme');
    };
    
    // Add transition class when theme changes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'data-theme') {
                document.documentElement.classList.add('is-changing-theme');
                document.addEventListener('transitionend', onTransitionEnd, { once: true });
                break;
            }
        }
    });
    
    // Start observing the document element for theme changes
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

/**
 * Update theme based on current path
 * - On /entry// paths: force light theme
 * - Everywhere else: force dark theme
**/
function updateThemeByPath() {
    const path = window.location.pathname;
    const isEntryPage = /\/entry\/[^/]+\//.test(path);
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (isEntryPage && currentTheme === 'dark') {
        // Switch to light theme for entry pages
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('pref-theme', 'light');
    } else if (!isEntryPage && currentTheme === 'light') {
        // Switch to dark theme for non-entry pages
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('pref-theme', 'dark');
    }
    // If theme already matches, do nothing
}

// Initialize everything when the DOM is fully loaded
function init() {
    try {
        // First, ensure the theme is set before applying transitions
        const savedTheme = localStorage.getItem('pref-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
        
        // Initialize transitions after a small delay to ensure DOM is ready
        setTimeout(() => {
            initThemeTransitions();
            // Update theme based on initial path
            updateThemeByPath();
        }, 50);
        
        // Update theme when navigating between pages
        window.addEventListener('popstate', updateThemeByPath);
        
        // Also update theme when page is shown (for browser back/forward cache)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                updateThemeByPath();
            }
        });
        
    } catch (error) {
        console.error('Error initializing theme:', error);
    }
}

// Wait for the entire page to be loaded, including all resources
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Call init on next tick to ensure the rest of the page is ready
    setTimeout(init, 1);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 1);
    });
}
