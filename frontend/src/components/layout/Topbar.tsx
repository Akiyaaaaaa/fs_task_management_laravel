'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button
        id="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          color: 'rgb(148,163,184)',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
          e.currentTarget.style.color = 'rgb(165,180,252)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.color = 'rgb(148,163,184)';
        }}
      >
        <Menu size={18} />
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right section: notifications + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Notification bell */}
        <button
          id="topbar-notifications-btn"
          aria-label="Notifications"
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: 'rgb(148,163,184)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
            e.currentTarget.style.color = 'rgb(165,180,252)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgb(148,163,184)';
          }}
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'rgb(99,102,241)',
              border: '2px solid rgb(22,22,30)',
              boxShadow: '0 0 6px rgba(99,102,241,0.8)',
            }}
          />
        </button>

        {/* User chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px 6px 6px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <span
            style={{
              fontSize: '13px',
              color: 'rgb(148,163,184)',
              fontWeight: 500,
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.name ?? 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
