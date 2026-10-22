import React from 'react';
import { useKhutwa } from '../../hooks';
import { ART } from '../../constants';
import { ytid } from '../../utils';

export function CourseView({ id }) {
  const { user, getCourse, getEnrollment, getPendingSub, setPend, setDialogContent, showToast } = useKhutwa();

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
}

export default CourseView;
