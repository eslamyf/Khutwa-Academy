import React, { useEffect, useRef } from 'react';
import { useKhutwa } from '../../hooks';

export function TracksJourney() {
  const { isAppOpen } = useKhutwa();

  // SVG Journey refs
  const journeyRef = useRef(null);
  const pbRef = useRef(null);
  const pfRef = useRef(null);
  const icRef = useRef(null);
  const st1Ref = useRef(null);
  const st2Ref = useRef(null);
  const st3Ref = useRef(null);
  const endRef = useRef(null);

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
      const xs = m ? [0.88, 0.82, 0.88, 0.82] : [0.3, 0.7, 0.3, 0.5];

      const titleEl = J.querySelector('.j-title-wrap');
      const titleBottom = titleEl ? (titleEl.offsetTop + titleEl.offsetHeight) : (m ? 110 : 130);
      const h0 = sts[0] ? sts[0].offsetHeight : (m ? 340 : 460);
      const h1 = sts[1] ? sts[1].offsetHeight : (m ? 340 : 460);
      const h2 = sts[2] ? sts[2].offsetHeight : (m ? 340 : 460);

      if (m) {
        // In mobile screens, ensure first card starts cleanly below the section title
        const y0 = titleBottom + (h0 / 2) + 35;
        const y1 = y0 + (h0 / 2) + (h1 / 2) + 65;
        const y2 = y1 + (h1 / 2) + (h2 / 2) + 65;
        ys_val = [y0, y1, y2];
      } else {
        // Desktop / Tablet dynamic spacing: never overlap cards or mentor details
        const y0 = titleBottom + (h0 / 2) + 70;
        const y1 = y0 + Math.max(h0 * 0.78, 430);
        const y2 = y1 + Math.max(h1 * 0.78, 430);
        ys_val = [y0, y1, y2];
      }

      // Position the ending headline safely below the final track
      const endEl = endRef.current;
      const endTextTop = ys_val[2] + (h2 / 2) + (m ? 85 : 130);
      if (endEl) {
        endEl.style.top = `${endTextTop}px`;
        endEl.style.bottom = 'auto';
      }

      // Ensure container has plenty of breathing room
      const requiredHeight = endTextTop + (endEl ? endEl.offsetHeight : 80) + (m ? 80 : 130);
      if (H_val < requiredHeight) {
        J.style.minHeight = `${requiredHeight}px`;
        H_val = requiredHeight;
      }

      // Smooth path start from underneath section title, ending cleanly above footer banner
      const startY = titleBottom + 12;
      const startX = m ? W * 0.88 : W * 0.5;
      const endY = endTextTop - 25;

      const pts = [[startX, startY], ...ys_val.map((y, i) => [W * xs[i], y]), [W * 0.5, endY]];

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
          s.style.insetInlineEnd = '16px';
          s.style.insetInlineStart = '16px';
          s.style.marginInline = 'auto';
        } else if (xs[i] < 0.5) {
          s.style.insetInlineStart = '6%';
          s.style.insetInlineEnd = 'auto';
          s.style.marginInline = '0';
        } else {
          s.style.insetInlineEnd = '6%';
          s.style.insetInlineStart = 'auto';
          s.style.marginInline = '0';
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
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.85 - r.top) / (H_val + window.innerHeight * 0.08)));
      pf.style.strokeDashoffset = L_len * (1 - p);
      const pt = pf.getPointAtLength(L_len * p);
      ic.style.transform = `translate(${pt.x - 29}px,${pt.y - 48}px)`;

      sts.forEach((s, i) => {
        const sRect = s.getBoundingClientRect();
        // تفعيل معتدل ووسطي: عندما يصل الكورس لمنتصف مجال الرؤية أو يصله المسار
        const isInFocus = sRect.top < window.innerHeight * 0.58 && sRect.bottom > 80;
        const isPathReached = (L_len * p) >= (lenAt(ys_val[i]) - 40);
        s.classList.toggle('on', isInFocus || isPathReached);
      });
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

  return (
    <section className="j" id="j" ref={journeyRef}>
      <div className="j-title-wrap">
        <h2>اختار مسارك</h2>
      </div>
      <svg aria-hidden="true">
        <path className="bg" ref={pbRef} />
        <path className="fg" ref={pfRef} />
      </svg>
      <img className="ic" ref={icRef} src="assets/icon-cyan.png" alt="" />

      <div className="st" ref={st1Ref} data-y=".16">
        <div className="n">٨<small>أسابيع</small></div>
        <b>تطوير واجهات الويب</b>
        <p>تبني مواقع حقيقية وتطلع بمشاريع قوية في البورتفوليو.</p>

        <div className="st-mentor-card">
          <div className="st-mentor-avatar-wrap">
            <img src="assets/mentors/eslam.jpg" alt="م. إسلام ياسر" className="st-mentor-avatar" />
            <span className="st-mentor-badge" title="مدرّب معتمد">
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </div>
          <div className="st-mentor-info">
            <span className="st-mentor-label">إشراف وتوجيه فردي</span>
            <strong className="st-mentor-name">م. إسلام ياسر</strong>
            <span className="st-mentor-spec">Senior Frontend Engineer</span>
          </div>
        </div>

        <a href="#/course/frontend" className="st-cta">
          <span>تفاصيل المسار</span>
          <i className="fa-solid fa-arrow-left"></i>
        </a>
      </div>

      <div className="st" ref={st2Ref} data-y=".43">
        <div className="n">٦<small>أسابيع</small></div>
        <b>تصميم UX/UI</b>
        <p>تصمم تجربة مستخدم كاملة، من الفكرة للنموذج التفاعلي.</p>

        <div className="st-mentor-card">
          <div className="st-mentor-avatar-wrap">
            <img src="assets/mentors/sara.jpg" alt="أ. سارة أحمد" className="st-mentor-avatar" />
            <span className="st-mentor-badge" title="مدرّبة معتمدة">
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </div>
          <div className="st-mentor-info">
            <span className="st-mentor-label">إشراف وتوجيه فردي</span>
            <strong className="st-mentor-name">أ. سارة أحمد</strong>
            <span className="st-mentor-spec">Lead Product & UX Designer</span>
          </div>
        </div>

        <a href="#/course/ux" className="st-cta">
          <span>تفاصيل المسار</span>
          <i className="fa-solid fa-arrow-left"></i>
        </a>
      </div>

      <div className="st" ref={st3Ref} data-y=".70">
        <div className="n">٦<small>أسابيع</small></div>
        <b>التسويق الرقمي</b>
        <p>تخطط وتنشر وتقيس محتوى حقيقي لعلامة تجارية فعلية.</p>

        <div className="st-mentor-card">
          <div className="st-mentor-avatar-wrap">
            <img src="assets/mentors/karim.jpg" alt="أ. كريم عبد الرحمن" className="st-mentor-avatar" />
            <span className="st-mentor-badge" title="مدرّب معتمد">
              <i className="fa-solid fa-circle-check"></i>
            </span>
          </div>
          <div className="st-mentor-info">
            <span className="st-mentor-label">إشراف وتوجيه فردي</span>
            <strong className="st-mentor-name">أ. كريم عبد الرحمن</strong>
            <span className="st-mentor-spec">Growth & Performance Marketing</span>
          </div>
        </div>

        <a href="#/course/marketing" className="st-cta">
          <span>تفاصيل المسار</span>
          <i className="fa-solid fa-arrow-left"></i>
        </a>
      </div>

      <div className="end" ref={endRef}>وإرشاد فردي معاك طول الطريق.</div>
    </section>
  );
}

export default TracksJourney;
