import React, { useEffect, useState, useRef } from 'react';

// Database seed and storage helpers
const DB_KEY = 'khutwa_db_v1';
const SESSION_KEY = 'khutwa_session';

const gid = (p) => p + Math.random().toString(36).slice(2, 9);
const fmt = (t) => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });

const LS = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      return false;
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch {
      return false;
    }
  }
};

const L = (a) => a.map(([title, min, url]) => ({ id: gid('l'), title, min, url: url || '' }));
const TX = { topup: 'شحن رصيد', purchase: 'اشتراك', adjust: 'تعديل', grant: 'اشتراك من الأدمن' };
const YEARS = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'خريج'];
const GOALS = ['عمل حر', 'وظيفة', 'تغيير مجال', 'تطوير مهاراتي'];

function initialSeed() {
  return {
    v: 3,
    settings: {
      whatsapp: '201000000000',
      vodafone: '01012345678',
      instapay: 'khutwa@instapay'
    },
    users: [
      {
        id: 'u_admin',
        name: 'مدير خطوة',
        email: 'admin@khutwa.com',
        pass: 'admin123',
        role: 'admin',
        balance: 0,
        phone: '',
        profile: {},
        status: 'active',
        created: Date.now()
      }
    ],
    courses: [
      {
        id: 'frontend',
        title: 'معسكر تطوير واجهات الويب',
        weeks: 8,
        price: 1500,
        pub: true,
        img: '',
        desc: '٨ أسابيع تبني فيها واجهات مواقع حقيقية خطوة بخطوة، مع إرشاد فردي أسبوعي.',
        outcomes: [
          'تبني صفحة ويب متجاوبة من الصفر',
          'تربط التصميم بالكود وتنظم مشروعك على GitHub',
          'ترفع مشروعك أونلاين وتضيفه للبورتفوليو'
        ],
        lessons: L([
          ['إزاي بيشتغل الويب', 12, 'https://www.youtube.com/watch?v=edBBbWSdfAg'],
          ['HTML من الصفر', 60, 'https://www.youtube.com/watch?v=6QAELgirvjs'],
          ['CSS والتخطيط', 30, 'https://www.youtube.com/watch?v=R6Ygwllc_a8'],
          ['JavaScript أساسيات', 35, 'https://www.youtube.com/watch?v=GM6dQBmc-Xg'],
          ['مشروع الأسبوع: صفحة شخصية', 28, 'https://www.youtube.com/watch?v=UB1O30fR-EE'],
          ['التجاوب مع الموبايل', 22, 'https://www.youtube.com/watch?v=R6Ygwllc_a8'],
          ['رفع المشروع أونلاين', 15, 'https://www.youtube.com/watch?v=LbChVEs_mLs']
        ])
      },
      {
        id: 'ux',
        title: 'مسار التصميم UX/UI',
        weeks: 6,
        price: 1200,
        pub: true,
        img: '',
        desc: '٦ أسابيع تتعلم فيها تصمم تجربة مستخدم كاملة من الفكرة للنموذج التفاعلي.',
        outcomes: [
          'تفهم المستخدم وتحوّله لمشكلة تتحل',
          'ترسم Wireframe وتطوره لتصميم نهائي',
          'تعرض مشروعك في بورتفوليو'
        ],
        lessons: L([
          ['يعني إيه UX؟', 10, 'https://www.youtube.com/watch?v=8TCjKKReoo8'],
          ['فهم المستخدم', 20, 'https://www.youtube.com/watch?v=LkX8acAE8_A'],
          ['الـ Wireframe', 25, 'https://www.youtube.com/watch?v=-qMP94fKHa4'],
          ['الألوان والخطوط', 22, 'https://www.youtube.com/watch?v=8TCjKKReoo8'],
          ['النموذج التفاعلي', 30, 'https://www.youtube.com/watch?v=-qMP94fKHa4'],
          ['عرض مشروعك', 15, 'https://www.youtube.com/watch?v=LkX8acAE8_A']
        ])
      },
      {
        id: 'marketing',
        title: 'التسويق الرقمي وصناعة المحتوى',
        weeks: 6,
        price: 1200,
        pub: true,
        img: '',
        desc: '٦ أسابيع تخطط فيها محتوى حقيقي وتنشره وتقيس نتيجته.',
        outcomes: [
          'تحدد جمهورك وتكتب خطة محتوى',
          'تنشر وتجدول على المنصات',
          'تقيس النتائج وتحسّن'
        ],
        lessons: L([
          ['أساسيات التسويق الرقمي', 12, 'https://www.youtube.com/watch?v=7RACMcT0vLg'],
          ['فهم الجمهور', 18, 'https://www.youtube.com/watch?v=STbhc0Rvzao'],
          ['صناعة المحتوى', 28, 'https://www.youtube.com/watch?v=5a-RkzUEqAM'],
          ['الجدولة والنشر', 20, 'https://www.youtube.com/watch?v=7RACMcT0vLg'],
          ['قياس النتائج', 22, 'https://www.youtube.com/watch?v=STbhc0Rvzao'],
          ['مشروع حملة كاملة', 30, 'https://www.youtube.com/watch?v=5a-RkzUEqAM']
        ])
      }
    ],
    enr: [],
    tx: [],
    leads: [],
    subRequests: []
  };
}

