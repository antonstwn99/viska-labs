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
  <div className="fixed inset-0 -z-10 bg-[#F9F9F8] dark:bg-[#0A0A0B] transition-colors duration-500">
    {/* Subtle Noise / Grain Filter untuk sentuhan editorial (tanpa blob) */}
    <div 
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

// ScrollProgressBar sengaja dikosongkan karena warna gradientnya mengganggu art direction editorial
export const ScrollProgressBar = () => null;

 

export const Navbar = ({ route, navigate, theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
        'fixed inset-x-0 top-0 z-[80] transition-colors duration-300',
        scrolled
          ? 'bg-[#F9F9F8]/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-b border-slate-900/10 dark:border-white/10'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          <Logo onClick={() => go(ROUTES.HOME)} light={false} />
          
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.route}
                onClick={() => go(link.route)}
                className={classNames(
                  'text-[0.65rem] font-bold uppercase tracking-widest transition-colors',
                  route === link.route
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 transition hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => go(ROUTES.CONTACT)}
            >
              Hubungi Kami
            </Button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="p-2 text-slate-900 transition dark:text-white lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {open && (
          <>
            <div
              className="fixed inset-0 -z-10 bg-slate-900/20 backdrop-blur-sm dark:bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full border-b border-slate-900/10 bg-[#F9F9F8] px-4 pb-6 pt-4 dark:border-white/10 dark:bg-[#0A0A0B] shadow-2xl lg:hidden">
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.route}
                    onClick={() => go(link.route)}
                    className={classNames(
                      'px-4 py-3 text-left text-xs font-bold uppercase tracking-widest transition-colors',
                      route === link.route
                        ? 'bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white'
                        : 'text-slate-500 hover:bg-slate-900/5 dark:text-slate-400 dark:hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </button>
                ))}
                <div className="mt-4 px-4">
                  <Button className="w-full" onClick={() => go(ROUTES.CONTACT)}>
                    Hubungi Kami
                  </Button>
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
  <footer className="relative mt-32 border-t border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          {/* Logo otomatis menyesuaikan dark/light mode bawaan sistem */}
          <Logo onClick={() => navigate(ROUTES.HOME)} />
          <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {settings.company_tagline || BRAND.tagline}. Kami merancang
            pengalaman digital fungsional untuk bisnis yang menuntut kualitas.
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
                className="p-2 border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="mb-6 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
            Navigasi
          </h4>
          <ul className="space-y-3 text-sm font-bold">
            {NAV_LINKS.map((l) => (
              <li key={l.route}>
                <button
                  onClick={() => navigate(l.route)}
                  className="hover:underline underline-offset-4"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="mb-6 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
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
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="mb-6 text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
            Kontak
          </h4>
          <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <li>
              <a
                href={`mailto:${settings.contact_email || BRAND.email}`}
                className="flex items-center gap-3 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                className="flex items-center gap-3 hover:text-slate-900 dark:hover:text-white transition-colors"
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
      
      <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-900/10 dark:border-white/10 pt-8 text-xs font-bold uppercase tracking-widest text-slate-400 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {settings.company_name || BRAND.name}.
        </p>
        <button
          onClick={() => navigate(ROUTES.ADMIN)}
          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {ShieldCheck && <ShieldCheck className="h-3 w-3" />} Admin Panel
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
  return (
    <section className="relative flex min-h-[95dvh] items-center justify-center pt-28 pb-20">
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <Badge variant="glass" className="mb-8">
            Viska Labs Indonesia
          </Badge>
        </Reveal>
        <Reveal delay={100}>
          {/* Implementasi Inline Font Mixing (Satoshi + Playfair Display) */}
          <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tighter text-slate-900 dark:text-white sm:text-7xl md:text-[5.5rem]">
            Teknologi digital, <br className="hidden md:block" />
            <span className="editorial-accent text-slate-500 dark:text-slate-400">dirancang</span> untuk dampak nyata.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg font-medium">
            Kami membangun website, aplikasi, dan sistem perangkat lunak dengan pendekatan fungsional, performa tinggi, dan estetika yang presisi.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-12 mx-auto flex w-full max-w-xs flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
            >
              Lihat Karya Kami
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate(ROUTES.CONTACT)}
            >
              Mulai Diskusi
            </Button>
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

const ServiceCard = ({ service, navigate, index, delay }) => (
  <Reveal delay={delay}>
    <div className="group flex flex-col justify-between h-full border-t border-slate-900/10 dark:border-white/10 pt-6 pb-12 transition-colors hover:border-slate-900 dark:hover:border-white">
      <div>
        <div className="flex items-start justify-between mb-8">
          <span className="text-xs font-bold text-slate-400">
            {String(index + 1).padStart(2, '0')}
          </span>
          <ServiceIcon name={service.icon_name} className="h-5 w-5 text-slate-900 dark:text-white" />
        </div>
        <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          {service.name}
        </h3>
        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          {service.short_description}
        </p>
      </div>
      <button
        onClick={() => navigate(ROUTES.SERVICES)}
        className="mt-8 inline-flex w-fit items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-900 dark:text-white group-hover:underline underline-offset-4"
      >
        Pelajari <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  </Reveal>
);

const ServicesPreview = ({ services, navigate }) => (
  <section className="relative py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <SectionHeading
          center={false}
          eyebrow="Disiplin Praktik"
          title="Kapabilitas End-to-End"
          description="Dari ide hingga peluncuran, kami memegang kendali atas setiap lapisan rekayasa perangkat lunak dan desain interaktif."
        />
        <Reveal>
          <Button variant="outline" onClick={() => navigate(ROUTES.SERVICES)}>
            Lihat Semua Layanan
          </Button>
        </Reveal>
      </div>
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((s, i) => (
          <ServiceCard key={s.id} index={i} service={s} navigate={navigate} delay={i * 80} />
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
        className="group flex w-full flex-col gap-5 text-left"
      >
        <div
          className={classNames(
            'w-full overflow-hidden bg-slate-200 dark:bg-slate-800',
            isMobileApp ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-square sm:aspect-[4/3]'
          )}
        >
          <img
            src={item.thumbnail_url}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 sm:grayscale group-hover:scale-105 group-hover:grayscale-0"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between border-b border-slate-900/10 dark:border-white/10 pb-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {item.category}
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {new Date(item.completed_at || Date.now()).getFullYear()}
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:underline underline-offset-4">
            {item.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
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
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end mb-16">
          <SectionHeading
            center={false}
            eyebrow="Karya Terpilih"
            title="Arsip Digital"
            description="Implementasi rekayasa perangkat lunak dan desain interaktif yang membawa hasil nyata."
          />
          <Reveal>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PORTFOLIO)}
            >
              Jelajahi Arsip
            </Button>
          </Reveal>
        </div>
        <div className="columns-1 gap-8 sm:columns-2">
          {items.map((p, i) => (
            <div key={p.id} className="mb-12 break-inside-avoid block w-full">
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
      title: 'Pengiriman Agresif',
      desc: 'Metodologi ketat untuk meluncurkan produk tepat waktu tanpa toleransi terhadap penurunan kualitas.',
    },
    {
      icon: Gauge,
      title: 'Performa Absolut',
      desc: 'Core Web Vitals hijau, skor PageSpeed 90+, dan arsitektur kode yang teroptimasi secara ekstrem.',
    },
    {
      icon: Palette,
      title: 'Estetika Fungsional',
      desc: 'Desain editorial yang menyingkirkan elemen dekoratif usang, berfokus pada tipografi dan ruang.',
    },
    {
      icon: ShieldCheck,
      title: 'Kestabilan Skala',
      desc: 'Arsitektur cloud-native dengan keamanan berlapis. Dibangun untuk bertahan dan bertumbuh.',
    },
  ];
  return (
    <section className="relative py-24 sm:py-32 border-y border-slate-900/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          center={false}
          eyebrow="Mengapa Kami"
          title="Standar Agensi, Kelincahan Startup"
          description="Kami tidak memproduksi template. Kami merekayasa solusi kustom yang menjadi aset jangka panjang bisnis Anda."
        />
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 border-t border-l border-slate-900/10 dark:border-white/10">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <div className="p-8 sm:p-12 border-r border-b border-slate-900/10 dark:border-white/10 h-full transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <r.icon className="h-6 w-6 mb-6 text-slate-900 dark:text-white" />
                <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                  {r.title}
                </h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  {r.desc}
                </p>
              </div>
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
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading center={false} eyebrow="Kredibilitas" title="Kata Mereka" />
        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-center">
            <div className="flex-1">
              <Quote className="h-8 w-8 text-slate-300 dark:text-slate-800 mb-8" />
              <p className="text-2xl sm:text-3xl md:text-4xl leading-tight text-slate-900 dark:text-white font-medium text-balance transition-opacity duration-500">
                “<span className="editorial-accent">{active.content}</span>”
              </p>
            </div>
            <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-slate-900/10 dark:border-white/10 pt-8 md:pt-0 md:pl-10">
              <div className="flex items-center gap-4">
                {active.client_photo_url && (
                  <img
                    src={active.client_photo_url}
                    alt={active.client_name}
                    className="h-14 w-14 rounded-none grayscale object-cover"
                  />
                )}
                <div>
                  <p className="font-black tracking-tight text-slate-900 dark:text-white">
                    {active.client_name}
                  </p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mt-1">
                    {active.client_title}
                    {active.client_company ? ` · ${active.client_company}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2">
                {approved.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={classNames(
                      'h-1 transition-all duration-500',
                      i === index ? 'w-8 bg-slate-900 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-800'
                    )}
                    aria-label={`Lihat testimoni ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const CtaSection = ({ navigate }) => (
  <section className="relative py-24 sm:py-32 border-t border-slate-900/10 dark:border-white/10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Reveal>
        <div className="relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-10 sm:p-24 flex flex-col items-center text-center">
          <h2 className="text-balance text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter">
            Siap untuk <br />
            <span className="editorial-accent text-slate-400 dark:text-slate-500">bertransformasi?</span>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-sm sm:text-base font-medium text-slate-400 dark:text-slate-600">
            Mari wujudkan visi Anda menjadi pengalaman perangkat lunak fungsional yang bebas kompromi. Konsultasi bebas biaya.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              onClick={() => navigate(ROUTES.CONTACT)} 
            >
              Mulai Diskusi
            </Button>
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-slate-900 dark:text-slate-900 dark:border-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
              onClick={() => navigate(ROUTES.PRICING)} 
            >
              Lihat Harga
            </Button>
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
  <section className="relative pt-36 pb-20 sm:pt-48 border-b border-slate-900/10 dark:border-white/10">
    <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
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
      desc: 'Setiap keputusan desain dan teknis kami ukur dampaknya terhadap bisnis.',
    },
    {
      icon: Lightbulb,
      title: 'Inovatif',
      desc: 'Mengeksplorasi batas teknologi untuk solusi yang relevan dengan masa depan.',
    },
    {
      icon: Heart,
      title: 'Berdedikasi',
      desc: 'Kami memperlakukan setiap baris kode seperti produk kami sendiri.',
    },
    {
      icon: Award,
      title: 'Berkualitas',
      desc: 'Standar tinggi pada rekayasa perangkat lunak tanpa ruang untuk kompromi.',
    },
  ];
  return (
    <>
      <PageHero
        eyebrow="Tentang Kami"
        title="Filosofi Digital"
        description="Kami adalah agensi creative technology yang mengawinkan rekayasa perangkat lunak dengan presisi desain editorial."
      />
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-slate-900/10 dark:border-white/10 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Visi <span className="editorial-accent text-slate-500">Utama</span></h3>
              <p className="mt-6 text-sm sm:text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Menjadi standar emas praktik creative technology di Indonesia dengan menghadirkan solusi perangkat lunak yang tak hanya fungsional, tetapi menawan secara estetika dan fundamental bisnis.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="h-full p-8 sm:p-12 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Misi <span className="editorial-accent text-slate-500">Kami</span></h3>
              <p className="mt-6 text-sm sm:text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Merekayasa pengalaman digital berkualitas enterprise yang mengutamakan kecepatan performa, keamanan arsitektur, dan kesederhanaan alur pengguna di setiap iterasi pengerjaan.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Nilai Perusahaan" title="Prinsip Kerja" />
          <div className="mt-16 grid border-t border-l border-slate-900/10 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon || Boxes;
              return (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="h-full p-8 border-r border-b border-slate-900/10 dark:border-white/10 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <Icon className="h-5 w-5 mb-6 text-slate-900 dark:text-white" />
                    <h3 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">{v.title}</h3>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{v.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Tim Inti"
            title="Arsitek di Balik Viska"
            description="Tim ramping berkinerja tinggi yang menggabungkan keahlian engineering dan product strategy."
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <div className="group flex h-full flex-col text-left">
                  <div className="relative mb-6 aspect-[4/5] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </div>
                  <h3 className="text-lg font-black tracking-tighter uppercase text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mt-1">{m.role}</p>
                  <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {m.bio}
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-900/10 dark:border-white/10 pt-4">
                    {m.instagram_url && (
                      <a href={formatSocialLink(m.instagram_url, 'instagram')} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-slate-900 dark:hover:text-white">
                        {Instagram && <Instagram className="h-4 w-4" />}
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a href={formatSocialLink(m.linkedin_url, 'linkedin')} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-slate-900 dark:hover:text-white">
                        {Linkedin && <Linkedin className="h-4 w-4" />}
                      </a>
                    )}
                  </div>
                </div>
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
        description="Solusi rekayasa perangkat lunak menyeluruh, dari arsitektur backend hingga presisi antarmuka."
      />
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="border-t border-slate-900/10 dark:border-white/10">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 80}>
                <div className="grid gap-8 md:grid-cols-3 border-b border-slate-900/10 dark:border-white/10 py-12 sm:py-16 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 sm:px-8">
                  <div className="flex flex-col items-start">
                    <ServiceIcon name={s.icon_name} className="h-8 w-8 text-slate-900 dark:text-white mb-6" />
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{s.name}</h3>
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
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                          <Check className="h-4 w-4 mt-0.5 text-slate-900 dark:text-white shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => navigate(ROUTES.PRICING)}>
                        Lihat Skema Harga
                      </Button>
                      <Button variant="outline" onClick={() => navigate(ROUTES.CONTACT)}>
                        Mulai Diskusi
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
        eyebrow="Arsip"
        title="Karya Terseleksi"
        description="Eksplorasi implementasi rekayasa perangkat lunak dan desain antarmuka dari berbagai industri."
      />
      <section className="py-12 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="sticky top-[80px] z-30 flex flex-col gap-6 bg-[#F9F9F8] dark:bg-[#0A0A0B] pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-900/10 dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setVisibleCount(6);
                  }}
                  className={classNames(
                    'rounded-none px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-colors border',
                    category === c
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border-slate-900/20 text-slate-500 hover:border-slate-900 dark:border-white/20 dark:text-slate-400 dark:hover:border-white'
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
                placeholder="Cari arsip proyek..."
                className={classNames(inputClass, 'pl-12')}
              />
            </div>
          </div>

          {visible.length ? (
            <div className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3">
              {visible.map((p, i) => (
                <div key={p.id} className="mb-12 break-inside-avoid block w-full">
                  <PortfolioCard item={p} navigate={navigate} delay={(i % 3) * 80} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16">
              <EmptyState
                icon={Search}
                title="Arsip tidak ditemukan"
                description="Gunakan kata kunci atau kategori yang berbeda."
              />
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="mt-16 text-center border-t border-slate-900/10 dark:border-white/10 pt-16">
              <Button variant="outline" onClick={() => setVisibleCount((c) => c + 6)}>
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
            description="Arsip yang Anda cari telah dipindahkan atau dihapus dari sistem."
            action={
              <Button onClick={() => navigate(ROUTES.PORTFOLIO)}>
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
      <section className="pt-36 pb-16 sm:pt-48 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <button
            onClick={() => navigate(ROUTES.PORTFOLIO)}
            className="mb-10 inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Kembali ke Indeks
          </button>
          <Reveal>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 border border-slate-900/20 dark:border-white/20 px-3 py-1">
                {item.category}
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
                {new Date(item.completed_at || Date.now()).getFullYear()}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              {item.title}
            </h1>
            <p className="mt-8 max-w-3xl text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              {item.short_description}
            </p>
          </Reveal>
        </div>
      </section>
      
      <section className="pb-16 border-b border-slate-900/10 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 pt-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div
              className="mx-auto overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-xl"
              style={{ maxWidth: item.category === 'Mobile App' ? '400px' : '100%' }}
            >
              <img
                src={gallery[activeImage]}
                alt={item.title}
                className={classNames(
                  'w-full object-cover grayscale transition-all duration-700 hover:grayscale-0',
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
                      'h-20 w-28 sm:h-24 sm:w-36 flex-shrink-0 overflow-hidden transition-all duration-300 border',
                      i === activeImage
                        ? 'border-slate-900 dark:border-white grayscale-0'
                        : 'border-slate-900/20 dark:border-white/20 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
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
      
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto grid max-w-5xl gap-16 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
              Konteks <span className="editorial-accent text-slate-400">Proyek</span>
            </h2>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line font-medium">
              {item.full_description}
            </p>
          </div>
          <aside>
            <div className="p-8 border border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-900/10 dark:border-white/10 pb-4">
                Metrik & Info
              </h3>
              <dl className="space-y-6 text-sm">
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Klien</dt>
                  <dd className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> {item.client_name || '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1">Penyelesaian</dt>
                  <dd className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {formatDate(item.completed_at)}
                  </dd>
                </div>
                {item.project_url && (
                  <div className="pt-2">
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-slate-900 dark:text-white hover:underline underline-offset-4"
                    >
                      <ExternalLink className="h-3 w-3" /> Kunjungi Proyek
                    </a>
                  </div>
                )}
              </dl>
              <div className="mt-8 pt-8 border-t border-slate-900/10 dark:border-white/10">
                <h4 className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Tumpukan Teknologi (Tech Stack)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(item.tech_stack || []).map((t) => (
                    <span
                      key={t}
                      className="border border-slate-900/20 dark:border-white/20 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Button className="mt-10 w-full" onClick={() => navigate(ROUTES.CONTACT)}>
                Inisiasi Proyek Serupa
              </Button>
            </div>
          </aside>
        </div>
      </section>
      
      {related.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-16 border-b border-slate-900/10 dark:border-white/10 pb-6">
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Arsip Terkait</h2>
            </div>
            <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
              {related.map((p, i) => (
                <div key={p.id} className="mb-12 break-inside-avoid block w-full">
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
        title="Investasi Transparan"
        description="Pilih skema biaya yang sesuai skala proyek Anda. Tanpa biaya tersembunyi, sepenuhnya terukur."
      />
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-stretch gap-0 border border-slate-900/10 dark:border-white/10 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 100}>
                <div
                  className={classNames(
                    'relative flex h-full flex-col p-8 sm:p-12 transition-colors',
                    pkg.is_highlighted
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl'
                      : 'bg-transparent text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/30',
                    i !== 0 && 'border-t lg:border-t-0 lg:border-l border-slate-900/10 dark:border-white/10'
                  )}
                >
                  {pkg.is_highlighted && (
                    <div className="absolute top-0 right-0 bg-white text-slate-900 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest border-b border-l border-slate-900/10 dark:border-white/10">
                      Populer
                    </div>
                  )}
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="mt-4 text-3xl sm:text-4xl font-black tracking-tighter">
                    {formatPriceRange(pkg)}
                  </p>
                  <ul className="mt-10 flex-1 space-y-4">
                    {(pkg.features || []).map((f, idx) => (
                      <li
                        key={idx}
                        className={classNames(
                          'flex items-start gap-3 text-sm font-medium',
                          !f.is_included && 'opacity-40'
                        )}
                      >
                        <span className="mt-0.5">
                          {f.is_included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                        <span>{f.feature_text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-10 w-full"
                    variant={pkg.is_highlighted ? (document.documentElement.classList.contains('dark') ? 'primary' : 'outline') : 'outline'}
                    style={pkg.is_highlighted && !document.documentElement.classList.contains('dark') ? { borderColor: 'white', color: 'white' } : {}}
                    onClick={() => navigate(ROUTES.CONTACT)}
                  >
                    {pkg.cta_label || 'Konsultasi Sekarang'}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Membangun platform custom berskala besar?{' '}
              <button
                onClick={() => navigate(ROUTES.CONTACT)}
                className="font-bold text-slate-900 dark:text-white hover:underline underline-offset-4"
              >
                Diskusikan model enterprise →
              </button>
            </p>
          </Reveal>
        </div>
      </section>
      <FaqSection
        items={data.faq_items.filter((f) => f.category === 'Pricing')}
        title="Pertanyaan Seputar Biaya"
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
  <div className="border-b border-slate-900/10 dark:border-white/10 group">
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 py-6 text-left outline-none transition-colors group-hover:text-slate-500"
    >
      <span className="font-bold text-slate-900 dark:text-white sm:text-lg tracking-tight transition-colors">{item.question}</span>
      <Plus
        className={classNames(
          'h-5 w-5 flex-shrink-0 text-slate-900 dark:text-white transition-transform duration-300',
          open && 'rotate-45'
        )}
      />
    </button>
    <div
      className={classNames(
        'grid transition-all duration-300 ease-in-out',
        open ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <p className="font-medium leading-relaxed text-slate-500 dark:text-slate-400 pr-8">{item.answer}</p>
      </div>
    </div>
  </div>
);

export const FaqSection = ({ items, title }) => {
  const [openId, setOpenId] = useState(null);
  if (!items?.length) return null;
  return (
    <section className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {title && (
          <h2 className="mb-12 text-3xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-4xl text-center">
            {title}
          </h2>
        )}
        <div className="border-t border-slate-900/10 dark:border-white/10">
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
        description="Eksplorasi jawaban atas pertanyaan seputar layanan dan operasional kami."
      />
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative mb-8">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ketik untuk mencari..."
              className={classNames(inputClass, 'pl-11')}
            />
          </div>
          <div className="mb-12 flex flex-wrap gap-2 border-b border-slate-900/10 dark:border-white/10 pb-6">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={classNames(
                  'rounded-none px-4 py-2 text-[0.65rem] font-bold uppercase tracking-widest transition-colors border',
                  category === c
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-900/20 text-slate-500 hover:border-slate-900 dark:border-white/20 dark:text-slate-400 dark:hover:border-white'
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div className="border-t border-slate-900/10 dark:border-white/10">
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
            <EmptyState icon={HelpCircle} title="Tidak ditemukan jawaban." />
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
    if (!form.full_name.trim()) e.full_name = 'Wajib diisi';
    if (!form.email.trim()) e.email = 'Wajib diisi';
    else if (!isValidEmail(form.email)) e.email = 'Format salah';
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
      toast?.success('Berhasil terkirim.');
    } catch {
      toast?.error('Gagal terkirim.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactItems = [
    { label: 'Email', value: settings.contact_email || BRAND.email, copy: settings.contact_email || BRAND.email },
    { label: 'WhatsApp', value: `+${settings.whatsapp_number || BRAND.whatsapp}`, copy: settings.whatsapp_number || BRAND.whatsapp },
    { label: 'Kantor', value: settings.address || BRAND.address },
    { label: 'Operasional', value: settings.operating_hours || BRAND.hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title="Inisiasi Proyek"
        description="Ceritakan visi Anda. Tim kami akan merespons dengan solusi teknis dalam 1×24 jam."
      />
      <section className="py-24 border-b border-slate-900/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-0 border border-slate-900/10 dark:border-white/10">
            <div className="lg:col-span-2 p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-slate-800/20">
              <Reveal>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-10">
                  Jalur <span className="editorial-accent">Komunikasi</span>
                </h3>
                <div className="space-y-8">
                  {contactItems.map((c) => (
                    <div key={c.label} className="flex flex-col gap-1 border-b border-slate-900/10 dark:border-white/10 pb-4">
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
                        {c.label}
                      </p>
                      <div className="flex items-start justify-between gap-4 mt-1">
                        <p className="font-bold text-slate-900 dark:text-white leading-relaxed">{c.value}</p>
                        {c.copy && (
                          <button
                            onClick={async () => {
                              (await copyToClipboard(c.copy)) && toast?.info('Tersalin');
                            }}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-12">
                  <a href={buildWhatsAppLink(settings.whatsapp_number)} target="_blank" rel="noreferrer" className="block">
                    <Button className="w-full bg-[#25D366] text-white hover:bg-[#1DA851] border-none" icon={MessageCircle}>
                      Konsultasi WhatsApp
                    </Button>
                  </a>
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-3 p-8 sm:p-12 bg-white dark:bg-[#0A0A0B]">
              <Reveal delay={120}>
                {submitted ? (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                    <CheckCircle2 className="h-12 w-12 text-slate-900 dark:text-white mb-6" />
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Form Diterima.</h3>
                    <p className="mt-3 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
                      Visi Anda sudah berada di sistem kami. Kami akan segera menghubungi Anda.
                    </p>
                    <Button className="mt-8" variant="outline" onClick={() => setSubmitted(false)}>
                      Kirim Formulir Baru
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <fieldset disabled={submitting} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Nama Lengkap" required error={errors.full_name}>
                          <Input value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
                        </Field>
                        <Field label="Email Resmi" required error={errors.email}>
                          <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                        </Field>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="WhatsApp">
                          <Input type="tel" inputMode="numeric" value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
                        </Field>
                        <Field label="Entitas / Perusahaan">
                          <Input value={form.company} onChange={(e) => setField('company', e.target.value)} />
                        </Field>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Konsentrasi Layanan">
                          <Select value={form.service_interest} onChange={(e) => setField('service_interest', e.target.value)}>
                            <option value="" disabled>— Pilih —</option>
                            {SERVICE_INTEREST_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                          </Select>
                        </Field>
                        <Field label="Alokasi Anggaran">
                          <Select value={form.budget_range} onChange={(e) => setField('budget_range', e.target.value)}>
                            <option value="" disabled>— Pilih —</option>
                            {BUDGET_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
                          </Select>
                        </Field>
                      </div>
                      <Field label="Brief Proyek" required error={errors.message}>
                        <Textarea rows={6} value={form.message} onChange={(e) => setField('message', e.target.value)} placeholder="Deskripsikan skala dan objektif proyek..." />
                      </Field>
                      <Button type="submit" size="lg" className="w-full" loading={submitting}>
                        {submitting ? 'Memproses...' : 'Kirim Brief Proyek'}
                      </Button>
                    </fieldset>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};