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
    setMobileMenuOpen,
    getCourse
  } = useKhutwa();

  // Determine current page context and back target
  const parts = hash.slice(2).split('/');
  const route = parts[0]; // course, watch, dashboard, admin, auth
  const paramA = parts[1];
  const paramB = parts[2];

  let currentTitle = 'المنصة';
  let backTarget = '';
  let backLabel = 'الرئيسية';

  if (route === 'course') {
    const course = getCourse(paramA);
    currentTitle = course ? course.title : 'تفاصيل المسار';
    backTarget = '#j';
    backLabel = 'كل المسارات';
  } else if (route === 'watch') {
    const course = getCourse(paramA);
    currentTitle = course ? `${course.title}` : 'مشاهدة الدرس';
    backTarget = `#/course/${paramA}`;
    backLabel = 'صفحة المسار';
  } else if (route === 'dashboard') {
    currentTitle = 'لوحتي التعليمية';
    backTarget = '';
    backLabel = 'الرئيسية';
  } else if (route === 'admin') {
    currentTitle = 'لوحة الإدارة';
    backTarget = '';
    backLabel = 'الرئيسية';
  } else if (route === 'auth') {
    currentTitle = paramA === 'register' ? 'إنشاء حساب' : 'تسجيل الدخول';
    backTarget = '';
    backLabel = 'الرئيسية';
  }

  const handleBack = () => {
    if (backTarget === '#j') {
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById('j');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.location.hash = backTarget;
    }
  };

  return (
    <header className="tb">
      <div className="tb-brand">
        <a className="lg" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} title="أكاديمية خطوة — الرئيسية">
          <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
          <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
        </a>
      </div>

      <nav className="desktop-nav">
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>الرئيسية</a>

        {backTarget && (
          <button
            className="tb-nav-back-link"
            onClick={handleBack}
            title={`الرجوع إلى: ${backLabel}`}
          >
            <i className="fa-solid fa-arrow-right"></i>
            <span>{backLabel}</span>
          </button>
        )}
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
              setDtab('courses');
              window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
            }}
          >
            كورساتي
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
