import React from 'react';
import { Flame, Bell, Sparkles } from 'lucide-react';

export default function Topbar({ title, streakDays, notificationsCount, onOpenNotifications, onQuickStudy }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <div className="streak-pill" title="Consecutive study streak days">
          <Flame size={18} color="#ea580c" />
          <span>{streakDays || 7} Day Streak</span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ position: 'relative', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
          onClick={onOpenNotifications}
          title="View Notifications"
        >
          <Bell size={18} />
          {notificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {notificationsCount}
            </span>
          )}
        </button>

        <button className="btn btn-primary btn-sm" onClick={onQuickStudy}>
          <Sparkles size={16} />
          <span>Quick Focus</span>
        </button>
      </div>
    </header>
  );
}
