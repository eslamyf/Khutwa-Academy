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
    getCourse
  } = useKhutwa();

  // Search query for students (internal local state)
  const [sq, setSq] = useState('');

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
}

export default AdminDashboard;
