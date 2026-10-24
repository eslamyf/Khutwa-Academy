import React, { Suspense, lazy } from 'react';
import { useKhutwa } from '../../hooks';
import { AuthView } from '../modals/AuthView.jsx';
import { CourseView } from './CourseView.jsx';
import { StudentDashboard } from './StudentDashboard.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';
import { NotFoundView } from './NotFoundView.jsx';
import { AdminRestrictedView } from './AdminRestrictedView.jsx';

// Code-split / Lazy load the WatchView component for performance
const WatchView = lazy(() => import('./WatchView.jsx'));

export function AppRouter() {
  const { hash, pathname, user, getCourse } = useKhutwa();

  // Determine active route string: hash takes priority if active (e.g. #/auth/login or #/dashboard)
  let activePath = '';
  let fullAttemptedPath = '';

  let cleanHash = (hash || '').trim();
  if (cleanHash.startsWith('/#')) {
    cleanHash = cleanHash.slice(1);
  }

  if (cleanHash && cleanHash !== '#' && cleanHash !== '#/') {
    fullAttemptedPath = cleanHash;
    if (cleanHash.startsWith('#/')) {
      activePath = cleanHash.slice(2);
    } else if (cleanHash.startsWith('#')) {
      activePath = cleanHash.slice(1);
    }
  } else if (pathname && pathname !== '/' && pathname !== '/index.html') {
    fullAttemptedPath = pathname;
    activePath = pathname.replace(/^\/+/, '');
  }

  if (!activePath) {
    return <NotFoundView attemptedPath={fullAttemptedPath || pathname || '/'} />;
  }

  const segments = activePath.split('/').filter(Boolean);
  const [r, a, b] = segments;

  // 1. Protection for /admin (Role-Based Access Control - RBAC):
  if (r === 'admin') {
    // If invalid subroute e.g. /admin/something
    if (a) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }

    // If guest (not logged in): redirect to login screen
    if (!user) {
      if (window.location.hash !== '#/auth/login' || window.location.pathname !== '/') {
        try {
          window.history.replaceState(null, '', '/#/auth/login');
        } catch {
          /* ignore */
        }
        window.location.hash = '#/auth/login';
      }
      return <AuthView mode="login" />;
    }

    // If logged in as student: show enterprise-grade restricted gateway
    if (user.role !== 'admin') {
      return <AdminRestrictedView user={user} />;
    }

    // If admin: render admin dashboard
    return <AdminDashboard />;
  }

  // 2. Protection for /dashboard:
  if (r === 'dashboard') {
    // If invalid subroute e.g. /dashboard/sbfadsf
    if (a) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }

    if (!user) {
      if (window.location.hash !== '#/auth/login') {
        window.location.hash = '#/auth/login';
      }
      return <AuthView mode="login" />;
    }
    if (user.role === 'admin') {
      if (window.location.hash !== '#/admin') {
        window.location.hash = '#/admin';
      }
      return <AdminDashboard />;
    }
    return <StudentDashboard />;
  }

  // 3. /auth routes:
  if (r === 'auth') {
    if ((a && a !== 'login' && a !== 'register') || b || segments.length > 2) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }
    if (user) {
      if (user.role === 'admin') {
        if (window.location.hash !== '#/admin') {
          window.location.hash = '#/admin';
        }
        return <AdminDashboard />;
      }
      if (window.location.hash !== '#/dashboard') {
        window.location.hash = '#/dashboard';
      }
      return <StudentDashboard />;
    }
    return <AuthView mode={a === 'register' ? 'register' : 'login'} />;
  }

  if (r === 'course') {
    const course = (getCourse && a) ? getCourse(a) : null;
    if (!course || b || segments.length > 2) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }
    return <CourseView id={a} />;
  }
  if (r === 'watch') {
    const course = (getCourse && a) ? getCourse(a) : null;
    if (!course || segments.length > 3) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }
    if (b && !course.lessons.some((l) => l.id === b)) {
      return <NotFoundView attemptedPath={fullAttemptedPath} />;
    }
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

  // Any other route that doesn't match
  return <NotFoundView attemptedPath={fullAttemptedPath} />;

}

export default AppRouter;

