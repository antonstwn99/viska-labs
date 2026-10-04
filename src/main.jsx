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
  <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#030F26] transition-colors duration-500">
    {/* Tech-vibe ambient glow - disesuaikan dengan warna logo (Biru gelap ke biru terang) */}
    <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#1566D1]/10 dark:bg-[#1566D1]/20 blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#051C48]/5 dark:bg-[#1566D1]/10 blur-[150px] pointer-events-none" />
    
    {/* Subtle grid layer untuk nuansa teknologi modern */}
    <div 
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(21,102,209,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(21,102,209,0.8) 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }}
    />
  </div>
);

export const ScrollProgressBar = () => {
  const progress = useScrollProgress();
  return (
    <div className="fixed left-0 top-0 z-[90] h-1 w-full bg-transparent">
      <div
        className="h-full w-full bg-gradient-to-r from-[#1566D1] to-[#7fb0f5] origin-left will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

export const Navbar = ({ route, navigate, theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
        'fixed inset-x-0 top-0 z-[80] transition-all duration-300',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={classNames(
            'flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 border',
            scrolled
              ? 'glass dark:glass shadow-lg'
              : 'bg-white/50 dark:bg-[#030F26]/30 border-transparent backdrop-blur-md'
          )}
        >
          <Logo onClick={() => go(ROUTES.HOME)} />
          <nav className="hidden items-center gap-1.5 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.route}
                onClick={() => go(link.route)}
                className={classNames(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                  route === link.route
                    ? 'bg-[#1566D1]/10 text-[#1566D1] dark:bg-[#1566D1]/20 dark:text-[#7fb0f5]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => go(ROUTES.ADMIN)}
              className="hidden sm:inline-flex rounded-xl p-2.5 text-slate-500 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
              className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {open && (
          <>
            <div
              className="fixed inset-0 -z-10 bg-slate-900/20 backdrop-blur-sm dark:bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="mt-3 rounded-3xl glass dark:glass p-4 shadow-2xl lg:hidden max-h-[75vh] overflow-y-auto">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.route}
                    onClick={() => go(link.route)}
                    className={classNames(
                      'rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors',
                      route === link.route
                        ? 'bg-[#1566D1]/10 text-[#1566D1] dark:bg-[#1566D1]/20 dark:text-[#7fb0f5]'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
                  <Button className="w-full" onClick={() => go(ROUTES.CONTACT)}>
                    Hubungi Kami
                  </Button>
                  <button
                    onClick={() => go(ROUTES.ADMIN)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:hover:text-white"
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
  <footer className="relative mt-32 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#030F26]/50 backdrop-blur-lg">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo onClick={() => navigate(ROUTES.HOME)} />
          <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {settings.company_tagline || BRAND.tagline}. Agensi teknologi kreatif yang merancang pengalaman digital canggih dan presisi.
          </p>
          <div className="mt-8 flex gap-3">
            {[
              { icon: Instagram, url: settings.instagram_url },
              { icon: Linkedin, url: settings.linkedin_url },
              { icon: Github, url: settings.github_url },
            ].map(({ icon: Icon, url }, i) => (
              <a
                key={i}
                href={url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-[#1566D1] hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-[#1566D1] dark:hover:text-white"
              >
                {Icon && <Icon className="h-5 w-5" />}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="mb-6 text-sm font-bold text-slate-900 dark:text-white">
            Eksplorasi
          </h4>
          <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {NAV_LINKS.map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="hover:text-[#1566D1] dark:hover:text-[#7fb0f5] transition-colors"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="mb-6 text-sm font-bold text-slate-900 dark:text-white">
            Layanan
          </h4>
          <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
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
                  className="hover:text-[#1566D1] dark:hover:text-[#7fb0f5] transition-colors"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="mb-6 text-sm font-bold text-slate-900 dark:text-white">
            Hubungi Kami
          </h4>
          <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li>
              <a
                href={`mailto:${settings.contact_email || BRAND.email}`}
                className="flex items-center gap-3 hover:text-[#1566D1] dark:hover:text-[#7fb0f5] transition-colors"
              >
                {Mail && <Mail className="h-4 w-4" />}
                {settings.contact_email || BRAND.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:+${(
                  settings.whatsapp_number || BRAND.whatsapp
                ).replace(/\D/g, '')}`}
                className="flex items-center gap-3 hover:text-[#1566D1] dark:hover:text-[#7fb0f5] transition-colors"
              >
                {Phone && <Phone className="h-4 w-4" />} 
                +{settings.whatsapp_number || BRAND.whatsapp}
              </a>
            </li>
            <li className="flex items-start gap-3">
              {MapPin && <MapPin className="h-4 w-4 shrink-0 mt-0.5" />}
              <span>{settings.address || BRAND.address}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-8 text-xs font-semibold text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {settings.company_name || BRAND.name}.
        </p>
        <button
          onClick={() => navigate(ROUTES.ADMIN)}
          className="flex items-center gap-2 hover:text-[#1566D1] dark:hover:text-white transition-colors"
        >
          {ShieldCheck && <ShieldCheck className="h-4 w-4" />} Admin Panel
        </button>
      </div>
    </div>
  </footer>
);

export const FloatingWhatsApp = ({ settings }) => (
  <div className="fixed bottom-6 right-6 z-[85]">
    <a
      href={buildWhatsAppLink(settings.whatsapp_number)}
      target="_blank"
      rel="noreferrer"
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50"
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
      <p className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight">
        {value}
        <span className="text-[#1566D1] dark:text-[#7fb0f5]">
          {suffix}
        </span>
      </p>
      <p className="mt-3 text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
};

const StatsSection = () => {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const stats = [
    { end: 10, suffix: '+', label: 'Proyek Selesai' },
    { end: 95, suffix: '%', label: 'Klien Puas' },
    { end: 2, suffix: ' th', label: 'Pengalaman' },
    { end: 5, suffix: '.0', label: 'Rating Bintang' },
  ];
  return (
    <section ref={ref} className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <GlassCard hover={false} className="p-8 sm:p-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <StatItem key={s.label} {...s} start={visible} />
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

const HeroSection = ({ navigate }) => {
  return (
    <section className="relative flex min-h-[95dvh] items-center justify-center pt-28 pb-20">
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <Badge className="mb-8 px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#1566D1] animate-pulse mr-1" />
            Viska Labs Indonesia
          </Badge>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="text-balance text-4xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl">
            Solusi digital modern, <br className="hidden md:block" />
            <span className="editorial-accent">dirancang</span> untuk dampak nyata.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg font-medium">
            Kami membangun platform web, aplikasi mobile, dan sistem perangkat lunak yang presisi, menggabungkan rekayasa teknologi tingkat tinggi dengan desain antarmuka premium.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-12 mx-auto flex w-full max-w-sm flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
              icon={Layers}
            >
              Lihat Karya Kami
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(ROUTES.CONTACT)}
            >
              Mulai Diskusi
            </Button>
          </div>
        </Reveal>
        <Reveal delay={500}>
          <div className="mt-20 flex flex-col items-center gap-3 text-slate-400">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest">
              Jelajahi Lebih Lanjut
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce text-[#1566D1]" />
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
    <section className="relative overflow-hidden py-10">
      <div className="flex w-max animate-marquee gap-12 px-6">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-400 dark:text-slate-500"
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
    <GlassCard className="group h-full flex flex-col">
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#1566D1] group-hover:text-white">
        <ServiceIcon name={service.icon_name} className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        {service.name}
      </h3>
      <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        {service.short_description}
      </p>
      <button
        onClick={() => navigate(ROUTES.SERVICES)}
        className="mt-6 flex items-center gap-2 text-sm font-bold text-[#1566D1] dark:text-[#7fb0f5] transition-all group-hover:gap-3"
      >
        Pelajari layanan <ArrowRight className="h-4 w-4" />
      </button>
    </GlassCard>
  </Reveal>
);

const ServicesPreview = ({ services, navigate }) => (
  <section className="relative py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Spesialisasi Kami"
        title="Kapabilitas Digital Terpadu"
        description="Dari arsitektur backend yang kokoh hingga desain antarmuka yang elegan, kami menangani seluruh spektrum rekayasa teknologi."
      />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        className="group block w-full text-left"
      >
        <div
          className={classNames(
            'w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-md transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#1566D1]/20',
            isMobileApp ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-square sm:aspect-[4/3]'
          )}
        >
          <img
            src={item.thumbnail_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="pt-6 px-2">
          <div className="mb-3 flex items-center gap-3">
            <Badge variant="default" className="!px-2.5 !py-1 !text-[0.6rem]">
              {item.category}
            </Badge>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-[#1566D1] dark:group-hover:text-[#7fb0f5]">
            {item.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {item.client_name}
          </p>
        </div>
      </button>
    </Reveal>
  );
};

const PortfolioHighlights = ({ portfolios, navigate }) => {
  const featured = portfolios.filter((p) => p.is_published && p.is_featured).slice(0, 4);
  const items = featured.length ? featured : portfolios.filter((p) => p.is_published).slice(0, 4);
  return (
    <section className="relative py-24 bg-slate-50/50 dark:bg-[#030F26]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end mb-16">
          <SectionHeading
            center={false}
            eyebrow="Studi Kasus"
            title="Karya Terbaik Kami"
            description="Melihat langsung bagaimana kami mengubah masalah kompleks menjadi solusi digital yang presisi."
          />
          <Reveal>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
              icon={ArrowRight}
            >
              Jelajahi Arsip
            </Button>
          </Reveal>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {items.map((p, i) => (
            <PortfolioCard key={p.id} item={p} navigate={navigate} delay={i * 80} />
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
      title: 'Pengiriman Agresif',
      desc: 'Metodologi ketat untuk meluncurkan produk tepat waktu tanpa kompromi pada standar kualitas.',
    },
    {
      icon: Gauge,
      title: 'Performa Optimal',
      desc: 'Skor metrik performa tinggi dan arsitektur kode yang teroptimasi secara mendalam.',
    },
    {
      icon: Palette,
      title: 'Desain Berkelas',
      desc: 'Antarmuka premium yang mengutamakan kenyamanan pengguna (UX) dan keindahan visual (UI).',
    },
    {
      icon: ShieldCheck,
      title: 'Skalabel & Aman',
      desc: 'Sistem yang dibangun dengan keamanan berlapis, siap menopang pertumbuhan bisnis Anda.',
    },
  ];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Mengapa Viska Labs"
          title="Keunggulan Teknis & Kreatif"
          description="Kami memposisikan diri sebagai mitra teknologi, bukan sekadar vendor pelaksana."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <GlassCard className="h-full text-center">
                <div className="mx-auto mb-6 inline-flex rounded-2xl bg-[#1566D1]/10 p-4 text-[#1566D1]">
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
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
    const timer = setInterval(() => setIndex((i) => (i + 1) % approved.length), 6000);
    return () => clearInterval(timer);
  }, [paused, approved.length]);
  if (!approved.length) return null;
  const active = approved[index];
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading eyebrow="Kredibilitas" title="Dipercaya oleh Klien" />
        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <GlassCard hover={false} className="text-center sm:p-12 shadow-2xl">
            <Quote className="mx-auto mb-6 h-12 w-12 text-[#1566D1]/20" />
            <p className="text-xl leading-relaxed text-slate-800 dark:text-slate-200 sm:text-2xl font-medium">
              “{active.content}”
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              {active.client_photo_url && (
                <img
                  src={active.client_photo_url}
                  alt={active.client_name}
                  className="h-16 w-16 rounded-full border-4 border-white dark:border-[#030F26] shadow-md object-cover"
                />
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {active.client_name}
                </p>
                <p className="text-sm font-medium text-[#1566D1] dark:text-[#7fb0f5] mt-1">
                  {active.client_title}
                  {active.client_company ? ` di ${active.client_company}` : ''}
                </p>
              </div>
              <StarRating value={active.rating} />
            </div>
          </GlassCard>
          <div className="mt-8 flex items-center justify-center gap-2">
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
                    i === index ? 'w-8 bg-[#1566D1]' : 'w-2 bg-slate-300 dark:bg-slate-700'
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
  <section className="relative py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-[#051C48] p-10 text-center sm:p-20 shadow-2xl">
          {/* Subtle tech background for CTA */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#1566D1]/30 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#1566D1]/20 blur-[80px]" />
          
          <div className="relative z-10">
            <h2 className="text-balance text-4xl font-black text-white sm:text-6xl tracking-tight">
              Siap membangun <span className="editorial-accent text-[#7fb0f5]">inovasi</span> Anda?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-slate-300 sm:text-lg">
              Mari wujudkan visi Anda menjadi produk perangkat lunak tangguh. Konsultasi bebas biaya dengan tim ahli kami.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto bg-[#1566D1] text-white hover:bg-[#124691] border-none" onClick={() => navigate(ROUTES.CONTACT)} icon={Send}>
                Mulai Diskusi Proyek
              </Button>
              <Button size="lg" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/20" onClick={() => navigate(ROUTES.PRICING)}>
                Lihat Skema Harga
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
  <section className="relative pt-40 pb-16">
    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
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
      desc: 'Setiap keputusan teknis dan desain kami ukur dampaknya secara objektif terhadap bisnis Anda.',
    },
    {
      icon: Lightbulb,
      title: 'Inovasi Presisi',
      desc: 'Mengeksplorasi batas teknologi untuk solusi canggih yang relevan dengan masa depan.',
    },
    {
      icon: Heart,
      title: 'Dedikasi Tinggi',
      desc: 'Kami memperlakukan setiap baris kode dan komponen antarmuka layaknya produk kami sendiri.',
    },
    {
      icon: Award,
      title: 'Kualitas Absolut',
      desc: 'Standar tinggi pada rekayasa perangkat lunak tanpa memberikan ruang untuk kompromi.',
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Tentang Kami"
        title="Arsitek Inovasi Digital"
        description="Agensi creative technology yang mengawinkan rekayasa perangkat lunak canggih dengan desain antarmuka premium."
      />
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <GlassCard hover={false} className="h-full">
              <div className="mb-6 inline-flex rounded-2xl bg-[#1566D1]/10 p-4 text-[#1566D1]">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Visi Utama</h3>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                Menjadi standar emas praktik creative technology di Indonesia dengan menghadirkan solusi perangkat lunak yang tak hanya fungsional, tetapi menawan secara estetika dan fundamental bagi bisnis.
              </p>
            </GlassCard>
          </Reveal>
          <Reveal delay={120}>
            <GlassCard hover={false} className="h-full">
              <div className="mb-6 inline-flex rounded-2xl bg-[#1566D1]/10 p-4 text-[#1566D1]">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Misi Kami</h3>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                Merekayasa pengalaman digital berkualitas enterprise yang mengutamakan kecepatan performa, keamanan arsitektur, dan kesederhanaan alur pengguna di setiap iterasi pengerjaan.
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Nilai Perusahaan" title="Prinsip Kerja Eksekusi" />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon || Boxes;
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <GlassCard className="h-full text-center">
                    <div className="mx-auto mb-5 inline-flex rounded-2xl bg-[#1566D1] p-3.5 text-white shadow-lg shadow-[#1566D1]/30">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{v.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{v.desc}</p>
                  </GlassCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50/50 dark:bg-[#030F26]/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Tim Inti"
            title="Orang-orang di Balik Viska"
            description="Tim ramping berkinerja tinggi yang menggabungkan keahlian mendalam di bidang engineering dan product strategy."
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <GlassCard hover={false} className="group h-full flex flex-col items-center text-center !p-6">
                  <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-xl">
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="mt-1 text-sm font-bold text-[#1566D1] dark:text-[#7fb0f5]">{m.role}</p>
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {m.bio}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    {m.instagram_url && (
                      <a href={formatSocialLink(m.instagram_url, 'instagram')} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-pink-500 hover:text-white dark:bg-slate-800 dark:text-slate-400">
                        {Instagram && <Instagram className="h-4 w-4" />}
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a href={formatSocialLink(m.linkedin_url, 'linkedin')} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-[#0A66C2] hover:text-white dark:bg-slate-800 dark:text-slate-400">
                        {Linkedin && <Linkedin className="h-4 w-4" />}
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
        eyebrow="Praktik & Keahlian"
        title="Layanan Terspesialisasi"
        description="Solusi rekayasa perangkat lunak menyeluruh, dari arsitektur backend hingga keindahan visual antarmuka."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80}>
              <GlassCard className="grid gap-8 md:grid-cols-3" hover={false}>
                <div className="flex flex-col items-start">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1]">
                    <ServiceIcon name={s.icon_name} className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {s.short_description}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                    {s.full_description}
                  </p>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                    {(s.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Button onClick={() => navigate(ROUTES.PRICING)} icon={Tag}>
                      Lihat Skema Harga
                    </Button>
                    <Button variant="outline" onClick={() => navigate(ROUTES.CONTACT)}>
                      Mulai Diskusi
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
        eyebrow="Karya Kami"
        title="Arsip Proyek Digital"
        description="Eksplorasi implementasi rekayasa perangkat lunak dan desain antarmuka canggih dari berbagai industri."
      />
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <GlassCard className="sticky top-24 z-30 mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between !p-4" hover={false}>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setVisibleCount(6);
                  }}
                  className={classNames(
                    'rounded-full px-4 py-2 text-xs font-bold transition-all duration-300',
                    category === c
                      ? 'bg-[#1566D1] text-white shadow-md shadow-[#1566D1]/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari proyek atau klien..."
                className={classNames(inputClass, 'pl-11 rounded-full')}
              />
            </div>
          </GlassCard>

          {visible.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <PortfolioCard key={p.id} item={p} navigate={navigate} delay={(i % 3) * 80} />
              ))}
            </div>
          ) : (
            <div className="mt-12">
              <EmptyState
                icon={Search}
                title="Proyek tidak ditemukan"
                description="Coba gunakan kategori atau kata kunci pencarian yang lain."
              />
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="mt-16 text-center">
              <Button variant="outline" onClick={() => setVisibleCount((c) => c + 6)} icon={Plus}>
                Muat Lebih Banyak Karya
              </Button>
            </div>
          )}
        </div>
      </section>
      <CtaSection navigate={navigate} />
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
            description="Arsip yang Anda cari mungkin telah dipindahkan atau dihapus."
            action={
              <Button onClick={() => navigate(ROUTES.PORTFOLIO)} icon={ArrowLeft}>
                Kembali ke Arsip
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
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <button
            onClick={() => navigate(ROUTES.PORTFOLIO)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#1566D1] dark:text-slate-400 dark:hover:text-[#7fb0f5]"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Indeks
          </button>
          <Reveal>
            <Badge className="mb-6 px-3 py-1.5 shadow-sm">{item.category}</Badge>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {item.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              {item.short_description}
            </p>
          </Reveal>
        </div>
      </section>
      
      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div
              className="mx-auto overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-2xl"
              style={{ maxWidth: item.category === 'Mobile App' ? '400px' : '100%' }}
            >
              <img
                src={gallery[activeImage]}
                alt={item.title}
                className={classNames(
                  'w-full object-cover transition-transform duration-700 hover:scale-105',
                  item.category === 'Mobile App' ? 'aspect-[4/5]' : 'aspect-video'
                )}
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-8 flex justify-center gap-4 overflow-x-auto pb-4">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={classNames(
                      'h-20 w-28 sm:h-24 sm:w-36 flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300 border-2',
                      i === activeImage
                        ? 'border-[#1566D1] shadow-lg shadow-[#1566D1]/30 opacity-100 scale-100'
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
      
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Konteks Proyek</h2>
            <p className="text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {item.full_description}
            </p>
          </div>
          <aside>
            <GlassCard hover={false} className="sticky top-32">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                Informasi Proyek
              </h3>
              <dl className="space-y-5 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1566D1]/10 text-[#1566D1]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.client_name || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1566D1]/10 text-[#1566D1]">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(item.completed_at)}</span>
                </div>
                {item.project_url && (
                  <div className="pt-2">
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-bold text-[#1566D1] hover:underline underline-offset-4"
                    >
                      <ExternalLink className="h-4 w-4" /> Kunjungi Aplikasi
                    </a>
                  </div>
                )}
              </dl>
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Tumpukan Teknologi
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(item.tech_stack || []).map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Button className="mt-8 w-full" onClick={() => navigate(ROUTES.CONTACT)}>
                Bangun Proyek Serupa
              </Button>
            </GlassCard>
          </aside>
        </div>
      </section>
      
      {related.length > 0 && (
        <section className="py-20 bg-slate-50/50 dark:bg-[#030F26]/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-10 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Proyek Terkait</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PortfolioCard key={p.id} item={p} navigate={navigate} delay={i * 80} />
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
        eyebrow="Investasi"
        title="Skema Harga Transparan"
        description="Pilih struktur biaya yang sesuai skala pertumbuhan bisnis Anda. Terukur, jelas, dan tanpa kejutan."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 100}>
                <GlassCard
                  hover={false}
                  className={classNames(
                    'relative flex h-full flex-col !p-8 transition-transform duration-500',
                    pkg.is_highlighted ? 'border-2 border-[#1566D1] shadow-2xl shadow-[#1566D1]/20 lg:-translate-y-4' : 'hover:-translate-y-2'
                  )}
                >
                  {pkg.is_highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#1566D1] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#1566D1]/30">
                      Rekomendasi
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="mt-4 text-3xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-4xl">
                    {formatPriceRange(pkg)}
                  </p>
                  <ul className="mt-8 flex-1 space-y-4">
                    {(pkg.features || []).map((f, idx) => (
                      <li
                        key={idx}
                        className={classNames(
                          'flex items-start gap-3 text-sm font-medium',
                          !f.is_included && 'opacity-40'
                        )}
                      >
                        <span
                          className={classNames(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                            f.is_included ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}
                        >
                          {f.is_included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">{f.feature_text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-10 w-full"
                    variant={pkg.is_highlighted ? 'primary' : 'outline'}
                    onClick={() => navigate(ROUTES.CONTACT)}
                  >
                    {pkg.cta_label || 'Pilih Paket Ini'}
                  </Button>
                </GlassCard>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-16 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Membangun sistem berskala enterprise yang sangat spesifik?{' '}
              <button
                onClick={() => navigate(ROUTES.CONTACT)}
                className="font-bold text-[#1566D1] hover:underline underline-offset-4"
              >
                Diskusikan kebutuhan custom →
              </button>
            </p>
          </Reveal>
        </div>
      </section>
      <FaqSection
        items={data.faq_items.filter((f) => f.category === 'Pricing')}
        title="FAQ Skema Biaya"
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
        eyebrow="Kredibilitas"
        title="Kepercayaan Klien"
        description="Bagi kami, kesuksesan diukur dari dampak yang dihasilkan oleh produk kami terhadap bisnis klien."
      />
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {approved.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {approved.map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 80}>
                  <GlassCard className="flex h-full flex-col">
                    <Quote className="h-8 w-8 text-[#1566D1]/30" />
                    <p className="mt-4 flex-1 text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                      “<span className="editorial-accent">{t.content}</span>”
                    </p>
                    <div className="mt-8 flex items-center gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
                      {t.client_photo_url && (
                        <img
                          src={t.client_photo_url}
                          alt={t.client_name}
                          loading="lazy"
                          className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm dark:border-[#030F26]"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{t.client_name}</p>
                        <p className="mt-0.5 text-xs font-bold text-[#1566D1] dark:text-[#7fb0f5]">
                          {t.client_title}
                          {t.client_company ? ` · ${t.client_company}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <StarRating value={t.rating} />
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Belum ada ulasan"
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
  <GlassCard hover={false} className="!p-0 overflow-hidden mb-4 transition-all">
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 p-6 text-left outline-none transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
    >
      <span className="font-bold text-slate-900 dark:text-white sm:text-lg">{item.question}</span>
      <div className={classNames("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 dark:bg-slate-800 dark:text-slate-400", open && "rotate-45 bg-[#1566D1] text-white dark:bg-[#1566D1] dark:text-white")}>
        <Plus className="h-4 w-4" />
      </div>
    </button>
    <div
      className={classNames(
        'grid transition-all duration-300 ease-in-out',
        open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden px-6">
        <p className="font-medium leading-relaxed text-slate-600 dark:text-slate-300 pt-2">{item.answer}</p>
      </div>
    </div>
  </GlassCard>
);

export const FaqSection = ({ items, title }) => {
  const [openId, setOpenId] = useState(null);
  if (!items?.length) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {title && (
          <h2 className="mb-10 text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h2>
        )}
        <div className="space-y-4">
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
        eyebrow="Knowledge Base"
        title="Pertanyaan Umum"
        description="Temukan jawaban mendetail terkait operasional dan prosedur layanan teknis kami."
      />
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative mb-8">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik yang ingin Anda ketahui..."
              className={classNames(inputClass, 'pl-12 !rounded-2xl !h-14 shadow-sm')}
            />
          </div>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={classNames(
                  'rounded-full px-4 py-2 text-xs font-bold transition-all',
                  category === c
                    ? 'bg-[#1566D1] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div>
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
            <EmptyState icon={HelpCircle} title="Informasi tidak ditemukan." />
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
    if (!form.full_name.trim()) e.full_name = 'Identitas wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!isValidEmail(form.email)) e.email = 'Format email tidak sesuai';
    if (!form.message.trim()) e.message = 'Deskripsi proyek wajib diisi';
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
      toast?.success('Data berhasil masuk ke sistem kami.');
    } catch {
      toast?.error('Gagal mengirim formulir.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email Resmi', value: settings.contact_email || BRAND.email, copy: settings.contact_email || BRAND.email },
    { icon: Phone, label: 'Jalur WhatsApp', value: `+${settings.whatsapp_number || BRAND.whatsapp}`, copy: settings.whatsapp_number || BRAND.whatsapp },
    { icon: MapPin, label: 'Alamat Operasional', value: settings.address || BRAND.address },
    { icon: Clock, label: 'Jam Kerja', value: settings.operating_hours || BRAND.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Kontak Terpadu"
        title="Mari Eksekusi Ide Anda"
        description="Isi form briefing di bawah ini. Tim analis teknis kami akan merespons dalam 1×24 jam kerja."
      />
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Reveal>
              <div className="space-y-4">
                {contactItems.map((c) => (
                  <GlassCard key={c.label} hover={false} className="flex items-center gap-4 !p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1]">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {c.label}
                      </p>
                      <p className="mt-1 truncate font-bold text-slate-900 dark:text-white">{c.value}</p>
                    </div>
                    {c.copy && (
                      <button
                        onClick={async () => {
                          (await copyToClipboard(c.copy)) && toast?.info('Tersalin ke clipboard');
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
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
                  className="block mt-6"
                >
                  <Button className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white border-none" icon={MessageCircle} size="lg">
                    Konsultasi Langsung via WhatsApp
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-3">
            <Reveal delay={120}>
              <GlassCard hover={false} className="h-full">
                {submitted ? (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Briefing Diterima</h3>
                    <p className="mt-3 max-w-sm text-base font-medium text-slate-500 dark:text-slate-400">
                      Dokumen briefing proyek Anda telah masuk ke dalam antrean analisis tim Viska Labs.
                    </p>
                    <Button className="mt-8" variant="outline" onClick={() => setSubmitted(false)}>
                      Kirim Briefing Baru
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <fieldset disabled={submitting} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Nama Lengkap" required error={errors.full_name}>
                          <Input
                            value={form.full_name}
                            onChange={(e) => setField('full_name', e.target.value)}
                            placeholder="John Doe"
                          />
                        </Field>
                        <Field label="Alamat Email" required error={errors.email}>
                          <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setField('email', e.target.value)}
                            placeholder="john@perusahaan.com"
                          />
                        </Field>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="No. WhatsAppAktif">
                          <Input
                            type="tel"
                            inputMode="numeric"
                            value={form.whatsapp}
                            onChange={(e) => setField('whatsapp', e.target.value)}
                            placeholder="0812xxxx"
                          />
                        </Field>
                        <Field label="Entitas / Organisasi">
                          <Input
                            value={form.company}
                            onChange={(e) => setField('company', e.target.value)}
                            placeholder="Nama Perusahaan (Opsional)"
                          />
                        </Field>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Fokus Layanan">
                          <Select
                            value={form.service_interest}
                            onChange={(e) => setField('service_interest', e.target.value)}
                          >
                            <option value="" disabled>
                              Pilih Konsentrasi
                            </option>
                            {SERVICE_INTEREST_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Proyeksi Anggaran">
                          <Select
                            value={form.budget_range}
                            onChange={(e) => setField('budget_range', e.target.value)}
                          >
                            <option value="" disabled>
                              Pilih Rentang
                            </option>
                            {BUDGET_OPTIONS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </Select>
                        </Field>
                      </div>
                      <Field label="Spesifikasi Proyek" required error={errors.message}>
                        <Textarea
                          rows={6}
                          value={form.message}
                          onChange={(e) => setField('message', e.target.value)}
                          placeholder="Deskripsikan fitur, target rilis, dan skala proyek Anda..."
                        />
                      </Field>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        loading={submitting}
                        icon={submitting ? undefined : Send}
                      >
                        {submitting ? 'Memproses Data...' : 'Kirim Brief Proyek'}
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