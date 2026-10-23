import React, { useEffect, useRef } from 'react';
import { useKhutwa } from '../../hooks';
import '../../styles/courseEditorial.css';

// Track specific titles and presets for Editorial Style
const TRACK_PRESETS = {
  frontend: {
    heroTitleParts: ['من الصفر', 'لمشروع', 'أونلاين'],
    marqueeWords: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'Deploy', 'Portfolio'],
    instructorBadge: 'محاضر المسار والمدرب العملي',
    vtRole: 'WEB MENTOR · SENIOR FRONTEND ENGINEER',
    endIcon: 'fa-flag-checkered',
    endTitle: 'وصلت',
    endSub: 'مشروعك أونلاين وفي البورتفوليو بتاعك'
  },
  ux: {
    heroTitleParts: ['من الفكرة', 'لنموذج', 'تفاعلي'],
    marqueeWords: ['UX Research', 'User Flow', 'Wireframing', 'Figma', 'UI Design', 'Design Systems', 'Interactive Prototyping'],
    instructorBadge: 'محاضرة المسار والمدربة العملية',
    vtRole: 'LEAD PRODUCT & UX/UI DESIGNER',
    endIcon: 'fa-palette',
    endTitle: 'أتقنت التجربة',
    endSub: 'نموذجك التفاعلي كامل وموثق وجاهز للعرض في بيهانس'
  },
  marketing: {
    heroTitleParts: ['من الخطة', 'لحملة', 'ناجحة'],
    marqueeWords: ['Content Strategy', 'Social Media', 'Paid Ads', 'Copywriting', 'Analytics', 'Conversion Rate', 'Growth Marketing'],
    instructorBadge: 'محاضر المسار والمدرب العملي',
    vtRole: 'GROWTH & PERFORMANCE MARKETING SPECIALIST',
    endIcon: 'fa-rocket',
    endTitle: 'أطلقت أول حملة',
    endSub: 'حملتك شغالة وبتقيس أرقام ومبيعات حقيقية'
  }
};

