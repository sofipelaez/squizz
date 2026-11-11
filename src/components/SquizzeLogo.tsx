'use client';

import React from 'react';
import Image from 'next/image';

interface SquizzeLogoProps {
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export function SquizzeLogo({
  variant = 'dark',
  size = 'md',
  className = '',
  showTagline = false,
}: SquizzeLogoProps) {
  // Size mapping
  const dimensions = {
    sm: { width: 110, height: 28 },
    md: { width: 160, height: 42 },
    lg: { width: 230, height: 60 },
    xl: { width: 340, height: 88 },
  }[size];

  // For light backgrounds (like cream cards), we invert/darken the logo to Espresso #5D131B.
  // For dark backgrounds (like the wine sidebar or dark login), the natural rose/cream stands out.
  const filterStyle =
    variant === 'dark'
      ? 'brightness(0.38) sepia(1) saturate(5) hue-rotate(300deg)' // rich Espresso #5D131B
      : variant === 'brand'
      ? 'drop-shadow(0 2px 8px rgba(93, 19, 27, 0.2))'
      : 'brightness(1.05) drop-shadow(0 2px 10px rgba(0,0,0,0.25))'; // light cream on dark background

  return (
    <div className={`squizze-logo-wrap ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Image
        src="/squizze-logo.png"
        alt="Squizze"
        width={dimensions.width}
        height={dimensions.height}
        priority
        style={{
          width: dimensions.width,
          height: 'auto',
          objectFit: 'contain',
          filter: filterStyle,
        }}
      />
      {showTagline && (
        <span
          style={{
            fontSize: size === 'sm' ? '9px' : '11px',
            color: variant === 'light' ? '#FEEED5' : '#8A6B67',
            letterSpacing: '0.04em',
            marginTop: '4px',
            fontWeight: 500,
          }}
        >
          Ecosistemas emocionales
        </span>
      )}
    </div>
  );
}
