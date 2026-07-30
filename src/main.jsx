import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  Layers,
  Rocket,
  ShieldCheck,
  Gauge,
  Palette,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Plus,
  FolderKanban,
  Tag,
  MessageSquare,
  HelpCircle,
  Sun,
  Moon,
  ChevronDown,
  Check,
  ExternalLink,
  Building2,
  Calendar,
  Quote,
  Copy,
  Target,
  Lightbulb,
  Heart,
  Award,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

import {
  BRAND,
  ROUTES,
  NAV_LINKS,
  PORTFOLIO_CATEGORIES,
  SERVICE_INTEREST_OPTIONS,
  BUDGET_OPTIONS,
  SEED,
  deepClone,
  uid,
  formatPriceRange,
  formatDate,
  formatDateTime,
  isValidEmail,
  classNames,
  clamp,
  buildWhatsAppLink,
  copyToClipboard,
  formatSocialDisplay,
  formatSocialLink,
  useReveal,
  useCountUp,
  useScrollProgress,
  useToast,
  Reveal,
  Button,
  Badge,
  GlassCard,
  SectionHeading,
  StarRating,
  Field,
  inputClass,
  Input,
  Textarea,
  Select,
  EmptyState,
  ServiceIcon,
  Logo,
  Instagram,
  Linkedin,
  Github,
} from './ui';

import { SUPABASE_ENABLED, db } from './supabase';

// =========================================
// CUSTOM HOOK: DATA STORE
// =========================================

