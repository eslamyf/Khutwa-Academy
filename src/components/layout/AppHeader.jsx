import React from 'react';
import { useKhutwa } from '../../hooks';

export function AppHeader() {
  const {
    user,
    hash,
    dtab,
    setDtab,
    atab,
    setAtab,
    setAedit,
    toggleTheme,
    logoutUser,
    pendingSubCount,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useKhutwa();

  return (
    <header className="tb">
      <a className="lg" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
        <img className="logo-d" src="assets/Asset_103.png" alt="خطوة" />
        <img className="logo-l" src="assets/Asset_42.png" alt="خطوة" />
      </a>
      <nav className="desktop-nav">
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>الرئيسية</a>
        {hash.startsWith('#/dashboard') && (
          <>
            <button className={dtab === 'courses' ? 'on' : ''} onClick={() => setDtab('courses')}>كورساتي</button>
            <button className={dtab === 'inquiries' ? 'on' : ''} onClick={() => setDtab('inquiries')}>استفساراتي والدعم</button>
            <button className={dtab === 'profile' ? 'on' : ''} onClick={() => setDtab('profile')}>ملفي</button>
            <button className={dtab === 'wallet' ? 'on' : ''} onClick={() => setDtab('wallet')}>رصيدي</button>
          </>
        )}
        {hash.startsWith('#/admin') && (
          <>
            <button className={atab === 'ov' ? 'on' : ''} onClick={() => { setAtab('ov'); setAedit(null); }}>نظرة عامة</button>
            <button className={atab === 'sub_requests' ? 'on' : ''} onClick={() => { setAtab('sub_requests'); setAedit(null); }}>
              طلبات الاشتراك {pendingSubCount > 0 ? `(${pendingSubCount})` : ''}
            </button>
            <button className={atab === 'courses' ? 'on' : ''} onClick={() => { setAtab('courses'); setAedit(null); }}>الكورسات</button>
            <button className={atab === 'students' ? 'on' : ''} onClick={() => { setAtab('students'); setAedit(null); }}>الطلاب</button>
            <button className={atab === 'tx' ? 'on' : ''} onClick={() => { setAtab('tx'); setAedit(null); }}>العمليات</button>
            <button className={atab === 'leads' ? 'on' : ''} onClick={() => { setAtab('leads'); setAedit(null); }}>الاستفسارات</button>
          </>
        )}
        {!hash.startsWith('#/dashboard') && !hash.startsWith('#/admin') && user && (
          <button
            className="on"
            onClick={() => {
              window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
            }}
          >
            لوحتي
          </button>
        )}
      </nav>

      <div className="end-actions">
        <button className="tg" onClick={toggleTheme} aria-label="تبديل الوضع"></button>
        <div className="desktop-auth">
          {user ? (
            <>
              <span className="me">{user.name.split(' ')[0]}</span>
              <button className="lnk" onClick={logoutUser}>خروج</button>
            </>
          ) : (
            <button
              className="btn"
              onClick={() => { window.location.hash = '#/auth/register'; }}
            >
              سجّل الآن
            </button>
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

export default AppHeader;
