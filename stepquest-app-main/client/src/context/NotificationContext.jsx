import { createContext, useContext, useState, useCallback, useEffect } from "react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 500); // extra padding for animation
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ message, type, duration, onRemove }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  }, [onRemove]);

  // Auto-close after duration
  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);


  const typeIcons = {
    success: "✨",
    error: "🚫",
    info: "⚔️", 
    achievement: "🏆"
  };

  return (
    <div className={`toast-item toast-${type} ${isVisible ? 'visible' : 'hidden'}`} onClick={handleClose}>
      <span className="toast-icon">{typeIcons[type] || "📜"}</span>
      <div className="toast-content">{String(message)}</div>
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
