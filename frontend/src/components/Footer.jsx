import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer
      className="mt-auto theme-transition"
      style={{ backgroundColor: 'var(--color-sidebar)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-10">
          {/* Brand — spans 2 columns on desktop for better readability */}
          <div className="md:col-span-2">
            <div className="max-w-sm">
              <Logo size="sm" linkTo="/" />
              <p className="text-[13px] text-textSecondary/75 mt-3 leading-relaxed">
                Discover, promote, and engage with the world of entertainment.
                Movies, TV series, anime, sports — all in one place.
              </p>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-[13px] font-semibold text-text-textPrimary mb-4">Browse</h4>
            <ul className="space-y-2.5">
              <li><Link to="/search" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Search Content</Link></li>
              <li><Link to="/search" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Trending</Link></li>
              <li><Link to="/sports" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Live Sports</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[13px] font-semibold text-text-textPrimary mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-semibold text-text-textPrimary mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Partner With Us</Link></li>
              <li><Link to="/register" className="text-[13px] text-text-textSecondary hover:text-text-textPrimary transition-colors">Create Campaign</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-[11px] text-textSecondary">
            &copy; {new Date().getFullYear()} NexPlay. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-[11px] text-text-textSecondary hover:text-text-textPrimary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-[11px] text-text-textSecondary hover:text-text-textPrimary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