export function CourseView({ id }) {
  const { user, getCourse, getEnrollment, getPendingSub, setPend, setDialogContent, showToast } = useKhutwa();
  const lstRef = useRef(null);
  const fillRef = useRef(null);
  const rowsRef = useRef([]);
  const botRef = useRef(null);

  const c = getCourse(id);
  if (!c) return null;

  const en = getEnrollment(user, c.id);
  const pendingReq = getPendingSub(user, c.id);
  const open = !!en || (user && user.role === 'admin');

  const preset = TRACK_PRESETS[c.id] || {
    heroTitleParts: ['من البداية', 'لاحتراف', 'المهارة'],
    marqueeWords: ['تطبيق عملي', 'إشراف أسبوعي', 'مشاريع حقيقية', 'بورتفوليو قوي', 'أكاديمية خطوة'],
    instructorBadge: 'محاضر المسار والمدرب العملي',
    vtRole: 'COURSE INSTRUCTOR',
    endIcon: 'fa-flag-checkered',
    endTitle: 'وصلت لنهاية المسار',
    endSub: 'مشروعك أونلاين وفي البورتفوليو بتاعك يؤهلك لسوق العمل'
  };

  const totMinutes = c.lessons.reduce((s, l) => s + (+l.min || 0), 0);
  const hours = Math.floor(totMinutes / 60);
  const mins = totMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}:${mins < 10 ? '0' : ''}${mins}` : `${mins} د`;

  const avatarSrc = c.instructorAvatar
    ? (c.instructorAvatar.startsWith('/') || c.instructorAvatar.startsWith('http') ? c.instructorAvatar : `/${c.instructorAvatar}`)
    : '/assets/mentors/eslam.jpg';

  // Interactive scroll rail and sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      if (!lstRef.current) return;
      const r = lstRef.current.getBoundingClientRect();
      const m = window.innerHeight * 0.6;

      // Update vertical rail fill height
      if (fillRef.current) {
        fillRef.current.style.height = `${Math.max(0, Math.min(r.height, m - r.top))}px`;
      }

      // Highlight passed rows
      rowsRef.current.forEach((rowEl) => {
        if (rowEl) {
          rowEl.classList.toggle('on', rowEl.getBoundingClientRect().top < m - 20);
        }
      });

      // Show sticky bottom bar on scroll
      if (botRef.current) {
        const appContainer = document.getElementById('app');
        const scrollOffset = appContainer ? appContainer.scrollTop : window.scrollY;
        botRef.current.classList.toggle('show', scrollOffset > window.innerHeight * 0.45);
      }
    };

    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    handleScroll();

    return () => {
      if (appContainer) {
        appContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [c.id]);

  const handleOpenPayment = () => {
    if (!user) {
      setPend(c.id);
      showToast('يرجى تسجيل الدخول أو إنشاء حسابك أولاً لتأكيد الاشتراك');
      window.location.hash = '#/auth/register';
      return;
    }
    setDialogContent({
      type: 'vodafone_insta_pay',
      course: c
    });
  };

  const padNumber = (i) => String(i + 1).padStart(2, '0');

  return (
    <div className="course-editorial-page">
      {/* 1. Breadcrumbs */}
      <div className="ed-breadcrumbs">
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>الرئيسية</a>
        <span>/</span>
        <a href="#j" onClick={(e) => {
          e.preventDefault();
          window.location.hash = '';
          setTimeout(() => {
            const el = document.getElementById('j');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}>المسارات والرحلات</a>
        <span>/</span>
        <span>{c.title}</span>
      </div>

      {/* 2. Hero Editorial Section (ed-h2w) */}
      <section className="ed-h2w">
        <div>
          <span className="ed-eb">{c.title}</span>

          <h1 className="ed-big">
            <span>{preset.heroTitleParts[0]}</span>
            <span className="ed-o">{preset.heroTitleParts[1]}</span>
            <span>{preset.heroTitleParts[2]}</span>
          </h1>

          <p className="ed-lead">{c.desc}</p>

          <div className="ed-facts">
            <span><b>{c.weeks}</b> أسابيع</span>
            <span><b>{c.lessons.length}</b> فيديو</span>
            <span><b>{timeFormatted}</b> ساعة</span>
            <span className="ed-fact-free-chip"><b>١</b> درس مجاني</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            {en ? (
              <a className="ed-cta" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>
                <i className="fa-solid fa-play"></i> كمّل الكورس
              </a>
            ) : pendingReq ? (
              <button className="ed-cta" disabled style={{ opacity: 0.8, cursor: 'default' }}>
                <i className="fa-solid fa-hourglass-half" style={{ marginInlineEnd: '8px' }}></i> إيصال التحويل قيد المراجعة
              </button>
            ) : (
              <>
                <a className="ed-cta" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>
                  <i className="fa-solid fa-play"></i> جرّب أول درس مجاني
                </a>
                <button
                  className="ed-cta"
                  style={{ background: 'transparent', color: 'var(--fg)', border: '1px solid var(--line)', boxShadow: 'none' }}
                  onClick={handleOpenPayment}
                >
                  اشترك الآن — {c.price} ج.م
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Clipped Polygon Photo Frame (Clean face, No overlap) */}
        <div className="ed-ph">
          <div className="ed-s ed-s1"></div>
          <div className="ed-s ed-s2">
            <img
              src={avatarSrc}
              alt={c.instructor}
            />
          </div>
          <div className="ed-vt">{preset.vtRole}</div>
          <div className="ed-tag">
            {c.instructor}
            <small>{preset.instructorBadge}</small>
          </div>
        </div>
      </section>

      {/* 3. Tilted Marquee Ticker */}
      <div className="ed-mq" aria-hidden="true">
        <div>
          {[...preset.marqueeWords, ...preset.marqueeWords, ...preset.marqueeWords, ...preset.marqueeWords].map((word, idx) => (
            <span key={idx}>{word} <i className="fa-solid fa-star" style={{ fontSize: '10px', marginInline: '8px', opacity: 0.8 }}></i></span>
          ))}
        </div>
      </div>

      {/* 4. Stations List Section (ed-rw) */}
      <section className="ed-rw" id="rw">
        <h2>{c.lessons.length} محطات لحد مشروعك الأول</h2>
        <p className="ed-mu">أول محطة مجانية، جرّبها وبعدين قرر</p>

        <div className="ed-lst" ref={lstRef}>
          <div className="ed-rail">
            <i ref={fillRef}></i>
          </div>

          {c.lessons.map((lesson, idx) => {
            const isFree = idx === 0;
            const canWatch = isFree || open;

            return (
              <article
                key={lesson.id}
                className="ed-row"
                ref={(el) => { rowsRef.current[idx] = el; }}
                onClick={() => {
                  if (canWatch) {
                    window.location.hash = `#/watch/${c.id}/${lesson.id}`;
                  } else {
                    handleOpenPayment();
                  }
                }}
              >
                <div className="ed-nu">{padNumber(idx)}</div>

                <div>
                  <h3>{lesson.title}</h3>
                  <p>
                    {isFree
                      ? 'محطة تمهيدية مجانية تأسسك خطوة بخطوة وتفهم منها التطبيق العملي'
                      : 'محطة تطبيقية لبناء مهارة قوية وإنجاز جزء من مشروعك التخرجي'}
                  </p>
                </div>

                <div className="ed-meta">
                  <b><i className="fa-regular fa-clock" style={{ marginInlineEnd: '4px' }}></i> {lesson.min} د</b>
                  {canWatch ? (
                    isFree && !open ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="ed-free">مجاني</span>
                        <button
                          className="ed-play"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.hash = `#/watch/${c.id}/${lesson.id}`;
                          }}
                        >
                          <i className="fa-solid fa-play" style={{ fontSize: '11px', marginInlineEnd: '4px' }}></i> شغّله
                        </button>
                      </div>
                    ) : (
                      <span className="ed-free" style={{ background: 'rgba(43, 185, 211, 0.18)', color: 'var(--cyan)' }}>
                        {en && en.done?.includes(lesson.id) ? (
                          <><i className="fa-solid fa-circle-check" style={{ marginInlineEnd: '4px' }}></i> تم الإنجاز</>
                        ) : (
                          <><i className="fa-solid fa-play" style={{ fontSize: '11px', marginInlineEnd: '4px' }}></i> متاح للمشاهدة</>
                        )}
                      </span>
                    )
                  ) : (
                    <span><i className="fa-solid fa-lock" style={{ marginInlineEnd: '4px', fontSize: '12px' }}></i> بالاشتراك</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 5. Clipped Completion Band */}
      <section className="ed-band">
        <h2>
          {preset.endIcon && <i className={`fa-solid ${preset.endIcon}`} style={{ marginInlineEnd: '12px' }}></i>}
          {preset.endTitle}
        </h2>
        <p>{preset.endSub}</p>
        {en ? (
          <a className="ed-cta" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>
            تابع رحلتك الآن
          </a>
        ) : (
          <button className="ed-cta" onClick={handleOpenPayment}>
            ابدأ الرحلة · {c.price} ج.م
          </button>
        )}
      </section>

      <div className="ed-sp"></div>

      {/* 6. Sticky Bottom Bar (ed-bot) */}
      <div className="ed-bot" ref={botRef}>
        <strong>{c.price} ج.م</strong>
        <span className="ed-mu">كل المحطات + مراجعة مشاريعك + متابعة عملية مستمرة</span>
        {en ? (
          <a className="ed-cta" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>
            كمّل الكورس
          </a>
        ) : (
          <button className="ed-cta" onClick={handleOpenPayment}>
            ابدأ الرحلة
          </button>
        )}
      </div>
    </div>
  );
}

export default CourseView;
