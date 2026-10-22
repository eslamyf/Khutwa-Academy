import React from 'react';
import { useKhutwa } from '../../hooks';

export function MobileMenu() {
  const {
    user,
    hash,
    mobileMenuOpen,
    setMobileMenuOpen,
    logoutUser,
    dtab,
    setDtab,
    atab,
    setAtab,
    pendingSubCount,
    pendingLeadsCount,
    unreadRepliesCount,
    markInquiriesAsRead
  } = useKhutwa();

  const isHome = !hash || hash === '#' || hash === '#/';

  return (
    <div className={`mob-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
      <div
        className="mob-menu-backdrop"
        onClick={() => setMobileMenuOpen(false)}
      />
      <nav
        className="mob-menu"
        aria-label="قائمة التصفح للهاتف"
      >
        {/* Top Header Bar */}
        <div className="mob-menu-topbar">
          <span
            onClick={() => {
              setMobileMenuOpen(false);
              window.location.hash = '';
            }}
            style={{ cursor: 'pointer' }}
          >
            <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" width="30" height="40" loading="lazy" />
            <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" width="30" height="40" loading="lazy" />
          </span>
          <button
            className="mob-menu-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Centered Content Area */}
        <div className="mob-menu-content">
          {user && (
            <div className="mob-user-clean mob-anim-item" style={{ '--i': 1 }}>
              <div className="mob-user-avatar">
                <i className="fa-solid fa-circle-user"></i>
              </div>
              <div className="mob-user-name">{user.name}</div>
              <div className="mob-user-role">
                <i className={user.role === 'admin' ? 'fa-solid fa-shield-halved' : 'fa-solid fa-graduation-cap'}></i>
                <span>{user.role === 'admin' ? 'مدير المنصة (Admin)' : 'طالب بأكاديمية خطوة'}</span>
              </div>
            </div>
          )}

          <div className="mob-menu-nav-links">
            {isHome ? (
              /* Home View Context */
              <>
                <div className="mob-nav-group-title mob-anim-item" style={{ '--i': 2 }}>
                  أقسام الموقع
                </div>

                <button
                  className="mob-nav-link active mob-anim-item"
                  style={{ '--i': 3 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.location.hash = '';
                  }}
                >
                  <i className="fa-solid fa-house"></i>
                  <span>الرئيسية</span>
                </button>

                <button
                  className="mob-nav-link mob-anim-item"
                  style={{ '--i': 4 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('stats');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else window.location.hash = '#stats';
                  }}
                >
                  <i className="fa-solid fa-chart-simple"></i>
                  <span>أرقام وإحصائيات خطوة</span>
                </button>

                <button
                  className="mob-nav-link mob-anim-item"
                  style={{ '--i': 5 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('j');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else window.location.hash = '#j';
                  }}
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                  <span>المسارات التعليمية</span>
                </button>

                <button
                  className="mob-nav-link mob-anim-item"
                  style={{ '--i': 6 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('join');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else window.location.hash = '#join';
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>جاهز؟ سيب رقمك</span>
                </button>

                <div className="mob-nav-divider mob-anim-item" style={{ '--i': 7 }} />

                <div className="mob-nav-group-title mob-anim-item" style={{ '--i': 8 }}>
                  حسابك والمنصة
                </div>

                {user ? (
                  <>
                    <button
                      className="mob-nav-link mob-anim-item"
                      style={{ '--i': 9 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
                      }}
                    >
                      <i className={user.role === 'admin' ? 'fa-solid fa-shield-halved' : 'fa-solid fa-chalkboard-user'}></i>
                      <span>{user.role === 'admin' ? 'لوحة تحكم الإدارة' : 'لوحتي التعليمية'}</span>
                    </button>

                    <button
                      className="mob-nav-link mob-nav-danger mob-anim-item"
                      style={{ '--i': 10 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutUser();
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="mob-nav-link mob-anim-item"
                      style={{ '--i': 9 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.hash = '#/auth/login';
                      }}
                    >
                      <i className="fa-solid fa-arrow-right-to-bracket"></i>
                      <span>تسجيل الدخول</span>
                    </button>

                    <button
                      className="mob-nav-link mob-nav-accent mob-anim-item"
                      style={{ '--i': 10 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.hash = '#/auth/register';
                      }}
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      <span>إنشاء حساب جديد</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              /* Dashboard / Admin View Context */
              <>
                <div className="mob-nav-group-title mob-anim-item" style={{ '--i': 2 }}>
                  التنقل السريع
                </div>

                <button
                  className="mob-nav-link mob-anim-item"
                  style={{ '--i': 3 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.hash = '';
                  }}
                >
                  <i className="fa-solid fa-house"></i>
                  <span>الصفحة الرئيسية</span>
                </button>

                <button
                  className={`mob-nav-link mob-anim-item ${hash.startsWith('#/dashboard') ? 'active' : ''}`}
                  style={{ '--i': 4 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.hash = '#/dashboard';
                  }}
                >
                  <i className="fa-solid fa-chalkboard-user"></i>
                  <span>لوحة التحكم / كورساتي</span>
                </button>

                {hash.startsWith('#/dashboard') && (
                  <div className="mob-sub-nav-group mob-anim-item" style={{ '--i': 5 }}>
                    <button
                      className={`mob-sub-link ${dtab === 'courses' ? 'active' : ''}`}
                      onClick={() => {
                        setDtab('courses');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-book-open"></i> الدورات المسجلة
                    </button>
                    <button
                      className={`mob-sub-link ${dtab === 'inquiries' ? 'active' : ''}`}
                      onClick={() => {
                        if (markInquiriesAsRead) markInquiriesAsRead();
                        setDtab('inquiries');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-comment-dots"></i> استفساراتي والدعم {unreadRepliesCount > 0 ? `(${unreadRepliesCount})` : ''}
                    </button>
                    <button
                      className={`mob-sub-link ${dtab === 'profile' ? 'active' : ''}`}
                      onClick={() => {
                        setDtab('profile');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-regular fa-id-badge"></i> الملف الشخصي
                    </button>
                    <button
                      className={`mob-sub-link ${dtab === 'wallet' ? 'active' : ''}`}
                      onClick={() => {
                        setDtab('wallet');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-wallet"></i> المحفظة والمعاملات
                    </button>
                  </div>
                )}

                {user?.role === 'admin' && (
                  <>
                    <button
                      className={`mob-nav-link mob-anim-item ${hash.startsWith('#/admin') ? 'active' : ''}`}
                      style={{ '--i': 6 }}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.hash = '#/admin';
                      }}
                    >
                      <i className="fa-solid fa-shield-halved"></i>
                      <span>
                        لوحة تحكم الأدمن
                        {pendingSubCount > 0 && (
                          <span className="mob-badge">
                            {pendingSubCount}
                          </span>
                        )}
                      </span>
                    </button>

                    {hash.startsWith('#/admin') && (
                      <div className="mob-sub-nav-group mob-anim-item" style={{ '--i': 7 }}>
                        <button
                          className={`mob-sub-link ${atab === 'ov' ? 'active' : ''}`}
                          onClick={() => {
                            setAtab('ov');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-chart-line"></i> نظرة عامة
                        </button>
                        <button
                          className={`mob-sub-link ${atab === 'sub_requests' ? 'active' : ''}`}
                          onClick={() => {
                            setAtab('sub_requests');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-receipt"></i> طلبات الاشتراك
                          {pendingSubCount > 0 && <span className="mob-badge">{pendingSubCount}</span>}
                        </button>
                        <button
                          className={`mob-sub-link ${atab === 'students' ? 'active' : ''}`}
                          onClick={() => {
                            setAtab('students');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-users"></i> الطلاب
                        </button>
                        <button
                          className={`mob-sub-link ${atab === 'courses' ? 'active' : ''}`}
                          onClick={() => {
                            setAtab('courses');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-laptop-code"></i> المسارات
                        </button>
                        <button
                          className={`mob-sub-link ${atab === 'leads' ? 'active' : ''}`}
                          onClick={() => {
                            setAtab('leads');
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i className="fa-solid fa-comments"></i> الاستفسارات والدعم {pendingLeadsCount > 0 ? `(${pendingLeadsCount})` : ''}
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className="mob-nav-divider mob-anim-item" style={{ '--i': 8 }} />

                <button
                  className="mob-nav-link mob-nav-danger mob-anim-item"
                  style={{ '--i': 9 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logoutUser();
                  }}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>تسجيل الخروج</span>
                </button>
              </>
            )}
          </div>

          {/* Social Icons with FontAwesome */}
          <div className="mob-socials mob-anim-item" style={{ '--i': 11 }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
            <a href="https://wa.me/201012345678" target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default MobileMenu;
