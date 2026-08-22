import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toasts, removeToast } = useDashboard();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '76px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        maxWidth: 'calc(100vw - 32px)',
        width: '400px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in"
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${
              toast.type === 'success'
                ? 'rgba(5, 150, 105, 0.3)'
                : toast.type === 'warning'
                ? 'rgba(217, 119, 6, 0.3)'
                : toast.type === 'error'
                ? 'rgba(225, 29, 72, 0.3)'
                : 'rgba(8, 145, 178, 0.3)'
            }`,
            boxShadow: 'var(--shadow-lg), 0 8px 24px -4px rgba(0, 0, 0, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: 'var(--text-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'warning' && <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'error' && <AlertTriangle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'info' && <Info size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '2px' }} />}

          <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>
            {toast.message}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};
