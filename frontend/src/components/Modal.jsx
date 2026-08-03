import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, onClose, children, size = 'md', showClose = true }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // ── Focus trap ─────────────────────────────────────────────
  const trapFocus = useCallback((e) => {
    if (!dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus the first focusable element inside the dialog
    requestAnimationFrame(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) focusable[0].focus();
      }
    });

    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('keydown', trapFocus);

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', trapFocus);
      // Restore focus to the trigger element
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose, trapFocus]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={`relative w-full ${sizeClasses[size] || sizeClasses.md} animate-fadeInScale max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl`}
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-elevated)' }}
          role="dialog"
          aria-modal="true"
        >
          {showClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
