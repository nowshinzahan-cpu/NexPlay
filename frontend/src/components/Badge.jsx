const statusMap = {
  pending: 'badge-pending',
  verified: 'badge-verified',
  rejected: 'badge-rejected',
  success: 'badge-verified',
  warning: 'badge-pending',
  danger: 'badge-rejected',
  admin: 'badge-admin',
  blocked: 'badge bg-danger/10 text-danger border border-danger/20',
  user: 'badge bg-hover text-text-textSecondary border border-border',
  company: 'badge bg-accent/10 text-accent-text border border-accent/20'
};

export default function Badge({ status = 'pending', children, className = '' }) {
  const badgeClass = statusMap[status] || statusMap.pending;

  return <span className={`${badgeClass} ${className}`}>{children}</span>;
}
