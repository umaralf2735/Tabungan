'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  dotColor?: string;
  badge?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  ariaLabel,
  icon,
  compact = false,
  style,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: compact ? 'auto' : '100%',
        minWidth: compact ? '145px' : undefined,
        ...style,
      }}
    >
      {/* TRIGGER BUTTON */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: compact ? '8px 14px' : '13px 16px',
          background: isOpen
            ? 'rgba(17, 28, 49, 0.95)'
            : compact
            ? 'var(--color-surface)'
            : 'rgba(6, 10, 25, 0.55)',
          border: isOpen
            ? '1px solid rgba(129, 140, 248, 0.65)'
            : '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: compact ? '14px' : '16px',
          color: selectedOption ? 'var(--color-text)' : 'var(--color-text-muted)',
          fontSize: compact ? '0.85rem' : '0.92rem',
          fontWeight: 600,
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(99, 102, 241, 0.18), 0 8px 20px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {icon && <span style={{ display: 'inline-flex', color: 'var(--color-primary-text)', flexShrink: 0 }}>{icon}</span>}
          {selectedOption?.dotColor && (
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: selectedOption.dotColor,
                boxShadow: `0 0 8px ${selectedOption.dotColor}`,
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              ({selectedOption.sublabel})
            </span>
          )}
        </span>

        {/* Animated Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.22s ease',
            color: isOpen ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* DROPDOWN POPOVER MENU */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '180px',
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'rgba(13, 21, 38, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(129, 140, 248, 0.28)',
            borderRadius: '16px',
            padding: '6px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.04)',
            zIndex: 999,
            animation: 'fadeIn 0.16s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '0.82rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Belum ada pilihan
            </div>
          ) : (
            options.map(option => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '11px',
                    border: 'none',
                    background: isSelected ? 'rgba(79, 70, 229, 0.22)' : 'transparent',
                    color: isSelected ? '#E0E7FF' : 'var(--color-text)',
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
                    {option.dotColor && (
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: option.dotColor,
                          boxShadow: `0 0 8px ${option.dotColor}`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span style={{ fontSize: '0.76rem', color: isSelected ? '#A5B4FC' : 'var(--color-text-muted)', fontWeight: 500 }}>
                        ({option.sublabel})
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
