/* eslint-disable react-refresh/only-export-components */
import React from 'react';

export const ART = {
  frontend: (
    <svg viewBox="0 0 400 300" className="art">
      <rect width="400" height="300" fill="#282F85" />
      <path d="M0 300 400 110V300Z" fill="#2BB9D3" opacity=".22" />
      <g className="bb">
        <rect x="48" y="44" width="304" height="200" rx="16" fill="#1B2050" />
        <circle cx="72" cy="68" r="6" fill="#2BB9D3" />
        <circle cx="92" cy="68" r="6" fill="#fff" opacity=".5" />
        <circle cx="112" cy="68" r="6" fill="#fff" opacity=".25" />
        <rect x="72" y="100" width="110" height="10" rx="5" fill="#2BB9D3" />
        <rect x="92" y="126" width="190" height="10" rx="5" fill="#fff" opacity=".85" />
        <rect x="92" y="152" width="140" height="10" rx="5" fill="#fff" opacity=".5" />
        <rect x="72" y="178" width="90" height="10" rx="5" fill="#2BB9D3" />
        <text x="334" y="228" textAnchor="end" fontSize="44" fontWeight="900" fill="#2BB9D3" fontFamily="monospace">&lt;/&gt;</text>
      </g>
    </svg>
  ),
  ux: (
    <svg viewBox="0 0 400 300" className="art">
      <rect width="400" height="300" fill="#2BB9D3" />
      <circle cx="70" cy="80" r="26" fill="#282F85" />
      <circle cx="70" cy="140" r="26" fill="#fff" />
      <circle cx="70" cy="200" r="26" fill="#1B2050" />
      <g className="bb">
        <rect x="140" y="28" width="120" height="244" rx="22" fill="#1B2050" />
        <rect x="154" y="52" width="92" height="64" rx="10" fill="#2BB9D3" opacity=".85" />
        <rect x="154" y="130" width="92" height="9" rx="4" fill="#fff" opacity=".8" />
        <rect x="154" y="150" width="64" height="9" rx="4" fill="#fff" opacity=".45" />
        <rect x="154" y="226" width="92" height="30" rx="15" fill="#fff" />
        <g fill="#fff" stroke="#282F85" strokeWidth="3">
          <rect x="148" y="46" width="12" height="12" />
          <rect x="240" y="46" width="12" height="12" />
        </g>
        <path d="M300 150 300 214 316 200 328 226 340 220 328 194 350 192Z" fill="#fff" stroke="#1B2050" strokeWidth="4" strokeLinejoin="round" />
      </g>
    </svg>
  ),
  marketing: (
    <svg viewBox="0 0 400 300" className="art">
      <rect width="400" height="300" fill="#1B2050" />
      <circle cx="330" cy="60" r="90" fill="#282F85" />
      <g className="bb">
        <rect x="52" y="200" width="42" height="60" rx="8" fill="#2BB9D3" opacity=".5" />
        <rect x="112" y="170" width="42" height="90" rx="8" fill="#2BB9D3" opacity=".65" />
        <rect x="172" y="130" width="42" height="130" rx="8" fill="#2BB9D3" opacity=".8" />
        <rect x="232" y="90" width="42" height="170" rx="8" fill="#2BB9D3" />
        <rect x="292" y="44" width="42" height="216" rx="8" fill="#fff" />
        <path d="M60 170 135 130 195 96 255 62 318 24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 10" />
      </g>
    </svg>
  ),
  gen: (
    <svg viewBox="0 0 400 300" className="art">
      <rect width="400" height="300" fill="#282F85" />
      <g className="bb" fill="#2BB9D3">
        <rect x="60" y="210" width="50" height="50" opacity=".4" />
        <rect x="110" y="170" width="50" height="90" opacity=".55" />
        <rect x="160" y="130" width="50" height="130" opacity=".7" />
        <rect x="210" y="90" width="50" height="170" opacity=".85" />
        <rect x="260" y="50" width="50" height="210" />
      </g>
    </svg>
  )
};

export default ART;
