import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { Code2, Smartphone, PenTool, Database, Cpu, Palette, MonitorSmartphone, Boxes, Layers, Globe, Wrench, Rocket, ShieldCheck, Gauge, Zap, Sparkles, Star, X, Inbox, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const BRAND = { name: 'Viska Labs Indonesia', short: 'Viska Labs', tagline: 'Creative Technology Agency', logo: '/assets/logo/logo_viskalabs.png', email: 'hello@viskalabs.id', whatsapp: '6281234567890', address: 'Kalimantan Selatan, Indonesia', hours: 'Senin – Minggu, 09.00 – 21.00 WITA', instagram: 'https://instagram.com/viskalabs', linkedin: 'https://linkedin.com/company/viskalabs', github: 'https://github.com/viskalabs' };
export const ROUTES = { HOME: 'home', ABOUT: 'about', SERVICES: 'services', PORTFOLIO: 'portfolio', PORTFOLIO_DETAIL: 'portfolio-detail', PRICING: 'pricing', TESTIMONIALS: 'testimonials', FAQ: 'faq', CONTACT: 'contact', ADMIN: 'admin' };
export const NAV_LINKS = [{ label: 'Beranda', route: ROUTES.HOME }, { label: 'Tentang', route: ROUTES.ABOUT }, { label: 'Layanan', route: ROUTES.SERVICES }, { label: 'Portfolio', route: ROUTES.PORTFOLIO }, { label: 'Harga', route: ROUTES.PRICING }, { label: 'Testimoni', route: ROUTES.TESTIMONIALS }, { label: 'FAQ', route: ROUTES.FAQ }, { label: 'Kontak', route: ROUTES.CONTACT }];
export const PORTFOLIO_CATEGORIES = ['Semua', 'Web Development', 'Web Application', 'Mobile App', 'UI/UX Design', 'Sistem Informasi'];
export const SERVICE_INTEREST_OPTIONS = ['Website Development', 'Web Application', 'Mobile App', 'UI/UX Design', 'Sistem Informasi', 'Maintenance & Support', 'Lainnya'];
export const BUDGET_OPTIONS = ['< Rp 5 juta', 'Rp 5 – 15 juta', 'Rp 15 – 50 juta', 'Rp 50 – 100 juta', '> Rp 100 juta'];
export const LEAD_STATUSES = ['new', 'in_progress', 'done', 'spam'];
export const TESTIMONIAL_STATUSES = ['pending', 'approved', 'rejected'];
export const ICON_MAP = { Code2, Smartphone, PenTool, Database, Cpu, Palette, MonitorSmartphone, Boxes, Layers, Globe, Wrench, Rocket, ShieldCheck, Gauge, Zap, Sparkles };
export const ICON_NAMES = Object.keys(ICON_MAP);

export const uid = () => 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const slugify = (text) => (text || '').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
export const formatRupiah = (value) => { if (value === null || value === undefined || value === '') return ''; const num = Number(value); if (Number.isNaN(num)) return value; return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num); };
export const formatPriceRange = (pkg) => { if (pkg.price_label) return pkg.price_label; if (pkg.price_from && pkg.price_to) { return `${formatRupiah(pkg.price_from)} – ${formatRupiah(pkg.price_to)}`; } if (pkg.price_from) return `Mulai ${formatRupiah(pkg.price_from)}`; return 'Hubungi Kami'; };
export const formatDate = (value) => { if (!value) return '-'; try { return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return value; } };
export const formatDateTime = (value) => { if (!value) return '-'; try { return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return value; } };
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
export const classNames = (...args) => args.filter(Boolean).join(' ');
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
export const buildWhatsAppLink = (number, message) => `https://wa.me/${(number || BRAND.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(message || 'Halo Viska Labs, saya tertarik untuk berdiskusi tentang proyek.')}`;
export const downloadCSV = (rows, filename) => { if (!rows || !rows.length) return; const headers = Object.keys(rows[0]); const escape = (val) => { const s = val === null || val === undefined ? '' : String(val); return `"${s.replace(/"/g, '""')}"`; }; const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); };
export const copyToClipboard = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
export const formatSocialDisplay = (input) => { if (!input) return ''; let clean = input.trim().replace(/\/$/, ''); if (clean.includes('/')) { const parts = clean.split('/'); clean = parts[parts.length - 1]; } clean = clean.replace(/^@/, ''); return clean ? `@${clean}` : ''; };
export const formatSocialLink = (input, platform) => { if (!input) return '#'; const clean = input.trim(); if (clean.startsWith('http://') || clean.startsWith('https://')) return clean; const username = clean.replace(/^@/, ''); if (platform === 'instagram') return `https://instagram.com/${username}`; if (platform === 'linkedin') return `https://www.linkedin.com/in/${username}`; return clean; };

