import { Link } from 'react-router-dom';

/**
 * Logo — NexPlay brand logo using the Vite SVG.
 *
 * Props:
 *   size        - 'sm' | 'md' | 'lg' (default: 'md')
 *   linkTo      - Optional route to wrap the logo in a <Link>
 *   collapsed   - If true, shows only the icon (for collapsed sidebar)
 *   sidebarRole - If set, shows a small role badge next to the logo (e.g. 'admin', 'user')
 *   showTagline - Whether to show the tagline below the logo (default: true)
 */
export default function Logo({ size = 'md', linkTo, collapsed = false, sidebarRole = null, showTagline = true }) {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', tagline: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-xl', tagline: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-xs' },
  };

  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <img
        src="/vite.svg"
        alt="NexPlay"
        className={`${s.icon} shrink-0`}
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span className={`${s.text} font-semibold tracking-tight text-text-textPrimary leading-none`}>
            NexPlay
          </span>
          {showTagline && (
            <span className={`${s.tagline} text-text-textSecondary/60 font-normal tracking-wide leading-none mt-0.5`}>
              Entertainment Hub
            </span>
          )}
          {sidebarRole && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-accent-text mt-0.5 leading-none">
              {sidebarRole}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="hover:opacity-80 transition-opacity shrink-0">{content}</Link>;
  }

  return <div className="shrink-0">{content}</div>;
}
