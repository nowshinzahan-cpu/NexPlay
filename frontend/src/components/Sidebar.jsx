import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Logo from './Logo';
import RoleAvatar from './RoleAvatar';

function SearchIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
}
function DashboardIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
}
function WatchlistIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
}
function StarIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>);
}
function ProfileIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
}
function UsersIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>);
}
function CompaniesIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
}
function VerificationIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
}
function AdsIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>);
}
function RejectedIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);
}
function SettingsIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
}
function BroadcastIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>);
}
function ShieldIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
}
function CampaignsIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>);
}
function ContentIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>);
}
function NotificationIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
}
function ChevronLeftIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>);
}
function ChevronRightIcon() {
  return (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>);
}
function LogoutIcon() {
  return (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>);
}

const userNavItems = [
  { to: '/user/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/search', label: 'Browse', icon: SearchIcon },
  { to: '/user/profile', label: 'Profile', icon: ProfileIcon },
  { to: '/user/watchlist', label: 'Watchlist', icon: WatchlistIcon },
  { to: '/user/reviews', label: 'Reviews', icon: StarIcon },
  { to: '/matches', label: 'Match Center', icon: SearchIcon },
  { to: '/discussions', label: 'Forum', icon: StarIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: CampaignsIcon },
  { to: '/user/notifications', label: 'Notifications', icon: NotificationIcon }
];

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/companies', label: 'Companies', icon: CompaniesIcon },
  { to: '/admin/verifications', label: 'Verifications', icon: VerificationIcon },
  { to: '/admin/advertisements', label: 'Advertisements', icon: AdsIcon },
  { to: '/admin/campaigns', label: 'Campaigns', icon: CampaignsIcon },
  { to: '/admin/rejected', label: 'Rejected', icon: RejectedIcon },
  { to: '/admin/platforms', label: 'Platforms', icon: SettingsIcon },
  { to: '/admin/broadcasters', label: 'Broadcasters', icon: BroadcastIcon },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldIcon },
  { to: '/admin/activity-log', label: 'Activity Log', icon: SettingsIcon }
];

const companyNavItems = (verificationStatus) => [
  { to: '/company/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/company/advertisements', label: 'Advertisements', icon: AdsIcon, disabled: verificationStatus !== 'verified' },
  { to: '/company/campaigns', label: 'Campaigns', icon: CampaignsIcon, disabled: verificationStatus !== 'verified' },
  { to: '/company/profile', label: 'Profile', icon: ProfileIcon },
  { to: '/company/upcoming', label: 'Upcoming', icon: ContentIcon, disabled: verificationStatus !== 'verified' },
  { to: '/company/contents', label: 'My Content', icon: ContentIcon, disabled: verificationStatus !== 'verified' },
  { to: '/company/notifications', label: 'Notifications', icon: NotificationIcon }
];

export default function Sidebar({ type = 'admin', verificationStatus, isOpen = false, collapsed = false, onClose, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  let navItems;
  if (type === 'admin') navItems = adminNavItems;
  else if (type === 'user') navItems = userNavItems;
  else navItems = companyNavItems(verificationStatus);

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-border flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
      collapsed ? 'lg:w-20' : 'lg:w-64'
    } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-border shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4 sm:px-6'}`}>
        <Logo size="sm" collapsed={collapsed} sidebarRole={!collapsed ? type : null} />
        {onClose && (
          <button onClick={onClose} className={`lg:hidden ml-auto p-1.5 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-[var(--hover-bg)] transition-all ${collapsed ? 'hidden' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && <p className="sidebar-section">Menu</p>}
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div key={item.to} className="sidebar-link disabled relative group" title={collapsed ? `${item.label} (Locked)` : 'Verified companies only'}>
                <div className="relative"><item.icon /></div>
                {!collapsed && (
                  <><span className="flex-1 truncate text-sm">{item.label}</span><span className="text-[9px] font-medium bg-warning/10 text-warning px-1.5 py-0.5 rounded shrink-0">Locked</span></>
                )}
              </div>
            );
          }
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <item.icon />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center bg-accent text-accent-contrast text-[8px] font-bold rounded-full px-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              {!collapsed && <span className="flex-1 truncate text-sm">{item.label}</span>}
              {!collapsed && item.label === 'Notifications' && unreadCount > 0 && (
                <span className="bg-accent text-accent-contrast text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center leading-tight shrink-0">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className={`border-t border-border ${collapsed ? 'flex flex-col items-center p-3' : 'px-4 py-3'}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-2.5'}`}>
          <RoleAvatar role={user?.role} size="md" />
          {!collapsed && (
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-text-textPrimary truncate leading-tight my-0">{user?.name || 'User'}</p>
              <p className="text-[11px] text-text-textSecondary/70 truncate capitalize leading-tight my-0">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={() => { logout(); onClose?.(); }} className="ml-3 p-1.5 text-text-textSecondary hover:text-danger rounded-lg hover:bg-danger/5 transition-all shrink-0" title="Sign Out">
              <LogoutIcon />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={() => { logout(); onClose?.(); }} className="mt-3 p-1.5 text-text-textSecondary hover:text-danger rounded-lg hover:bg-danger/5 transition-all" title="Sign Out">
            <LogoutIcon />
          </button>
        )}
      </div>
    </aside>
  );
}