export const useDataStore = () => {
  const [state, setState] = useState({
    services: [],
    portfolios: [],
    pricing_packages: [],
    testimonials: [],
    leads: [],
    faq_items: [],
    team_members: [],
    site_settings: {},
  });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    if (!SUPABASE_ENABLED) {
      setState({
        services: deepClone(SEED.services),
        portfolios: deepClone(SEED.portfolios),
        pricing_packages: deepClone(SEED.pricing_packages),
        testimonials: deepClone(SEED.testimonials),
        leads: deepClone(SEED.leads),
        faq_items: deepClone(SEED.faq_items),
        team_members: deepClone(SEED.team_members),
        site_settings: deepClone(SEED.site_settings),
      });
      setLoading(false);
      return;
    }
    try {
      const [
        services,
        portfolios,
        pricing_packages,
        testimonials,
        leads,
        faq_items,
        team_members,
        site_settings,
      ] = await Promise.all([
        db.getServices(),
        db.getPortfolios(),
        db.getPricingPackages(),
        db.getTestimonials(),
        db.getLeads().catch(() => []),
        db.getFaqItems(),
        db.getTeamMembers(),
        db.getSiteSettings(),
      ]);
      setState({
        services,
        portfolios,
        pricing_packages,
        testimonials,
        leads,
        faq_items,
        team_members,
        site_settings: { ...deepClone(SEED.site_settings), ...site_settings },
      });
    } catch (err) {
      console.warn('Supabase load failed, using seed data:', err?.message);
      setState({
        services: deepClone(SEED.services),
        portfolios: deepClone(SEED.portfolios),
        pricing_packages: deepClone(SEED.pricing_packages),
        testimonials: deepClone(SEED.testimonials),
        leads: deepClone(SEED.leads),
        faq_items: deepClone(SEED.faq_items),
        team_members: deepClone(SEED.team_members),
        site_settings: deepClone(SEED.site_settings),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const localAdd = (key, record) =>
    setState((s) => ({ ...s, [key]: [...s[key], record] }));
  const localUpdate = (key, id, patch) =>
    setState((s) => ({
      ...s,
      [key]: s[key].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  const localRemove = (key, id) =>
    setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id) }));

  const makeCrud = (key, remoteCreate, remoteUpdate, remoteDelete) => ({
    async create(data) {
      const payload = {
        id: data.id || uid(),
        created_at: data.created_at || new Date().toISOString(),
        ...data,
      };

      if (SUPABASE_ENABLED) {
        const created = await remoteCreate(payload);
        localAdd(key, created);
        return created;
      }
      localAdd(key, payload);
      return payload;
    },
    async update(id, data) {
      if (SUPABASE_ENABLED) {
        const updated = await remoteUpdate(id, data);
        localUpdate(key, id, updated);
        return updated;
      }
      localUpdate(key, id, data);
      return { id, ...data };
    },
    async remove(id) {
      if (SUPABASE_ENABLED) {
        await remoteDelete(id);
        localRemove(key, id);
        return true;
      }
      localRemove(key, id);
      return true;
    },
  });

  const crud = useMemo(
    () => ({
      portfolios: makeCrud('portfolios', db.createPortfolio, db.updatePortfolio, db.deletePortfolio),
      services: makeCrud('services', db.createService, db.updateService, db.deleteService),
      pricing_packages: makeCrud('pricing_packages', db.createPricingPackage, db.updatePricingPackage, db.deletePricingPackage),
      testimonials: makeCrud('testimonials', db.createTestimonial, db.updateTestimonial, db.deleteTestimonial),
      leads: makeCrud('leads', db.createLead, db.updateLead, db.deleteLead),
      faq_items: makeCrud('faq_items', db.createFaqItem, db.updateFaqItem, db.deleteFaqItem),
      team_members: makeCrud('team_members', db.createTeamMember, db.updateTeamMember, db.deleteTeamMember),
    }),
    []
  );

  const saveSettings = useCallback(async (settingsObj) => {
    if (SUPABASE_ENABLED) {
      await db.upsertSiteSettings(settingsObj);
    }
    setState((s) => ({
      ...s,
      site_settings: { ...s.site_settings, ...settingsObj },
    }));
  }, []);

  return { state, loading, crud, saveSettings, reload: loadAll };
};

// =========================================
// SHARED LAYOUT COMPONENTS
// =========================================

export const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#051C48] dark:bg-[#051C48]">
    <div className="absolute inset-0 bg-white dark:bg-[#051C48] transition-colors duration-500" />
    <div
      className="absolute inset-0 opacity-70 dark:opacity-100 animate-gradient-pan"
      style={{
        background:
          'radial-gradient(40% 50% at 20% 20%, rgba(21,102,209,0.30), transparent), radial-gradient(40% 50% at 80% 10%, rgba(18,70,145,0.30), transparent), radial-gradient(50% 60% at 60% 90%, rgba(11,47,107,0.35), transparent)',
      }}
    />
    <div className="absolute top-[-10%] left-[-5%] h-72 w-72 rounded-full bg-[#1566D1]/30 blur-3xl animate-blob will-change-transform" />
    <div className="absolute top-[20%] right-[-8%] h-80 w-80 rounded-full bg-[#124691]/30 blur-3xl animate-blob animation-delay-2000 will-change-transform" />
    <div className="absolute bottom-[-10%] left-[30%] h-96 w-96 rounded-full bg-[#0B2F6B]/30 blur-3xl animate-blob animation-delay-4000 will-change-transform" />
    <div
      className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(21,102,209,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(21,102,209,0.6) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

export const ScrollProgressBar = () => {
  const progress = useScrollProgress();
  return (
    <div className="fixed left-0 top-0 z-[90] h-0.5 w-full bg-transparent">
      <div
        className="h-full w-full bg-gradient-to-r from-[#1566D1] via-[#5b9bf0] to-[#124691] origin-left will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

 

export const Navbar = ({ route, navigate, theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (r) => {
    navigate(r);
    setOpen(false);
  };
  return (
    <header
      className={classNames(
        'fixed inset-x-0 top-0 z-[80] transition-all duration-500',
        scrolled ? 'py-2.5' : 'py-4'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={classNames(
            'flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500',
            scrolled
              ? 'glass dark:glass glass-light shadow-lg shadow-black/5'
              : 'bg-transparent'
          )}
        >
          <Logo onClick={() => go(ROUTES.HOME)} />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.route}
                onClick={() => go(link.route)}
                className={classNames(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  route === link.route
                    ? 'text-[#1566D1] dark:text-white'
                    : 'text-slate-600 hover:text-[#1566D1] dark:text-slate-300 dark:hover:text-white'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(ROUTES.ADMIN)}
              className="hidden sm:inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-300 dark:hover:text-[#7fb0f5]"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-500/10 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => go(ROUTES.CONTACT)}
              icon={ArrowRight}
            >
              Hubungi Kami
            </Button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-500/10 dark:text-white lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <>
            <div
              className="fixed inset-0 -z-10 bg-slate-900/20 backdrop-blur-sm dark:bg-[#051C48]/40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="mt-2 rounded-2xl glass dark:glass glass-light p-3 lg:hidden max-h-[75vh] overflow-y-auto overscroll-contain">
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.route}
                    onClick={() => go(link.route)}
                    className={classNames(
                      'rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors',
                      route === link.route
                        ? 'bg-[#1566D1]/10 text-[#1566D1] dark:text-white'
                        : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-300'
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  className="mt-2"
                  onClick={() => go(ROUTES.CONTACT)}
                  icon={ArrowRight}
                >
                  Hubungi Kami
                </Button>
                <div className="mt-4 border-t border-slate-200/60 dark:border-white/10 pt-4">
                  <button
                    onClick={() => go(ROUTES.ADMIN)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-500/10 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-300 dark:hover:text-white"
                  >
                    <ShieldCheck className="h-5 w-5" /> Akses Admin
                  </button>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export const Footer = ({ navigate, settings }) => (
  <footer className="relative mt-24 border-t border-white/10 bg-[#051C48] text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo light onClick={() => navigate(ROUTES.HOME)} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            {settings.company_tagline || BRAND.tagline}. Kami merancang
            pengalaman digital premium untuk bisnis, startup, dan organisasi di
            Indonesia.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              {
                icon: Instagram,
                url: settings.instagram_url,
                fallback: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                ),
              },
              {
                icon: Linkedin,
                url: settings.linkedin_url,
                fallback: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                ),
              },
              {
                icon: Github,
                url: settings.github_url,
                fallback: (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                ),
              },
            ].map(({ icon: Icon, url, fallback }, i) => (
              <a
                key={i}
                href={url || '#'}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition hover:border-[#1566D1] hover:bg-[#1566D1]/20 hover:text-white"
              >
                {Icon ? <Icon className="h-4 w-4" /> : fallback}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Navigasi
          </h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="text-slate-400 transition hover:text-[#1566D1]"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Layanan
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              'Website Development',
              'Web Application',
              'Mobile App',
              'UI/UX Design',
              'Sistem Informasi',
            ].map((s) => (
              <li key={s}>
                <button
                  onClick={() => navigate(ROUTES.SERVICES)}
                  className="text-slate-400 transition hover:text-[#1566D1]"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            Kontak
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li>
              <a
                href={`mailto:${settings.contact_email || BRAND.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                {Mail && <Mail className="h-4 w-4 text-[#5b9bf0]" />}
                {settings.contact_email || BRAND.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:+${(
                  settings.whatsapp_number || BRAND.whatsapp
                ).replace(/\D/g, '')}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                {Phone && <Phone className="h-4 w-4 text-[#5b9bf0]" />} +
                {settings.whatsapp_number || BRAND.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              {MapPin && <MapPin className="h-4 w-4 text-[#1566D1]" />}
              {settings.address || BRAND.address}
            </li>
            <li className="flex items-center gap-2.5">
              {Clock && <Clock className="h-4 w-4 text-[#1566D1]" />}
              {settings.operating_hours || BRAND.hours}
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {settings.company_name || BRAND.name}.
          Seluruh hak cipta dilindungi.
        </p>
        <button
          onClick={() => navigate(ROUTES.ADMIN)}
          className="flex items-center gap-1.5 text-slate-400 transition hover:text-white"
        >
          {ShieldCheck && <ShieldCheck className="h-4 w-4" />} Admin Panel
        </button>
      </div>
    </div>
  </footer>
);

export const FloatingWhatsApp = ({ settings }) => (
  <div className="fixed bottom-5 left-5 z-[85] animate-float">
    <a
      href={buildWhatsAppLink(settings.whatsapp_number)}
      target="_blank"
      rel="noreferrer"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 transition-transform duration-300 hover:scale-110"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  </div>
);

// =========================================
// HOMEPAGE SECTIONS
// =========================================

const StatItem = ({ end, suffix, label, start }) => {
  const value = useCountUp(end, { start });
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold text-white sm:text-5xl">
        {value}
        <span className="bg-gradient-to-r from-[#5b9bf0] to-[#bae6fd] bg-clip-text text-transparent">
          {suffix}
        </span>
      </p>
      <p className="mt-2 text-sm font-medium text-slate-300">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const stats = [
    { end: 120, suffix: '+', label: 'Proyek Selesai' },
    { end: 95, suffix: '+', label: 'Klien Puas' },
    { end: 7, suffix: ' th', label: 'Pengalaman' },
    { end: 5, suffix: '.0', label: 'Rating Rata-rata' },
  ];
  return (
    <section ref={ref} className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B2F6B] to-[#051C48] p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} start={visible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroSection = ({ navigate }) => {
  const progress = useScrollProgress();
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-28 pb-16">
      <div
        className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#1566D1]/20 blur-3xl will-change-transform"
        style={{ transform: `translate(-50%, ${progress * 120}px)` }}
      />
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <Badge variant="glass" className="mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Creative Technology Agency · Indonesia
          </Badge>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl">
            Solusi Digital{' '}
            <span className="relative whitespace-nowrap">
              <span className="gradient-text">Profesional</span>
            </span>{' '}
            untuk Bisnis Anda
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Kami merancang website, aplikasi, dan sistem informasi yang cepat,
            indah, dan mengkonversi — menggabungkan rekayasa multimedia,
            creative technology, dan desain interaktif kelas dunia.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-9 mx-auto flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
              icon={Layers}
            >
              Lihat Portfolio
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate(ROUTES.CONTACT)}
              icon={Send}
            >
              Hubungi Kami
            </Button>
          </div>
        </Reveal>
        <Reveal delay={420}>
          <div className="mt-14 flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs uppercase tracking-widest">
              Scroll untuk menjelajah
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const TechMarquee = () => {
  const items = [
    'React', 'Next.js', 'Supabase', 'Tailwind', 'TypeScript', 'Framer Motion',
    'PostgreSQL', 'Node.js', 'Figma', 'WebGL', 'GSAP', 'Vercel',
  ];
  const doubled = [...items, ...items];
  return (
    <section className="relative overflow-hidden border-y border-white/10 py-6">
      <div className="flex w-max animate-marquee gap-12 px-6">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            <Sparkles className="h-4 w-4 text-[#1566D1]" /> {t}
          </span>
        ))}
      </div>
    </section>
  );
};

const ServiceCard = ({ service, navigate, delay }) => (
  <Reveal delay={delay}>
    <GlassCard className="group h-full">
      <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-[#1566D1] to-[#0B2F6B] p-3.5 text-white shadow-lg shadow-[#1566D1]/30 transition group-hover:scale-110">
        <ServiceIcon name={service.icon_name} className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {service.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {service.short_description}
      </p>
      <button
        onClick={() => navigate(ROUTES.SERVICES)}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1566D1] transition group-hover:gap-2.5"
      >
        Pelajari lebih lanjut <ArrowRight className="h-4 w-4" />
      </button>
    </GlassCard>
  </Reveal>
);

const ServicesPreview = ({ services, navigate }) => (
  <section className="relative py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Layanan Kami"
        title="Kapabilitas Digital End-to-End"
        description="Dari ide hingga peluncuran, kami menangani setiap lapisan rekayasa multimedia dan creative technology."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((s, i) => (
          <ServiceCard key={s.id} service={s} navigate={navigate} delay={i * 80} />
        ))}
      </div>
    </div>
  </section>
);

const PortfolioCard = ({ item, navigate, delay }) => {
  const isMobileApp = item.category === 'Mobile App';
  return (
    <Reveal delay={delay}>
      <button
        onClick={() => navigate(ROUTES.PORTFOLIO_DETAIL, { slug: item.slug })}
        className="group relative block h-fit w-full overflow-hidden rounded-2xl border border-white/10 text-left"
      >
        <div
          className={classNames(
            'w-full overflow-hidden bg-slate-800',
            isMobileApp ? 'aspect-[9/16]' : 'aspect-video'
          )}
        >
          <img
            src={item.thumbnail_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#051C48] via-[#051C48]/40 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <Badge variant="glass" className="mb-2">
            {item.category}
          </Badge>
          <h3 className="text-lg font-bold text-white">{item.title}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-slate-300">
            {item.client_name}
          </p>
          <span className="mt-3 inline-flex translate-y-2 items-center gap-1.5 text-sm font-semibold text-[#7fb0f5] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Lihat Detail <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </button>
    </Reveal>
  );
};

const PortfolioHighlights = ({ portfolios, navigate }) => {
  const featured = portfolios.filter((p) => p.is_published && p.is_featured).slice(0, 4);
  const items = featured.length ? featured : portfolios.filter((p) => p.is_published).slice(0, 4);
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            center={false}
            eyebrow="Portfolio Terbaik"
            title="Karya yang Berbicara"
            description="Setiap proyek adalah perpaduan estetika, performa, dan dampak bisnis nyata."
          />
          <Reveal>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
              icon={ArrowRight}
            >
              Semua Proyek
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 columns-1 gap-6 sm:columns-2">
          {items.map((p, i) => (
            <div key={p.id} className="mb-6 break-inside-avoid block w-full">
              <PortfolioCard item={p} navigate={navigate} delay={i * 80} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Rocket,
      title: 'Pengiriman Cepat',
      desc: 'Metodologi agile yang teruji untuk meluncurkan produk tepat waktu tanpa kompromi kualitas.',
    },
    {
      icon: Gauge,
      title: 'Performa Kelas Dunia',
      desc: 'Core Web Vitals hijau, skor PageSpeed 90+, dan pengalaman yang mulus di setiap perangkat.',
    },
    {
      icon: Palette,
      title: 'Desain Premium',
      desc: 'Estetika Apple-level dan interaksi Framer-inspired yang membuat brand Anda menonjol.',
    },
    {
      icon: ShieldCheck,
      title: 'Aman & Skalabel',
      desc: 'Arsitektur cloud-native dengan keamanan berlapis dan kesiapan untuk tumbuh.',
    },
  ];
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Mengapa Viska Labs"
          title="Partner Teknologi yang Bisa Diandalkan"
          description="Kami bukan sekadar vendor — kami mitra strategis yang berinvestasi pada kesuksesan digital Anda."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <GlassCard className="h-full text-center">
                <div className="mx-auto mb-5 inline-flex rounded-2xl bg-[#1566D1]/15 p-4 text-[#1566D1]">
                  <r.icon className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {r.desc}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCarousel = ({ testimonials }) => {
  const approved = testimonials.filter((t) => t.status === 'approved');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || approved.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % approved.length), 5000);
    return () => clearInterval(timer);
  }, [paused, approved.length]);
  if (!approved.length) return null;
  const active = approved[index];
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading eyebrow="Testimoni Klien" title="Dipercaya oleh Para Visioner" />
        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <GlassCard hover={false} className="text-center sm:p-10">
            <Quote className="mx-auto mb-5 h-10 w-10 text-[#1566D1]/40" />
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-100 sm:text-xl">
              “{active.content}”
            </p>
            <div className="mt-7 flex flex-col items-center gap-3">
              {active.client_photo_url && (
                <img
                  src={active.client_photo_url}
                  alt={active.client_name}
                  className="h-14 w-14 rounded-full border-2 border-[#1566D1]/40 object-cover"
                />
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {active.client_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {active.client_title}
                  {active.client_company ? `, ${active.client_company}` : ''}
                </p>
              </div>
              <StarRating value={active.rating} />
            </div>
          </GlassCard>
          <div className="mt-6 flex items-center justify-center gap-1">
            {approved.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="p-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] rounded-full"
                aria-label={`Lihat testimoni ${i + 1}`}
              >
                <span
                  className={classNames(
                    'block h-2 rounded-full transition-all duration-300',
                    i === index ? 'w-8 bg-[#1566D1]' : 'w-2 bg-slate-400/40'
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const CtaSection = ({ navigate }) => (
  <section className="relative py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1566D1] via-[#124691] to-[#0B2F6B] p-10 text-center sm:p-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-blob" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-blob animation-delay-2000" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-extrabold text-white sm:text-5xl">
              Siap Mulai Proyek Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-100 sm:text-lg">
              Mari wujudkan ide Anda menjadi pengalaman digital yang luar biasa.
              Konsultasi gratis, tanpa komitmen.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" onClick={() => navigate(ROUTES.CONTACT)} icon={Send}>
                Mulai Diskusi
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white" onClick={() => navigate(ROUTES.PRICING)} icon={Tag}>
                Lihat Harga
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export const HomePage = ({ data, navigate }) => (
  <>
    <HeroSection navigate={navigate} />
    <TechMarquee />
    <StatsSection />
    <ServicesPreview services={data.services.filter((s) => s.is_active)} navigate={navigate} />
    <PortfolioHighlights portfolios={data.portfolios} navigate={navigate} />
    <WhyChooseUs />
    <TestimonialCarousel testimonials={data.testimonials} />
    <CtaSection navigate={navigate} />
  </>
);

const PageHero = ({ eyebrow, title, description }) => (
  <section className="relative pt-36 pb-12 sm:pt-44">
    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
    </div>
  </section>
);

export const AboutPage = ({ data, navigate }) => {
  const team = data.team_members.filter((m) => m.is_active);
  const values = [
    {
      icon: Target,
      title: 'Berorientasi Hasil',
      desc: 'Setiap keputusan desain dan teknis kami ukur dampaknya terhadap bisnis Anda.',
    },
    {
      icon: Lightbulb,
      title: 'Inovatif',
      desc: 'Kami terus mengeksplorasi teknologi terbaru untuk solusi yang relevan dan masa depan.',
    },
    {
      icon: Heart,
      title: 'Berdedikasi',
      desc: 'Kami memperlakukan setiap proyek seperti produk kami sendiri.',
    },
    {
      icon: Award,
      title: 'Berkualitas',
      desc: 'Standar tinggi pada kode, desain, dan pengalaman pengguna tanpa kompromi.',
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Tentang Kami"
        title="Tentang Viska Labs Indonesia"
        description="Kami adalah creative technology agency yang membantu bisnis bertransformasi melalui rekayasa multimedia dan inovasi digital."
      />
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <GlassCard hover={false} className="h-full">
              <div className="mb-4 inline-flex rounded-2xl bg-[#1566D1]/15 p-3 text-[#1566D1]">
                {Target ? <Target className="h-6 w-6" /> : <Boxes className="h-6 w-6" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Visi Kami</h3>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                Menjadi mitra creative technology terdepan di Indonesia yang
                memberdayakan bisnis dari segala skala untuk berkembang di era
                digital melalui produk yang indah, cepat, dan bermakna.
              </p>
            </GlassCard>
          </Reveal>
          <Reveal delay={120}>
            <GlassCard hover={false} className="h-full">
              <div className="mb-4 inline-flex rounded-2xl bg-[#1566D1]/15 p-3 text-[#1566D1]">
                {Rocket ? <Rocket className="h-6 w-6" /> : <Boxes className="h-6 w-6" />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Misi Kami</h3>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                Menghadirkan solusi digital berkualitas enterprise dengan harga
                yang terjangkau, mengutamakan performa, keamanan, dan pengalaman
                pengguna pada setiap proyek yang kami kerjakan.
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Nilai Perusahaan" title="Prinsip yang Kami Pegang" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon || Boxes;
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <GlassCard className="h-full text-center">
                    <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-[#1566D1] to-[#0B2F6B] p-3.5 text-white">
                      {Icon ? <Icon className="h-6 w-6" /> : <Boxes className="h-6 w-6" />}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{v.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{v.desc}</p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Tim Kami"
            title="Orang-orang di Balik Viska Labs"
            description="Tim multidisiplin yang menggabungkan keahlian engineering, desain, dan strategi produk."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <GlassCard className="group h-full text-center">
                  <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-2xl">
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="text-sm font-medium text-[#1566D1]">{m.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {m.bio}
                  </p>
                  <div className="mt-4 flex flex-col items-center justify-center gap-2">
                    {m.instagram_url && (
                      <a
                        href={formatSocialLink(m.instagram_url, 'instagram')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full max-w-[160px] items-center justify-center gap-2 rounded-xl bg-slate-500/5 px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-pink-500/10 hover:text-pink-500 dark:text-slate-400"
                      >
                        {Instagram ? <Instagram className="h-4 w-4 flex-shrink-0" /> : <span />}
                        <span className="truncate">{formatSocialDisplay(m.instagram_url)}</span>
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a
                        href={formatSocialLink(m.linkedin_url, 'linkedin')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full max-w-[160px] items-center justify-center gap-2 rounded-xl bg-slate-500/5 px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-400"
                      >
                        {Linkedin ? <Linkedin className="h-4 w-4 flex-shrink-0" /> : <span />}
                        <span className="truncate">{formatSocialDisplay(m.linkedin_url)}</span>
                      </a>
                    )}
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CtaSection navigate={navigate} />
    </>
  );
};

export const ServicesPage = ({ data, navigate }) => {
  const services = data.services.filter((s) => s.is_active);
  return (
    <>
      <PageHero
        eyebrow="Layanan"
        title="Layanan Digital Viska Labs Indonesia"
        description="Solusi lengkap untuk setiap tahap perjalanan digital bisnis Anda."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80}>
              <GlassCard className="grid gap-6 md:grid-cols-3" hover={false}>
                <div className="flex flex-col items-start">
                  <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-[#1566D1] to-[#0B2F6B] p-4 text-white shadow-lg shadow-[#1566D1]/30">
                    <ServiceIcon name={s.icon_name} className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {s.short_description}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {s.full_description}
                  </p>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {(s.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
                        <span className="inline-flex rounded-full bg-emerald-500/15 p-1 text-emerald-500">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex gap-3">
                    <Button size="sm" onClick={() => navigate(ROUTES.PRICING)} icon={Tag}>
                      Lihat Harga
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.CONTACT)}>
                      Konsultasi
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaSection navigate={navigate} />
    </>
  );
};

export const PortfolioPage = ({ data, navigate }) => {
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const published = data.portfolios.filter((p) => p.is_published);
  const filtered = useMemo(() => {
    return published.filter((p) => {
      const matchCat = category === 'Semua' || p.category === category;
      const q = debounced.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.client_name || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [published, category, debounced]);

  const visible = filtered.slice(0, visibleCount);
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Portfolio Proyek Viska Labs Indonesia"
        description="Jelajahi karya digital terbaik kami untuk klien di seluruh Indonesia."
      />
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="sticky top-20 z-30 flex flex-col gap-4 rounded-2xl glass dark:glass glass-light p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setVisibleCount(6);
                  }}
                  className={classNames(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                    category === c
                      ? 'bg-[#1566D1] text-white shadow-md shadow-[#1566D1]/30'
                      : 'bg-slate-500/10 text-slate-600 hover:bg-[#1566D1]/15 dark:text-slate-300'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari proyek atau klien..."
                className={classNames(inputClass, 'pl-10')}
              />
            </div>
          </div>

          {visible.length ? (
            <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {visible.map((p, i) => (
                <div key={p.id} className="mb-6 break-inside-avoid block w-full">
                  <PortfolioCard item={p} navigate={navigate} delay={(i % 3) * 80} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                icon={Search}
                title="Tidak ada proyek ditemukan"
                description="Coba kategori atau kata kunci lain."
              />
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={() => setVisibleCount((c) => c + 6)} icon={Plus}>
                Muat Lebih Banyak
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export const PortfolioDetailPage = ({ data, navigate, params }) => {
  const item = data.portfolios.find((p) => p.slug === params?.slug);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    setActiveImage(0);
  }, [params?.slug]);

  if (!item) {
    return (
      <section className="pt-44 pb-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <EmptyState
            icon={FolderKanban}
            title="Proyek tidak ditemukan"
            description="Proyek yang Anda cari mungkin sudah dipindahkan atau dihapus."
            action={
              <Button onClick={() => navigate(ROUTES.PORTFOLIO)} icon={ArrowLeft}>
                Kembali ke Portfolio
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  const gallery = [item.thumbnail_url, ...(Array.isArray(item.images) ? item.images : [])].filter(Boolean);
  const related = data.portfolios
    .filter((p) => p.is_published && p.id !== item.id && p.category === item.category)
    .slice(0, 3);

  return (
    <>
      <section className="pt-36 pb-12 sm:pt-44">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <button
            onClick={() => navigate(ROUTES.PORTFOLIO)}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition hover:text-[#1566D1] dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Portfolio
          </button>
          <Reveal>
            <Badge className="mb-4">{item.category}</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {item.short_description}
            </p>
          </Reveal>
        </div>
      </section>
      <section className="pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div
              className="mx-auto overflow-hidden rounded-2xl border border-white/10"
              style={{ maxWidth: item.category === 'Mobile App' ? '360px' : '100%' }}
            >
              <img
                src={gallery[activeImage]}
                alt={item.title}
                className={classNames(
                  'w-full object-cover',
                  item.category === 'Mobile App' ? 'aspect-[9/16]' : 'aspect-video'
                )}
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={classNames(
                      'h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300',
                      i === activeImage
                        ? 'border-[#1566D1] scale-95 shadow-lg shadow-[#1566D1]/20 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>
      <section className="pb-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tentang Proyek</h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {item.full_description}
            </p>
          </div>
          <aside>
            <GlassCard hover={false}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detail
              </h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-[#1566D1]" />
                  <span className="text-slate-700 dark:text-slate-200">{item.client_name || '-'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-[#1566D1]" />
                  <span className="text-slate-700 dark:text-slate-200">{formatDate(item.completed_at)}</span>
                </div>
                {item.project_url && (
                  <a
                    href={item.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-[#1566D1] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Kunjungi Proyek
                  </a>
                )}
              </dl>
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tech Stack
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.tech_stack || []).map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-[#1566D1]/10 px-2.5 py-1 font-mono text-xs text-[#1566D1]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Button className="mt-6 w-full" onClick={() => navigate(ROUTES.CONTACT)} icon={Send}>
                Proyek Serupa? Hubungi Kami
              </Button>
            </GlassCard>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Proyek Terkait</h2>
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {related.map((p, i) => (
                <div key={p.id} className="mb-6 break-inside-avoid block w-full">
                  <PortfolioCard item={p} navigate={navigate} delay={i * 80} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export const PricingPage = ({ data, navigate }) => {
  const packages = data.pricing_packages.filter((p) => p.is_active);
  return (
    <>
      <PageHero
        eyebrow="Harga"
        title="Harga Layanan Digital Viska Labs"
        description="Transparan dan fleksibel. Pilih paket yang sesuai, atau hubungi kami untuk solusi custom."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 100}>
                <div
                  className={classNames(
                    'relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500',
                    pkg.is_highlighted
                      ? 'border-[#1566D1] bg-gradient-to-br from-[#0B2F6B] to-[#051C48] text-white shadow-2xl shadow-[#1566D1]/30 lg:-translate-y-3'
                      : 'glass dark:glass glass-light hover:-translate-y-1.5'
                  )}
                >
                  {pkg.is_highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-[#d2fc01] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0641e3] shadow-lg shadow-[#d2fc01]/30 border border-[#0641e3]/10 whitespace-nowrap">
                      Paling Populer
                    </span>
                  )}
                  <h3
                    className={classNames(
                      'text-lg font-bold',
                      pkg.is_highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                    )}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={classNames(
                      'mt-3 text-2xl font-extrabold sm:text-3xl',
                      pkg.is_highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                    )}
                  >
                    {formatPriceRange(pkg)}
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {(pkg.features || []).map((f, idx) => (
                      <li
                        key={idx}
                        className={classNames(
                          'flex items-start gap-2.5 text-sm',
                          !f.is_included && 'opacity-40'
                        )}
                      >
                        <span
                          className={classNames(
                            'mt-0.5 inline-flex rounded-full p-0.5',
                            f.is_included
                              ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                              : 'bg-slate-500/20 text-slate-400 dark:text-slate-300'
                          )}
                        >
                          {f.is_included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        </span>
                        <span
                          className={
                            pkg.is_highlighted ? 'text-slate-100' : 'text-slate-700 dark:text-slate-200'
                          }
                        >
                          {f.feature_text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-7 w-full"
                    variant={pkg.is_highlighted ? 'primary' : 'outline'}
                    onClick={() => navigate(ROUTES.CONTACT)}
                    icon={ArrowRight}
                  >
                    {pkg.cta_label || 'Konsultasi Gratis'}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Butuh sesuatu yang berbeda?{' '}
              <button
                onClick={() => navigate(ROUTES.CONTACT)}
                className="font-semibold text-[#1566D1] hover:underline"
              >
                Diskusikan kebutuhan custom Anda →
              </button>
            </p>
          </Reveal>
        </div>
      </section>
      <FaqSection
        items={data.faq_items.filter((f) => f.category === 'Pricing')}
        title="Pertanyaan Seputar Harga"
      />
      <CtaSection navigate={navigate} />
    </>
  );
};

export const TestimonialsPage = ({ data, navigate }) => {
  const approved = data.testimonials.filter((t) => t.status === 'approved');
  return (
    <>
      <PageHero
        eyebrow="Testimoni"
        title="Apa Kata Klien Kami"
        description="Kepercayaan klien adalah pencapaian terbesar kami. Inilah cerita mereka."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {approved.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approved.map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 80}>
                  <GlassCard className="flex h-full flex-col">
                    <Quote className="h-8 w-8 text-[#1566D1]/40" />
                    <p className="mt-3 flex-1 leading-relaxed text-slate-700 dark:text-slate-200">
                      “{t.content}”
                    </p>
                    <div className="mt-5 flex items-center gap-3 border-t border-slate-200/60 dark:border-white/10 pt-4">
                      {t.client_photo_url && (
                        <img
                          src={t.client_photo_url}
                          alt={t.client_name}
                          loading="lazy"
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{t.client_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.client_title}
                          {t.client_company ? `, ${t.client_company}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <StarRating value={t.rating} />
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Belum ada testimoni"
              description="Testimoni klien akan ditampilkan di sini."
            />
          )}
        </div>
      </section>
      <CtaSection navigate={navigate} />
    </>
  );
};

const FaqAccordionItem = ({ item, open, onToggle }) => (
  <div className="overflow-hidden rounded-2xl glass dark:glass glass-light transition">
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 p-5 text-left outline-none focus-visible:bg-[#1566D1]/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1566D1] transition-colors"
    >
      <span className="font-semibold text-slate-900 dark:text-white">{item.question}</span>
      <ChevronDown
        className={classNames(
          'h-5 w-5 flex-shrink-0 text-[#1566D1] transition-transform',
          open && 'rotate-180'
        )}
      />
    </button>
    <div
      className={classNames(
        'grid transition-all duration-300 ease-in-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <p className="px-5 pb-5 leading-relaxed text-slate-600 dark:text-slate-300">{item.answer}</p>
      </div>
    </div>
  </div>
);

export const FaqSection = ({ items, title }) => {
  const [openId, setOpenId] = useState(null);
  if (!items?.length) return null;
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {title && (
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() => setOpenId((id) => (id === item.id ? null : item.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export const FaqPage = ({ data, navigate }) => {
  const published = data.faq_items.filter((f) => f.is_published);
  const categories = [
    'Semua',
    ...Array.from(new Set(published.map((f) => f.category).filter(Boolean))),
  ];
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const filtered = published.filter((f) => {
    const matchCat = category === 'Semua' || f.category === category;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Pertanyaan yang Sering Diajukan"
        description="Temukan jawaban cepat atas pertanyaan umum tentang layanan kami."
      />
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan..."
              className={classNames(inputClass, 'pl-10')}
            />
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={classNames(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  category === c
                    ? 'bg-[#1566D1] text-white'
                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-[#1566D1]/15'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div className="space-y-3">
              {filtered.map((item) => (
                <FaqAccordionItem
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() => setOpenId((id) => (id === item.id ? null : item.id))}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon={HelpCircle} title="Tidak ada pertanyaan ditemukan" />
          )}
        </div>
      </section>
      <CtaSection navigate={navigate} />
    </>
  );
};

export const ContactPage = ({ data, crud }) => {
  const toast = useToast();
  const settings = data.site_settings;
  const empty = {
    full_name: '',
    email: '',
    whatsapp: '',
    company: '',
    service_interest: '',
    budget_range: '',
    message: '',
  };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!isValidEmail(form.email)) e.email = 'Format email tidak valid';
    if (!form.message.trim()) e.message = 'Pesan wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await crud.leads.create({
        ...form,
        status: 'new',
        source_page: 'contact',
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
      setForm(empty);
      toast?.success('Pesan berhasil terkirim! Kami akan segera menghubungi Anda.');
    } catch {
      toast?.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: 'Email',
      value: settings.contact_email || BRAND.email,
      copy: settings.contact_email || BRAND.email,
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: `+${settings.whatsapp_number || BRAND.whatsapp}`,
      copy: settings.whatsapp_number || BRAND.whatsapp,
    },
    { icon: MapPin, label: 'Alamat', value: settings.address || BRAND.address },
    {
      icon: Clock,
      label: 'Jam Operasional',
      value: settings.operating_hours || BRAND.hours,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title="Mari Mulai Percakapan"
        description="Ceritakan kebutuhan Anda dan tim kami akan merespons dalam 1×24 jam."
      />
      <section className="py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="space-y-4">
                {contactItems.map((c) => (
                  <GlassCard key={c.label} hover={false} className="flex items-center gap-4 !p-5">
                    <div className="inline-flex rounded-xl bg-[#1566D1]/15 p-3 text-[#1566D1]">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {c.label}
                      </p>
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{c.value}</p>
                    </div>
                    {c.copy && (
                      <button
                        onClick={async () => {
                          (await copyToClipboard(c.copy)) && toast?.info('Disalin ke clipboard');
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:text-[#1566D1]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    )}
                  </GlassCard>
                ))}
                <a
                  href={buildWhatsAppLink(settings.whatsapp_number)}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button className="w-full" variant="success" icon={MessageCircle}>
                    Chat via WhatsApp
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-3">
            <Reveal delay={120}>
              <GlassCard hover={false}>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/15 p-4 text-emerald-500">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terima Kasih!</h3>
                    <p className="mt-2 max-w-sm text-slate-600 dark:text-slate-300">
                      Pesan Anda sudah kami terima. Tim Viska Labs akan segera menghubungi Anda.
                    </p>
                    <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>
                      Kirim Pesan Lain
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <fieldset disabled={submitting} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nama Lengkap" required error={errors.full_name}>
                          <Input
                            value={form.full_name}
                            onChange={(e) => setField('full_name', e.target.value)}
                            placeholder="Nama Anda"
                          />
                        </Field>
                        <Field label="Email" required error={errors.email}>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setField('email', e.target.value)}
                            placeholder="email@contoh.com"
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="WhatsApp">
                          <Input
                            type="tel"
                            inputMode="numeric"
                            value={form.whatsapp}
                            onChange={(e) => setField('whatsapp', e.target.value)}
                            placeholder="0812xxxx"
                          />
                        </Field>
                        <Field label="Perusahaan / Organisasi">
                          <Input
                            value={form.company}
                            onChange={(e) => setField('company', e.target.value)}
                            placeholder="Opsional"
                          />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Layanan Diminati">
                          <Select
                            value={form.service_interest}
                            onChange={(e) => setField('service_interest', e.target.value)}
                          >
                            <option value="" disabled>
                              Pilih layanan
                            </option>
                            {SERVICE_INTEREST_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Estimasi Anggaran">
                          <Select
                            value={form.budget_range}
                            onChange={(e) => setField('budget_range', e.target.value)}
                          >
                            <option value="" disabled>
                              Pilih anggaran
                            </option>
                            {BUDGET_OPTIONS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </Select>
                        </Field>
                      </div>
                      <Field label="Pesan" required error={errors.message}>
                        <Textarea
                          rows={5}
                          value={form.message}
                          onChange={(e) => setField('message', e.target.value)}
                          placeholder="Ceritakan tentang proyek Anda..."
                        />
                      </Field>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={submitting}
                        icon={submitting ? undefined : Send}
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                      </Button>
                    </fieldset>
                  </form>
                )}
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
};