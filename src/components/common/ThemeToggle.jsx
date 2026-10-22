import React from 'react';
import { useKhutwa } from '../../hooks';

export function ThemeToggle({ ariaLabel = 'تبديل الوضع الفاتح والداكن', className = 'tg', ...props }) {
  const { toggleTheme } = useKhutwa();

  return (
    <button
      className={className}
      onClick={toggleTheme}
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export default ThemeToggle;
