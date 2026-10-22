import React from 'react';
import { KhutwaProvider, useKhutwa } from '../context';
import { Header, AppHeader, Footer, MobileMenu } from '../components/layout';
import { HeroSection, StatsSection, TracksJourney, LeadFormSection } from '../components/home';
import { AppRouter } from '../components/dashboard';
import { ModalsManager } from '../components/modals';
import { Toast } from '../components/common';

function MainContent() {
  const { isAppOpen, hash } = useKhutwa();

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
          <>
            {!hash.startsWith('#/auth') && <AppHeader />}
            <main>
              <AppRouter />
            </main>
          </>
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
