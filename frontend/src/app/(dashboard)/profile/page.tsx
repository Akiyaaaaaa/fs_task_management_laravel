'use client';

import React from 'react';
import { User, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(248,250,252)', marginBottom: '24px' }}>
        Profile
      </h1>

      <div className="glass" style={{ padding: '32px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            }}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(248,250,252)', marginBottom: '4px' }}>
              {user.name}
            </h2>
            <p style={{ fontSize: '14px', color: 'rgb(100,116,139)' }}>{user.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InfoRow icon={<User size={16} />} label="Full Name" value={user.name} />
          <InfoRow icon={<Mail size={16} />} label="Email Address" value={user.email} />
          <InfoRow icon={<Shield size={16} />} label="Role" value={user.role} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <span style={{ color: 'rgb(99,102,241)', display: 'flex' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '11px', color: 'rgb(71,85,105)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgb(226,232,240)' }}>{value}</p>
      </div>
    </div>
  );
}
