import React, { useState, useEffect, useRef } from 'react';
import { useKhutwa } from '../../hooks';
import { ytid } from '../../utils';

export function WatchView({ cid, lid }) {
  const { user, getCourse, getEnrollment, getPendingSub, db, saveDb, setPend, setDialogContent } = useKhutwa();
  const playerRef = useRef(null);
  const [videoLoading, setVideoLoading] = useState(true);

  const c = getCourse(cid);
  if (!c || !c.lessons.length) return null;
  const en = getEnrollment(user, cid);
  const adm = user && user.role === 'admin';
  const pendingReq = getPendingSub(user, cid);
  const i = Math.max(0, c.lessons.findIndex((l) => l.id === lid));
  const l = c.lessons[i];
  const ok = i === 0 || en || adm;
  const yId = ytid(l.url);

  // Reset loading state whenever current video changes
  useEffect(() => {
    setVideoLoading(true);
  }, [yId]);

  // Smooth scroll up to video player on lesson change or click
  const scrollToPlayer = () => {
    // 1. Scroll main overlay container #app
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // 2. Scroll into view of player element
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // 3. Fallback for window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToPlayer();
  }, [cid, lid]);

  return (
    <div className="wrap">
      <p className="cr">
        <a href={`#/course/${c.id}`}>← {c.title}</a>
        {c.instructor && <span style={{ opacity: 0.8, marginInlineStart: '10px' }}>• تقديم: {c.instructor}</span>}
      </p>
      <div className="wt">
        <div ref={playerRef}>
          <div className="pl">
            {ok ? (
              yId ? (
                <>
                  {videoLoading && (
                    <div className="video-skeleton-loader">
                      <img
                        src={`https://i.ytimg.com/vi/${yId}/hqdefault.jpg`}
                        alt=""
                        className="video-skeleton-bg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="video-skeleton-overlay">
                        <div className="video-loading-spinner" />
                        <span className="video-loading-text">جاري تحميل الفيديو...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    key={yId}
                    src={`https://www.youtube.com/embed/${yId}?rel=0&playsinline=1&enablejsapi=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    title={l.title}
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => setVideoLoading(false)}
                    style={{ opacity: videoLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                  />
                </>
              ) : /\.(mp4|webm)(\?|$)/i.test(l.url) ? (
                <video src={l.url} controls playsInline controlsList="nodownload" />
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
              <a className="lnk" href={`#/watch/${c.id}/${c.lessons[i - 1].id}`} onClick={scrollToPlayer}>→ السابق</a>
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
              <a className="lnk" href={`#/watch/${c.id}/${c.lessons[i + 1].id}`} onClick={scrollToPlayer}>التالي ←</a>
            )}
          </div>
        </div>

        <aside>
          {c.lessons.map((x, j) => {
            const itemOk = j === 0 || en || adm;
            const itemYid = ytid(x.url);
            return itemOk ? (
              <a
                key={x.id}
                className={`ls ${x.id === l.id ? 'cur' : ''}`}
                href={`#/watch/${c.id}/${x.id}`}
                onClick={scrollToPlayer}
              >
                <span>{en && en.done.includes(x.id) ? '✓' : '▶'}</span>
                {itemYid && (
                  <img
                    className="yt"
                    src={`https://i.ytimg.com/vi/${itemYid}/mqdefault.jpg`}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="lt">{j + 1}. {x.title}</span>
                {j === 0 && !en && !adm && <span className="tag">مجاني</span>}
                <em>{x.min} د</em>
              </a>
            ) : (
              <a
                key={x.id}
                className={`ls lock ${x.id === l.id ? 'cur' : ''}`}
                href={`#/watch/${c.id}/${x.id}`}
                onClick={scrollToPlayer}
                title="اضغط لمعاينة وتفاصيل الاشتراك"
              >
                <span>🔒</span>
                {itemYid && (
                  <img
                    className="yt bl"
                    src={`https://i.ytimg.com/vi/${itemYid}/mqdefault.jpg`}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="lt">{j + 1}. {x.title}</span>
                <em>{x.min} د</em>
              </a>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

export default WatchView;
