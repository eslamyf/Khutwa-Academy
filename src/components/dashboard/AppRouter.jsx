import React, { Suspense, lazy } from 'react';
import { useKhutwa } from '../../hooks';
import { AuthView } from '../modals/AuthView.jsx';
import { CourseView } from './CourseView.jsx';
import { StudentDashboard } from './StudentDashboard.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';

// Code-split / Lazy load the WatchView component for performance
const WatchView = lazy(() => import('./WatchView.jsx'));

export function AppRouter() {
  const { hash, user } = useKhutwa();

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
    return <AuthView mode={a === 'register' ? 'register' : 'login'} />;
  }
  if (r === 'course') {
    return <CourseView id={a} />;
  }
  if (r === 'watch') {
    return (
      <Suspense
        fallback={
          <div style={{ minHeight: '80vh', display: 'grid', placeContent: 'center', textAlign: 'center' }}>
            <div className="video-loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 14px' }} />
            <p style={{ fontWeight: 700, color: 'var(--cyan)' }}>جاري تحميل مشغل الدروس...</p>
          </div>
        }
      >
        <WatchView cid={a} lid={b} />
      </Suspense>
    );
  }
  if (r === 'dashboard') {
    return <StudentDashboard />;
  }
  if (r === 'admin') {
    return <AdminDashboard />;
  }

  return null;
}

export default AppRouter;
