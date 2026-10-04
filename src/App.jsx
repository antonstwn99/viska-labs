import React, { useState, useEffect, useCallback } from 'react';

// TODO: Komponen UI dasar, context, custom hooks, dan konstanta
// akan dipisahkan dan di-import dari file ui.jsx
import {
  ToastProvider,
  useTheme,
  GlobalStyles,
  Spinner,
  ROUTES,
  BRAND,
} from './ui';

// TODO: Komponen halaman publik, layout utama, dan pengelolaan data/store
// akan dipisahkan dan di-import dari file main.jsx
import {
  useDataStore,
  AnimatedBackground,
  ScrollProgressBar,
  Navbar,
  Footer,
  FloatingWhatsApp,
  HomePage,
  AboutPage,
  ServicesPage,
  PortfolioPage,
  PortfolioDetailPage,
  PricingPage,
  TestimonialsPage,
  FaqPage,
  ContactPage,
} from './main';

// TODO: Modul admin dashboard akan dipisahkan dan di-import dari file admin.jsx
import AdminApp from './admin';

// =========================================
// MAIN APPLICATION
// =========================================

const LoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4">
    <div className="relative flex h-24 w-48 items-center justify-center animate-float">
      <img
        src={BRAND.logo}
        alt={`${BRAND.short} logo`}
        className="h-full w-full object-contain drop-shadow-xl"
      />
    </div>
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
      <Spinner className="h-4 w-4 text-[#1566D1]" /> Memuat Viska Labs...
    </div>
  </div>
);

const AppShell = () => {
  const { theme, toggleTheme } = useTheme();
  const { state, loading, crud, saveSettings } = useDataStore();
  const [route, setRoute] = useState(ROUTES.HOME);
  const [params, setParams] = useState({});

  const navigate = useCallback((nextRoute, nextParams = {}) => {
    setRoute(nextRoute);
    setParams(nextParams);
    if (typeof window !== 'undefined')
      window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const titles = {
      [ROUTES.HOME]: 'Beranda',
      [ROUTES.ABOUT]: 'Tentang Kami',
      [ROUTES.SERVICES]: 'Layanan',
      [ROUTES.PORTFOLIO]: 'Portfolio',
      [ROUTES.PRICING]: 'Harga',
      [ROUTES.TESTIMONIALS]: 'Testimoni',
      [ROUTES.FAQ]: 'FAQ',
      [ROUTES.CONTACT]: 'Kontak',
      [ROUTES.ADMIN]: 'Admin Panel',
    };
    document.title = `${
      state.site_settings.company_name || BRAND.name
    }`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      route === ROUTES.PORTFOLIO_DETAIL
        ? 'Jelajahi detail studi kasus dan portfolio proyek digital dari Viska Labs.'
        : state.site_settings.meta_description_default || BRAND.tagline;
  }, [
    route,
    state.site_settings.company_name,
    state.site_settings.meta_description_default,
  ]);

  const isAdmin = route === ROUTES.ADMIN;

  const publicPages = {
    [ROUTES.HOME]: <HomePage data={state} navigate={navigate} />,
    [ROUTES.ABOUT]: <AboutPage data={state} navigate={navigate} />,
    [ROUTES.SERVICES]: <ServicesPage data={state} navigate={navigate} />,
    [ROUTES.PORTFOLIO]: <PortfolioPage data={state} navigate={navigate} />,
    [ROUTES.PORTFOLIO_DETAIL]: (
      <PortfolioDetailPage data={state} navigate={navigate} params={params} />
    ),
    [ROUTES.PRICING]: <PricingPage data={state} navigate={navigate} />,
    [ROUTES.TESTIMONIALS]: (
      <TestimonialsPage data={state} navigate={navigate} />
    ),
    [ROUTES.FAQ]: <FaqPage data={state} navigate={navigate} />,
    [ROUTES.CONTACT]: <ContactPage data={state} crud={crud} />,
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-900 dark:text-white selection:bg-[#1566D1]/30">
      <GlobalStyles />
      <AnimatedBackground />
      <ScrollProgressBar />

      {loading ? (
        <LoadingScreen />
      ) : isAdmin ? (
        <AdminApp
          data={state}
          crud={crud}
          saveSettings={saveSettings}
          navigate={navigate}
        />
      ) : (
        <>
          <Navbar
            route={route}
            navigate={navigate}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <FloatingWhatsApp settings={state.site_settings} />
          <main>{publicPages[route] || publicPages[ROUTES.HOME]}</main>
          <Footer navigate={navigate} settings={state.site_settings} />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}