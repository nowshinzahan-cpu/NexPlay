/**
 * RoleAvatar — renders a role-specific icon inside a styled badge.
 * Uses filled (solid) SVG icons for a real-life look.
 * Used in the Header and Sidebar instead of generic initials.
 *
 * Props:
 *   role     - 'user' | 'admin' | 'company' (default: 'user')
 *   size     - 'sm' (7x7) | 'md' (9x9) (default: 'md')
 *   className - Additional CSS classes
 */

/* ── Filled/solid icons for a real-life look ─────────────── */

function UserIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function AdminIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}

function CompanyIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
    </svg>
  );
}

export default function RoleAvatar({ role = 'user', size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]';

  const IconComponent = role === 'admin'
    ? AdminIcon
    : role === 'company'
      ? CompanyIcon
      : UserIcon;

  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 border border-accent/20 bg-accent/15 ${sizeClass} ${className}`}
    >
      <IconComponent className={`${iconSize} text-accent-text`} />
    </div>
  );
}
