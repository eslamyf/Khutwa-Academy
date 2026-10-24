import React from 'react';
import { KhutwaProvider, useKhutwa } from '../context';
import { Header, AppHeader, Footer, MobileMenu } from '../components/layout';
import { HeroSection, StatsSection, TracksJourney, LeadFormSection } from '../components/home';
import { AppRouter } from '../components/dashboard';
import { ModalsManager } from '../components/modals';
import { Toast } from '../components/common';

function MainContent() {
  const { isAppOpen, hash, pathname, user } = useKhutwa();
  const isGuestAdminAttempt =
    !user &&
    ((hash && (hash === '#/admin' || hash.startsWith('#/admin/'))) ||
     (pathname && (pathname === '/admin' || pathname.startsWith('/admin/'))));

  const isAuth =
    (hash && hash.startsWith('#/auth')) ||
    (pathname && pathname.startsWith('/auth')) ||
    isGuestAdminAttempt;
  const isWatch = (hash && hash.startsWith('#/watch')) || (pathname && pathname.startsWith('/watch'));

  return (
    <>
      {/* 1. Header (Navbar) */}
      <Header />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 2.5 Numbers & Stats Section */}
      <StatsSection />

      {/* 3. Journey Section (Path & Steps) */}
      <TracksJourney />

      {/* 4. Contact / Join Section */}
      <LeadFormSection />

      {/* 5. Footer */}
      <Footer />

      {/* 6. Full App Layer Overlay (#app) */}
      <div id="app" hidden={!isAppOpen}>
        {isAppOpen && (
          <div className="app-shell">
            {!isAuth && <AppHeader />}
            <main className="app-main-content">
              <AppRouter />
            </main>
            {!isWatch && !isAuth && <Footer />}
          </div>
        )}
      </div>



      {/* Render Mobile Hamburger Menu Drawer */}
      <MobileMenu />

      {/* 7. Dialog Modal */}
      <ModalsManager />

      {/* 8. Toast popup */}
      <Toast />
    </>
  );
}

export function App() {
  return (
    <KhutwaProvider>
      <MainContent />
    </KhutwaProvider>
  );
}

export default App;
