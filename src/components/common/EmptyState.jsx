import React from 'react';
import { Inbox, Database, ArrowRight } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data available',
  description = 'There are currently no records to display.',
  badgeText,
  actionLabel,
  actionText,
  onAction,
  compact = false,
  extraContent,
}) => {
  const resolvedActionLabel = actionLabel || actionText;

  return (
    <div className={`empty-state ${compact ? 'empty-state-compact' : ''}`}>
      <div className="empty-state-icon-box">
        <Icon size={24} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {badgeText && (
        <span className="empty-state-badge">
          <Database size={11} />
          {badgeText}
        </span>
      )}
      {resolvedActionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '14px' }}
        >
          <span>{resolvedActionLabel}</span>
          <ArrowRight size={13} />
        </button>
      )}
      {extraContent}
    </div>
  );
};
