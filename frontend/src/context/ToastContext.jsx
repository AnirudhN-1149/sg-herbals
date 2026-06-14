import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast-item toast-item--${t.type}`}
          >
            <div className="toast-item__content">
              {t.type !== 'info' && (
                <span className="toast-item__icon">
                  {t.type === 'error' ? '✕' : '✓'}
                </span>
              )}
              <p className="toast-item__message">{t.message}</p>
            </div>
            {t.type !== 'info' && (
              <button
                onClick={() => removeToast(t.id)}
                className="toast-item__close"
                aria-label="Close notification"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
