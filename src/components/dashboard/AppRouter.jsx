import React from 'react';
import { useKhutwa } from '../../hooks';
import { AuthView } from '../modals/AuthView.jsx';
import { CourseView } from './CourseView.jsx';
import { WatchView } from './WatchView.jsx';
import { StudentDashboard } from './StudentDashboard.jsx';
import { AdminDashboard } from './AdminDashboard.jsx';

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
    return <WatchView cid={a} lid={b} />;
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
