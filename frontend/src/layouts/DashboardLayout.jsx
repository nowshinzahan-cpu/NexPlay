import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import { getInitials } from '../utils/index';

export default function DashboardLayout({ type = 'admin' }) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/companies')) return 'Companies';
    if (path.includes('/verifications')) return 'Verifications';
    if (path.includes('/advertisements')) return 'Advertisements';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/campaigns')) return 'Campaigns';
    if (path.includes('/upcoming')) return 'Upcoming';
    if (path.includes('/contents')) return 'My Content';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/activity')) return 'Activity Log';
    if (path.includes('/watchlist')) return 'Watchlist';
    if (path.includes('/reviews')) return 'Reviews';
    if (path.includes('/rejected')) return 'Rejected';
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        type={type}
        verificationStatus={user?.verificationStatus}
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20" style={{ backgroundColor: 'var(--color-sidebar)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex w-full items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-1">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 -ml-2 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" aria-label="Open sidebar">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-2.5 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" aria-label="Toggle sidebar">
                <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-text-textPrimary truncate ml-1">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link to="/" className="hidden sm:flex p-2 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" title="Home">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </Link>
              <Link to="/search" className="hidden sm:flex p-2 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" title="Browse">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
              <Link to="/sports" className="hidden sm:flex p-2 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" title="Sports">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </Link>

              <div className="w-px h-5 mx-1 hidden sm:block" style={{ backgroundColor: 'var(--color-border)' }} />

              <Link to="/search" className="sm:hidden p-2.5 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all" title="Search">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </Link>
              <ThemeToggle />

              {user && (
                <Link to={`/${user.role}/profile`} className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-hover transition-all ml-0.5" title="Profile">
                  <div className="w-7 h-7 rounded-full bg-accent/15 text-accent-text flex items-center justify-center text-[10px] font-semibold ring-1 ring-accent/20">
                    {getInitials(user.name)}
                  </div>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="animate-pageIn max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
