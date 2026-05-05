import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, helpText, id, style, ...props },
    ref,
  ) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgb(148,163,184)',
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                color: 'rgb(100,116,139)',
                display: 'flex',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            style={{
              width: '100%',
              padding: '10px 16px',
              paddingLeft: leftIcon ? '40px' : '16px',
              paddingRight: rightIcon ? '40px' : '16px',
              fontSize: '14px',
              color: 'rgb(248,250,252)',
              background: 'rgba(255,255,255,0.04)',
              border: error
                ? '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              fontFamily: 'inherit',
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(99,102,241,0.15)';
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? 'rgba(239,68,68,0.5)'
                : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '12px',
                color: 'rgb(100,116,139)',
                display: 'flex',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            style={{
              fontSize: '12px',
              color: 'rgb(239,68,68)',
              marginTop: '2px',
            }}
          >
            {error}
          </p>
        )}
        {helpText && !error && (
          <p style={{ fontSize: '12px', color: 'rgb(100,116,139)' }}>
            {helpText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, style, ...props }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgb(148,163,184)',
            }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '14px',
            color: 'rgb(248,250,252)',
            background: 'rgba(255,255,255,0.04)',
            border: error
              ? '1px solid rgba(239,68,68,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            outline: 'none',
            resize: 'vertical',
            minHeight: '100px',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239,68,68,0.5)'
              : 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && (
          <p style={{ fontSize: '12px', color: 'rgb(239,68,68)' }}>{error}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, style, ...props }, ref) => {
    const inputId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgb(148,163,184)',
            }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '14px',
            color: 'rgb(248,250,252)',
            background: 'rgb(22 22 30)',
            border: error
              ? '1px solid rgba(239,68,68,0.5)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(239,68,68,0.5)'
              : 'rgba(255,255,255,0.1)';
            props.onBlur?.(e);
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p style={{ fontSize: '12px', color: 'rgb(239,68,68)' }}>{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
