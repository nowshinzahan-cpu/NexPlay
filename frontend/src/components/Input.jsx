import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, name, type = 'text', error, className = '', icon: Icon, autoComplete, rightAction, ...props },
  ref
) {
  const hasRightContent = !!rightAction || !!error;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-text-textSecondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-textSecondary" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          className={`input-field ${Icon ? 'pl-12' : ''} ${hasRightContent ? 'pr-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {hasRightContent && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-2 gap-0.5 ${!rightAction ? 'pointer-events-none' : ''}`}>
            {rightAction && (
              <div className="flex items-center justify-center">
                {rightAction}
              </div>
            )}
            {error && (
              <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-xs text-danger flex items-center gap-1.5" role="alert">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
