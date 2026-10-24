import React from 'react';
import { useKhutwa } from '../../hooks';
import '../../styles/notFound.css';

export function NotFoundView({ attemptedPath }) {
  const { db } = useKhutwa();

  // Safely decode the attempted path for display
  const rawPath = attemptedPath || window.location.hash || '';
  let displayPath = rawPath;
  try {
    displayPath = decodeURIComponent(rawPath);
  } catch {
    displayPath = rawPath;
  }

  const handleGoHome = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.location.hash = '';
    }
  };

  const handleGoTracks = (e) => {
    e.preventDefault();
    try {
      window.history.pushState(null, '', '/#j');
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch {
      window.location.hash = '#j';
    }
    setTimeout(() => {
      const el = document.getElementById('j');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };


  // Get active courses for helpful quick recommendations
  const courses = (db && db.courses && db.courses.length)
    ? db.courses
    : [
        { id: 'frontend', title: 'تطوير واجهات الويب' },
        { id: 'ux', title: 'تصميم تجربة المستخدم UX/UI' },
        { id: 'marketing', title: 'التسويق الرقمي' }
      ];

  const getTrackIcon = (id) => {
    if (id === 'frontend') return 'fa-solid fa-code';
    if (id === 'ux') return 'fa-solid fa-palette';
    if (id === 'marketing') return 'fa-solid fa-bullhorn';
    return 'fa-solid fa-graduation-cap';
  };

  return (
    <div className="nf-page">
      {/* Visual glowing orbs matching Khutwa palette */}
      <div className="nf-orb nf-orb-1" aria-hidden="true" />
      <div className="nf-orb nf-orb-2" aria-hidden="true" />

      <div className="nf-card">
        {/* Animated Icon */}
        <div className="nf-icon-wrap" aria-hidden="true">
          <i className="fa-solid fa-compass"></i>
        </div>


        {/* 404 Visual Number */}
        <div className="nf-code">404</div>

        {/* Badge */}
        <div className="nf-badge">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>مسار غير متوفر</span>
        </div>

        {/* Title & Description */}
        <h1 className="nf-title">المسار ده مش تبعنا!</h1>
        <p className="nf-desc">
          شكلك تهت في الطريق.. الرابط أو المسار اللي دخلت عليه مش موجود ضمن مسارات <strong>أكاديمية خطوة</strong>، أو ممكن يكون اتكتب بحروف مش مظبوطة.
        </p>

        {/* Attempted Path Box */}
        {displayPath && (
          <div className="nf-path-card">
            <span className="nf-path-label">
              <i className="fa-solid fa-link-slash"></i>
              المسار المطلوب:
            </span>
            <code className="nf-path-value">{displayPath}</code>
          </div>
        )}

        {/* Suggested Courses / Tracks */}
        <div className="nf-tracks-section">
          <div className="nf-tracks-title">
            <i className="fa-solid fa-route"></i>
            <span>المسارات المعتمدة حالياً في الأكاديمية:</span>
          </div>
          <div className="nf-tracks-grid">
            {courses.map((c) => (
              <a
                key={c.id}
                href={`#/course/${c.id}`}
                className="nf-track-pill"
                title={`الذهاب إلى تفاصيل مسار ${c.title}`}
              >
                <i className={getTrackIcon(c.id)}></i>
                <span>{c.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="nf-actions">
          <button
            type="button"
            className="nf-btn-primary"
            onClick={handleGoHome}
            title="الرجوع إلى الصفحة الرئيسية للأكاديمية"
          >
            <i className="fa-solid fa-house"></i>
            <span>الرجوع للرئيسية</span>
          </button>

          <button
            type="button"
            className="nf-btn-secondary"
            onClick={handleGoTracks}
            title="استعراض خريطة ومحطات المسارات"
          >
            <i className="fa-solid fa-road"></i>
            <span>استكشاف كل المسارات</span>
          </button>
        </div>

        {/* Support Help Link */}
        <div className="nf-help">
          <span>لو شايف إن دي مشكلة تقنية؟</span>
          <a
            href="https://wa.me/201028103634?text=%D8%B9%D9%86%D8%AF%D9%8A%20%D9%85%D8%B4%D9%83%D9%84%D8%A9%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84%20%D9%84%D9%85%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D9%85%D9%86%D8%B5%D8%A9"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-whatsapp"></i>
            تواصل مع الدعم الفني
          </a>
        </div>
      </div>
    </div>
  );
}

export default NotFoundView;