export const SEED = {
  services: [
    { id: 'svc-1', name: 'Website Development', slug: 'website-development', short_description: 'Website company profile & landing page cepat, SEO-friendly, dan konversi tinggi.', full_description: 'Kami membangun website modern berbasis arsitektur terbaru dengan performa kelas dunia, optimasi SEO menyeluruh, dan desain yang merepresentasikan brand Anda secara premium.', icon_name: 'Code2', features: ['Desain custom & responsif', 'SEO on-page optimal', 'Core Web Vitals hijau', 'CMS untuk update mandiri'], is_active: true, sort_order: 1 },
    { id: 'svc-2', name: 'Web Application', slug: 'web-application', short_description: 'Aplikasi web kompleks: dashboard, SaaS, hingga sistem internal yang scalable.', full_description: 'Dari dashboard analitik hingga platform SaaS multi-tenant, kami merancang aplikasi web yang aman, cepat, dan mudah dikembangkan.', icon_name: 'Layers', features: ['Arsitektur scalable', 'Realtime & API integration', 'Role-based access', 'Cloud-native deployment'], is_active: true, sort_order: 2 },
    { id: 'svc-3', name: 'Mobile App', slug: 'mobile-app', short_description: 'Aplikasi mobile iOS & Android dengan pengalaman native yang mulus.', full_description: 'Aplikasi mobile cross-platform dengan animasi halus, offline support, dan integrasi penuh ke backend Anda.', icon_name: 'Smartphone', features: ['iOS & Android', 'UX native & gestur halus', 'Push notification', 'Integrasi backend penuh'], is_active: true, sort_order: 3 },
    { id: 'svc-4', name: 'UI/UX Design', slug: 'ui-ux-design', short_description: 'Riset, wireframe, hingga design system yang konsisten dan memikat.', full_description: 'Kami merancang pengalaman digital yang intuitif berbasis riset pengguna, lengkap dengan design system yang scalable.', icon_name: 'PenTool', features: ['User research & persona', 'Wireframe & prototype', 'Design system', 'Usability testing'], is_active: true, sort_order: 4 },
    { id: 'svc-5', name: 'Sistem Informasi', slug: 'sistem-informasi', short_description: 'Sistem informasi sekolah, organisasi, dan bisnis yang stabil & terintegrasi.', full_description: 'Sistem informasi terpadu untuk sekolah, yayasan, dan organisasi dengan modul lengkap dan dukungan jangka panjang.', icon_name: 'Database', features: ['Modul kustom sesuai kebutuhan', 'Manajemen data terpusat', 'Laporan & analitik', 'Support & maintenance'], is_active: true, sort_order: 5 },
    { id: 'svc-6', name: 'Maintenance & Support', slug: 'maintenance-support', short_description: 'Dukungan teknis, monitoring, dan pengembangan berkelanjutan.', full_description: 'Tim kami menjaga produk digital Anda tetap aman, cepat, dan up-to-date dengan layanan maintenance proaktif.', icon_name: 'Wrench', features: ['Monitoring 24/7', 'Security patching', 'Backup berkala', 'Pengembangan fitur baru'], is_active: true, sort_order: 6 },
  ],
  portfolios: [
    { id: 'pf-1', title: 'Nusantara EduCloud', slug: 'nusantara-educloud', short_description: 'Platform sistem informasi sekolah berbasis cloud untuk 120+ sekolah.', full_description: 'EduCloud adalah sistem informasi sekolah terpadu yang menangani manajemen siswa, nilai, presensi berbasis QR, dan pembayaran. Dibangun untuk skala nasional dengan arsitektur multi-tenant.', client_name: 'Yayasan Pendidikan Nusantara', tech_stack: ['React', 'Supabase', 'PostgreSQL', 'Tailwind'], project_url: 'https://example.com', thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', images: ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80'], category: 'Sistem Informasi', is_featured: true, is_published: true, sort_order: 1, completed_at: '2025-11-20' },
    { id: 'pf-2', title: 'Rasa Lokal Marketplace', slug: 'rasa-lokal-marketplace', short_description: 'Marketplace kuliner UMKM dengan pengalaman belanja yang imersif.', full_description: 'Marketplace yang menghubungkan UMKM kuliner dengan pelanggan. Dilengkapi pencarian cerdas, checkout mulus, dan dashboard penjual realtime.', client_name: 'Koperasi Rasa Lokal', tech_stack: ['Next.js', 'Supabase', 'Stripe', 'Framer Motion'], project_url: 'https://example.com', thumbnail_url: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80', images: [], category: 'Web Application', is_featured: true, is_published: true, sort_order: 2, completed_at: '2025-09-12' },
  ],
  pricing_packages: [
    { id: 'pkg-1', service_id: 'svc-1', name: 'Starter', price_from: 3000000, price_to: 7000000, price_label: '', is_highlighted: false, is_active: true, sort_order: 1, cta_label: 'Konsultasi Gratis', features: [{ id: 'f1', feature_text: 'Landing page hingga 5 section', is_included: true }, { id: 'f2', feature_text: 'Desain responsif', is_included: true }, { id: 'f3', feature_text: 'SEO dasar', is_included: true }, { id: 'f5', feature_text: 'CMS admin panel', is_included: false }] },
    { id: 'pkg-2', service_id: 'svc-1', name: 'Professional', price_from: 12000000, price_to: 30000000, price_label: '', is_highlighted: true, is_active: true, sort_order: 2, cta_label: 'Mulai Sekarang', features: [{ id: 'f1', feature_text: 'Website multi-halaman', is_included: true }, { id: 'f2', feature_text: 'Desain custom premium', is_included: true }, { id: 'f3', feature_text: 'SEO menyeluruh', is_included: true }, { id: 'f4', feature_text: 'CMS admin panel lengkap', is_included: true }] },
  ],
  testimonials: [
    { id: 'ts-1', client_name: 'Andini Pratiwi', client_title: 'Founder', client_company: 'Rasa Lokal', client_photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', content: 'Viska Labs mengubah ide kami menjadi platform yang luar biasa. Detail desain dan performanya benar-benar kelas dunia.', rating: 5, is_featured: true, status: 'approved', sort_order: 1 },
  ],
  leads: [],
  faq_items: [],
  team_members: [],
  site_settings: {
    company_name: BRAND.name, company_tagline: BRAND.tagline, whatsapp_number: BRAND.whatsapp, contact_email: BRAND.email, instagram_url: BRAND.instagram, linkedin_url: BRAND.linkedin, github_url: BRAND.github, address: BRAND.address, operating_hours: BRAND.hours, meta_title_default: `${BRAND.name} — ${BRAND.tagline}`, meta_description_default: 'Viska Labs Indonesia adalah creative technology agency spesialis website, aplikasi, dan sistem informasi.',
  },
};
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const useReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(node); } }, { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px 0px -40px 0px' });
    observer.observe(node); return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);
  return [ref, visible];
};
export const useCountUp = (target, { duration = 1800, start = false } = {}) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return; let raf; const startTime = performance.now(); const numericTarget = Number(target) || 0;
    const tick = (now) => { const progress = clamp((now - startTime) / duration, 0, 1); const eased = 1 - Math.pow(1 - progress, 3); setValue(Math.round(eased * numericTarget)); if (progress < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
};
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => { const scrollTop = window.scrollY; const height = document.documentElement.scrollHeight - window.innerHeight; setProgress(height > 0 ? clamp(scrollTop / height, 0, 1) : 0); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
};
export const useTheme = () => {
  const [theme, setTheme] = useState(() => { if (typeof window === 'undefined') return 'dark'; return localStorage.getItem('viska-theme') || 'dark'; });
  React.useLayoutEffect(() => { const root = document.documentElement; if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark'); localStorage.setItem('viska-theme', theme); }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggleTheme };
};

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export const GlobalStyles = () => (
  <style>{`
    :root { --bg-light: #F8FAFC; --bg-dark: #030F26; --text-light: #0F172A; --text-dark: #F8FAFC; }
    * { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: var(--bg-light); color: var(--text-light); }
    .dark body { background-color: var(--bg-dark); color: var(--text-dark); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(21, 102, 209, 0.3); border-radius: 10px; }
    .dark ::-webkit-scrollbar-thumb { background: rgba(21, 102, 209, 0.5); }
    
    @keyframes blob { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-50px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.9); } }
    @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .animate-blob { animation: blob 15s infinite alternate ease-in-out; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animate-marquee { animation: marquee 30s linear infinite; }
    
    .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }

    .glass, .glass-light { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 1.5rem; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); }
    .dark .glass, .dark .glass-light { background: rgba(5, 28, 72, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
    
    .shine-effect { position: relative; overflow: hidden; }
    .shine-effect::after { content: ''; position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg) translateX(-150%); }
    .shine-effect:hover::after { animation: shine 1.5s infinite; }
    html { overflow-x: hidden; }
  `}</style>
);

export const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
  const [ref, visible] = useReveal();
  return <Tag ref={ref} className={classNames('reveal', visible && 'is-visible', className)} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
};
export const Spinner = ({ className = '' }) => <Loader2 className={classNames('animate-spin', className)} />;

export const Button = ({ children, variant = 'primary', size = 'md', className = '', as: Tag = 'button', loading = false, icon: Icon, ...props }) => {
  // Fix: Mengatur tinggi dan padding tombol agar ramping dan proposional di mobile
  const base = 'inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl text-center font-bold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97] sm:whitespace-nowrap text-xs sm:text-[0.875rem]';
  const sizes = {
    sm: 'h-10 px-4',
    md: 'h-11 sm:h-12 px-5 sm:px-6',
    lg: 'h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base',
  };
  const variants = {
    primary: 'shine-effect bg-[#1566D1] text-white shadow-lg shadow-[#1566D1]/30 hover:bg-[#124691] hover:shadow-[#1566D1]/50 hover:-translate-y-0.5',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
    outline: 'bg-transparent text-[#1566D1] border-2 border-[#1566D1]/30 hover:border-[#1566D1] hover:bg-[#1566D1]/5 dark:text-white dark:border-white/20 dark:hover:border-white',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg',
  };
  return (
    <Tag className={classNames(base, sizes[size], variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : null}
      {children}
    </Tag>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const base = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider whitespace-normal break-words border transition-colors';
  const variants = {
    default: 'border-[#1566D1]/20 text-[#1566D1] bg-[#1566D1]/10 dark:border-[#7fb0f5]/30 dark:text-[#7fb0f5] dark:bg-[#1566D1]/20',
    glass: 'border-slate-200 text-slate-700 bg-white/70 dark:border-white/10 dark:text-white dark:bg-white/5 backdrop-blur-md shadow-sm',
    success: 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
    warning: 'border-amber-500/20 text-amber-600 bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
    danger: 'border-red-500/20 text-red-600 bg-red-500/10 dark:border-red-500/30 dark:text-red-400',
    neutral: 'border-slate-200 text-slate-500 bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:bg-white/5',
  };
  return <span className={classNames(base, variants[variant], className)}>{children}</span>;
};

export const GlassCard = ({ children, className = '', hover = true, ...props }) => (
  <div className={classNames('glass dark:glass glass-light p-5 sm:p-8 transition-all duration-300 relative overflow-hidden', hover && 'hover:-translate-y-1 hover:border-[#1566D1]/40 hover:shadow-2xl hover:shadow-[#1566D1]/10 dark:hover:border-white/30', className)} {...props}>{children}</div>
);

export const SectionHeading = ({ eyebrow, title, description, center = true, light }) => (
  <div className={classNames('max-w-3xl relative z-10', center && 'mx-auto text-center')}>
    {eyebrow && <Reveal><Badge variant={light ? 'glass' : 'default'} className="mb-4 sm:mb-6"><Sparkles className="h-3 w-3" /> {eyebrow}</Badge></Reveal>}
    <Reveal delay={80}><h2 className={classNames('text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-balance leading-tight', light ? 'text-white' : 'text-slate-900 dark:text-white')}>{title}</h2></Reveal>
    {description && <Reveal delay={160}><p className={classNames('mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed max-w-2xl font-medium', center && 'mx-auto', light ? 'text-slate-200' : 'text-slate-500 dark:text-slate-300')}>{description}</p></Reveal>}
  </div>
);

export const StarRating = ({ value = 5, size = 'h-4 w-4', interactive = false, onChange, className = '' }) => (
  <div className={classNames('inline-flex items-center gap-1', className)}>
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" disabled={!interactive} onClick={() => interactive && onChange?.(i)} className={classNames('p-1 -m-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]', interactive && 'cursor-pointer hover:scale-110 transition-transform duration-200')}>
        <Star className={classNames(size, i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600')} />
      </button>
    ))}
  </div>
);

export const Field = ({ label, error, required, children, hint }) => (
  <label className="block">
    {label && <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label} {required && <span className="text-red-500">*</span>}</span>}
    {children}
    {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
  </label>
);

export const inputClass = 'w-full h-12 rounded-2xl border-2 border-slate-200 bg-white/50 px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 hover:border-[#1566D1]/50 focus:bg-white focus:border-[#1566D1] focus:ring-4 focus:ring-[#1566D1]/10 outline-none transition-all duration-300 dark:border-white/10 dark:bg-[#030F26]/50 dark:text-white dark:hover:border-[#7fb0f5]/50 dark:focus:border-[#7fb0f5] dark:focus:bg-[#030F26]';
export const Input = ({ className = '', ...props }) => <input className={classNames(inputClass, className)} {...props} />;
export const Textarea = ({ className = '', rows = 4, ...props }) => <textarea rows={rows} className={classNames(inputClass, 'h-auto py-3 resize-none sm:resize-y', className)} {...props} />;
export const Select = ({ className = '', children, ...props }) => <select className={classNames(inputClass, 'appearance-none pr-10 bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-18px)_50%,calc(100%-13px)_50%] bg-no-repeat text-slate-900 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#030F26] dark:[&>option]:text-white', className)} {...props}>{children}</select>;

export const Toggle = ({ checked, onChange, label }) => (
  <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex min-w-0 max-w-full items-center gap-3 rounded-full text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#1566D1]">
    <span className={classNames('relative h-6 w-11 flex-shrink-0 rounded-full border border-transparent transition-colors duration-200', checked ? 'bg-[#1566D1]' : 'bg-slate-300 dark:bg-slate-700')}>
      <span className={classNames('absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </span>
    {label && <span className="min-w-0 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>}
  </button>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!open) return; const onKey = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6">
      <div className="fixed inset-0 bg-[#030F26]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={classNames('relative z-10 my-8 w-full rounded-3xl border border-white/10 bg-white dark:bg-[#030F26] shadow-2xl', sizes[size])}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 p-5 sm:p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 py-12 sm:py-16 px-6 text-center transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/10">
    <div className="mb-6 rounded-3xl bg-[#1566D1]/10 p-4 sm:p-5 text-[#1566D1]"><Icon className="h-8 w-8" /></div>
    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</p>
    {description && <p className="mt-2 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-8">{action}</div>}
  </div>
);

export const ServiceIcon = ({ name, className = 'h-6 w-6' }) => { const Icon = ICON_MAP[name] || Boxes; return <Icon className={className} />; };

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => { const id = uid(); setToasts((t) => [...t, { id, message, type }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500); }, []);
  const api = useMemo(() => ({ success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') }), [push]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className={classNames('flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl transition-all', t.type === 'success' && 'bg-emerald-500', t.type === 'error' && 'bg-red-500', t.type === 'info' && 'bg-[#1566D1]')}>
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5" />}{t.type === 'error' && <XCircle className="h-5 w-5" />}{t.type === 'info' && <Sparkles className="h-5 w-5" />}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const Instagram = ({ className = 'h-5 w-5' }) => ( <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> );
export const Linkedin = ({ className = 'h-5 w-5' }) => ( <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> );
export const Github = ({ className = 'h-5 w-5' }) => ( <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg> );

export const Logo = ({ onClick }) => (
  // Fix: Mengecilkan padding dan gap Logo di mobile agar Navbar tidak terlalu besar
  <button type="button" onClick={onClick} className="group inline-flex items-center gap-2 sm:gap-3 text-left outline-none transition-transform active:scale-95">
    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-white p-1.5 sm:p-2 shadow-sm ring-1 ring-slate-200 dark:ring-white/20">
      <img src={BRAND.logo} alt="Logo" className="h-full w-full object-contain" />
    </span>
    <span className="flex flex-col">
      <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">VISKA LABS</span>
      <span className="hidden sm:block mt-1 text-[0.6rem] font-bold tracking-widest text-[#1566D1] dark:text-[#7fb0f5] uppercase leading-none">Creative Technology</span>
    </span>
  </button>
);