import React from 'react';
import { useKhutwa } from '../../hooks';

export function ThemeToggle({ ariaLabel = 'تبديل الوضع الفاتح والداكن', className = 'tg', ...props }) {
  const { toggleTheme } = useKhutwa();

  return (
    <button
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title="تبديل الوضع (داكن / فاتح)"
      {...props}
    >
      <span className="tg-icon tg-sun" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      </span>
      <span className="tg-icon tg-moon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </span>
    </button>
  );
}

export default ThemeToggle;
