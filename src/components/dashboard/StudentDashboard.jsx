import React from 'react';
import { useKhutwa } from '../../hooks';
import { YEARS, GOALS, TX, ART } from '../../constants';
import { fmt } from '../../utils';

export function StudentDashboard() {
  const { user, db, saveDb, showToast, dtab, setDtab, getCourse } = useKhutwa();

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
}

export default StudentDashboard;
