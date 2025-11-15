(function () {
  const INIT_DELAY = 50;

  function shouldReduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function init() {
    if (shouldReduceMotion()) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    overlay.classList.add('is-visible');

    const TRANSITION_FALLBACK_MS = 600;

    const hideOverlay = () => {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-visible');
      });
    };

    const showOverlay = () => {
      overlay.classList.add('is-visible');
    };

    const playEnter = () => {
      hideOverlay();
    };

    const playExit = (href) => {
      showOverlay();

      let navigated = false;
      const navigate = () => {
        if (navigated) {
          return;
        }
        navigated = true;
        window.location.assign(href);
      };

      const handleTransitionEnd = (event) => {
        if (event.target !== overlay || event.propertyName !== 'opacity') {
          return;
        }
        overlay.removeEventListener('transitionend', handleTransitionEnd);
        clearTimeout(fallbackTimer);
        navigate();
      };

      overlay.addEventListener('transitionend', handleTransitionEnd);

      const fallbackTimer = setTimeout(() => {
        overlay.removeEventListener('transitionend', handleTransitionEnd);
        navigate();
      }, TRANSITION_FALLBACK_MS);
    };

    const isInternalLink = (anchor) => {
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return false;
      }

      const url = new URL(anchor.href, window.location.origin);
      return url.origin === window.location.origin;
    };

    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a');
      if (!anchor || !isInternalLink(anchor)) {
        return;
      }

      if (
        anchor.dataset.transition === 'false' ||
        anchor.href.includes('#') && anchor.pathname === window.location.pathname
      ) {
        return;
      }

      event.preventDefault();
      playExit(anchor.href);
    });

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        showOverlay();
        hideOverlay();
      }
    });

    const startEnterTransition = () => {
      setTimeout(playEnter, INIT_DELAY);
    };

    if (document.readyState === 'complete') {
      startEnterTransition();
    } else {
      window.addEventListener('load', startEnterTransition, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
