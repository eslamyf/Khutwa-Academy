import React from 'react';
import { getUserInitials } from '../../utils';
import '../../styles/adminRestricted.css';

export function AdminRestrictedView({ user }) {
  const handleGoDashboard = () => {
    window.location.hash = '#/dashboard';
  };

  const handleGoHome = (e) => {
    e.preventDefault();
    try {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new Event('popstate'));
    } catch {
      window.location.hash = '';
    }
  };

  const initials = user?.name ? getUserInitials(user.name) : 'ط';

  return (
    <div className="ar-page" dir="rtl">
      {/* Decorative ambient glowing orbs */}
      <div className="ar-orb ar-orb-1" aria-hidden="true" />
      <div className="ar-orb ar-orb-2" aria-hidden="true" />

      <div className="ar-card">
        {/* Shield Icon Badge */}
        <div className="ar-icon-wrap" aria-hidden="true">
          <i className="fa-solid fa-shield-halved"></i>
        </div>

        {/* Security Tag */}
        <div>
          <span className="ar-pill">
            <i className="fa-solid fa-lock"></i>
            منطقة صلاحيات مقيدة · Admin Area
          </span>
        </div>

        <h1 className="ar-title">لوحة التحكم مخصصة لمسؤولي الأكاديمية</h1>

        <p className="ar-desc">
          أهلاً {user?.name ? user.name.split(' ')[0] : 'بك'}، لقد حاولت الدخول إلى مسار إدارة المنصة (<code>/admin</code>).
          هذا المسار محمي بصلاحيات أمنية مخصصة لمسؤولي النظام فقط لمتابعة الطلاب وإعدادات الأكاديمية.
        </p>

        {/* User Identity Info Card */}
        {user && (
          <div className="ar-user-card">
            <div className="ar-user-meta">
              <div className="ar-user-avatar">
                {initials}
              </div>
              <div>
                <div className="ar-user-name">{user.name}</div>
                <div className="ar-user-email">{user.email}</div>
              </div>
            </div>
            <div className="ar-role-badge">
              <i className="fa-solid fa-user-graduate"></i>
              حساب طالب (Student)
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ar-actions">
          <button
            type="button"
            className="ar-btn-primary"
            onClick={handleGoDashboard}
          >
            <i className="fa-solid fa-graduation-cap"></i>
            الذهاب إلى لوحتي التعليمية (كورساتي)
          </button>

          <button
            type="button"
            className="ar-link-home"
            onClick={handleGoHome}
          >
            <i className="fa-solid fa-house"></i>
            الرجوع للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminRestrictedView;
