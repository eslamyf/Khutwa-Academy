import React from 'react';
import { useKhutwa } from '../../hooks';

export function Header() {
  const { user, toggleTheme, logoutUser, mobileMenuOpen, setMobileMenuOpen } = useKhutwa();

  return (
    <header>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          window.location.hash = '';
        }}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
        <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
      </a>

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.location.hash = '';
          }}
        >
          الرئيسية
        </a>
        <a href="#stats">الأرقام</a>
        <a href="#j">المسارات</a>
        <a href="#join">انضم إلينا</a>
      </nav>

      <div className="hr">
        <button className="tg" onClick={toggleTheme} aria-label="تبديل الوضع"></button>

        {/* Desktop Auth */}
        <div className="desktop-auth">
          {user ? (
            <>
              <button
                className="lnk"
                onClick={() => {
                  window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
                }}
              >
                {user.name.split(' ')[0]}
              </button>
              <button className="btn-logout" onClick={logoutUser}>
                خروج
              </button>
            </>
          ) : (
            <>
              <a className="lnk" href="#/auth/login">دخول</a>
              <a className="btn" href="#/auth/register">سجّل الآن</a>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamb-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="القائمة الرئيسية"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
