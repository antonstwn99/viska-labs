import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu, X, ArrowRight, ArrowLeft, ArrowUpRight, Layers, ShieldCheck, Search, Mail, Phone, MapPin, Clock, Send, Plus, FolderKanban, Tag, MessageSquare, HelpCircle, Sun, Moon, ChevronDown, Check, ExternalLink, Building2, Calendar, Copy, CheckCircle2, MonitorSmartphone, Code2, Quote, Target, Lightbulb, Heart, Award, Boxes, Users, ImageIcon } from 'lucide-react';
import { BRAND, ROUTES, NAV_LINKS, PORTFOLIO_CATEGORIES, SERVICE_INTEREST_OPTIONS, BUDGET_OPTIONS, SEED, deepClone, uid, formatPriceRange, formatDate, formatDateTime, isValidEmail, classNames, clamp, buildWhatsAppLink, copyToClipboard, formatSocialDisplay, formatSocialLink, useScrollProgress, useToast, Reveal, Button, Badge, GlassCard, SectionHeading, StarRating, Field, inputClass, Input, Textarea, Select, EmptyState, ServiceIcon, Logo, Instagram, Linkedin, Github } from './ui';
import { SUPABASE_ENABLED, db } from './supabase';

export const useDataStore = () => {
  const [state, setState] = useState({ services: [], portfolios: [], pricing_packages: [], testimonials: [], leads: [], faq_items: [], team_members: [], site_settings: {} });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    if (!SUPABASE_ENABLED) { setState({ services: deepClone(SEED.services), portfolios: deepClone(SEED.portfolios), pricing_packages: deepClone(SEED.pricing_packages), testimonials: deepClone(SEED.testimonials), leads: deepClone(SEED.leads), faq_items: deepClone(SEED.faq_items), team_members: deepClone(SEED.team_members), site_settings: deepClone(SEED.site_settings) }); setLoading(false); return; }
    try {
      const [services, portfolios, pricing_packages, testimonials, leads, faq_items, team_members, site_settings] = await Promise.all([ db.getServices(), db.getPortfolios(), db.getPricingPackages(), db.getTestimonials(), db.getLeads().catch(() => []), db.getFaqItems(), db.getTeamMembers(), db.getSiteSettings() ]);
      setState({ services, portfolios, pricing_packages, testimonials, leads, faq_items, team_members, site_settings: { ...deepClone(SEED.site_settings), ...site_settings } });
    } catch (err) { setState({ services: deepClone(SEED.services), portfolios: deepClone(SEED.portfolios), pricing_packages: deepClone(SEED.pricing_packages), testimonials: deepClone(SEED.testimonials), leads: deepClone(SEED.leads), faq_items: deepClone(SEED.faq_items), team_members: deepClone(SEED.team_members), site_settings: deepClone(SEED.site_settings) }); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  const localAdd = (key, record) => setState((s) => ({ ...s, [key]: [...s[key], record] }));
  const localUpdate = (key, id, patch) => setState((s) => ({ ...s, [key]: s[key].map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const localRemove = (key, id) => setState((s) => ({ ...s, [key]: s[key].filter((r) => r.id !== id) }));

  const makeCrud = (key, remoteCreate, remoteUpdate, remoteDelete) => ({
    async create(data) { const payload = { id: data.id || uid(), created_at: data.created_at || new Date().toISOString(), ...data }; if (SUPABASE_ENABLED) { const created = await remoteCreate(payload); localAdd(key, created); return created; } localAdd(key, payload); return payload; },
    async update(id, data) { if (SUPABASE_ENABLED) { const updated = await remoteUpdate(id, data); localUpdate(key, id, updated); return updated; } localUpdate(key, id, data); return { id, ...data }; },
    async remove(id) { if (SUPABASE_ENABLED) { await remoteDelete(id); localRemove(key, id); return true; } localRemove(key, id); return true; },
  });

  const crud = useMemo(() => ({ portfolios: makeCrud('portfolios', db.createPortfolio, db.updatePortfolio, db.deletePortfolio), services: makeCrud('services', db.createService, db.updateService, db.deleteService), pricing_packages: makeCrud('pricing_packages', db.createPricingPackage, db.updatePricingPackage, db.deletePricingPackage), testimonials: makeCrud('testimonials', db.createTestimonial, db.updateTestimonial, db.deleteTestimonial), leads: makeCrud('leads', db.createLead, db.updateLead, db.deleteLead), faq_items: makeCrud('faq_items', db.createFaqItem, db.updateFaqItem, db.deleteFaqItem), team_members: makeCrud('team_members', db.createTeamMember, db.updateTeamMember, db.deleteTeamMember) }), []);
  const saveSettings = useCallback(async (settingsObj) => { if (SUPABASE_ENABLED) { await db.upsertSiteSettings(settingsObj); } setState((s) => ({ ...s, site_settings: { ...s.site_settings, ...settingsObj } })); }, []);
  return { state, loading, crud, saveSettings, reload: loadAll };
};

export const Background = () => (
  <div className="fixed inset-0 -z-10 bg-[#F8FAFC] dark:bg-[#030F26] overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(21,102,209,1) 1px, transparent 1px), linear-gradient(90deg, rgba(21,102,209,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
    <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#1566D1]/5 dark:bg-[#1566D1]/15 blur-[120px] pointer-events-none animate-slow-blob" />
    <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#7fb0f5]/10 dark:bg-[#0B2F6B]/30 blur-[120px] pointer-events-none animate-slow-blob animation-delay-4000" />
  </div>
);

export const ScrollProgressBar = () => {
  const progress = useScrollProgress();
  return <div className="fixed left-0 top-0 z-[100] h-1 w-full bg-transparent pointer-events-none"><div className="h-full bg-gradient-to-r from-[#1566D1] to-[#7fb0f5] origin-left will-change-transform" style={{ transform: `scaleX(${progress})` }} /></div>;
};

export const Navbar = ({ route, navigate, theme, toggleTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 20); onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  const go = (r) => { navigate(r); setOpen(false); };
  
  return (
    <header className={classNames('fixed inset-x-0 top-0 z-[80] transition-all duration-300', scrolled ? 'py-3 sm:py-4' : 'py-4 sm:py-6')}>
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className={classNames('flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 transition-all duration-300 border', scrolled ? 'bg-white/80 dark:bg-[#051C48]/80 backdrop-blur-xl border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-900/5' : 'bg-white/40 dark:bg-[#051C48]/40 backdrop-blur-md border-transparent')}>
          <Logo onClick={() => go(ROUTES.HOME)} />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button key={link.route} onClick={() => go(link.route)} className={classNames('rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200', route === link.route ? 'bg-[#1566D1] text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white')}>
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={() => go(ROUTES.ADMIN)} className="hidden md:inline-flex rounded-xl p-2.5 text-slate-500 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"><ShieldCheck className="h-5 w-5" /></button>
            <button onClick={toggleTheme} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Button size="sm" className="hidden md:inline-flex" onClick={() => go(ROUTES.CONTACT)}>Kirim Pesan</Button>
            <button onClick={() => setOpen((o) => !o)} className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 lg:hidden">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="mt-3 rounded-2xl bg-white/95 dark:bg-[#051C48]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-3 shadow-2xl lg:hidden max-h-[75vh] overflow-y-auto">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button key={link.route} onClick={() => go(link.route)} className={classNames('rounded-xl px-4 py-3.5 text-left text-sm font-bold transition-colors', route === link.route ? 'bg-[#1566D1] text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5')}>
                  {link.label}
                </button>
              ))}
              <div className="mt-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <Button className="w-full" onClick={() => go(ROUTES.CONTACT)}>Kirim Pesan</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export const Footer = ({ navigate, settings }) => (
  <footer className="border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#030F26] mt-32">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo onClick={() => navigate(ROUTES.HOME)} />
          <p className="mt-5 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {settings.company_tagline || BRAND.tagline}.
          </p>
          <div className="mt-8 flex gap-3">
            {[{ icon: Instagram, url: settings.instagram_url }, { icon: Linkedin, url: settings.linkedin_url }, { icon: Github, url: settings.github_url }].map(({ icon: Icon, url }, i) => (
              <a key={i} href={url || '#'} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#1566D1] hover:text-white dark:bg-white/5 dark:text-slate-400 dark:hover:bg-[#1566D1] dark:hover:text-white">
                {Icon && <Icon className="h-4 w-4" />}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs text-slate-900 dark:text-white mb-6">Navigasi</h4>
          <ul className="space-y-4 text-sm font-medium">
            {NAV_LINKS.map((l) => (<li key={l.route}><button onClick={() => navigate(l.route)} className="text-slate-600 hover:text-[#1566D1] dark:text-slate-400 dark:hover:text-white transition-colors">{l.label}</button></li>))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs text-slate-900 dark:text-white mb-6">Layanan</h4>
          <ul className="space-y-4 text-sm font-medium">
            {['Website Development', 'Web Application', 'Mobile App', 'UI/UX Design', 'Sistem Informasi'].map((s) => (<li key={s}><button onClick={() => navigate(ROUTES.SERVICES)} className="text-slate-600 hover:text-[#1566D1] dark:text-slate-400 dark:hover:text-white transition-colors">{s}</button></li>))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs text-slate-900 dark:text-white mb-6">Kontak</h4>
          <ul className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <li><a href={`mailto:${settings.contact_email || BRAND.email}`} className="flex items-center gap-3 hover:text-[#1566D1] dark:hover:text-white transition-colors"><Mail className="h-4 w-4" /> {settings.contact_email || BRAND.email}</a></li>
            <li><a href={`tel:+${(settings.whatsapp_number || BRAND.whatsapp).replace(/\D/g, '')}`} className="flex items-center gap-3 hover:text-[#1566D1] dark:hover:text-white transition-colors"><Phone className="h-4 w-4" /> +{settings.whatsapp_number || BRAND.whatsapp}</a></li>
            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> <span>{settings.address || BRAND.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10 pt-8 text-sm font-bold text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} {settings.company_name || BRAND.name}. Hak Cipta Dilindungi.</p>
        <button onClick={() => navigate(ROUTES.ADMIN)} className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"><ShieldCheck className="h-4 w-4" /> Admin Panel</button>
      </div>
    </div>
  </footer>
);

export const FloatingWhatsApp = ({ settings }) => (
  <div className="fixed bottom-5 left-5 z-[85] animate-slow-blob">
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

const HeroSection = ({ navigate }) => (
  <section className="relative pt-32 pb-16 sm:pt-44 sm:pb-24">
    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 relative z-10">
      <Reveal>
        <Badge variant="glass" className="mb-6 px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#1566D1]" />
          Creative Technology Agency
        </Badge>
      </Reveal>
      <Reveal delay={100}>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
          Infrastruktur digital yang <span className="editorial-accent">dirancang</span> untuk dampak nyata.
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-xl font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          Kami merancang dan membangun sistem informasi internal, aplikasi SaaS, dan produk perangkat lunak khusus untuk kebutuhan bisnis Anda.
        </p>
      </Reveal>
      <Reveal delay={300}>
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => navigate(ROUTES.PORTFOLIO)} className="w-full sm:w-auto" icon={Layers}>Lihat Repositori Proyek</Button>
          <Button size="lg" variant="outline" onClick={() => navigate(ROUTES.CONTACT)} className="w-full sm:w-auto" icon={Send}>Kirim Detail Kebutuhan</Button>
        </div>
      </Reveal>
    </div>
  </section>
);

const TechStack = () => {
  const items = ['React', 'Next.js', 'Supabase', 'Tailwind CSS', 'TypeScript', 'PostgreSQL', 'Node.js', 'Figma'];
  return (
    <section className="py-8 border-y border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#030F26]/50 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
          {items.map((t, i) => (
            <span key={i} className="text-sm font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service, navigate, delay }) => (
  <Reveal delay={delay}>
    <GlassCard className="flex flex-col h-full group">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#1566D1] group-hover:text-white">
        <ServiceIcon name={service.icon_name} className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{service.name}</h3>
      <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">{service.short_description}</p>
      <button onClick={() => navigate(ROUTES.SERVICES)} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1566D1] dark:text-[#7fb0f5] group-hover:gap-3 transition-all">
        Baca Spesifikasi <ArrowRight className="h-4 w-4" />
      </button>
    </GlassCard>
  </Reveal>
);

const ServicesPreview = ({ services, navigate }) => (
  <section className="py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHeading center={false} eyebrow="Layanan Pengembangan" title="Area Fokus Pengerjaan" description="Kami menangani rekayasa kode dan infrastruktur sistem dengan standar industri terkini." />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 3).map((s, i) => <ServiceCard key={s.id} service={s} navigate={navigate} delay={i * 80} />)}
      </div>
    </div>
  </section>
);

const PortfolioCard = ({ item, navigate, delay }) => (
  <Reveal delay={delay}>
    <button onClick={() => navigate(ROUTES.PORTFOLIO_DETAIL, { slug: item.slug })} className="group block w-full text-left bg-white/80 dark:bg-[#0B2F6B]/40 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#1566D1]/50 dark:hover:border-white/30 hover:shadow-2xl hover:shadow-[#1566D1]/10 hover:-translate-y-1.5 transition-all duration-300">
      <div className="w-full bg-slate-100 dark:bg-[#030F26] aspect-video overflow-hidden border-b border-slate-200/50 dark:border-white/5">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Visual Pending</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <Badge variant="neutral" className="mb-4">{item.category}</Badge>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#1566D1] transition-colors">{item.title}</h3>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{item.client_name}</p>
      </div>
    </button>
  </Reveal>
);

const PortfolioHighlights = ({ portfolios, navigate }) => {
  const published = portfolios.filter((p) => p.is_published).slice(0, 4);
  return (
    <section className="py-24 bg-white/40 dark:bg-[#051C48]/40 border-y border-slate-200 dark:border-white/10 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <SectionHeading center={false} eyebrow="Studi Kasus" title="Implementasi Lingkungan Produksi" />
          <Reveal><Button variant="outline" onClick={() => navigate(ROUTES.PORTFOLIO)} icon={ArrowRight}>Lihat Semua Arsip</Button></Reveal>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {published.map((p, i) => <PortfolioCard key={p.id} item={p} navigate={navigate} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
};

const WhyChooseUs = () => {
  const reasons = [
    { icon: Code2, title: 'Kode Teroptimasi', desc: 'Sistem dibangun dengan prinsip arsitektur perangkat lunak yang bersih, memudahkan pemeliharaan jangka panjang.' },
    { icon: MonitorSmartphone, title: 'Desain Responsif', desc: 'Antarmuka menyesuaikan dengan resolusi layar pengguna dari perangkat seluler hingga monitor desktop.' },
    { icon: ShieldCheck, title: 'Keamanan Basis Data', desc: 'Penerapan autentikasi dan otorisasi untuk memastikan data pengguna tersimpan dan diakses sesuai aturan.' },
    { icon: Layers, title: 'Dokumentasi Sistem', desc: 'Kami menyertakan dokumentasi teknis untuk setiap kode sumber yang diserahkan pada akhir pengerjaan.' },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading title="Standar Teknis" />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <GlassCard className="text-center h-full">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1]"><r.icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{r.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">{r.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsPreview = ({ testimonials }) => {
  const approved = testimonials.filter((t) => t.status === 'approved');
  return (
    <section className="py-24 bg-white/40 dark:bg-[#051C48]/40 border-y border-slate-200 dark:border-white/10 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading title="Ulasan Pengguna" />
        <div className="mt-14">
          {approved.length ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {approved.map((t, i) => (
                <Reveal key={t.id} delay={i * 80}>
                  <GlassCard className="h-full">
                    <Quote className="mb-6 h-10 w-10 text-[#1566D1]/20" />
                    <p className="text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-300">"{t.content}"</p>
                    <div className="mt-8 flex items-center gap-4">
                      {t.client_photo_url && <img src={t.client_photo_url} alt="" className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-[#030F26]" />}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{t.client_name}</p>
                        <p className="text-sm font-bold text-[#1566D1]">{t.client_title}</p>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal><EmptyState icon={MessageSquare} title="Belum ada ulasan publik" description="Ulasan dari klien akan ditampilkan pada area ini setelah diverifikasi." /></Reveal>
          )}
        </div>
      </div>
    </section>
  );
};

export const CtaSection = ({ navigate }) => (
  <section className="py-24">
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <Reveal>
        <div className="rounded-[2.5rem] bg-[#051C48] p-10 text-center sm:p-20 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1566D1]/20 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Ajukan Spesifikasi Proyek</h2>
            <p className="mt-6 text-lg font-medium text-slate-300 max-w-2xl mx-auto">Sampaikan dokumen kebutuhan bisnis Anda untuk mendapatkan penawaran teknis dari kami.</p>
            <div className="mt-10 flex justify-center"><Button size="lg" onClick={() => navigate(ROUTES.CONTACT)} icon={Send}>Kirim Pesan</Button></div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export const HomePage = ({ data, navigate }) => (
  <>
    <HeroSection navigate={navigate} />
    <TechStack />
    <ServicesPreview services={data.services.filter((s) => s.is_active)} navigate={navigate} />
    <PortfolioHighlights portfolios={data.portfolios} navigate={navigate} />
    <WhyChooseUs />
    <TestimonialsPreview testimonials={data.testimonials} />
    <CtaSection navigate={navigate} />
  </>
);

const PageHero = ({ title, description }) => (
  <section className="pt-36 pb-16 sm:pt-44 sm:pb-20 border-b border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#051C48]/40 backdrop-blur-md">
    <div className="mx-auto max-w-4xl px-4 sm:px-6">
      <SectionHeading center={false} title={title} description={description} />
    </div>
  </section>
);

/* IMPROVISASI 1: Halaman Tentang (Visi Misi Gabungan Sinematik) */
export const AboutPage = ({ data, navigate }) => {
  const team = data.team_members.filter((m) => m.is_active);
  return (
    <>
      <PageHero title="Profil Perusahaan" description="Viska Labs adalah badan usaha yang menyediakan layanan penulisan kode sumber dan perancangan antarmuka pengguna." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center bg-[#051C48] rounded-[2rem] p-10 sm:p-16 overflow-hidden relative shadow-2xl border border-white/10">
              <div className="absolute top-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-[#1566D1]/20 blur-[100px] pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#7fb0f5] mb-4">Visi Utama</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-white leading-snug">Menjadi standar emas praktik rekayasa perangkat lunak di Indonesia melalui kode yang bersih dan visual yang berkarakter.</p>
                </div>
                <div className="w-16 h-1 bg-white/20 rounded-full" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#7fb0f5] mb-4">Misi Operasional</h3>
                  <p className="text-lg text-slate-300 leading-relaxed">Menghadirkan arsitektur sistem kelas enterprise dengan performa tinggi, keamanan berlapis, dan alur pengguna yang intuitif pada setiap penugasan.</p>
                </div>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-4">
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center"><Target className="h-8 w-8 text-[#7fb0f5] mx-auto mb-3" /><p className="text-white font-bold">Fokus Hasil</p></div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center mt-8"><Lightbulb className="h-8 w-8 text-[#7fb0f5] mx-auto mb-3" /><p className="text-white font-bold">Inovasi</p></div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center"><Award className="h-8 w-8 text-[#7fb0f5] mx-auto mb-3" /><p className="text-white font-bold">Kualitas</p></div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-center mt-8"><Heart className="h-8 w-8 text-[#7fb0f5] mx-auto mb-3" /><p className="text-white font-bold">Dedikasi</p></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="py-20 bg-white/40 dark:bg-[#051C48]/40 border-t border-slate-200 dark:border-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading center={false} title="Personel" description="Individu yang bertanggung jawab atas penulisan dan tinjauan kode." />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.length ? team.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <GlassCard className="text-center h-full">
                  <div className="mx-auto mb-6 h-24 w-24 bg-slate-200 dark:bg-[#030F26] rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-lg">
                    {m.photo_url ? <img src={m.photo_url} alt="" className="h-full w-full object-cover" /> : <Users className="m-auto mt-6 h-10 w-10 text-slate-400" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{m.name}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#1566D1] dark:text-[#7fb0f5]">{m.role}</p>
                </GlassCard>
              </Reveal>
            )) : <div className="col-span-full"><Reveal><EmptyState icon={Users} title="Daftar personel belum dimasukkan" /></Reveal></div>}
          </div>
        </div>
      </section>
    </>
  );
};

/* IMPROVISASI 2: Halaman Layanan (Tata Letak Zig-Zag untuk RHYTHM 2) */
export const ServicesPage = ({ data, navigate }) => {
  const services = data.services.filter((s) => s.is_active);
  return (
    <>
      <PageHero title="Katalog Layanan" description="Daftar kapabilitas teknis yang disediakan oleh Viska Labs." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={80}>
              <div className={classNames('flex flex-col gap-12 md:items-center', i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse')}>
                <div className="flex-1 w-full bg-slate-100 dark:bg-[#030F26] aspect-video rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1566D1]/10 to-transparent" />
                  <ServiceIcon name={s.icon_name} className="h-24 w-24 text-[#1566D1]/40" />
                </div>
                <div className="flex-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1566D1]/10 text-[#1566D1]"><ServiceIcon name={s.icon_name} className="h-6 w-6" /></div>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="mt-4 text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">{s.full_description}</p>
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    {(s.features || []).map((f, i) => <li key={i} className="flex items-center gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1566D1]/10 text-[#1566D1]"><Check className="h-3.5 w-3.5" /></span>{f}</li>)}
                  </ul>
                  <div className="mt-10 flex gap-4"><Button onClick={() => navigate(ROUTES.PRICING)}>Lihat Skema Biaya</Button></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

export const PortfolioPage = ({ data, navigate }) => {
  const published = data.portfolios.filter((p) => p.is_published);
  return (
    <>
      <PageHero title="Repositori Proyek" description="Kumpulan implementasi perangkat lunak yang telah diselesaikan." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {published.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {published.map((p, i) => <PortfolioCard key={p.id} item={p} navigate={navigate} delay={i * 80} />)}
            </div>
          ) : <Reveal><EmptyState icon={FolderKanban} title="Belum ada repositori terbuka" /></Reveal>}
        </div>
      </section>
    </>
  );
};

export const PortfolioDetailPage = ({ data, navigate, params }) => {
  const item = data.portfolios.find((p) => p.slug === params?.slug);
  if (!item) return <section className="pt-40 pb-20"><div className="mx-auto max-w-2xl px-4"><EmptyState icon={FolderKanban} title="Dokumen tidak ditemukan" action={<Button onClick={() => navigate(ROUTES.PORTFOLIO)}>Kembali</Button>} /></div></section>;
  return (
    <>
      <PageHero title={item.title} description={item.short_description} />
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="bg-slate-100 dark:bg-[#030F26] border border-slate-200 dark:border-white/10 rounded-2xl aspect-video overflow-hidden mb-14 shadow-xl">
              {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" /> : null}
            </div>
          </Reveal>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="md:col-span-2">
              <Reveal><h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Uraian Teknis</h2></Reveal>
              <Reveal delay={80}><p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">{item.full_description}</p></Reveal>
            </div>
            <div>
              <Reveal delay={160}>
                <GlassCard hover={false} className="sticky top-32">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Data Proyek</h3>
                  <ul className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-3"><Building2 className="h-4 w-4 text-[#1566D1]" /> {item.client_name || '-'}</li>
                    <li className="flex items-center gap-3"><Layers className="h-4 w-4 text-[#1566D1]" /> {item.category}</li>
                  </ul>
                  <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Tumpukan Kode</h4>
                    <div className="flex flex-wrap gap-2">
                      {(item.tech_stack || []).map((t) => <span key={t} className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">{t}</span>)}
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export const PricingPage = ({ data, navigate }) => {
  const packages = data.pricing_packages.filter((p) => p.is_active);
  return (
    <>
      <PageHero title="Skema Penagihan" description="Rincian biaya berdasarkan spesifikasi cakupan sistem." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:items-center">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.id} delay={i * 100}>
              <div className={classNames('relative h-full flex flex-col rounded-[2rem] p-8 sm:p-10 transition-all duration-500 border', pkg.is_highlighted ? 'bg-gradient-to-b from-[#1566D1] to-[#0B2F6B] border-[#7fb0f5]/30 shadow-2xl shadow-[#1566D1]/30 z-10 md:scale-105' : 'bg-white/80 dark:bg-[#0B2F6B]/40 backdrop-blur-xl border-slate-200/80 dark:border-white/10 hover:-translate-y-2')}>
                {pkg.is_highlighted && <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#d2fc01] px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#051C48] shadow-lg">Paling Diminati</span>}
                <h3 className={classNames('text-xl font-bold', pkg.is_highlighted ? 'text-white' : 'text-slate-900 dark:text-white')}>{pkg.name}</h3>
                <p className={classNames('mt-4 text-4xl font-black tracking-tight', pkg.is_highlighted ? 'text-white' : 'text-slate-900 dark:text-white')}>{formatPriceRange(pkg)}</p>
                <ul className="mt-8 flex-1 space-y-4 text-sm font-medium">
                  {(pkg.features || []).map((f, i) => (
                    <li key={i} className={classNames('flex items-start gap-3', f.is_included ? '' : 'opacity-40', pkg.is_highlighted ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300')}>
                      <span className={classNames('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', f.is_included ? (pkg.is_highlighted ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500') : (pkg.is_highlighted ? 'bg-white/10 text-white/50' : 'bg-slate-200 text-slate-400'))}><Check className="h-3 w-3" /></span>
                      {f.feature_text}
                    </li>
                  ))}
                </ul>
                <Button className="mt-10 w-full" variant={pkg.is_highlighted ? 'secondary' : 'outline'} onClick={() => navigate(ROUTES.CONTACT)}>Pilih Spesifikasi</Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

/* IMPROVISASI 3: Halaman Testimoni (Tata Letak Masonry Organik) */
export const TestimonialsPage = ({ data, navigate }) => {
  const approved = data.testimonials.filter((t) => t.status === 'approved');
  return (
    <>
      <PageHero title="Ulasan Klien" description="Dokumentasi pendapat pihak ketiga terhadap layanan kami." />
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {approved.length ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
              {approved.map((t, i) => (
                <Reveal key={t.id} delay={i * 80}>
                  <GlassCard className="break-inside-avoid mb-8 flex flex-col">
                    <Quote className="mb-4 h-8 w-8 text-[#1566D1]/30" />
                    <p className="text-base font-medium leading-relaxed text-slate-700 dark:text-slate-300 flex-1">"{t.content}"</p>
                    <div className="mt-8 border-t border-slate-200 dark:border-white/10 pt-5">
                      <p className="font-bold text-slate-900 dark:text-white">{t.client_name}</p>
                      <p className="text-xs font-bold text-[#1566D1] mt-1">{t.client_title}</p>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          ) : <Reveal><EmptyState icon={MessageSquare} title="Catatan ulasan belum tersedia" /></Reveal>}
        </div>
      </section>
    </>
  );
};

/* IMPROVISASI 4: Halaman FAQ (Sistem Accordion Interaktif) */
const FaqAccordionItem = ({ item, open, onToggle }) => (
  <div className="overflow-hidden rounded-2xl glass dark:glass glass-light transition border border-slate-200/80 dark:border-white/10 mb-4">
    <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left outline-none transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
      <span className="font-bold text-slate-900 dark:text-white sm:text-lg">{item.question}</span>
      <ChevronDown className={classNames('h-5 w-5 flex-shrink-0 text-[#1566D1] transition-transform duration-300', open && 'rotate-180')} />
    </button>
    <div className={classNames('grid transition-all duration-300 ease-in-out', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
      <div className="overflow-hidden">
        <p className="px-5 sm:px-6 pb-6 font-medium leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/5 pt-4 mt-2">{item.answer}</p>
      </div>
    </div>
  </div>
);

export const FaqPage = ({ data }) => {
  const published = data.faq_items.filter((f) => f.is_published);
  const [openId, setOpenId] = useState(null);
  return (
    <>
      <PageHero title="Daftar Pertanyaan" description="Informasi teknis dan operasional." />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {published.length ? (
            <div className="space-y-2">
              {published.map((f, i) => (
                <Reveal key={f.id} delay={i * 50}>
                  <FaqAccordionItem item={f} open={openId === f.id} onToggle={() => setOpenId((id) => (id === f.id ? null : f.id))} />
                </Reveal>
              ))}
            </div>
          ) : <Reveal><EmptyState icon={HelpCircle} title="Dokumen belum diisi" /></Reveal>}
        </div>
      </section>
    </>
  );
};

/* IMPROVISASI 5: Halaman Kontak (Panel Solid Menyatu) */
export const ContactPage = ({ data, crud }) => {
  const toast = useToast();
  const settings = data.site_settings;
  const empty = { full_name: '', email: '', whatsapp: '', company: '', service_interest: '', budget_range: '', message: '' };
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.message) { toast?.error('Identitas dan pesan wajib diisi'); return; }
    setSubmitting(true);
    try {
      await crud.leads.create({ ...form, status: 'new', source_page: 'contact', created_at: new Date().toISOString() });
      setForm(empty); toast?.success('Pesan tersimpan di basis data.');
    } catch { toast?.error('Kesalahan pengiriman.'); } finally { setSubmitting(false); }
  };

  return (
    <>
      <PageHero title="Pengiriman Dokumen Proyek" description="Formulir untuk menyerahkan detail kebutuhan perangkat lunak." />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="grid lg:grid-cols-5 gap-0 bg-white/80 dark:bg-[#0B2F6B]/40 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="lg:col-span-2 bg-[#051C48] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1566D1]/30 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-8">Informasi Kontak</h3>
                  <div className="space-y-8 flex-1">
                    <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white"><Mail className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Email</p><p className="font-medium">{settings.contact_email || BRAND.email}</p></div></div>
                    <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white"><Phone className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Telepon</p><p className="font-medium">+{settings.whatsapp_number || BRAND.whatsapp}</p></div></div>
                    <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white"><MapPin className="h-5 w-5" /></div><div><p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Alamat</p><p className="font-medium">{settings.address || BRAND.address}</p></div></div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 p-10 sm:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Formulir Pengajuan</h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Identitas Pengirim"><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></Field>
                    <Field label="Alamat Surat Elektronik"><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
                  </div>
                  <Field label="Pesan atau Spesifikasi Kebutuhan"><Textarea rows={6} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></Field>
                  <div className="pt-4"><Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto" icon={Send}>Kirim ke Antrean</Button></div>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};