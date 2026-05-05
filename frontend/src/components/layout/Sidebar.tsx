'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
  Zap,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';

const navItems = [
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onlineCount?: number;
}

export function Sidebar({ isOpen, onClose, onlineCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`sidebar${isOpen ? ' open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background:
              'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            flexShrink: 0,
          }}
        >
          <Zap size={18} color="white" />
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '15px',
              color: 'rgb(248,250,252)',
            }}
          >
            TaskFlow
          </div>
          <div style={{ fontSize: '11px', color: 'rgb(100,116,139)' }}>
            Task Management
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'rgb(100,116,139)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none',
          }}
          className="sidebar-close-btn"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'rgb(165,180,252)' : 'rgb(100,116,139)',
                  background: isActive
                    ? 'rgba(99,102,241,0.15)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(99,102,241,0.25)'
                    : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'rgb(148,163,184)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgb(100,116,139)';
                  }
                }}
              >
                <Icon size={18} />
                {label}

                {/* Active indicator */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '10px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'rgb(99,102,241)',
                      boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* User info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'rgb(248,250,252)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name ?? 'User'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgb(71,85,105)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.role ?? ''}
            </div>
            {/* Online Indicator */}
            {onlineCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'rgb(34,197,94)',
                    boxShadow: '0 0 6px rgba(34,197,94,0.5)',
                  }}
                />
                <span style={{ fontSize: '10px', color: 'rgb(34,197,94)' }}>
                  Online: {onlineCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '13px',
            color: 'rgb(100,116,139)',
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            width: '100%',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = 'rgb(239,68,68)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgb(100,116,139)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
