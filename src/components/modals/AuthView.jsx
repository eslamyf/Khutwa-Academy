import React from 'react';
import { useKhutwa } from '../../hooks';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

export function AuthView({ mode }) {
  const { registerUser, loginUser, showToast, pend, setPend } = useKhutwa();
  const reg = mode === 'register';

  return (
    <div className="au">
      {/* Mobile top bar with brand, theme toggle & back link */}
      <header className="auth-mobile-bar">
        <a className="auth-brand-mobile" href="/" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
          <img src="assets/Asset_103.png" alt="أكاديمية خطوة" width="34" height="46" />
          <span>أكاديمية خطوة</span>
        </a>
        <div className="auth-mobile-actions">
          <ThemeToggle ariaLabel="تبديل الوضع" />
          <a className="back-link" href="/" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
            <i className="fa-solid fa-arrow-right" style={{ marginInlineEnd: '6px' }}></i> الرئيسية
          </a>
        </div>
      </header>

      <aside className="ab">
        <img className="alg" src="assets/Asset_103.png" alt="أكاديمية خطوة" width="42" height="56" />
        <a className="back" href="/" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
          <i className="fa-solid fa-arrow-right" style={{ marginInlineEnd: '6px' }}></i> الرئيسية
        </a>
        <div className="stairs" style={{ '--u': 'clamp(24px,3.2vw,44px)' }} aria-hidden="true">
          <i style={{ '--n': 1 }}></i><i style={{ '--n': 2 }}></i><i style={{ '--n': 3 }}></i>
          <i style={{ '--n': 4 }}></i><i style={{ '--n': 5 }}></i><i style={{ '--n': 6 }}></i>
          <img className="hop" src="assets/icon-cyan.png" alt="" width="54" height="47" />
        </div>
        <h2>{reg ? <>ابدأ خطوتك<br />من هنا.</> : <>كمّل من<br />حيث وقفت.</>}</h2>
        <ul className="pk">
          <li>مشاريع حقيقية</li>
          <li>إرشاد فردي أسبوعي</li>
          <li>فرص توظيف وتدريب للمتفوقين</li>
        </ul>
      </aside>

      <section className="af">
        <ThemeToggle className="tg desktop-tg" ariaLabel="تبديل الوضع" />
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
                <input id="auth-name" name="name" placeholder=" " required autoComplete="name" aria-label="الاسم بالكامل" />
                <label htmlFor="auth-name">الاسم بالكامل</label>
              </div>
            )}
            <div className="ff">
              <input id="auth-email" name="email" type="email" placeholder=" " required autoComplete="email" aria-label="البريد الإلكتروني" />
              <label htmlFor="auth-email">الإيميل</label>
            </div>
            <div className="ff">
              <input id="auth-pass" name="pass" type="password" placeholder=" " required minLength={6} autoComplete={reg ? 'new-password' : 'current-password'} aria-label="كلمة السر" />
              <label htmlFor="auth-pass">كلمة السر</label>
              <button
                type="button"
                className="eye"
                aria-label="تبديل إظهار وإخفاء كلمة المرور"
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
              <b><i className="fa-solid fa-arrow-left"></i></b>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AuthView;
