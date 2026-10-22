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

  if (!user || user.role !== 'admin') return null;

  const st = db.users.filter((u) => u.role === 'student');
  const rev = -db.tx.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
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
                        <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{req.courseTitle}</span>
                      </td>
                      <td>
                        <span className="admin-price-tag">{req.price} ج.م</span>
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
                      <td><b>{c.title}</b></td>
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
      {atab === 'students' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                إدارة المستخدمين
              </div>
              <h1 className="admin-title">الطلاب المسجلين</h1>
              <p className="admin-subtitle">عرض الطلاب، أرصدتهم، وتعديل بياناتهم أو حظرهم.</p>
            </div>
            <div className="admin-search-box" style={{ minWidth: '280px' }}>
              <input
                type="text"
                value={sq}
                onChange={(e) => setSq(e.target.value)}
                placeholder="ابحث بالاسم أو الإيميل أو الرقم..."
              />
            </div>
          </div>

          <div className="admin-card">
            <div className="sc">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>الهاتف</th>
                    <th>الرصيد</th>
                    <th>الكورسات</th>
                    <th>الحالة</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {db.users
                    .filter((u) => u.role === 'student' && (u.name + u.email + (u.phone || '')).toLowerCase().includes(sq.toLowerCase()))
                    .map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar">{u.name ? u.name.charAt(0) : 'ط'}</div>
                            <div className="admin-user-meta">
                              <span className="admin-user-name">{u.name}</span>
                              <span className="admin-user-sub">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{u.phone || '—'}</td>
                        <td><span className="admin-price-tag">{u.balance} ج.م</span></td>
                        <td>{db.enr.filter((e) => e.u === u.id).length} كورس</td>
                        <td>
                          <span className={`admin-status-pill ${u.status === 'blocked' ? 'admin-status-rejected' : 'admin-status-approved'}`}>
                            <span className="admin-status-dot" />
                            {u.status === 'blocked' ? 'موقوف' : 'نشط'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '6px 14px', fontSize: '.85rem' }}
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
          </div>
        </>
      )}

      {/* ========================================================
          TAB 5: LEADS (الاستفسارات)
          ======================================================== */}
      {atab === 'leads' && (
        <>
          <div className="admin-header-card">
            <div>
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                إدارة طلبات التواصل
              </div>
              <h1 className="admin-title">استفسارات الصفحة الرئيسية</h1>
              <p className="admin-subtitle">المهتمين الذين سجلوا بياناتهم للتواصل عبر نموذج الخطوة الأولى في الصفحة الرئيسية.</p>
            </div>
            <div className="admin-stat-chip">
              <b>{db.leads.filter((l) => l.status === 'new').length}</b>
              <span>استفسار جديد</span>
            </div>
          </div>

          <div className="admin-card">
            <div className="sc">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الاسم</th>
                    <th>الهاتف والواتساب</th>
                    <th>المسار المطلوب</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {db.leads.map((l) => (
                    <tr key={l.id}>
                      <td><div className="admin-date-cell">{fmt(l.date)}</div></td>
                      <td><b>{l.name}</b></td>
                      <td>
                        <a
                          className="admin-action-btn-approve"
                          style={{ textDecoration: 'none', padding: '5px 12px', fontSize: '.82rem' }}
                          href={`https://wa.me/${String(l.phone).replace(/\D/g, '').replace(/^0/, '20')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          💬 {l.phone}
                        </a>
                      </td>
                      <td><b>{getCourse(l.track)?.title || l.track}</b></td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '.85rem' }}
                            onClick={() => {
                              l.status = l.status === 'new' ? 'done' : 'new';
                              saveDb({ ...db });
                            }}
                          >
                            {l.status === 'new' ? 'تم التواصل ✓' : '↺ جديد'}
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn-delete"
                            onClick={() => {
                              saveDb({ ...db, leads: db.leads.filter((x) => x.id !== l.id) });
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
                      <td colSpan={5}>
                        <div className="admin-empty-state">
                          <div className="admin-empty-icon">📬</div>
                          <div className="admin-empty-title">لا توجد استفسارات حالياً</div>
                          <div className="admin-empty-desc">أي طالب يسجل في استمارة التواصل بالرئيسية سيظهر هنا فوراً.</div>
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
