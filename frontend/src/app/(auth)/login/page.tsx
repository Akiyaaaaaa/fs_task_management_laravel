'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Metadata } from 'next';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Enter a valid email address.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back! Redirecting to dashboard…');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosErr?.response?.data?.message ?? 'Login failed. Please try again.';
      toast.error(msg);
      setErrors({ password: ' ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          animation: 'slideInUp 0.5s ease forwards',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background:
                'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              marginBottom: '20px',
            }}
          >
            <Zap size={28} color="white" />
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
            }}
          >
            TaskFlow
          </h1>
          <p style={{ color: 'rgb(100,116,139)', fontSize: '14px' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Glass form card */}
        <div
          className="glass"
          style={{ padding: '36px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        >
          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <Input
                id="login-email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                error={errors.email}
                leftIcon={<Mail size={16} />}
                autoComplete="email"
                autoFocus
              />

              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password !== ' ' ? errors.password : undefined}
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      padding: 0,
                      display: 'flex',
                    }}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                autoComplete="current-password"
              />

              <Button
                type="submit"
                id="login-submit"
                variant="primary"
                size="lg"
                loading={loading}
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '13px',
            color: 'rgb(71,85,105)',
          }}
        >
          Task Management Platform &mdash; Part 2 Assessment
        </p>
      </div>
    </main>
  );
}
