import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | TaskFlow',
    default: 'TaskFlow — Modern Task Management',
  },
  description:
    'A powerful, real-time task management platform for modern teams. Manage tasks, track progress, and collaborate effortlessly.',
  keywords: ['task management', 'project management', 'productivity', 'team collaboration'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            {/* Animated background orbs */}
            <div className="gradient-bg" aria-hidden="true">
              <div className="gradient-orb gradient-orb-1" />
              <div className="gradient-orb gradient-orb-2" />
              <div className="gradient-orb gradient-orb-3" />
            </div>

            {/* Main app */}
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgb(30 30 42)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgb(248,250,252)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
