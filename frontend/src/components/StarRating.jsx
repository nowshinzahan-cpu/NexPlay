import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'md', readOnly = false, showValue = false }) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9'
  };

  const handleClick = (star) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Rating">
      {stars.map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readOnly && 'hover:scale-110'} p-0.5`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            role="radio"
            aria-checked={star <= value}
          >
            <svg
              className={`${sizeClasses[size]} transition-all duration-150 drop-shadow-sm`}
              style={{ color: filled ? 'rgb(var(--color-warning))' : 'rgb(var(--color-text-tertiary))', opacity: filled ? 1 : 0.35 }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
      {showValue && value > 0 && (
        <span className="ml-2 text-sm font-medium text-textPrimary">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
