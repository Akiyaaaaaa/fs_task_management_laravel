'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Protected dashboard layout.
 * Renders a loading screen while auth state is being checked from localStorage.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    import('@/lib/echo').then(({ getEcho }) => {
      getEcho().then((echo) => {
        if (!echo || !mounted) return;

        channel = echo.join('presence.workspace');
        channel
          .here((users: any[]) => {
            if (mounted) setOnlineUsers(users);
          })
          .joining((user: any) => {
            if (mounted) setOnlineUsers((prev) => [...prev, user]);
          })
          .leaving((user: any) => {
            if (mounted)
              setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id));
          });
      });
    });

    return () => {
      mounted = false;
      import('@/lib/echo').then(({ getEcho }) => {
        getEcho().then((echo) => {
          if (echo) echo.leave('presence.workspace');
        });
      });
    };
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgb(99,102,241)',
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onlineCount={onlineUsers.length}
      />

      <div
        className="main-content"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main
          style={{
            flex: 1,
            padding: '28px',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
