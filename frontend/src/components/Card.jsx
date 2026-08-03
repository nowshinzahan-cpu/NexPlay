export default function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
