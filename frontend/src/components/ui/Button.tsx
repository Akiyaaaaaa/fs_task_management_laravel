import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<
  ButtonVariant,
  React.CSSProperties & { className?: string }
> = {
  primary: {
    background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
  },
  secondary: {
    background: 'rgba(99,102,241,0.12)',
    color: 'rgb(165,180,252)',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgb(148,163,184)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(239,68,68,0.15)',
    color: 'rgb(239,68,68)',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  outline: {
    background: 'transparent',
    color: 'rgb(248,250,252)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: '6px 12px',
    fontSize: '13px',
    borderRadius: '8px',
    gap: '6px',
  },
  md: {
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '10px',
    gap: '8px',
  },
  lg: {
    padding: '14px 28px',
    fontSize: '16px',
    borderRadius: '12px',
    gap: '10px',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            (e.currentTarget as HTMLButtonElement).style.transform =
              'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform =
            'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.opacity = isDisabled
            ? '0.6'
            : '1';
        }}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
