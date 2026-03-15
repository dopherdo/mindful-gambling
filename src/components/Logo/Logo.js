import React from "react";
import "./Logo.css";

/**
 * BJ Central logo — two overlapping cards.
 * @param {number}  size    — width/height in px (default 56)
 * @param {boolean} animate — play the entrance reveal animation
 * @param {boolean} loading — play the diagonal stroke-fill loop animation
 */
const Logo = ({ size = 56, animate = false, loading = false }) => {
  const sw = size <= 36 ? 4 : size <= 56 ? 3 : 2.5;
  // Unique IDs so multiple logos on the same page don't collide
  const uid = loading ? "logo-ld" : "logo";

  return (
    <div
      className={`logo-wrap${animate ? " logo-animate" : ""}${loading ? " logo-loading" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Fill gradients */}
          <linearGradient id={`${uid}-back-f`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c2c2c" />
            <stop offset="100%" stopColor="#151515" />
          </linearGradient>
          <linearGradient id={`${uid}-front-f`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e2e2e" />
            <stop offset="100%" stopColor="#181818" />
          </linearGradient>
          <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Static stroke gradients (dim outline) */}
          <linearGradient id={`${uid}-back-s`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#222" />
          </linearGradient>
          <linearGradient id={`${uid}-front-s`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#888" />
            <stop offset="100%" stopColor="#444" />
          </linearGradient>

          {/* Animated stroke gradient — silver sweeps top-left to bottom-right */}
          {loading && (
            <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0">
                <animate attributeName="stop-opacity" values="0;1;1;0" keyTimes="0;0.15;0.35;0.5" dur="2s" repeatCount="3" />
                <animate attributeName="stop-color" values="#555;#ffffff;#ffffff;#555" keyTimes="0;0.15;0.35;0.5" dur="2s" repeatCount="3" />
              </stop>
              <stop offset="50%" stopColor="#c0c0c0" stopOpacity="0">
                <animate attributeName="stop-opacity" values="0;0;1;1;0" keyTimes="0;0.15;0.4;0.6;0.75" dur="2s" repeatCount="3" />
                <animate attributeName="stop-color" values="#555;#555;#ffffff;#c0c0c0;#555" keyTimes="0;0.15;0.4;0.6;0.75" dur="2s" repeatCount="3" />
              </stop>
              <stop offset="100%" stopColor="#606060" stopOpacity="0">
                <animate attributeName="stop-opacity" values="0;0;1;0" keyTimes="0;0.4;0.7;0.9" dur="2s" repeatCount="3" />
                <animate attributeName="stop-color" values="#333;#333;#ffffff;#333" keyTimes="0;0.4;0.7;0.9" dur="2s" repeatCount="3" />
              </stop>
            </linearGradient>
          )}
        </defs>

        {/* Back card */}
        <rect x="12" y="22" width="68" height="96" rx="10"
          transform="rotate(-20 46 70)"
          fill={`url(#${uid}-back-f)`}
          stroke={loading ? `url(#${uid}-sweep)` : `url(#${uid}-back-s)`}
          strokeWidth={loading ? sw + 1 : sw} />

        {/* Front card */}
        <rect x="60" y="22" width="68" height="96" rx="10"
          transform="rotate(12 94 70)"
          fill={`url(#${uid}-front-f)`}
          stroke={loading ? `url(#${uid}-sweep)` : `url(#${uid}-front-s)`}
          strokeWidth={loading ? sw + 1 : sw} />

        {/* Sheen */}
        <rect x="60" y="22" width="68" height="96" rx="10"
          transform="rotate(12 94 70)"
          fill={`url(#${uid}-sheen)`} />
      </svg>
    </div>
  );
};

export default Logo;
