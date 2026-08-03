import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * RouteGuard keeps the browser address bar clean by intercepting
 * MemoryRouter navigation and syncing it with the browser's history API.
 *
 * - Every internal navigation pushes a hidden history entry so that
 *   back/forward still work.
 * - On popstate, the saved route is restored into MemoryRouter.
 * - The current route is persisted to sessionStorage, surviving page
 *   refreshes within the same tab.
 */
export default function RouteGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const restoredRef = useRef(false);
  const pendingRestoreRef = useRef(0);
  const mountedRef = useRef(false);

  // ── Mount: restore from sessionStorage ──────────────────────
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const savedRoute = sessionStorage.getItem('appRoute');
    if (savedRoute && savedRoute !== location.pathname + location.search) {
      // Replace MemoryRouter's initial "/" entry so its internal stack
      // reflects the correct starting point.
      navigate(savedRoute, { replace: true });

      // Synchronize the initial browser-history entry's state so that
      // going "back" from a later page lands here correctly.
      window.history.replaceState(savedRoute, '', '/');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Location change: persist + push hidden history entry ────
  useEffect(() => {
    const routeKey = location.pathname + location.search;

    // Persist so a page refresh can restore this route.
    sessionStorage.setItem('appRoute', routeKey);

    if (!mountedRef.current) {
      // First run — use replaceState to avoid creating an extra history
      // entry before the restore effect has a chance to redirect.
      mountedRef.current = true;
      window.history.replaceState(routeKey, '', '/');
    } else if (pendingRestoreRef.current > 0) {
      // This navigation was triggered by a popstate event (back/forward).
      // The browser history has already moved to the correct entry — don't
      // push another one. Decrement the counter in case multiple popstate
      // events were batched into a single render.
      pendingRestoreRef.current -= 1;
    } else {
      // User-initiated navigation — push a hidden browser-history entry
      // so back/forward can restore this position later.
      window.history.pushState(routeKey, '', '/');
    }
  }, [location.pathname, location.search]);

  // ── Back / forward: restore the route from history.state ────
  useEffect(() => {
    const handlePopState = (e) => {
      pendingRestoreRef.current += 1;
      navigate(
        e.state && typeof e.state === 'string' ? e.state : '/',
        { replace: true },
      );
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  return null;
}
