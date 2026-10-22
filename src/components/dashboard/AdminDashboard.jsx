import React, { useState } from 'react';
import { useKhutwa } from '../../hooks';
import { TX } from '../../constants';
import { fmt, gid } from '../../utils';

export function AdminDashboard() {
  const {
    user,
    db,
    saveDb,
    showToast,
    atab,
    aedit,
    setAedit,
    setDialogContent,
    getCourse,
    copyToClipboard
  } = useKhutwa();

  // Search queries & filters
  const [sq, setSq] = useState('');
  const [subFilter, setSubFilter] = useState('all');
  const [subSearch, setSubSearch] = useState('');
  const [replyingLeadId, setReplyingLeadId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Student Filters & Password Reset State
  const [stuSearch, setStuSearch] = useState('');
  const [stuEnrollFilter, setStuEnrollFilter] = useState('all'); // all | enrolled | not_enrolled
  const [stuCourseFilter, setStuCourseFilter] = useState('all'); // all | courseId
  const [stuStatusFilter, setStuStatusFilter] = useState('all'); // all | active | blocked
  const [stuSort, setStuSort] = useState('newest'); // newest | name | balance | courses
  const [resetPassStu, setResetPassStu] = useState(null);
  const [quickNewPass, setQuickNewPass] = useState('');

  if (!user || user.role !== 'admin') return null;

  const st = db.users.filter((u) => u.role === 'student');
  const rev = db.tx.filter((t) => t.type === 'purchase').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const subList = db.subRequests || [];

  const pendingSubCount = subList.filter((s) => s.status === 'pending').length;
  const approvedSubCount = subList.filter((s) => s.status === 'approved').length;
  const rejectedSubCount = subList.filter((s) => s.status === 'rejected').length;

  const filteredSubList = subList.filter((req) => {
    if (subFilter !== 'all' && req.status !== subFilter) return false;
    if (subSearch.trim()) {
      const q = subSearch.toLowerCase();
      const match =
        (req.userName || '').toLowerCase().includes(q) ||
        (req.userEmail || '').toLowerCase().includes(q) ||
        (req.userPhone || '').toLowerCase().includes(q) ||
        (req.sender || '').toLowerCase().includes(q) ||
        (req.courseTitle || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="wrap admin-wrap">
      {/* ========================================================
          TAB 1: OVERVIEW (نظرة عامة)
          ======================================================== */}
      {atab === 'ov' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                لوحة الإدارة · مؤشرات المنصة
              </div>
              <h1 className="admin-title">نظرة عامة على الأكاديمية</h1>
              <p className="admin-subtitle">
                متابعة أداء الاشتراكات وإحصائيات الطلاب والعمليات وإعدادات طرق الدفع الإلكتروني.
              </p>
            </div>
            <div className="admin-stats-summary">
              <div className="admin-stat-chip">
                <b>{st.length}</b>
                <span>طالب مسجل</span>
              </div>
              <div className="admin-stat-chip">
                <b>{pendingSubCount}</b>
                <span>طلب معلق</span>
              </div>
              <div className="admin-stat-chip">
                <b>{rev} ج.م</b>
                <span>إجمالي الإيرادات</span>
              </div>
            </div>
          </div>

          <div className="admin-overview-grid">
            <div className="admin-metric-card">
              <div className="admin-metric-num">{st.length}</div>
              <div className="admin-metric-label">طالب مسجل</div>
            </div>
            <div className="admin-metric-card">
              <div className="admin-metric-num">{db.courses.length}</div>
              <div className="admin-metric-label">كورس ومسار تعليمي</div>
            </div>
            <div className="admin-metric-card">
              <div className="admin-metric-num" style={{ color: pendingSubCount > 0 ? '#fbbf24' : 'var(--cyt)' }}>
                {pendingSubCount}
              </div>
              <div className="admin-metric-label">طلب اشتراك بانتظار المراجعة</div>
            </div>
            <div className="admin-metric-card">
              <div className="admin-metric-num" style={{ color: '#22c55e' }}>{db.enr.length}</div>
              <div className="admin-metric-label">اشتراك مفعل حالياً</div>
            </div>
            <div className="admin-metric-card">
              <div className="admin-metric-num">{rev}</div>
              <div className="admin-metric-label">إيرادات الاشتراكات (ج.م)</div>
            </div>
            <div className="admin-metric-card">
              <div className="admin-metric-num">{db.leads.filter((l) => l.status === 'new').length}</div>
              <div className="admin-metric-label">استفسار جديد للتواصل</div>
            </div>
          </div>

          <div className="admin-card" style={{ maxWidth: '680px' }}>
            <div className="admin-card-header">
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800 }}>بيانات التحويل للمشتركين</h3>
                <p className="hint" style={{ margin: 0 }}>تظهر هذه الأرقام للطلاب في نافذة الاشتراك عند اختيار فودافون كاش أو إنستاباي.</p>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <form
                className="fm"
                style={{ maxWidth: '100%' }}
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
                  رقم واتساب للتواصل السريع والدعم
                  <input className="fi" name="whatsapp" defaultValue={db.settings.whatsapp} required />
                </label>

                <button className="btn" type="submit" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>حفظ الإعدادات</button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          TAB 2: SUB REQUESTS (طلبات الاشتراك وإيصالات التحويل)
          ======================================================== */}
      {atab === 'sub_requests' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                لوحة التحكم الإدارية · طلبات الاشتراك
              </div>
              <h1 className="admin-title">طلبات الاشتراك وإيصالات التحويل</h1>
              <p className="admin-subtitle">
                مراجعة إيصالات فودافون كاش وإنستاباي وتفعيل الكورسات بحسابات الطلاب بنقرة واحدة فور التأكد.
              </p>
            </div>
            <div className="admin-stats-summary">
              <div className="admin-stat-chip">
                <b style={{ color: '#fbbf24' }}>{pendingSubCount}</b>
                <span>قيد المراجعة</span>
              </div>
              <div className="admin-stat-chip">
                <b style={{ color: '#22c55e' }}>{approvedSubCount}</b>
                <span>مفعل</span>
              </div>
              <div className="admin-stat-chip">
                <b>{subList.length}</b>
                <span>إجمالي الطلبات</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`admin-pill-btn ${subFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSubFilter('all')}
                >
                  الكل ({subList.length})
                </button>
                <button
                  type="button"
                  className={`admin-pill-btn ${subFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setSubFilter('pending')}
                >
                  قيد المراجعة ({pendingSubCount})
                </button>
                <button
                  type="button"
                  className={`admin-pill-btn ${subFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => setSubFilter('approved')}
                >
                  مفعل ({approvedSubCount})
                </button>
                <button
                  type="button"
                  className={`admin-pill-btn ${subFilter === 'rejected' ? 'active' : ''}`}
                  onClick={() => setSubFilter('rejected')}
                >
                  مرفوض ({rejectedSubCount})
                </button>
              </div>

              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="ابحث بالطالب، الرقم، أو الكورس..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="sc">
              <table className="admin-table">
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
                  {filteredSubList.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div className="admin-date-cell">{fmt(req.date || Date.now())}</div>
                      </td>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">
                            {req.userName ? req.userName.trim().charAt(0) : 'ط'}
                          </div>
                          <div className="admin-user-meta">
                            <span className="admin-user-name">{req.userName}</span>
                            <span className="admin-user-sub">{req.userEmail}</span>
                            {req.userPhone && (
                              <span className="admin-user-sub">
                                <span>{req.userPhone}</span>
                                <a
                                  href={`https://wa.me/${String(req.userPhone).replace(/\D/g, '').replace(/^0/, '20')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="مراسلة عبر واتساب"
                                >
                                  واتساب
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {req.type === 'topup' ? (
                          <span style={{ fontWeight: 800, color: 'var(--cyt)' }}>
                            💰 {req.courseTitle || 'شحن رصيد محفظة'}
                          </span>
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{req.courseTitle}</span>
                        )}
                      </td>
                      <td>
                        <span className="admin-price-tag">{req.amount || req.price} ج.م</span>
                      </td>
                      <td>
                        <span className={`admin-method-badge ${req.method === 'vodafone' ? 'admin-method-vf' : 'admin-method-insta'}`}>
                          {req.method === 'vodafone' ? '📱 فودافون كاش' : '⚡ إنستاباي'}
                        </span>
                      </td>
                      <td>
                        <div
                          className="admin-sender-box"
                          title="انقر للنسخ"
                          onClick={() => copyToClipboard(req.sender, 'الرقم المحول منه')}
                        >
                          <span>{req.sender}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>📋</span>
                        </div>
                      </td>
                      <td>
                        {req.receiptImg ? (
                          <div
                            className="admin-receipt-thumb"
                            title="انقر لتكبير الإيصال"
                            onClick={() => setDialogContent({ type: 'view_receipt', img: req.receiptImg, req })}
                          >
                            <img src={req.receiptImg} alt="الإيصال" />
                            <div className="admin-receipt-overlay">🔍 تكبير</div>
                          </div>
                        ) : (
                          <span className="hint">بدون صورة</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            req.status === 'approved'
                              ? 'admin-status-approved'
                              : req.status === 'rejected'
                                ? 'admin-status-rejected'
                                : 'admin-status-pending'
                          }`}
                        >
                          <span className="admin-status-dot" />
                          {req.status === 'approved' ? 'مفعل' : req.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td>
                        {req.status === 'pending' ? (
                          <div className="admin-actions-cell">
                            <button
                              type="button"
                              className="admin-action-btn-approve"
                              onClick={() => {
                                const targetUser = db.users.find((u) => u.id === req.userId);
                                if (!targetUser) {
                                  showToast('المستخدم غير موجود');
                                  return;
                                }

                                // Case 1: Topup Request
                                if (req.type === 'topup') {
                                  const topupVal = Number(req.amount || req.price || 0);
                                  targetUser.balance = (Number(targetUser.balance) || 0) + topupVal;
                                  const nextTx = [
                                    {
                                      id: gid('t'),
                                      u: req.userId,
                                      amount: topupVal,
                                      type: 'topup',
                                      note: `شحن رصيد محفظة (${req.method === 'vodafone' ? 'فودافون كاش' : 'إنستاباي'}) - المحول منه: ${req.sender}`,
                                      date: Date.now()
                                    },
                                    ...db.tx
                                  ];
                                  req.status = 'approved';
                                  req.reviewedAt = Date.now();
                                  saveDb({ ...db, tx: nextTx });
                                  showToast(`تمت الموافقة وشحن ${topupVal} ج.م في محفظة الطالب ${req.userName} بنجاح!`);
                                  return;
                                }

                                // Case 2: Course Subscription
                                const targetCourse = getCourse(req.courseId);
                                if (!targetCourse) {
                                  showToast('الكورس غير موجود');
                                  return;
                                }

                                const already = db.enr.find((e) => e.u === req.userId && e.c === req.courseId);
                                const nextEnr = already ? [...db.enr] : [...db.enr, { u: req.userId, c: req.courseId, date: Date.now(), done: [] }];

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

                                req.status = 'approved';
                                req.reviewedAt = Date.now();

                                saveDb({ ...db, enr: nextEnr, tx: nextTx });
                                showToast(`تمت الموافقة وتفعيل ${req.courseTitle} للطالب ${req.userName} بنجاح!`);
                              }}
                            >
                              {req.type === 'topup' ? '✓ شحن الرصيد' : '✓ تفعيل الكورس'}
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn-reject"
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
                            type="button"
                            className="admin-action-btn-delete"
                            onClick={() => {
                              saveDb({ ...db, subRequests: db.subRequests.filter((x) => x.id !== req.id) });
                              showToast('تم حذف الطلب');
                            }}
                          >
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSubList.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">📭</div>
                          <div className="admin-empty-title">لا توجد طلبات اشتراك مطابقة</div>
                          <div className="admin-empty-desc">
                            {subSearch ? 'جرب البحث بكلمات أخرى أو اختر تبويبًا مختلفًا.' : 'ستظهر هنا طلبات اشتراك الطلاب فور إرسالها مع إيصالات التحويل.'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          TAB 3: COURSES (الكورسات)
          ======================================================== */}
      {atab === 'courses' && !aedit && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                إدارة المحتوى والمسارات
              </div>
              <h1 className="admin-title">الكورسات التدريبية</h1>
              <p className="admin-subtitle">إدارة الكورسات، تحديد الأسعار وعدد الأسابيع، وإضافة أو ترتيب الدروس والفيديوهات.</p>
            </div>
            <div>
              <button
                className="btn"
                onClick={() => {
                  const newC = { id: gid('c'), title: 'كورس جديد', weeks: 4, price: 400, pub: false, desc: '', outcomes: [], lessons: [] };
                  saveDb({ ...db, courses: [...db.courses, newC] });
                  setAedit(newC.id);
                }}
              >
                + كورس جديد
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="sc">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الكورس</th>
                    <th>أسابيع</th>
                    <th>السعر</th>
                    <th>فيديوهات</th>
                    <th>مشتركين</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {db.courses.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <b>{c.title}</b>
                        {c.instructor && <div style={{ fontSize: '0.8rem', color: 'var(--cyt)', marginTop: '2px' }}>شرح: {c.instructor}</div>}
                      </td>
                      <td>{c.weeks} أسابيع</td>
                      <td><span className="admin-price-tag">{c.price} ج.م</span></td>
                      <td>{c.lessons.length} درس</td>
                      <td>{db.enr.filter((e) => e.c === c.id).length} مشترك</td>
                      <td>
                        <span
                          className={`admin-status-pill ${c.pub ? 'admin-status-approved' : 'admin-status-pending'}`}
                        >
                          <span className="admin-status-dot" />
                          {c.pub ? 'منشور' : 'مسودة'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '6px 14px', fontSize: '.85rem' }}
                            onClick={() => setAedit(c.id)}
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn-delete"
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          EDIT COURSE VIEW
          ======================================================== */}
      {atab === 'courses' && aedit && (() => {
        const c = getCourse(aedit);
        if (!c) { setAedit(null); return null; }
        return (
          <>
            <p><button className="lnk" onClick={() => setAedit(null)}>← العودة لقائمة الكورسات</button></p>
            <div className="admin-header-card">
              <div>
                <div className="admin-badge">
                  <span className="admin-badge-dot" />
                  محرر الكورسات
                </div>
                <h1 className="admin-title">تعديل: {c.title}</h1>
                <p className="admin-subtitle">تعديل التفاصيل، السعر، المحاور والدروس التعليمية.</p>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <form
                className="fm"
                style={{ maxWidth: '100%' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  c.title = fd.get('title').trim();
                  c.instructor = (fd.get('instructor') || '').trim();
                  c.instructorRole = (fd.get('instructorRole') || '').trim();
                  c.weeks = +fd.get('weeks') || 1;
                  c.price = +fd.get('price') || 0;
                  c.desc = fd.get('desc').trim();
                  c.outcomes = fd.get('outcomes').split('\n').map((s) => s.trim()).filter(Boolean);
                  c.pub = fd.get('pub') === 'on';
                  c.img = fd.get('img').trim();
                  saveDb({ ...db });
                  showToast('تم حفظ الكورس بنجاح');
                }}
              >
                <label>
                  اسم الكورس
                  <input className="fi" name="title" defaultValue={c.title} required placeholder="اسم الكورس" />
                </label>
                <div className="two">
                  <label>اسم المدرب / المحاضر<input className="fi" name="instructor" defaultValue={c.instructor || ''} placeholder="مثال: م. إسلام ياسر" /></label>
                  <label>لقب أو تخصص المدرب<input className="fi" name="instructorRole" defaultValue={c.instructorRole || ''} placeholder="مثال: Senior Frontend Engineer" /></label>
                </div>
                <div className="two">
                  <label>الأسابيع<input className="fi" type="number" min="1" name="weeks" defaultValue={c.weeks} /></label>
                  <label>السعر (ج.م)<input className="fi" type="number" min="0" name="price" defaultValue={c.price} /></label>
                </div>
                <label>
                  رابط صورة الغلاف (اختياري)
                  <input className="fi" name="img" defaultValue={c.img || ''} placeholder="رابط صورة الغلاف" />
                </label>
                <label>
                  وصف الكورس
                  <textarea className="fi" name="desc" rows={3} defaultValue={c.desc} placeholder="وصف الكورس" />
                </label>
                <label>
                  مخرجات التعلم (سطر لكل نقطة)
                  <textarea className="fi" name="outcomes" rows={4} defaultValue={c.outcomes.join('\n')} placeholder="مخرجات التعلم، سطر لكل نقطة" />
                </label>
                <label className="ck"><input type="checkbox" name="pub" defaultChecked={c.pub} /> كورس منشور ومتاح للطلاب</label>
                <button className="btn" type="submit" style={{ justifySelf: 'start' }}>حفظ التعديلات</button>
              </form>
            </div>

            <div className="admin-card" style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '1.3rem', fontWeight: 800 }}>الفيديوهات والدروس ({c.lessons.length})</h2>
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
                    showToast('تم حفظ الدرس');
                  }}
                >
                  <input className="fi" name="title" defaultValue={l.title} required />
                  <input className="fi" name="min" type="number" min="1" defaultValue={l.min} style={{ maxWidth: '90px' }} />
                  <input className="fi" name="url" defaultValue={l.url} placeholder="رابط الفيديو (يوتيوب)" />
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
                style={{ marginTop: '18px' }}
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
                  showToast('تمت إضافة الفيديو بنجاح');
                }}
              >
                <input className="fi" name="title" required placeholder="عنوان فيديو جديد" />
                <input className="fi" name="min" type="number" min="1" defaultValue={10} style={{ maxWidth: '90px' }} />
                <input className="fi" name="url" placeholder="رابط الفيديو" />
                <button className="btn" type="submit">+ إضافة</button>
              </form>
            </div>
          </>
        );
      })()}

      {/* ========================================================
          TAB 4: STUDENTS (الطلاب)
          ======================================================== */}
      {/* ========================================================
          TAB 4: STUDENTS (الطلاب المسجلين وإدارة بياناتهم)
          ======================================================== */}
      {atab === 'students' && (() => {
        const studentList = db.users.filter((u) => u.role === 'student');
        const stEnrolledCount = studentList.filter((u) => db.enr.some((e) => e.u === u.id)).length;
        const stUnenrolledCount = studentList.length - stEnrolledCount;
        const stBlockedCount = studentList.filter((u) => u.status === 'blocked').length;

        const filteredStudents = studentList
          .filter((u) => {
            // Search Query
            if (stuSearch.trim()) {
              const q = stuSearch.toLowerCase();
              const p = u.profile || {};
              const match =
                (u.name || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.phone || '').toLowerCase().includes(q) ||
                (p.university || '').toLowerCase().includes(q) ||
                (p.faculty || '').toLowerCase().includes(q) ||
                (p.year || '').toLowerCase().includes(q) ||
                (p.goal || '').toLowerCase().includes(q);
              if (!match) return false;
            }

            // Enrollment Filter
            const userEnrs = db.enr.filter((e) => e.u === u.id);
            if (stuEnrollFilter === 'enrolled' && userEnrs.length === 0) return false;
            if (stuEnrollFilter === 'not_enrolled' && userEnrs.length > 0) return false;

            // Course Filter
            if (stuCourseFilter !== 'all' && !userEnrs.some((e) => e.c === stuCourseFilter)) return false;

            // Status Filter
            if (stuStatusFilter === 'active' && u.status === 'blocked') return false;
            if (stuStatusFilter === 'blocked' && u.status !== 'blocked') return false;

            return true;
          })
          .sort((a, b) => {
            if (stuSort === 'name') return (a.name || '').localeCompare(b.name || '', 'ar');
            if (stuSort === 'balance') return (b.balance || 0) - (a.balance || 0);
            if (stuSort === 'courses') {
              const ca = db.enr.filter((e) => e.u === a.id).length;
              const cb = db.enr.filter((e) => e.u === b.id).length;
              return cb - ca;
            }
            return (b.created || 0) - (a.created || 0);
          });

        return (
          <>
            <div className="admin-header-card">
              <div>
                <div className="admin-badge">
                  <span className="admin-badge-dot" />
                  إدارة المستخدمين والطلاب
                </div>
                <h1 className="admin-title">الطلاب المسجلين بالمنصة</h1>
                <p className="admin-subtitle">
                  متابعة جميع بيانات الطلاب الأكاديمية والشخصية، مساراتهم المشتركين بها، أرصدتهم، وتعيين كلمات المرور.
                </p>
              </div>
              <div className="admin-stats-summary">
                <div className="admin-stat-chip">
                  <b>{studentList.length}</b>
                  <span>طالب مسجل</span>
                </div>
                <div className="admin-stat-chip">
                  <b style={{ color: 'var(--cyt)' }}>{stEnrolledCount}</b>
                  <span>مشترك بمسار</span>
                </div>
                <div className="admin-stat-chip">
                  <b style={{ color: '#f59e0b' }}>{stUnenrolledCount}</b>
                  <span>غير مشترك</span>
                </div>
                {stBlockedCount > 0 && (
                  <div className="admin-stat-chip">
                    <b style={{ color: '#ef4444' }}>{stBlockedCount}</b>
                    <span>موقوف</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive Filters Bar */}
            <div className="admin-filters-card">
              <div className="admin-search-row">
                <div className="admin-search-box" style={{ flex: 1 }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ marginInlineEnd: '8px', opacity: 0.6 }}></i>
                  <input
                    type="text"
                    value={stuSearch}
                    onChange={(e) => setStuSearch(e.target.value)}
                    placeholder="ابحث بالاسم، البريد، الهاتف، الجامعة، الكلية..."
                  />
                  {stuSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setStuSearch('')}
                      style={{ background: 'none', border: 0, color: 'var(--fg)', cursor: 'pointer', padding: '0 4px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-filters-pills-row">
                {/* Enrollment Filter */}
                <div className="filter-pill-group">
                  <span className="filter-group-label">الاشتراك:</span>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuEnrollFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStuEnrollFilter('all')}
                  >
                    الكل ({studentList.length})
                  </button>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuEnrollFilter === 'enrolled' ? 'active' : ''}`}
                    onClick={() => setStuEnrollFilter('enrolled')}
                  >
                    المشتركين ({stEnrolledCount})
                  </button>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuEnrollFilter === 'not_enrolled' ? 'active' : ''}`}
                    onClick={() => setStuEnrollFilter('not_enrolled')}
                  >
                    غير المشتركين ({stUnenrolledCount})
                  </button>
                </div>

                {/* Course Filter */}
                <div className="filter-pill-group">
                  <span className="filter-group-label">المسار:</span>
                  <select
                    className="admin-select-filter"
                    value={stuCourseFilter}
                    onChange={(e) => setStuCourseFilter(e.target.value)}
                  >
                    <option value="all">كل المسارات التدريبية</option>
                    {db.courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Account Status */}
                <div className="filter-pill-group">
                  <span className="filter-group-label">الحالة:</span>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuStatusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStuStatusFilter('all')}
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuStatusFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setStuStatusFilter('active')}
                  >
                    نشط
                  </button>
                  <button
                    type="button"
                    className={`admin-pill-btn ${stuStatusFilter === 'blocked' ? 'active' : ''}`}
                    onClick={() => setStuStatusFilter('blocked')}
                  >
                    موقوف
                  </button>
                </div>

                {/* Sort Option */}
                <div className="filter-pill-group" style={{ marginInlineStart: 'auto' }}>
                  <span className="filter-group-label">الترتيب:</span>
                  <select
                    className="admin-select-filter"
                    value={stuSort}
                    onChange={(e) => setStuSort(e.target.value)}
                  >
                    <option value="newest">الأحدث انضماماً</option>
                    <option value="name">أبجدياً (الاسم)</option>
                    <option value="balance">الأعلى رصيداً</option>
                    <option value="courses">الأكثر اشتراكاً</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="admin-card">
              <div className="sc">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الطالب والبريد</th>
                      <th>الهاتف والتواصل</th>
                      <th>الملف والبيانات الأكاديمية</th>
                      <th>المسارات المشترك بها</th>
                      <th>الرصيد</th>
                      <th>الحالة</th>
                      <th>إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((u) => {
                      const p = u.profile || {};
                      const userEnrs = db.enr.filter((e) => e.u === u.id);
                      const waUrl = u.phone ? `https://wa.me/${String(u.phone).replace(/\D/g, '').replace(/^0/, '20')}` : null;

                      return (
                        <tr key={u.id}>
                          {/* Col 1: Student info & password hint */}
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-avatar">
                                {u.name ? u.name.trim().charAt(0) : 'ط'}
                              </div>
                              <div className="admin-user-meta">
                                <span className="admin-user-name">{u.name}</span>
                                <span className="admin-user-sub">{u.email}</span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                                  <span className="admin-pass-chip" title="كلمة المرور الحالية المسجلة للنظام">
                                    🔑 {u.pass || '123456'}
                                  </span>
                                  <small className="hint">{fmt(u.created || Date.now())}</small>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Phone & WhatsApp */}
                          <td>
                            {u.phone ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{u.phone}</span>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-wa-btn"
                                  title="مراسلة الطالب مباشرة عبر واتساب"
                                >
                                  <i className="fa-brands fa-whatsapp"></i>
                                  <span>مراسلة واتساب</span>
                                </a>
                              </div>
                            ) : (
                              <span className="hint">لا يوجد رقم</span>
                            )}
                          </td>

                          {/* Col 3: Academic Profile Info */}
                          <td>
                            <div className="admin-profile-meta">
                              <div>
                                <b>الجامعة:</b> {p.university || '—'}
                              </div>
                              <div>
                                <b>الكلية:</b> {p.faculty || '—'}
                              </div>
                              <div className="hint" style={{ fontSize: '.8rem' }}>
                                {p.year ? `السنة: ${p.year}` : ''} {p.goal ? `· الهدف: ${p.goal}` : ''}
                              </div>
                            </div>
                          </td>

                          {/* Col 4: Enrolled Courses */}
                          <td>
                            {userEnrs.length > 0 ? (
                              <div className="admin-enr-chips-wrap">
                                {userEnrs.map((e) => {
                                  const c = getCourse(e.c);
                                  return (
                                    <span key={e.c} className="admin-course-pill">
                                      <i className="fa-solid fa-graduation-cap"></i>
                                      {c?.title || e.c}
                                      <small>({e.done?.length || 0} درس)</small>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="admin-no-enr-tag">غير مشترك</span>
                            )}
                          </td>

                          {/* Col 5: Balance */}
                          <td>
                            <span className="admin-price-tag">{u.balance || 0} ج.م</span>
                          </td>

                          {/* Col 6: Status */}
                          <td>
                            <span className={`admin-status-pill ${u.status === 'blocked' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
                              <span className="admin-status-dot" />
                              {u.status === 'blocked' ? 'موقوف' : 'نشط'}
                            </span>
                          </td>

                          {/* Col 7: Actions */}
                          <td>
                            <div className="admin-actions-cell" style={{ flexWrap: 'wrap', gap: '6px' }}>
                              <button
                                type="button"
                                className="admin-action-btn-resetpass"
                                onClick={() => {
                                  setResetPassStu(u);
                                  setQuickNewPass('123456');
                                }}
                                title="إعادة تعيين كلمة المرور فورياً"
                              >
                                🔑 كلمة المرور
                              </button>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: '6px 12px', fontSize: '.82rem' }}
                                onClick={() => {
                                  setDialogContent({ type: 'student', student: u });
                                }}
                              >
                                ⚙️ إدارة شاملة
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <div className="admin-empty-state">
                            <div className="admin-empty-icon">👥</div>
                            <div className="admin-empty-title">لا توجد نتائج مطابقة لبحثك</div>
                            <div className="admin-empty-desc">
                              جرب تغيير كلمات البحث أو إعادة ضبط خيارات الفلاتر المعروضة بالأعلى.
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ marginTop: '12px' }}
                              onClick={() => {
                                setStuSearch('');
                                setStuEnrollFilter('all');
                                setStuCourseFilter('all');
                                setStuStatusFilter('all');
                              }}
                            >
                              إعادة ضبط الفلاتر
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Password Reset Dialog Modal */}
            {resetPassStu && (
              <div className="modal-overlay" onClick={() => setResetPassStu(null)}>
                <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                  <button className="x" onClick={() => setResetPassStu(null)}>✕</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(43, 185, 211, 0.15)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      🔑
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>إعادة تعيين كلمة المرور</h3>
                      <p className="hint" style={{ margin: 0 }}>للطالب: {resetPassStu.name} ({resetPassStu.email})</p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!quickNewPass.trim() || quickNewPass.trim().length < 4) {
                        showToast('يرجى كتابة كلمة مرور لا تقل عن 4 خانات');
                        return;
                      }
                      const target = db.users.find((u) => u.id === resetPassStu.id);
                      if (target) {
                        target.pass = quickNewPass.trim();
                        saveDb({ ...db });
                        showToast(`تم تغيير كلمة المرور للطالب (${target.name}) إلى: "${quickNewPass.trim()}" بنجاح!`);
                        setResetPassStu(null);
                        setQuickNewPass('');
                      }
                    }}
                  >
                    <label className="fi-label">كلمة المرور الجديدة المطلوبة:</label>
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <input
                        type="text"
                        className="fi"
                        value={quickNewPass}
                        onChange={(e) => setQuickNewPass(e.target.value)}
                        placeholder="اكتب كلمة المرور الجديدة..."
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '.8rem' }}
                        onClick={() => setQuickNewPass('123456')}
                      >
                        افتراضي (123456)
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '.8rem' }}
                        onClick={() => setQuickNewPass('khutwa' + Math.floor(1000 + Math.random() * 9000))}
                      >
                        توليد عشوائي
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                        ✓ حفظ وتطبيق كلمة المرور
                      </button>
                      <button
                        type="button"
                        className="lnk"
                        onClick={() => setResetPassStu(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ========================================================
          TAB 5: LEADS (الاستفسارات)
          ======================================================== */}
      {/* ========================================================
          TAB 5: LEADS (الاستفسارات والدعم والردود)
          ======================================================== */}
      {atab === 'leads' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                مركز استفسارات ورسائل الطلاب
              </div>
              <h1 className="admin-title">الاستفسارات والدعم والردود</h1>
              <p className="admin-subtitle">متابعة رسائل واستفسارات الطلاب والمهتمين بالمسارات، والرد المباشر عليها لتصل إلى حساباتهم وإشعار الجرس.</p>
            </div>
            <div className="admin-stat-chip">
              <b>{db.leads.filter((l) => l.status === 'new' || !l.reply).length}</b>
              <span>في انتظار الرد</span>
            </div>
          </div>

          <div className="admin-card">
            <div className="sc">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الطالب / المهتم</th>
                    <th>المسار المطلوب</th>
                    <th>نص الاستفسار والرد</th>
                    <th>الحالة</th>
                    <th>الإجراءات والرد</th>
                  </tr>
                </thead>
                <tbody>
                  {db.leads.map((l) => (
                    <tr key={l.id}>
                      <td><div className="admin-date-cell">{fmt(l.date)}</div></td>
                      <td>
                        <b>{l.name}</b>
                        <div style={{ marginTop: '4px' }}>
                          <a
                            className="admin-action-btn-approve"
                            style={{ textDecoration: 'none', padding: '3px 10px', fontSize: '.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            href={`https://wa.me/${String(l.phone).replace(/\D/g, '').replace(/^0/, '20')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            💬 {l.phone}
                          </a>
                        </div>
                      </td>
                      <td><b>{getCourse(l.track)?.title || l.track}</b></td>
                      <td style={{ maxWidth: '320px' }}>
                        <div className="admin-inq-msg">
                          <strong>سؤال الطالب:</strong>
                          <p>{l.message || 'طلب تواصل واستفسار عن تفاصيل المسار'}</p>
                        </div>
                        {l.reply && (
                          <div className="admin-inq-reply-badge">
                            <strong>رد الأكاديمية:</strong>
                            <p>{l.reply}</p>
                            {l.repliedAt && <small>{fmt(l.repliedAt)}</small>}
                          </div>
                        )}
                        {replyingLeadId === l.id && (
                          <div className="admin-reply-box">
                            <textarea
                              className="fi"
                              rows={3}
                              placeholder="اكتب رد الأكاديمية الرسمي للطالب هنا..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              <button
                                type="button"
                                className="btn"
                                style={{ padding: '6px 14px', fontSize: '.85rem' }}
                                onClick={() => {
                                  if (!replyText.trim()) {
                                    showToast('يرجى كتابة نص الرد أولاً');
                                    return;
                                  }
                                  l.reply = replyText.trim();
                                  l.repliedAt = Date.now();
                                  l.status = 'answered';
                                  l.readByStudent = false;
                                  saveDb({ ...db });
                                  setReplyingLeadId(null);
                                  setReplyText('');
                                  showToast('تم إرسال الرد للطالب بنجاح! سيظهر في حسابه وإشعار الجرس');
                                }}
                              >
                                إرسال الرد للطالب
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '6px 14px', fontSize: '.85rem', borderRadius: '99px', background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg)', cursor: 'pointer' }}
                                onClick={() => {
                                  setReplyingLeadId(null);
                                  setReplyText('');
                                }}
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`admin-status-pill ${l.reply ? 'admin-status-approved' : 'admin-status-pending'}`}>
                          <span className="admin-status-dot" />
                          {l.reply ? 'تم الرد ✓' : 'في انتظار الرد'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '.82rem' }}
                            onClick={() => {
                              if (replyingLeadId === l.id) {
                                setReplyingLeadId(null);
                                setReplyText('');
                              } else {
                                setReplyingLeadId(l.id);
                                setReplyText(l.reply || '');
                              }
                            }}
                          >
                            {l.reply ? 'تعديل الرد' : 'رد على الاستفسار'}
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn-delete"
                            onClick={() => {
                              saveDb({ ...db, leads: db.leads.filter((x) => x.id !== l.id) });
                              showToast('تم حذف الاستفسار');
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {db.leads.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">📬</div>
                          <div className="admin-empty-title">لا توجد استفسارات حالياً</div>
                          <div className="admin-empty-desc">أي طالب أو زائر يسجل استفساراً في الصفحة الرئيسية أو لوحة التحكم سيظهر هنا فوراً.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          TAB 6: TX (سجل العمليات المالية)
          ======================================================== */}
      {atab === 'tx' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                السجل المالي
              </div>
              <h1 className="admin-title">سجل العمليات والتحويلات</h1>
              <p className="admin-subtitle">جميع عمليات الاشتراكات والشحن وتعديلات الأرصدة عبر النظام.</p>
            </div>
            <div className="admin-stat-chip">
              <b>{db.tx.length}</b>
              <span>عملية مسجلة</span>
            </div>
          </div>

          <div className="admin-card">
            <div className="sc">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الطالب</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {db.tx.map((t) => {
                    const u = db.users.find((x) => x.id === t.u);
                    return (
                      <tr key={t.id}>
                        <td><div className="admin-date-cell">{fmt(t.date)}</div></td>
                        <td><b>{u?.name || '—'}</b></td>
                        <td>
                          <span className="admin-status-pill admin-status-approved">
                            {TX[t.type] || t.type}
                          </span>
                        </td>
                        <td dir="ltr" style={{ textAlign: 'end', fontWeight: 800 }}>
                          <span style={{ color: t.amount > 0 ? '#22c55e' : '#ef4444' }}>
                            {t.amount > 0 ? '+' : ''}{t.amount} ج.م
                          </span>
                        </td>
                        <td><span style={{ opacity: 0.85 }}>{t.note}</span></td>
                      </tr>
                    );
                  })}
                  {db.tx.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">💳</div>
                          <div className="admin-empty-title">لا توجد عمليات مسجلة بعد</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
