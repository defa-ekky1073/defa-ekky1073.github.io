// Add smooth transitions for theme changes
function initThemeTransitions() {
    console.log('Initializing theme transitions...');
    const html = document.documentElement;
    
    // Remove any existing transition styles
    const existingStyle = document.getElementById('theme-transition-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Add a class to the html element to enable transitions
    html.classList.add('theme-transitions-enabled');
    
    // Create and append the transition styles
    const style = document.createElement('style');
    style.id = 'theme-transition-styles';
    style.textContent = `
        /* Base transitions for all elements */
        .theme-transitions-enabled * {
            transition-property: background-color, color, border-color, box-shadow, fill, stroke, opacity, text-shadow, transform;
            transition-duration: 0.3s;
            transition-timing-function: ease-in-out;
        }
        
        /* Disable transitions during initial page load */
        .theme-transitions-enabled.theme-loading * {
            transition: none !important;
        }
        
        /* Smooth transitions for theme changes */
        .theme-transitions-enabled.is-changing-theme {
            transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(style);
    
    // Handle transition end
    const onTransitionEnd = () => {
        html.classList.remove('is-changing-theme');
    };
    
    // Add transition class when theme changes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'data-theme') {
                html.classList.add('is-changing-theme');
                document.addEventListener('transitionend', onTransitionEnd, { once: true });
                break;
            }
        }
    });
    
    // Start observing the document element for theme changes
    observer.observe(html, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}

/**
 * Update theme based on current path
 * - On /entry/ paths: force light theme
 * - Everywhere else: force dark theme
 */
function updateThemeByPath() {
    const path = window.location.pathname;
    const isEntryPage = /\/entry\/[^/]+\//.test(path);
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    // Function to set theme with transition
    const setTheme = (theme) => {
        // Skip if already the correct theme
        if (currentTheme === theme) return;
        
        // Add transition class and force reflow
        html.classList.add('is-changing-theme');
        void html.offsetHeight; // Force reflow
        
        // Set the new theme
        html.setAttribute('data-theme', theme);
        localStorage.setItem('pref-theme', theme);
        
        // Clean up after transition
        setTimeout(() => {
            html.classList.remove('is-changing-theme');
        }, 400);
    };
    
    // Apply the appropriate theme based on the path
    if (isEntryPage) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// Initialize everything when the DOM is fully loaded
function init() {
    try {
        console.log('Initializing theme...');
        const html = document.documentElement;
        
        // Add loading class to prevent transitions during initial load
        html.classList.add('theme-loading');
        
        // Get the current theme from localStorage or system preference
        const savedTheme = localStorage.getItem('pref-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        // Set initial theme (without transitions)
        html.setAttribute('data-theme', initialTheme);
        
        // Initialize transitions
        initThemeTransitions();
        
        // Remove loading class after a short delay to enable transitions
        setTimeout(() => {
            html.classList.remove('theme-loading');
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
        
        // Override the theme toggle to ensure smooth transitions
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // Update theme with transition
                html.classList.add('is-changing-theme');
                void html.offsetHeight; // Force reflow
                
                // Set the new theme
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('pref-theme', newTheme);
                
                // Clean up after transition
                setTimeout(() => {
                    html.classList.remove('is-changing-theme');
                }, 400);
            });
        }
        
        console.log('Theme initialization complete');
        
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
