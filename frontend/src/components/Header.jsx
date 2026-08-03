import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useNotification } from '../hooks/useNotification';
import Button from './Button';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import RoleAvatar from './RoleAvatar';

export default function Header({ variant = 'default' }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (variant !== 'transparent') return;
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifMenuOpen(false);
    }
    if (userMenuOpen || notifMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, notifMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotifMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (notifMenuOpen && !notifications.length) fetchNotifications?.();
  }, [notifMenuOpen, fetchNotifications, notifications.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'company': return '/company/dashboard';
      default: return '/user/dashboard';
    }
  };

  const headerStyle = variant === 'transparent' && !scrolled
    ? { backgroundColor: 'transparent', borderBottom: '1px solid transparent' }
    : {
        backgroundColor: 'color-mix(in srgb, var(--color-sidebar) 80%, transparent)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--color-border)'
      };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 theme-transition"
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 w-full">
          {/* Logo (always left) */}
          <div className="flex-1 flex justify-start">
            <Logo size="sm" linkTo="/" showTagline={false} />
          </div>

          {/* Center Nav — truly centered using absolute positioning, unaffected by side content */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] tracking-tight transition-all ${
                  isActive
                    ? 'textPrimary'
                    : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Browse
            </NavLink>
            <NavLink
              to="/sports"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] tracking-tight transition-all ${
                  isActive
                    ? 'textPrimary'
                    : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Sports
            </NavLink>
            <NavLink
              to="/matches"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] tracking-tight transition-all ${
                  isActive
                    ? 'textPrimary'
                    : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Live Scores
            </NavLink>
            <NavLink
              to="/discussions"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] tracking-tight transition-all ${
                  isActive
                    ? 'textPrimary'
                    : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Forum
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] tracking-tight transition-all ${
                  isActive
                    ? 'textPrimary'
                    : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Leaderboard
            </NavLink>
          </nav>

          {/* Right — theme toggle first, then actions, buttons always pinned right */}
          <div className="absolute right-4 sm:right-6 lg:right-8 flex items-center justify-end gap-1">
            <ThemeToggle />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative hidden sm:block" ref={notifMenuRef}>
                  <button
                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                    className="relative p-2 rounded-lg text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full px-0.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden z-50 animate-scaleIn"
                      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-elevated)' }}
                    >
                      <div className="p-3 border-b border-border">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-textPrimary">Notifications</p>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-accent-text hover:underline">Mark all read</button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-text-textSecondary text-center py-6">No notifications yet</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <button
                              key={n._id}
                              onClick={() => { markAsRead(n._id); setNotifMenuOpen(false); }}
                              className={`w-full text-left p-3 transition-colors ${
                                n.isRead ? '' : 'bg-accent/[0.03]'
                              } hover:bg-hover`}
                              style={{ borderBottom: '1px solid var(--color-border)' }}
                            >
                              <p className="text-sm text-textPrimary">{n.title}</p>
                              {n.message && (
                                <p className="text-xs text-text-textSecondary mt-0.5 line-clamp-2">{n.message}</p>
                              )}
                              <span className="text-[10px] text-tertiary mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Link — role-aware avatar */}
                <Link
                  to={getDashboardLink()}
                  className="hidden sm:flex items-center gap-2 px-2 py-2 rounded-lg text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all"
                >
                  <RoleAvatar role={user?.role} size="sm" />
                </Link>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t theme-transition"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-sidebar) 92%, transparent)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'textPrimary' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Browse
            </NavLink>
            <NavLink
              to="/sports"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'textPrimary' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Sports
            </NavLink>
            <NavLink
              to="/matches"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'textPrimary' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Live Scores
            </NavLink>
            <NavLink
              to="/discussions"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'textPrimary' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Forum
            </NavLink>
            <NavLink
              to="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'textPrimary' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`
              }
            >
              Leaderboard
            </NavLink>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-2 border-t border-border space-y-1">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-lg text-sm font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
