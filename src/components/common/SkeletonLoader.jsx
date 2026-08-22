import React from 'react';

export const SkeletonMetric = () => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px' }}></div>
        <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '99px' }}></div>
      </div>
      <div className="skeleton" style={{ width: '80px', height: '36px', marginBottom: '8px' }}></div>
      <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }}></div>
      <div className="skeleton" style={{ width: '160px', height: '12px' }}></div>
    </div>
  );
};

export const SkeletonCard = SkeletonMetric;

export const SkeletonChart = ({ height = 300 }) => {
  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="skeleton" style={{ width: '140px', height: '20px' }}></div>
        <div className="skeleton" style={{ width: '80px', height: '20px', borderRadius: '99px' }}></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '70%' }}>
        {[40, 75, 55, 90, 65, 80, 45, 95, 60].map((h, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '6px 6px 0 0',
            }}
          />
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: '12px', marginTop: '10px' }}></div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div style={{ width: '100%' }}>
      {/* Table Header Skeleton */}
      <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border-medium)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton" style={{ flex: 1, height: '16px' }}></div>
        ))}
      </div>
      {/* Table Rows Skeleton */}
      <div style={{ padding: '8px 0' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="skeleton"
                style={{
                  flex: c === 0 ? 0.7 : c === 1 ? 1.5 : 1,
                  height: '18px',
                  borderRadius: '4px',
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(30, 41, 59, 0.3)',
          }}
        >
          <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '10px' }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '50%', height: '16px', marginBottom: '6px' }}></div>
            <div className="skeleton" style={{ width: '30%', height: '12px' }}></div>
          </div>
          <div className="skeleton" style={{ width: '70px', height: '24px', borderRadius: '99px' }}></div>
        </div>
      ))}
    </div>
  );
};
