import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, Key, Globe, Shield, RefreshCw } from 'lucide-react';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../../lib/supabaseClient';

export const SupabaseStatusModal = () => {
  const { isDbModalOpen, setIsDbModalOpen, saveSupabaseConfig, clearSupabaseConfig, addToast } = useDashboard();

  const [url, setUrl] = useState(isSupabaseConfigured() ? SUPABASE_URL : '');
  const [anonKey, setAnonKey] = useState(isSupabaseConfigured() ? SUPABASE_ANON_KEY : '');
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  if (!isDbModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      addToast('Please provide both Supabase Project URL and Anon API Key.', 'warning');
      return;
    }
    saveSupabaseConfig(url, anonKey);
    addToast('Supabase configuration saved! Reloading live database...', 'success');
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    addToast('Supabase custom config removed.', 'info');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsDbModalOpen(false)}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          padding: 0,
          border: '1px solid var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isSupabaseConfigured() ? 'var(--primary-50)' : 'var(--accent-amber-bg)',
                color: isSupabaseConfigured() ? 'var(--primary-600)' : 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isSupabaseConfigured() ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`,
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Supabase Database Engine
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isSupabaseConfigured() ? 'var(--primary-500)' : 'var(--accent-amber)',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isSupabaseConfigured() ? 'Connected to Live Cloud Database' : 'Awaiting Supabase Credentials'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDbModalOpen(false)}
            className="btn btn-ghost btn-icon-only"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            {isSupabaseConfigured()
              ? 'All citizen incident reports, fleet vehicle telemetry, and user profiles are syncing live with your Supabase PostgreSQL instance in real-time.'
              : 'Connect your Supabase PostgreSQL project to enable live persistent reports, driver GPS telemetry feeds, and real-time database subscriptions.'}
          </p>

          <form onSubmit={handleSave}>
            {/* Supabase URL */}
            <div className="form-group">
              <label className="form-label">
                <span>Project URL (VITE_SUPABASE_URL)</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Globe size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Supabase Anon Key */}
            <div className="form-group">
              <label className="form-label">
                <span>Public Anon Key (VITE_SUPABASE_ANON_KEY)</span>
                <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              {isSupabaseConfigured() ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-rose)' }}
                >
                  Disconnect Project
                </button>
              ) : (
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink size={12} />
                </a>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsDbModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <CheckCircle2 size={14} />
                  <span>Save & Connect</span>
                </button>
              </div>
            </div>
          </form>

          {/* SQL Schema helper toggle */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 0,
              }}
            >
              <Shield size={14} />
              <span>{showSqlGuide ? 'Hide' : 'View'} SQL Schema & Migration Script</span>
            </button>

            {showSqlGuide && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  The schema SQL is saved at <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>supabase/schema.sql</code>. Copy and run it in the Supabase SQL Editor:
                </p>
                <pre
                  style={{
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    overflowX: 'auto',
                    maxHeight: '140px',
                  }}
                >
{`-- Quick Table Initializer:
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  citizen_name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'High',
  status TEXT DEFAULT 'Pending Verification',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
