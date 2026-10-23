import React from 'react';
import { useKhutwa } from '../../hooks';
import { NotificationBell } from '../common/NotificationBell';
import { getUserInitials } from '../../utils';

export function Header() {
  const { user, toggleTheme, logoutUser, mobileMenuOpen, setMobileMenuOpen, setDtab, showToast } = useKhutwa();

  const handleMyCoursesClick = (e) => {
    e.preventDefault();
    if (!user) {
      showToast('يرجى تسجيل الدخول أولاً لعرض كورساتك المشترك فيها');
      window.location.hash = '#/auth/login';
      return;
    }
    setDtab('courses');
    window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
  };

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
        <a
          href="#/dashboard"
          onClick={handleMyCoursesClick}
          title="الكورسات والمسارات المشترك بها"
        >
          كورساتي
        </a>
        <a href="#stats">الأرقام</a>
        <a href="#j">المسارات</a>
        <a href="#join">انضم إلينا</a>
      </nav>

      <div className="hr">
        <NotificationBell />
        <button className="tg" onClick={toggleTheme} aria-label="تبديل الوضع"></button>

        {/* Mobile User Auth Button */}
        {user ? (
          <button
            type="button"
            className="mobile-user-btn logged-in"
            onClick={() => {
              window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
            }}
            aria-label={`حساب ${user.name}`}
            title={`حسابك: ${user.name} (فتح لوحة التحكم)`}
          >
            <span className="user-initials">{getUserInitials(user.name)}</span>
          </button>
        ) : (
          <button
            type="button"
            className="mobile-user-btn guest"
            onClick={() => {
              window.location.hash = '#/auth/login';
            }}
            aria-label="تسجيل الدخول"
            title="تسجيل الدخول"
          >
            <i className="fa-solid fa-user"></i>
          </button>
        )}

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
