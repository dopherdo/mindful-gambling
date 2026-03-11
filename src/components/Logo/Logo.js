import React from "react";
import "./Logo.css";

/**
 * BJ Central logo — two overlapping cards.
 * @param {number} size — width/height in px (default 56)
 * @param {boolean} animate — play the diagonal-fill reveal animation
 */
const Logo = ({ size = 56, animate = false }) => {
  // Scale stroke width inversely with size for clarity at small sizes
  const sw = size <= 36 ? 4 : size <= 56 ? 3 : 2.5;

  return (
    <div className={`logo-wrap ${animate ? "logo-animate" : ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-back-s" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#888" />
            <stop offset="100%" stopColor="#333" />
          </linearGradient>
          <linearGradient id="logo-front-s" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#c0c0c0" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>
          <linearGradient id="logo-back-f" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c2c2c" />
            <stop offset="100%" stopColor="#151515" />
          </linearGradient>
          <linearGradient id="logo-front-f" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="100%" stopColor="#181818" />
          </linearGradient>
          <linearGradient id="logo-sheen" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Back card */}
        <rect x="12" y="22" width="68" height="96" rx="10"
          transform="rotate(-20 46 70)"
          fill="url(#logo-back-f)"
          stroke="url(#logo-back-s)"
          strokeWidth={sw} />
        {/* Front card */}
        <rect x="60" y="22" width="68" height="96" rx="10"
          transform="rotate(12 94 70)"
          fill="url(#logo-front-f)"
          stroke="url(#logo-front-s)"
          strokeWidth={sw} />
        {/* Sheen */}
        <rect x="60" y="22" width="68" height="96" rx="10"
          transform="rotate(12 94 70)"
          fill="url(#logo-sheen)" />
      </svg>
    </div>
  );
};

export default Logo;
