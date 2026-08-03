import { createContext, useState, useCallback, useRef, useEffect } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

function ToastIcon({ type }) {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timerIds) => {
        timerIds.forEach(clearTimeout);
      });
    };
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    const exitTimer = setTimeout(() => {
      setToasts((prev) => prev.map((t) =>
        t.id === id ? { ...t, exiting: true } : t
      ));
      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        delete timersRef.current[id];
      }, 250);
      timersRef.current[id] = [removeTimer];
    }, duration);

    timersRef.current[id] = [exitTimer];
  }, []);

  const removeToast = useCallback((id) => {
    // Clear existing timers for this toast
    if (timersRef.current[id]) {
      timersRef.current[id].forEach(clearTimeout);
    }

    setToasts((prev) => prev.map((t) =>
      t.id === id ? { ...t, exiting: true } : t
    ));
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timersRef.current[id];
    }, 250);
    timersRef.current[id] = [removeTimer];
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 cursor-pointer ${
              toast.exiting ? 'animate-slideOut' : 'animate-slideIn'
            } ${toast.type === 'success' ? 'toast-success' : ''}${
              toast.type === 'error' ? 'toast-error' : ''
            }${toast.type === 'warning' ? 'toast-warning' : ''}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <div className="flex items-center gap-3 w-full min-w-0">
              <ToastIcon type={toast.type} />
              <span className="text-sm font-medium flex-1 min-w-0 break-words">{toast.message}</span>
              <button
                className="text-current opacity-50 hover:opacity-100 shrink-0 transition-opacity text-lg leading-none"
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
              >
                &times;
              </button>
            </div>
            <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