const ART = {
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

const ytid = (u) => {
  const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m && m[1];
};

export function App() {
  const [db, setDb] = useState(() => {
    try {
      const raw = LS.get(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.subRequests) parsed.subRequests = [];
        if (!parsed.settings) parsed.settings = {};
        if (!parsed.settings.vodafone) parsed.settings.vodafone = '01012345678';
        if (!parsed.settings.instapay) parsed.settings.instapay = 'khutwa@instapay';
        if (!parsed.courses || !parsed.courses.length) {
          parsed.courses = initialSeed().courses;
        } else {
          const seed = initialSeed();
          parsed.courses = seed.courses.map((sc) => {
            const ex = parsed.courses.find((c) => c.id === sc.id);
            if (!ex) return sc;
            const updatedLessons = sc.lessons.map((sl, idx) => {
              const el = ex.lessons && ex.lessons[idx];
              return {
                ...sl,
                url: (el && el.url) ? el.url : sl.url
              };
            });
            return { ...ex, lessons: updatedLessons };
          });
        }
        return parsed;
      }
    } catch {
      return initialSeed();
    }
    return initialSeed();
  });

  const [sid, setSid] = useState(() => LS.get(SESSION_KEY));
  const [hash, setHash] = useState(() => window.location.hash || '');
  const [toastMsg, setToastMsg] = useState('');
  const [dialogContent, setDialogContent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dashboards internal state
  const [dtab, setDtab] = useState('courses');
  const [atab, setAtab] = useState('ov');
  const [aedit, setAedit] = useState(null);
  const [sq, setSq] = useState('');
  const [pend, setPend] = useState(null);

  // Payment form internal state
  const [payMethod, setPayMethod] = useState('vodafone');
  const [paySender, setPaySender] = useState('');
  const [payReceipt, setPayReceipt] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Lead form state
  const [leadForm, setLeadForm] = useState({ track: 'frontend', name: '', phone: '' });
  const [leadSent, setLeadSent] = useState(false);

  // SVG Journey refs
  const journeyRef = useRef(null);
  const pbRef = useRef(null);
  const pfRef = useRef(null);
  const icRef = useRef(null);
  const st1Ref = useRef(null);
  const st2Ref = useRef(null);
  const st3Ref = useRef(null);
  const endRef = useRef(null);

  const saveDb = (next) => {
    setDb(next);
    LS.set(DB_KEY, JSON.stringify(next));
  };

  const showToast = (m) => {
    setToastMsg(m);
    setTimeout(() => {
      setToastMsg('');
    }, 2600);
  };

  const currentUser = () => {
    const u = db.users.find((x) => x.id === sid);
    return u && u.status !== 'blocked' ? u : null;
  };

  const getCourse = (id) => db.courses.find((c) => c.id === id);
  const getEnrollment = (u, cid) => u && db.enr.find((e) => e.u === u.id && e.c === cid);
  const getPendingSub = (u, cid) => u && (db.subRequests || []).find((s) => s.userId === u.id && s.courseId === cid && s.status === 'pending');

  // Theme toggle
  const toggleTheme = () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    LS.set('khutwa-theme', next);
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`تم نسخ ${label}: ${text}`);
    });
  };

  // Listen to hash changes and close mobile menu
  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || '');
      setMobileMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Update body lock class when app layer is open
  const isAppOpen = hash.startsWith('#/');
  useEffect(() => {
    if (isAppOpen) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  }, [isAppOpen]);

  // Build journey path (exact math from khutwa-site)
  useEffect(() => {
    if (isAppOpen) return;

    const J = journeyRef.current;
    const pb = pbRef.current;
    const pf = pfRef.current;
    const ic = icRef.current;
    const sts = [st1Ref.current, st2Ref.current, st3Ref.current].filter(Boolean);

    if (!J || !pb || !pf || !ic || sts.length !== 3) return;

    let L_len = 0;
    let H_val = 0;
    let ys_val = [];

    function buildPath() {
      const W = J.clientWidth;
      H_val = J.clientHeight;
      const m = W < 800;
      const xs = m ? [0.9, 0.8, 0.9, 0.82] : [0.3, 0.7, 0.3, 0.5];
      ys_val = sts.map((s) => +s.dataset.y * H_val);
      const endEl = endRef.current;
      const endY = endEl ? Math.max(ys_val[2] + 120, endEl.offsetTop - (m ? 60 : 70)) : (H_val * (m ? 0.82 : 0.88));
      const pts = [[W * (m ? 0.88 : 0.5), 0], ...ys_val.map((y, i) => [W * xs[i], y]), [W * 0.5, endY]];

      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        const my = (y0 + y1) / 2;
        d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`;
      }

      pb.setAttribute('d', d);
      pf.setAttribute('d', d);
      L_len = pf.getTotalLength();
      pf.style.strokeDasharray = L_len;

      sts.forEach((s, i) => {
        s.style.top = ys_val[i] - s.offsetHeight / 2 + 'px';
        if (m) {
          s.style.insetInlineEnd = '4vw';
          s.style.insetInlineStart = 'auto';
        } else if (xs[i] < 0.5) {
          s.style.insetInlineStart = '6%';
          s.style.insetInlineEnd = 'auto';
        } else {
          s.style.insetInlineEnd = '6%';
          s.style.insetInlineStart = 'auto';
        }
      });
      updateScroll();
    }

    function lenAt(y) {
      let lo = 0, hi = L_len;
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        pf.getPointAtLength(mid).y < y ? (lo = mid) : (hi = mid);
      }
      return lo;
    }

    function updateScroll() {
      if (!J || !pf || !ic) return;
      const r = J.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.6 - r.top) / (H_val + window.innerHeight * 0.1)));
      pf.style.strokeDashoffset = L_len * (1 - p);
      const pt = pf.getPointAtLength(L_len * p);
      ic.style.transform = `translate(${pt.x - 29}px,${pt.y - 48}px)`;
      sts.forEach((s, i) => s.classList.toggle('on', L_len * p >= lenAt(ys_val[i])));
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', buildPath);
    document.fonts.ready.then(buildPath);
    buildPath();

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', buildPath);
    };
  }, [isAppOpen]);

  // Lead Form submission
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const newLead = {
      id: gid('q'),
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim(),
      track: leadForm.track,
      date: Date.now(),
      status: 'new'
    };
    saveDb({ ...db, leads: [newLead, ...db.leads] });
    setLeadSent(true);
  };

  // Auth actions
  const registerUser = (name, email, pass) => {
    email = email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) return 'الإيميل ده مسجل قبل كده';
    const u = {
      id: gid('u'),
      name: name.trim(),
      email,
      pass,
      role: 'student',
      balance: 0,
      phone: '',
      profile: {},
      status: 'active',
      created: Date.now()
    };
    const nextDb = { ...db, users: [...db.users, u] };
    saveDb(nextDb);
    setSid(u.id);
    LS.set(SESSION_KEY, u.id);
    return null;
  };

  const loginUser = (email, pass) => {
    const u = db.users.find((x) => x.email === email.trim().toLowerCase() && x.pass === pass);
    if (!u) return 'الإيميل أو كلمة السر غلط';
    if (u.status === 'blocked') return 'الحساب موقوف، تواصل معنا';
    setSid(u.id);
    LS.set(SESSION_KEY, u.id);
    return null;
  };

  const logoutUser = () => {
    setSid(null);
    LS.del(SESSION_KEY);
    window.location.hash = '';
    showToast('تم تسجيل الخروج');
  };

  const user = currentUser();

  // Route parser
  const renderAppRoute = () => {
    if (!hash.startsWith('#/')) return null;
    const [r, a, b] = hash.slice(2).split('/');

    if ((r === 'dashboard' && !user) || (r === 'admin' && (!user || user.role !== 'admin'))) {
      window.location.hash = '#/auth/login';
      return null;
    }
    if (r === 'dashboard' && user?.role === 'admin') {
      window.location.hash = '#/admin';
      return null;
    }
    if (r === 'auth' && user) {
      window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
      return null;
    }

    if (r === 'auth') {
      return renderAuthView(a === 'register' ? 'register' : 'login');
    }
    if (r === 'course') {
      return renderCourseView(a);
    }
    if (r === 'watch') {
      return renderWatchView(a, b);
    }
    if (r === 'dashboard') {
      return renderDashboardView();
    }
    if (r === 'admin') {
      return renderAdminView();
    }

    return null;
  };

  // Auth view render
  const renderAuthView = (mode) => {
    const reg = mode === 'register';
    return (
      <div className="au">
        <aside className="ab">
          <img className="alg" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
          <a className="back" href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
            ← الرئيسية
          </a>
          <div className="stairs" style={{ '--u': 'clamp(24px,3.2vw,44px)' }} aria-hidden="true">
            <i style={{ '--n': 1 }}></i><i style={{ '--n': 2 }}></i><i style={{ '--n': 3 }}></i>
            <i style={{ '--n': 4 }}></i><i style={{ '--n': 5 }}></i><i style={{ '--n': 6 }}></i>
            <img className="hop" src="assets/icon-cyan.png" alt="" />
          </div>
          <h2>{reg ? <>ابدأ خطوتك<br />من هنا.</> : <>كمّل من<br />حيث وقفت.</>}</h2>
          <ul className="pk">
            <li>مشاريع حقيقية</li>
            <li>إرشاد فردي أسبوعي</li>
            <li>فرص توظيف وتدريب للمتفوقين</li>
          </ul>
        </aside>

        <section className="af">
          <button className="tg" onClick={toggleTheme} aria-label="تبديل الوضع"></button>
          <div className="fb">
            <div className="seg" data-m={reg ? 'register' : 'login'}>
              <a href="#/auth/login">دخول</a>
              <a href="#/auth/register">حساب جديد</a>
              <i></i>
            </div>
            <h1>{reg ? 'أهلًا بيك' : 'نورتنا تاني'}</h1>
            <p className="sb">{reg ? '٣ بيانات بس وتبدأ رحلتك.' : 'ادخل لوحتك وكمّل من حيث وقفت.'}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const err = reg
                  ? registerUser(fd.get('name'), fd.get('email'), fd.get('pass'))
                  : loginUser(fd.get('email'), fd.get('pass'));

                if (err) {
                  showToast(err);
                  return;
                }
                showToast(reg ? 'أهلًا بيك في خطوة' : 'أهلًا بيك تاني');
                if (pend) {
                  const p = pend;
                  setPend(null);
                  window.location.hash = '#/course/' + p;
                  return;
                }
                window.location.hash = '#/dashboard';
              }}
            >
              {reg && (
                <div className="ff">
                  <input name="name" placeholder=" " required autoComplete="name" />
                  <label>الاسم بالكامل</label>
                </div>
              )}
              <div className="ff">
                <input name="email" type="email" placeholder=" " required autoComplete="email" />
                <label>الإيميل</label>
              </div>
              <div className="ff">
                <input name="pass" type="password" placeholder=" " required minLength={6} autoComplete={reg ? 'new-password' : 'current-password'} />
                <label>كلمة السر</label>
                <button
                  type="button"
                  className="eye"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement.querySelector('input');
                    const isPass = input.type === 'password';
                    input.type = isPass ? 'text' : 'password';
                    e.currentTarget.textContent = isPass ? 'إخفاء' : 'إظهار';
                  }}
                >
                  إظهار
                </button>
              </div>

              <button className="go" type="submit">
                <span>{reg ? 'ابدأ خطوتك' : 'دخول'}</span>
                <b>←</b>
              </button>
            </form>

            {!reg && <p className="dev">تجربة الأدمن: admin@khutwa.com / admin123</p>}
          </div>
        </section>
      </div>
    );
  };

  // Course Details view
  const renderCourseView = (id) => {
    const c = getCourse(id);
    if (!c) return null;
    const en = getEnrollment(user, c.id);
    const pendingReq = getPendingSub(user, c.id);
    const open = !!en || (user && user.role === 'admin');

    const totTime = () => {
      const m = c.lessons.reduce((s, l) => s + (+l.min || 0), 0);
      return m >= 60 ? Math.floor(m / 60) + ' ساعة' + (m % 60 ? ' و' + (m % 60) + ' دقيقة' : '') : m + ' دقيقة';
    };

    const handleOpenPayment = () => {
      if (!user) {
        setPend(c.id);
        showToast('يرجى تسجيل الدخول أو إنشاء حسابك أولاً لتأكيد الاشتراك');
        window.location.hash = '#/auth/register';
        return;
      }
      setPayMethod('vodafone');
      setPaySender(user.phone || '');
      setPayReceipt('');
      setPayNotes('');
      setDialogContent({
        type: 'vodafone_insta_pay',
        course: c
      });
    };

    return (
      <div className="wrap">
        <div className="ch">
          <div>
            <p className="cr"><a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>الرئيسية</a> / المسارات</p>
            <h1>{c.title}</h1>
            <p className="mt">
              <span>{c.weeks} أسابيع</span>
              <span>{c.lessons.length} فيديو</span>
              <span>{totTime()}</span>
              <span>{c.price} ج.م</span>
            </p>
            <p className="ds">{c.desc}</p>

            {en ? (
              <a className="btn" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>كمّل الكورس</a>
            ) : pendingReq ? (
              <div className="banner" style={{ borderInlineStartColor: 'var(--cyan)' }}>
                <div>
                  <b style={{ color: 'var(--cyt)' }}>⏳ تم إرسال إيصال التحويل (قيد المراجعة)</b>
                  <p className="hint" style={{ marginTop: '4px' }}>
                    طلبك قيد المراجعة حالياً من الأدمن عبر ({pendingReq.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}). هيتم تفعيل الكورس فور التأكيد.
                  </p>
                </div>
              </div>
            ) : (
              <button className="btn" onClick={handleOpenPayment}>
                اشترك — {c.price} ج.م
              </button>
            )}
          </div>
          <div className="cv">{c.img ? <img src={c.img} alt="" /> : (ART[c.id] || ART.gen)}</div>
        </div>

        <h2>هتطلع بإيه</h2>
        <ul className="ol">
          {c.outcomes.map((o, idx) => <li key={idx}>{o}</li>)}
        </ul>

        <h2>محتوى الكورس <small>الفيديو الأول مجاني، والباقي بيتفتح بالاشتراك</small></h2>
        <div>
          {c.lessons.map((l, i) => {
            const ok = i === 0 || open;
            const yId = ytid(l.url);
            return ok ? (
              <a key={l.id} className="ls" href={`#/watch/${c.id}/${l.id}`}>
                <span>{en && en.done.includes(l.id) ? '✓' : '▶'}</span>
                {yId && <img className="yt" src={`https://i.ytimg.com/vi/${yId}/mqdefault.jpg`} alt="" />}
                <span className="lt">{i + 1}. {l.title}</span>
                {i === 0 && !open && <span className="tag">مجاني</span>}
                <em>{l.min} د</em>
              </a>
            ) : (
              <div key={l.id} className="ls lock" onClick={handleOpenPayment} style={{ cursor: 'pointer' }}>
                <span>🔒</span>
                {yId && <img className="yt bl" src={`https://i.ytimg.com/vi/${yId}/mqdefault.jpg`} alt="" />}
                <span className="lt">{i + 1}. {l.title}</span>
                <em>{l.min} د</em>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Watch video player view
  const renderWatchView = (cid, lid) => {
    const c = getCourse(cid);
    if (!c || !c.lessons.length) return null;
    const en = getEnrollment(user, cid);
    const adm = user && user.role === 'admin';
    const pendingReq = getPendingSub(user, cid);
    const i = Math.max(0, c.lessons.findIndex((l) => l.id === lid));
    const l = c.lessons[i];
    const ok = i === 0 || en || adm;
    const yId = ytid(l.url);

    return (
      <div className="wrap">
        <p className="cr">
          <a href={`#/course/${c.id}`}>← {c.title}</a>
        </p>
        <div className="wt">
          <div>
            <div className="pl">
              {ok ? (
                yId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${yId}?rel=0`}
                    allow="accelerometer;encrypted-media;picture-in-picture;fullscreen"
                    allowFullScreen
                    title={l.title}
                  />
                ) : /\.(mp4|webm)(\?|$)/i.test(l.url) ? (
                  <video src={l.url} controls controlsList="nodownload" />
                ) : (
                  <div className="ph">
                    <img src="assets/icon-cyan.png" alt="" />
                    <b>{l.title}</b>
                    <small>الفيديو هيتضاف هنا من لوحة الأدمن</small>
                  </div>
                )
              ) : (
                <div className="ph">
                  <b>🔒 الفيديو ده للمشتركين</b>
                  {pendingReq ? (
                    <small style={{ color: 'var(--cyan)' }}>⏳ جاري مراجعة إيصال تحويلك من الأدمن</small>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => {
                        if (!user) {
                          setPend(c.id);
                          window.location.hash = '#/auth/register';
                          return;
                        }
                        setPayMethod('vodafone');
                        setPaySender(user.phone || '');
                        setPayReceipt('');
                        setPayNotes('');
                        setDialogContent({ type: 'vodafone_insta_pay', course: c });
                      }}
                    >
                      اشترك الآن — {c.price} ج.م
                    </button>
                  )}
                </div>
              )}
            </div>

            {ok && yId && (
              <p className="hint" style={{ marginTop: '10px' }}>
                <a className="lnk" href={`https://www.youtube.com/watch?v=${yId}`} target="_blank" rel="noopener noreferrer">
                  لو الفيديو مش بيظهر افتحه على يوتيوب ↗
                </a>
              </p>
            )}

            <h2>{i + 1}. {l.title}</h2>
            <div className="ctl">
              {i > 0 && (
                <a className="lnk" href={`#/watch/${c.id}/${c.lessons[i - 1].id}`}>→ السابق</a>
              )}
              {en && ok && (
                <button
                  className="btn"
                  onClick={() => {
                    const doneArr = [...en.done];
                    const idx = doneArr.indexOf(l.id);
                    if (idx < 0) doneArr.push(l.id);
                    else doneArr.splice(idx, 1);
                    en.done = doneArr;
                    saveDb({ ...db });
                  }}
                >
                  {en.done.includes(l.id) ? '✓ خلصته (إلغاء)' : 'خلصت الفيديو'}
                </button>
              )}
              {i < c.lessons.length - 1 && (
                <a className="lnk" href={`#/watch/${c.id}/${c.lessons[i + 1].id}`}>التالي ←</a>
              )}
            </div>
          </div>

          <aside>
            {c.lessons.map((x, j) => {
              const itemOk = j === 0 || en || adm;
              const itemYid = ytid(x.url);
              return itemOk ? (
                <a key={x.id} className={`ls ${x.id === l.id ? 'cur' : ''}`} href={`#/watch/${c.id}/${x.id}`}>
                  <span>{en && en.done.includes(x.id) ? '✓' : '▶'}</span>
                  {itemYid && <img className="yt" src={`https://i.ytimg.com/vi/${itemYid}/mqdefault.jpg`} alt="" />}
                  <span className="lt">{j + 1}. {x.title}</span>
                  {j === 0 && !en && !adm && <span className="tag">مجاني</span>}
                  <em>{x.min} د</em>
                </a>
              ) : (
                <div key={x.id} className="ls lock">
                  <span>🔒</span>
                  {itemYid && <img className="yt bl" src={`https://i.ytimg.com/vi/${itemYid}/mqdefault.jpg`} alt="" />}
                  <span className="lt">{j + 1}. {x.title}</span>
                  <em>{x.min} د</em>
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    );
  };

  // Student Dashboard view
  const renderDashboardView = () => {
    if (!user) return null;
    const p = user.profile || {};
    const n = [user.phone, p.university, p.faculty, p.year, p.goal].filter(Boolean).length;
    const mine = db.enr.filter((e) => e.u === user.id);
    const userPending = (db.subRequests || []).filter((s) => s.userId === user.id && s.status === 'pending');
    const free = db.courses.filter((c) => c.pub && !mine.some((e) => e.c === c.id));

    return (
      <div className="wrap">
        {n < 5 && dtab !== 'profile' && (
          <div className="banner">
            <div className="steps">
              {[1, 2, 3, 4, 5].map((num) => (
                <i key={num} className={num <= n ? 'on' : ''} style={{ '--n': num }}></i>
              ))}
            </div>
            <div>
              <b>كمّل بياناتك ({n}/5)</b><br />
              <button className="lnk" onClick={() => setDtab('profile')}>كمّل دلوقتي ←</button>
            </div>
          </div>
        )}

        {dtab === 'courses' && (
          <>
            <h1>أهلًا {user.name.split(' ')[0]}</h1>

            {userPending.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2>طلبات اشتراك قيد المراجعة ({userPending.length})</h2>
                {userPending.map((pr) => (
                  <div key={pr.id} className="banner" style={{ borderInlineStartColor: 'var(--cyan)' }}>
                    <div>
                      <b>⏳ {pr.courseTitle} — {pr.price} ج.م</b>
                      <p className="hint">
                        تم إرسال إيصال التحويل عبر {pr.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}. سيقوم الأدمن بمراجعته وفتح الكورس لك قريباً.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2>كورساتي</h2>
            {mine.length > 0 ? (
              mine.map((e) => {
                const c = getCourse(e.c);
                if (!c) return null;
                const pc = c.lessons.length ? Math.round((e.done.length / c.lessons.length) * 100) : 0;
                return (
                  <div key={e.c} className="rw">
                    <div className="mn">
                      <div className="th">{c.img ? <img src={c.img} alt="" /> : (ART[c.id] || ART.gen)}</div>
                      <div>
                        <b>{c.title}</b>
                        <small>{e.done.length} من {c.lessons.length} فيديو · {pc}%</small>
                        <div className="bar"><i style={{ width: `${pc}%` }}></i></div>
                      </div>
                    </div>
                    <a className="btn" href={`#/watch/${c.id}/${c.lessons[0]?.id || ''}`}>كمّل</a>
                  </div>
                );
              })
            ) : (
              <p className="hint">لسه مشتركتش في أي كورس. اختار مسارك من تحت.</p>
            )}

            {free.length > 0 && (
              <>
                <h2>مسارات متاحة</h2>
                {free.map((c) => (
                  <div key={c.id} className="rw">
                    <div className="mn">
                      <div className="th">{c.img ? <img src={c.img} alt="" /> : (ART[c.id] || ART.gen)}</div>
                      <div>
                        <b>{c.title}</b>
                        <small>{c.weeks} أسابيع · {c.lessons.length} فيديو · {c.price} ج.م</small>
                      </div>
                    </div>
                    <a className="btn" href={`#/course/${c.id}`}>التفاصيل والاشتراك</a>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {dtab === 'profile' && (
          <>
            <h1>ملفي</h1>
            <form
              className="fm"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                user.name = fd.get('name').trim() || user.name;
                user.phone = fd.get('phone').trim();
                user.profile = {
                  university: fd.get('university').trim(),
                  faculty: fd.get('faculty').trim(),
                  year: fd.get('year'),
                  goal: fd.get('goal')
                };
                saveDb({ ...db });
                showToast('اتحفظت بياناتك');
                setDtab('courses');
              }}
            >
              <input className="fi" name="name" defaultValue={user.name} placeholder="الاسم" required />
              <input className="fi" name="phone" defaultValue={user.phone} placeholder="رقم واتساب" inputMode="tel" />
              <input className="fi" name="university" defaultValue={p.university || ''} placeholder="الجامعة" />
              <input className="fi" name="faculty" defaultValue={p.faculty || ''} placeholder="الكلية / التخصص" />
              <div className="two">
                <select className="fi" name="year" defaultValue={p.year || ''}>
                  <option value="">السنة الدراسية</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="fi" name="goal" defaultValue={p.goal || ''}>
                  <option value="">هدفك</option>
                  {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button className="btn" type="submit">حفظ</button>
            </form>
          </>
        )}

        {dtab === 'wallet' && (
          <>
            <h1>رصيدي</h1>
            <div className="bal">{user.balance} <small style={{ fontSize: '.3em' }}>ج.م</small></div>
            <p className="ds">
              الاشتراك في أي كورس أصبح متاحاً بالتحويل المباشر عبر <strong>فودافون كاش أو إنستاباي</strong> مع إمكانية رفع إيصال التحويل مباشرة من صفحة الكورس!
            </p>
            <h2>العمليات السابقة</h2>
            <div className="sc">
              <table className="tbl">
                <tbody>
                  {db.tx.filter((t) => t.u === user.id).map((t) => (
                    <tr key={t.id}>
                      <td>{fmt(t.date)}</td>
                      <td>{TX[t.type] || t.type}</td>
                      <td>{t.note}</td>
                      <td dir="ltr">{t.amount > 0 ? '+' : ''}{t.amount}</td>
                    </tr>
                  ))}
                  {db.tx.filter((t) => t.u === user.id).length === 0 && (
                    <tr><td>مفيش عمليات لسه</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  // Admin Dashboard view
  const renderAdminView = () => {
    if (!user || user.role !== 'admin') return null;
    const st = db.users.filter((u) => u.role === 'student');
    const rev = -db.tx.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
    const subList = db.subRequests || [];

    return (
      <div className="wrap">
        {atab === 'ov' && (
          <>
            <h1>نظرة عامة</h1>
            <div className="ov">
              <div><b>{st.length}</b>طالب</div>
              <div><b>{db.courses.length}</b>كورس</div>
              <div><b>{subList.filter((s) => s.status === 'pending').length}</b>طلب اشتراك معلق</div>
              <div><b>{db.enr.length}</b>اشتراك مفعل</div>
              <div><b>{rev}</b>إيراد (ج.م)</div>
              <div><b>{db.leads.filter((l) => l.status === 'new').length}</b>استفسار جديد</div>
            </div>

            <h2>بيانات التحويل للمشتركين (فودافون كاش & إنستاباي)</h2>
            <form
              className="fm"
              style={{ maxWidth: '600px' }}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                db.settings.whatsapp = fd.get('whatsapp').replace(/\D/g, '');
                db.settings.vodafone = fd.get('vodafone').trim();
                db.settings.instapay = fd.get('instapay').trim();
                saveDb({ ...db });
                showToast('تم حفظ بيانات الدفع بنجاح');
              }}
            >
              <label>
                رقم فودافون كاش / المحفظة الذكية
                <input className="fi" name="vodafone" defaultValue={db.settings.vodafone || '01012345678'} required />
              </label>

              <label>
                معرف إنستاباي (InstaPay Address)
                <input className="fi" name="instapay" defaultValue={db.settings.instapay || 'khutwa@instapay'} required />
              </label>

              <label>
                رقم واتساب للتواصل السريع
                <input className="fi" name="whatsapp" defaultValue={db.settings.whatsapp} required />
              </label>

              <button className="btn" type="submit">حفظ الإعدادات</button>
            </form>
          </>
        )}

        {atab === 'sub_requests' && (
          <>
            <h1>طلبات الاشتراك وإيصالات التحويل</h1>
            <p className="hint">
              هنا تظهر طلبات اشتراك الطلاب المحولة عبر فودافون كاش أو إنستاباي مع الإيصالات للمراجعة والقرار.
            </p>
            <div className="sc" style={{ marginTop: '16px' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الطالب</th>
                    <th>الكورس</th>
                    <th>المبلغ</th>
                    <th>طريقة الدفع</th>
                    <th>المحول منه</th>
                    <th>إيصال التحويل</th>
                    <th>الحالة</th>
                    <th>قرار الأدمن</th>
                  </tr>
                </thead>
                <tbody>
                  {subList.map((req) => (
                    <tr key={req.id}>
                      <td>{fmt(req.date || Date.now())}</td>
                      <td>
                        <b>{req.userName}</b><br />
                        <small>{req.userEmail}</small><br />
                        <small>{req.userPhone || '—'}</small>
                      </td>
                      <td>{req.courseTitle}</td>
                      <td><b>{req.price} ج.م</b></td>
                      <td>{req.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}</td>
                      <td dir="ltr" style={{ textAlign: 'end' }}><b>{req.sender}</b></td>
                      <td>
                        {req.receiptImg ? (
                          <img
                            src={req.receiptImg}
                            alt="الإيصال"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid var(--cyan)' }}
                            title="انقر لتكبير الإيصال"
                            onClick={() => setDialogContent({ type: 'view_receipt', img: req.receiptImg, req })}
                          />
                        ) : (
                          <span className="hint">بدون صورة</span>
                        )}
                      </td>
                      <td>
                        <span
                          className="tag"
                          style={{
                            background:
                              req.status === 'approved' ? '#22c55e' : req.status === 'rejected' ? '#ef4444' : 'var(--cyan)',
                            color: req.status === 'approved' || req.status === 'rejected' ? '#fff' : 'var(--ink)'
                          }}
                        >
                          {req.status === 'approved' ? 'مفعل ✓' : req.status === 'rejected' ? 'مرفوض ✕' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn"
                              style={{ padding: '6px 14px', fontSize: '.85rem', background: '#22c55e', color: '#fff' }}
                              onClick={() => {
                                // Approve and Enroll
                                const targetUser = db.users.find((u) => u.id === req.userId);
                                if (!targetUser) {
                                  showToast('المستخدم غير موجود');
                                  return;
                                }
                                const targetCourse = getCourse(req.courseId);
                                if (!targetCourse) {
                                  showToast('الكورس غير موجود');
                                  return;
                                }

                                // 1. Add enrollment
                                const already = db.enr.find((e) => e.u === req.userId && e.c === req.courseId);
                                const nextEnr = already ? [...db.enr] : [...db.enr, { u: req.userId, c: req.courseId, date: Date.now(), done: [] }];

                                // 2. Add transaction
                                const nextTx = [
                                  {
                                    id: gid('t'),
                                    u: req.userId,
                                    amount: req.price,
                                    type: 'purchase',
                                    note: `اشتراك مؤكد (${req.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}) - المحول منه: ${req.sender}`,
                                    date: Date.now()
                                  },
                                  ...db.tx
                                ];

                                // 3. Update request status
                                req.status = 'approved';
                                req.reviewedAt = Date.now();

                                saveDb({ ...db, enr: nextEnr, tx: nextTx });
                                showToast(`تمت الموافقة وتفعيل ${req.courseTitle} للطالب ${req.userName} بنجاح!`);
                              }}
                            >
                              ✓ تفعيل الكورس
                            </button>
                            <button
                              className="lnk"
                              style={{ color: '#ef4444' }}
                              onClick={() => {
                                req.status = 'rejected';
                                req.reviewedAt = Date.now();
                                saveDb({ ...db });
                                showToast('تم رفض الطلب');
                              }}
                            >
                              ✕ رفض
                            </button>
                          </div>
                        ) : (
                          <button
                            className="lnk"
                            onClick={() => {
                              saveDb({ ...db, subRequests: db.subRequests.filter((x) => x.id !== req.id) });
                            }}
                          >
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {subList.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>لا توجد طلبات اشتراك حالياً</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {atab === 'courses' && !aedit && (
          <>
            <h1>الكورسات</h1>
            <p style={{ marginBottom: '14px' }}>
              <button
                className="btn"
                onClick={() => {
                  const newC = { id: gid('c'), title: 'كورس جديد', weeks: 4, price: 0, pub: false, desc: '', outcomes: [], lessons: [] };
                  saveDb({ ...db, courses: [...db.courses, newC] });
                  setAedit(newC.id);
                }}
              >
                + كورس جديد
              </button>
            </p>
            <div className="sc">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>الكورس</th><th>أسابيع</th><th>السعر</th><th>فيديوهات</th><th>مشتركين</th><th>الحالة</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {db.courses.map((c) => (
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>{c.weeks}</td>
                      <td>{c.price}</td>
                      <td>{c.lessons.length}</td>
                      <td>{db.enr.filter((e) => e.c === c.id).length}</td>
                      <td>{c.pub ? 'منشور' : 'مسودة'}</td>
                      <td>
                        <button className="lnk" onClick={() => setAedit(c.id)}>تعديل</button>
                        <button
                          className="lnk"
                          onClick={() => {
                            if (!window.confirm('حذف الكورس وكل اشتراكاته؟')) return;
                            saveDb({
                              ...db,
                              courses: db.courses.filter((x) => x.id !== c.id),
                              enr: db.enr.filter((x) => x.c !== c.id)
                            });
                          }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {atab === 'courses' && aedit && (() => {
          const c = getCourse(aedit);
          if (!c) { setAedit(null); return null; }
          return (
            <>
              <p><button className="lnk" onClick={() => setAedit(null)}>← الكورسات</button></p>
              <h1>تعديل الكورس</h1>
              <form
                className="fm"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  c.title = fd.get('title').trim();
                  c.weeks = +fd.get('weeks') || 1;
                  c.price = +fd.get('price') || 0;
                  c.desc = fd.get('desc').trim();
                  c.outcomes = fd.get('outcomes').split('\n').map((s) => s.trim()).filter(Boolean);
                  c.pub = fd.get('pub') === 'on';
                  c.img = fd.get('img').trim();
                  saveDb({ ...db });
                  showToast('تم حفظ الكورس');
                }}
              >
                <input className="fi" name="title" defaultValue={c.title} required placeholder="اسم الكورس" />
                <div className="two">
                  <label>الأسابيع<input className="fi" type="number" min="1" name="weeks" defaultValue={c.weeks} /></label>
                  <label>السعر (ج.م)<input className="fi" type="number" min="0" name="price" defaultValue={c.price} /></label>
                </div>
                <input className="fi" name="img" defaultValue={c.img || ''} placeholder="رابط صورة الغلاف (اختياري)" />
                <textarea className="fi" name="desc" rows={3} defaultValue={c.desc} placeholder="وصف الكورس" />
                <textarea className="fi" name="outcomes" rows={4} defaultValue={c.outcomes.join('\n')} placeholder="مخرجات التعلم، سطر لكل نقطة" />
                <label className="ck"><input type="checkbox" name="pub" defaultChecked={c.pub} /> منشور للطلاب</label>
                <button className="btn" type="submit">حفظ الكورس</button>
              </form>

              <h2>الفيديوهات ({c.lessons.length})</h2>
              {c.lessons.map((l, lIdx) => (
                <form
                  key={l.id}
                  className="lr"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    l.title = fd.get('title').trim();
                    l.min = +fd.get('min') || 1;
                    l.url = fd.get('url').trim();
                    saveDb({ ...db });
                    showToast('تم الحفظ');
                  }}
                >
                  <input className="fi" name="title" defaultValue={l.title} required />
                  <input className="fi" name="min" type="number" min="1" defaultValue={l.min} style={{ maxWidth: '90px' }} />
                  <input className="fi" name="url" defaultValue={l.url} placeholder="رابط الفيديو" />
                  <button className="btn" type="submit">حفظ</button>
                  <button
                    type="button"
                    className="lnk"
                    onClick={() => {
                      if (lIdx <= 0) return;
                      const arr = [...c.lessons];
                      [arr[lIdx], arr[lIdx - 1]] = [arr[lIdx - 1], arr[lIdx]];
                      c.lessons = arr;
                      saveDb({ ...db });
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="lnk"
                    onClick={() => {
                      if (lIdx >= c.lessons.length - 1) return;
                      const arr = [...c.lessons];
                      [arr[lIdx], arr[lIdx + 1]] = [arr[lIdx + 1], arr[lIdx]];
                      c.lessons = arr;
                      saveDb({ ...db });
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="lnk"
                    onClick={() => {
                      if (!window.confirm('حذف الفيديو؟')) return;
                      c.lessons = c.lessons.filter((x) => x.id !== l.id);
                      saveDb({ ...db });
                    }}
                  >
                    حذف
                  </button>
                </form>
              ))}

              <form
                className="lr"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  c.lessons.push({
                    id: gid('l'),
                    title: fd.get('title').trim(),
                    min: +fd.get('min') || 1,
                    url: fd.get('url').trim()
                  });
                  saveDb({ ...db });
                  e.target.reset();
                  showToast('تمت إضافة الفيديو');
                }}
              >
                <input className="fi" name="title" required placeholder="عنوان فيديو جديد" />
                <input className="fi" name="min" type="number" min="1" defaultValue={10} style={{ maxWidth: '90px' }} />
                <input className="fi" name="url" placeholder="رابط الفيديو" />
                <button className="btn" type="submit">+ إضافة</button>
              </form>
            </>
          );
        })()}

        {atab === 'students' && (
          <>
            <h1>الطلاب</h1>
            <div className="lr">
              <input
                className="fi"
                value={sq}
                onChange={(e) => setSq(e.target.value)}
                placeholder="ابحث بالاسم أو الإيميل أو الرقم"
              />
            </div>
            <div className="sc">
              <table className="tbl">
                <thead>
                  <tr><th>الطالب</th><th>الهاتف</th><th>الرصيد</th><th>كورسات</th><th>الحالة</th><th></th></tr>
                </thead>
                <tbody>
                  {db.users
                    .filter((u) => u.role === 'student' && (u.name + u.email + u.phone).toLowerCase().includes(sq.toLowerCase()))
                    .map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}<br /><small>{u.email}</small></td>
                        <td>{u.phone || '—'}</td>
                        <td>{u.balance}</td>
                        <td>{db.enr.filter((e) => e.u === u.id).length}</td>
                        <td>{u.status === 'blocked' ? 'موقوف' : 'نشط'}</td>
                        <td>
                          <button
                            className="lnk"
                            onClick={() => {
                              setDialogContent({ type: 'student', student: u });
                            }}
                          >
                            إدارة
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {atab === 'leads' && (
          <>
            <h1>الاستفسارات</h1>
            <p className="hint">اللي بيسيبوا رقمهم من الصفحة الرئيسية.</p>
            <div className="sc">
              <table className="tbl">
                <thead>
                  <tr><th>التاريخ</th><th>الاسم</th><th>الهاتف</th><th>المسار</th><th></th></tr>
                </thead>
                <tbody>
                  {db.leads.map((l) => (
                    <tr key={l.id}>
                      <td>{fmt(l.date)}</td>
                      <td>{l.name}</td>
                      <td>
                        <a
                          className="lnk"
                          href={`https://wa.me/${String(l.phone).replace(/\D/g, '').replace(/^0/, '20')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {l.phone}
                        </a>
                      </td>
                      <td>{getCourse(l.track)?.title || l.track}</td>
                      <td>
                        <button
                          className="lnk"
                          onClick={() => {
                            l.status = l.status === 'new' ? 'done' : 'new';
                            saveDb({ ...db });
                          }}
                        >
                          {l.status === 'new' ? 'تم التواصل ✓' : '↺ جديد'}
                        </button>
                        <button
                          className="lnk"
                          onClick={() => {
                            saveDb({ ...db, leads: db.leads.filter((x) => x.id !== l.id) });
                          }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {db.leads.length === 0 && (
                    <tr><td>مفيش استفسارات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {atab === 'tx' && (
          <>
            <h1>العمليات</h1>
            <div className="sc">
              <table className="tbl">
                <thead>
                  <tr><th>التاريخ</th><th>الطالب</th><th>النوع</th><th>المبلغ</th><th>ملاحظة</th></tr>
                </thead>
                <tbody>
                  {db.tx.map((t) => {
                    const u = db.users.find((x) => x.id === t.u);
                    return (
                      <tr key={t.id}>
                        <td>{fmt(t.date)}</td>
                        <td>{u?.name || '—'}</td>
                        <td>{TX[t.type] || t.type}</td>
                        <td dir="ltr">{t.amount > 0 ? '+' : ''}{t.amount}</td>
                        <td>{t.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const pendingSubCount = (db.subRequests || []).filter((s) => s.status === 'pending').length;

  const renderMobileMenu = () => {
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
              <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
              <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
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
  };

  return (
    <>
      {/* 1. Header (Navbar) */}
      <header>
        <span
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.location.hash = '';
          }}
          style={{ cursor: 'pointer' }}
        >
          <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
          <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
        </span>

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
          <button className="tg" onClick={toggleTheme} aria-label="تبديل الوضع الفاتح والداكن"></button>

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
                <button className="btn" onClick={logoutUser}>
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

      {/* 2. Hero Section */}
      <section className="hero">
        <div>
          <h1 className="hero-title">
            <span className="l l-brand"><span>أكاديمية خطوة —</span></span>
            <span className="l l-main"><span>معاك خطوة بخطوة لحد ما توصل للقمة</span></span>
            <span className="l l-sub"><span>من غير وعود وهمية بخطوات حقيقية</span></span>
          </h1>
          <a className="btn" href="#j">شوف المسارات</a>
        </div>
        <div className="stairs" aria-hidden="true">
          <i style={{ '--n': 1 }}></i><i style={{ '--n': 2 }}></i><i style={{ '--n': 3 }}></i>
          <i style={{ '--n': 4 }}></i><i style={{ '--n': 5 }}></i><i style={{ '--n': 6 }}></i>
          <img className="hop" src="assets/icon-cyan.png" alt="" />
        </div>
        <div className="scrollcue" id="cue" aria-hidden="true">
          <span>انزل وابدأ الرحلة</span><i></i>
        </div>
      </section>

      {/* 2.5 Numbers & Stats Section (بناءً على بريف أكاديمية خطوة) */}
      <section className="stats-sec" id="stats">
        <div className="stats-wrap">
          <div className="stats-header">
            <span className="stats-tag">أرقام وإحصائيات حقيقية من أرض الواقع</span>
            <h2>مش مجرد وعود.. أرقام تثبت الفرق</h2>
            <p>
              بدأنا كمبادرة شبابية ودرّبنا مئات الطلاب بكليات مصر الإقليمية والنظرية، وفتحنا لهم طريق العمل الحر والوظائف في السوق الرقمي.
            </p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">+200</div>
              <div className="stat-title">طالب وخريج تدربوا معنا</div>
              <div className="stat-desc">تخرجوا بتطبيقات حقيقية وتدريب تفاعلي مركز ومتابعة مستمرة.</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">3</div>
              <div className="stat-title">مسارات رقمية مطلوبة</div>
              <div className="stat-desc">تطوير واجهات الويب، تصميم وتجربة UX/UI، والتسويق وصناعة المحتوى.</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">100%</div>
              <div className="stat-title">مشاريع عملية للبورتفوليو</div>
              <div className="stat-desc">تطبيق عملي بعيداً عن الحشو النظري عشان تخرج بمشاريع حقيقية على أرض الواقع.</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">1-on-1</div>
              <div className="stat-title">إرشاد وتوجيه فردي أسبوعي</div>
              <div className="stat-desc">مينتور متخصص يتابع تقدمك الشخصي ويحل معاك كل خطوة وتحدي.</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">+85%</div>
              <div className="stat-title">نسبة التوظيف والعمل الحر</div>
              <div className="stat-desc">خريجون اقتنصوا فرص تدريب ووظائف وعملاء فريلانس حقيقيين.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Journey Section (Path & Steps) */}
      <section className="j" id="j" ref={journeyRef}>
        <h2>اختار مسارك</h2>
        <svg aria-hidden="true">
          <path className="bg" ref={pbRef} />
          <path className="fg" ref={pfRef} />
        </svg>
        <img className="ic" ref={icRef} src="assets/icon-cyan.png" alt="" />

        <div className="st" ref={st1Ref} data-y=".16">
          <div className="n">٨<small>أسابيع</small></div>
          <b>تطوير واجهات الويب</b>
          <p>تبني مواقع حقيقية وتطلع بمشاريع في البورتفوليو.</p>
          <a href="#/course/frontend">تفاصيل المسار</a>
        </div>

        <div className="st" ref={st2Ref} data-y=".43">
          <div className="n">٦<small>أسابيع</small></div>
          <b>تصميم UX/UI</b>
          <p>تصمم تجربة مستخدم كاملة، من الفكرة للنموذج التفاعلي.</p>
          <a href="#/course/ux">تفاصيل المسار</a>
        </div>

        <div className="st" ref={st3Ref} data-y=".70">
          <div className="n">٦<small>أسابيع</small></div>
          <b>التسويق الرقمي</b>
          <p>تخطط وتنشر وتقيس محتوى حقيقي لعلامة حقيقية.</p>
          <a href="#/course/marketing">تفاصيل المسار</a>
        </div>

        <div className="end" ref={endRef}>وإرشاد فردي معاك طول الطريق.</div>
      </section>

      {/* 4. Contact / Join Section */}
      <section className="join" id="join">
        <div className={`form ${leadSent ? 'sent' : ''}`}>
          <h2>جاهز؟<br />سيب رقمك. هتواصل معاك</h2>
          <form id="f" style={{ display: 'grid', gap: '20px' }} onSubmit={handleLeadSubmit}>
            <div className="opts" role="radiogroup" aria-label="المسار">
              <label>
                <input
                  type="radio"
                  name="track"
                  value="frontend"
                  checked={leadForm.track === 'frontend'}
                  onChange={() => setLeadForm({ ...leadForm, track: 'frontend' })}
                />
                <span>واجهات الويب</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="track"
                  value="ux"
                  checked={leadForm.track === 'ux'}
                  onChange={() => setLeadForm({ ...leadForm, track: 'ux' })}
                />
                <span>UX/UI</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="track"
                  value="marketing"
                  checked={leadForm.track === 'marketing'}
                  onChange={() => setLeadForm({ ...leadForm, track: 'marketing' })}
                />
                <span>التسويق</span>
              </label>
            </div>
            <input
              className="in"
              name="name"
              dir="rtl"
              placeholder="اسمك"
              required
              autoComplete="name"
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
            />
            <input
              className="in"
              name="phone"
              type="tel"
              inputMode="tel"
              dir="rtl"
              placeholder="رقم واتساب"
              required
              autoComplete="tel"
              value={leadForm.phone}
              onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
            />
            <button className="btn" type="submit">ابدأ خطوتك</button>
          </form>
          <p className="ok">وصلنا طلبك. هنكلمك على واتساب.</p>
          <a href="#/auth/register" className="alt">أو اعمل حساب وابدأ دلوقتي ←</a>
        </div>

        <div className="side">
          <img src="assets/icon-color.png" alt="" />
          <div className="words" aria-hidden="true">
            <span>مشاريع حقيقية</span>
            <span>إرشاد فردي أسبوعي</span>
            <span>فرص توظيف للمتفوقين</span>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer>
        <span>
          <img className="logo-d" src="assets/Asset_103.png" alt="أكاديمية خطوة" />
          <img className="logo-l" src="assets/Asset_42.png" alt="أكاديمية خطوة" />
        </span>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="fa-brands fa-youtube"></i></a>
          <a href="https://wa.me/201012345678" target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
        </div>
        <small>Your Way To Success © {new Date().getFullYear()}</small>
      </footer>

      {/* 6. Full App Layer Overlay (#app) */}
      <div id="app" hidden={!isAppOpen}>
        {isAppOpen && (
          <>
            {!hash.startsWith('#/auth') && (
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
            )}

            <main>{renderAppRoute()}</main>
          </>
        )}
      </div>

      {/* Render Mobile Hamburger Menu Drawer */}
      {renderMobileMenu()}

      {/* 7. Dialog Modal */}
      {dialogContent && (
        <dialog id="dlg" open>
          <button className="x" onClick={() => setDialogContent(null)} aria-label="إغلاق">✕</button>

          {/* Subscription payment with Vodafone Cash & InstaPay + receipt upload */}
          {dialogContent.type === 'vodafone_insta_pay' && (
            <div>
              <h2>الاشتراك في: {dialogContent.course.title}</h2>
              <p className="mt" style={{ marginBottom: '16px' }}>
                <span>المبلغ المطلوب: <b>{dialogContent.course.price} ج.م</b></span>
              </p>

              {/* Payment Method Selector */}
              <div className="opts" style={{ marginBottom: '16px' }}>
                <label>
                  <input
                    type="radio"
                    name="method"
                    value="vodafone"
                    checked={payMethod === 'vodafone'}
                    onChange={() => setPayMethod('vodafone')}
                  />
                  <span>فودافون كاش / محفظة إلكترونية</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="method"
                    value="instapay"
                    checked={payMethod === 'instapay'}
                    onChange={() => setPayMethod('instapay')}
                  />
                  <span>إنستاباي InstaPay</span>
                </label>
              </div>

              {/* Transfer Details Card */}
              <div style={{ background: 'var(--line)', padding: '14px 18px', borderRadius: '12px', marginBottom: '18px' }}>
                {payMethod === 'vodafone' ? (
                  <div>
                    <span className="hint" style={{ display: 'block', marginBottom: '6px' }}>
                      رقم تحويل فودافون كاش أو أي محفظة (أورنج / اتصالات / وي كاش):
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.3rem', letterSpacing: '1px', color: 'var(--cyt)' }}>
                        {db.settings.vodafone || '01012345678'}
                      </strong>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '6px 16px', fontSize: '.9rem' }}
                        onClick={() => copyToClipboard(db.settings.vodafone || '01012345678', 'رقم فودافون كاش')}
                      >
                        نسخ الرقم
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="hint" style={{ display: 'block', marginBottom: '6px' }}>
                      معرف الدفع على تطبيق إنستاباي (InstaPay Address):
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.25rem', letterSpacing: '1px', color: 'var(--cyt)' }}>
                        {db.settings.instapay || 'khutwa@instapay'}
                      </strong>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '6px 16px', fontSize: '.9rem' }}
                        onClick={() => copyToClipboard(db.settings.instapay || 'khutwa@instapay', 'معرف إنستاباي')}
                      >
                        نسخ المعرف
                      </button>
                    </div>
                  </div>
                )}
                <small className="hint" style={{ display: 'block', marginTop: '10px' }}>
                  حوّل مبلغ <strong>{dialogContent.course.price} ج.م</strong> ثم ارفع صورة الإيصال واكتب الرقم المحول منه أدناه.
                </small>
              </div>

              {/* Payment Proof Form */}
              <form
                className="fm"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!paySender.trim()) {
                    showToast('يرجى إدخال الرقم المحول منه أو اسم الحساب');
                    return;
                  }
                  if (!payReceipt) {
                    showToast('يرجى رفع صورة إيصال التحويل');
                    return;
                  }

                  const newSubReq = {
                    id: gid('sub'),
                    userId: user.id,
                    userName: user.name,
                    userEmail: user.email,
                    userPhone: user.phone || '',
                    courseId: dialogContent.course.id,
                    courseTitle: dialogContent.course.title,
                    price: dialogContent.course.price,
                    method: payMethod,
                    sender: paySender.trim(),
                    receiptImg: payReceipt,
                    notes: payNotes.trim(),
                    status: 'pending',
                    date: Date.now()
                  };

                  const nextRequests = [newSubReq, ...(db.subRequests || [])];
                  saveDb({ ...db, subRequests: nextRequests });
                  setDialogContent(null);
                  showToast('تم إرسال إيصال التحويل بنجاح! سيتم مراجعة الطلب وتفعيل الكورس من الأدمن.');
                }}
              >
                <label>
                  {payMethod === 'vodafone'
                    ? 'الحساب اللي محول منه (رقم محفظة فودافون كاش) *'
                    : 'الحساب اللي محول منه (اسم حسابك أو رقمك على إنستاباي) *'}
                  <input
                    className="fi"
                    required
                    placeholder={
                      payMethod === 'vodafone'
                        ? 'مثال: 010xxxxxxxx (رقم المحفظة)'
                        : 'مثال: yourname@instapay أو رقم الهاتف المسجل'
                    }
                    value={paySender}
                    onChange={(e) => setPaySender(e.target.value)}
                  />
                </label>

                <label>
                  صورة إيصال التحويل (Screenshot) *
                  <input
                    className="fi"
                    type="file"
                    accept="image/*"
                    required={!payReceipt}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPayReceipt(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {payReceipt && (
                  <div style={{ marginTop: '8px' }}>
                    <span className="hint">معاينة الإيصال:</span>
                    <img
                      src={payReceipt}
                      alt="معاينة الإيصال"
                      style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '10px', marginTop: '6px', border: '2px solid var(--cyan)', display: 'block' }}
                    />
                  </div>
                )}

                <label>
                  ملاحظات إضافية (اختياري)
                  <input
                    className="fi"
                    placeholder="أي توضيح للأدمن بخصوص عملية التحويل"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </label>

                <button className="btn" type="submit" style={{ marginTop: '10px' }}>
                  إرسال إيصال التحويل لتأكيد الاشتراك
                </button>
              </form>
            </div>
          )}

          {/* View Receipt in Full Resolution */}
          {dialogContent.type === 'view_receipt' && (
            <div style={{ textAlign: 'center' }}>
              <h2>إيصال التحويل: {dialogContent.req.userName}</h2>
              <p className="hint" style={{ marginBottom: '14px' }}>
                الكورس: <b>{dialogContent.req.courseTitle}</b> · المبلغ: <b>{dialogContent.req.price} ج.م</b> · المحول منه: <b>{dialogContent.req.sender}</b>
              </p>
              <div style={{ maxHeight: '70vh', overflow: 'auto', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <img
                  src={dialogContent.img}
                  alt="إيصال التحويل بالكامل"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Student Account Management in Admin */}
          {dialogContent.type === 'student' && (() => {
            const stu = dialogContent.student;
            const stuEnr = db.enr.filter((e) => e.u === stu.id);
            return (
              <div>
                <h2>{stu.name}</h2>
                <p className="hint">{stu.email} · {stu.phone || '—'} · سجّل {fmt(stu.created)}</p>
                <h3>الرصيد: {stu.balance} ج.م</h3>
                <form
                  className="lr"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const amount = Math.abs(+fd.get('amount'));
                    const isAdd = fd.get('op') === 'add';
                    if (!isAdd && amount > stu.balance) {
                      showToast('الخصم أكبر من الرصيد');
                      return;
                    }
                    stu.balance += isAdd ? amount : -amount;
                    db.tx.unshift({
                      id: gid('t'),
                      u: stu.id,
                      amount: isAdd ? amount : -amount,
                      type: isAdd ? 'topup' : 'adjust',
                      note: fd.get('note') || (isAdd ? 'شحن من الأدمن' : 'خصم من الأدمن'),
                      date: Date.now()
                    });
                    saveDb({ ...db });
                    showToast('تم تعديل الرصيد');
                    setDialogContent(null);
                  }}
                >
                  <select className="fi" name="op">
                    <option value="add">شحن (+)</option>
                    <option value="sub">خصم (−)</option>
                  </select>
                  <input className="fi" name="amount" type="number" min="1" required placeholder="المبلغ" />
                  <input className="fi" name="note" placeholder="ملاحظة" />
                  <button className="btn" type="submit">تنفيذ</button>
                </form>

                <h3 style={{ marginTop: '16px' }}>الاشتراكات</h3>
                {stuEnr.map((e) => (
                  <div key={e.c} className="lr">
                    <span>{getCourse(e.c)?.title || 'محذوف'} · {e.done.length} فيديو</span>
                    <button
                      className="lnk"
                      onClick={() => {
                        if (!window.confirm('إلغاء الاشتراك؟')) return;
                        saveDb({
                          ...db,
                          enr: db.enr.filter((x) => !(x.u === stu.id && x.c === e.c))
                        });
                        setDialogContent(null);
                      }}
                    >
                      إلغاء الاشتراك
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </dialog>
      )}

      {/* 8. Toast popup */}
      <div id="toast" className={toastMsg ? 'on' : ''}>
        {toastMsg}
      </div>
    </>
  );
}

export default App;
