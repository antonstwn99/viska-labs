import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import { Code2, Smartphone, PenTool, Database, Cpu, Palette, MonitorSmartphone, Boxes, Layers, Globe, Wrench, Rocket, ShieldCheck, Gauge, Zap, Sparkles, Star, X, Inbox, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const BRAND = { name: 'Viska Labs Indonesia', short: 'Viska Labs', tagline: 'Creative Technology Agency', logo: '/assets/logo/logo_viskalabs.png', email: 'hello@viskalabs.id', whatsapp: '6281234567890', address: 'Kalimantan Selatan, Indonesia', hours: 'Senin - Minggu, 09.00 - 21.00 WITA', instagram: 'https://instagram.com/viskalabs', linkedin: 'https://linkedin.com/company/viskalabs', github: 'https://github.com/viskalabs' };
export const ROUTES = { HOME: 'home', ABOUT: 'about', SERVICES: 'services', PORTFOLIO: 'portfolio', PORTFOLIO_DETAIL: 'portfolio-detail', PRICING: 'pricing', TESTIMONIALS: 'testimonials', FAQ: 'faq', CONTACT: 'contact', ADMIN: 'admin' };
export const NAV_LINKS = [{ label: 'Beranda', route: ROUTES.HOME }, { label: 'Tentang', route: ROUTES.ABOUT }, { label: 'Layanan', route: ROUTES.SERVICES }, { label: 'Portfolio', route: ROUTES.PORTFOLIO }, { label: 'Harga', route: ROUTES.PRICING }, { label: 'Testimoni', route: ROUTES.TESTIMONIALS }, { label: 'FAQ', route: ROUTES.FAQ }, { label: 'Kontak', route: ROUTES.CONTACT }];
export const PORTFOLIO_CATEGORIES = ['Semua', 'Web Development', 'Web Application', 'Mobile App', 'UI/UX Design', 'Sistem Informasi'];
export const SERVICE_INTEREST_OPTIONS = ['Website Development', 'Web Application', 'Mobile App', 'UI/UX Design', 'Sistem Informasi', 'Maintenance & Support', 'Lainnya'];
export const BUDGET_OPTIONS = ['< Rp 5 juta', 'Rp 5 - 15 juta', 'Rp 15 - 50 juta', 'Rp 50 - 100 juta', '> Rp 100 juta'];
export const LEAD_STATUSES = ['new', 'in_progress', 'done', 'spam'];
export const TESTIMONIAL_STATUSES = ['pending', 'approved', 'rejected'];
export const ICON_MAP = { Code2, Smartphone, PenTool, Database, Cpu, Palette, MonitorSmartphone, Boxes, Layers, Globe, Wrench, Rocket, ShieldCheck, Gauge, Zap, Sparkles };
export const ICON_NAMES = Object.keys(ICON_MAP);

export const uid = () => 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const slugify = (text) => (text || '').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
export const formatRupiah = (value) => { if (value === null || value === undefined || value === '') return ''; const num = Number(value); if (Number.isNaN(num)) return value; return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num); };
export const formatPriceRange = (pkg) => { if (pkg.price_label) return pkg.price_label; if (pkg.price_from && pkg.price_to) { return `${formatRupiah(pkg.price_from)} - ${formatRupiah(pkg.price_to)}`; } if (pkg.price_from) return `Mulai ${formatRupiah(pkg.price_from)}`; return 'Kirim Detail Proyek'; };
export const formatDate = (value) => { if (!value) return '-'; try { return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return value; } };
export const formatDateTime = (value) => { if (!value) return '-'; try { return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return value; } };
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
export const classNames = (...args) => args.filter(Boolean).join(' ');
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
export const buildWhatsAppLink = (number, message) => `https://wa.me/${(number || BRAND.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(message || 'Halo Viska Labs, saya ingin berdiskusi mengenai proyek saya.')}`;
export const downloadCSV = (rows, filename) => { if (!rows || !rows.length) return; const headers = Object.keys(rows[0]); const escape = (val) => { const s = val === null || val === undefined ? '' : String(val); return `"${s.replace(/"/g, '""')}"`; }; const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n'); const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); };
export const copyToClipboard = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
export const formatSocialDisplay = (input) => { if (!input) return ''; let clean = input.trim().replace(/\/$/, ''); if (clean.includes('/')) { const parts = clean.split('/'); clean = parts[parts.length - 1]; } clean = clean.replace(/^@/, ''); return clean ? `@${clean}` : ''; };
export const formatSocialLink = (input, platform) => { if (!input) return '#'; const clean = input.trim(); if (clean.startsWith('http://') || clean.startsWith('https://')) return clean; const username = clean.replace(/^@/, ''); if (platform === 'instagram') return `https://instagram.com/${username}`; if (platform === 'linkedin') return `https://www.linkedin.com/in/${username}`; return clean; };

export const SEED = {
  services: [
    { id: 'svc-1', name: 'Website Development', slug: 'website-development', short_description: 'Platform profil perusahaan yang cepat diakses dan terindeks maksimal.', full_description: 'Kami membangun website menggunakan arsitektur modern. Fokus pada waktu muat halaman yang singkat dan struktur data yang rapi untuk mesin pencari.', icon_name: 'Code2', features: ['Tata letak responsif', 'Struktur kode on-page', 'Optimasi Core Web Vitals', 'Sistem manajemen konten'], is_active: true, sort_order: 1 },
    { id: 'svc-2', name: 'Web Application', slug: 'web-application', short_description: 'Perangkat lunak web fungsional untuk dasbor internal atau produk SaaS.', full_description: 'Pengembangan sistem berbasis web dari dasbor manajemen hingga platform multi-penyewa, dirancang untuk keamanan data dan skalabilitas.', icon_name: 'Layers', features: ['Arsitektur modular', 'Integrasi API eksternal', 'Kontrol akses multi-peran', 'Infrastruktur cloud'], is_active: true, sort_order: 2 },
    { id: 'svc-3', name: 'Mobile App', slug: 'mobile-app', short_description: 'Aplikasi perangkat bergerak native untuk platform iOS dan Android.', full_description: 'Aplikasi ponsel dengan antarmuka yang mengalir dan interaksi yang mengikuti standar pedoman desain masing-masing sistem operasi.', icon_name: 'Smartphone', features: ['iOS dan Android', 'Antarmuka responsif', 'Notifikasi sistem', 'Koneksi ke backend'], is_active: true, sort_order: 3 },
  ],
  portfolios: [
    { id: 'pf-1', title: 'Nusantara EduCloud', slug: 'nusantara-educloud', short_description: 'Sistem informasi manajemen sekolah terpusat.', full_description: 'Aplikasi untuk mengelola data siswa, jadwal, dan administrasi keuangan sekolah.', client_name: 'Yayasan Pendidikan Nusantara', tech_stack: ['React', 'Supabase', 'PostgreSQL', 'Tailwind'], project_url: 'https://example.com', thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', images: [], category: 'Sistem Informasi', is_featured: true, is_published: true, sort_order: 1, completed_at: '2025-11-20' },
    { id: 'pf-2', title: 'Rasa Lokal Marketplace', slug: 'rasa-lokal-marketplace', short_description: 'Platform transaksi untuk produk kuliner lokal.', full_description: 'Sistem jual beli dengan fitur pencarian produk, manajemen keranjang, dan konfirmasi pesanan.', client_name: 'Koperasi Rasa Lokal', tech_stack: ['Next.js', 'Supabase', 'Stripe'], project_url: 'https://example.com', thumbnail_url: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80', images: [], category: 'Web Application', is_featured: true, is_published: true, sort_order: 2, completed_at: '2025-09-12' },
  ],
  pricing_packages: [
    { id: 'pkg-1', service_id: 'svc-1', name: 'Starter', price_from: 3000000, price_to: 7000000, price_label: '', is_highlighted: false, is_active: true, sort_order: 1, cta_label: 'Konsultasi Kebutuhan', features: [{ id: 'f1', feature_text: 'Landing page maksimal 5 bagian', is_included: true }, { id: 'f2', feature_text: 'Tata letak adaptif', is_included: true }, { id: 'f3', feature_text: 'Optimasi on-page dasar', is_included: true }, { id: 'f5', feature_text: 'Akses ke panel admin', is_included: false }] },
    { id: 'pkg-2', service_id: 'svc-1', name: 'Professional', price_from: 12000000, price_to: 30000000, price_label: '', is_highlighted: true, is_active: true, sort_order: 2, cta_label: 'Konsultasi Kebutuhan', features: [{ id: 'f1', feature_text: 'Sistem multi-halaman', is_included: true }, { id: 'f2', feature_text: 'Tata letak fungsional khusus', is_included: true }, { id: 'f3', feature_text: 'Optimasi performa halaman', is_included: true }, { id: 'f4', feature_text: 'Akses ke panel admin', is_included: true }] },
  ],
  testimonials: [],
  leads: [],
  faq_items: [],
  team_members: [],
  site_settings: { company_name: BRAND.name, company_tagline: BRAND.tagline, whatsapp_number: BRAND.whatsapp, contact_email: BRAND.email, instagram_url: BRAND.instagram, linkedin_url: BRAND.linkedin, github_url: BRAND.github, address: BRAND.address, operating_hours: BRAND.hours, meta_title_default: `${BRAND.name} — ${BRAND.tagline}`, meta_description_default: 'Viska Labs mengembangkan perangkat lunak dan aplikasi web profesional.' },
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

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => { const scrollTop = window.scrollY; const height = document.documentElement.scrollHeight - window.innerHeight; setProgress(height > 0 ? clamp(scrollTop / height, 0, 1) : 0); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => { if (typeof window === 'undefined') return 'light'; return localStorage.getItem('viska-theme') || 'light'; });
  React.useLayoutEffect(() => { const root = document.documentElement; if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark'); localStorage.setItem('viska-theme', theme); }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggleTheme };
};

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export const GlobalStyles = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,300&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');

    :root { 
      /* Light Mode: Sangat cerah dan bersih */
      --bg-light: #F8FAFC; 
      --text-light: #0F172A; 
      
      /* Dark Mode: Tidak ada warna hitam! Menggunakan Deep Navy eksklusif Viska Labs */
      --bg-dark: #051C48; 
      --text-dark: #F8FAFC; 

      --font-sans: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-serif: 'Playfair Display', serif;
    }

    * { scroll-behavior: smooth; }
    
    body { 
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale; 
      background-color: var(--bg-light); 
      color: var(--text-light); 
      transition: background-color 0.4s ease, color 0.4s ease; 
    }
    
    .dark body { 
      background-color: var(--bg-dark); 
      color: var(--text-dark); 
    }

    /* Elemen Interaktif & Typografi Editorial */
    h1, h2, h3, h4, h5, h6, p, button, input, select, textarea, a { font-family: var(--font-sans); }
    
    .editorial-accent {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.02em;
      color: #1566D1;
    }
    .dark .editorial-accent { color: #7fb0f5; }

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(21, 102, 209, 0.4); border-radius: 4px; }
    .dark ::-webkit-scrollbar-thumb { background: rgba(21, 102, 209, 0.6); }

    /* Animasi Liveliness (Halus, Elegan, Interaktif) */
    @keyframes slow-blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-slow-blob { animation: slow-blob 20s ease-in-out infinite alternate; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }

    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }
  `}</style>
);

export const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
  const [ref, visible] = useReveal();
  return <Tag ref={ref} className={classNames('reveal', visible && 'is-visible', className)} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
};

export const Spinner = ({ className = '' }) => <Loader2 className={classNames('animate-spin', className)} />;

export const Button = ({ children, variant = 'primary', size = 'md', className = '', as: Tag = 'button', loading = false, icon: Icon, ...props }) => {
  const base = 'inline-flex min-w-0 items-center justify-center gap-2 rounded-xl text-center font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 sm:whitespace-nowrap text-sm shadow-sm';
  const sizes = { sm: 'min-h-[44px] px-5', md: 'min-h-[48px] px-6', lg: 'min-h-[54px] px-8 text-base' };
  const variants = {
    primary: 'bg-[#1566D1] text-white hover:bg-[#124691] hover:shadow-xl hover:shadow-[#1566D1]/30 hover:-translate-y-0.5',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 hover:-translate-y-0.5 hover:shadow-xl',
    outline: 'bg-white dark:bg-transparent text-[#1566D1] border-2 border-[#1566D1] hover:bg-[#1566D1] hover:text-white dark:text-white dark:border-white/30 dark:hover:bg-white dark:hover:text-[#051C48] hover:-translate-y-0.5 transition-all',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5',
  };
  return (
    <Tag className={classNames(base, sizes[size], variants[variant], className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4 flex-shrink-0" /> : null}
      {children}
    </Tag>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const base = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest border transition-colors';
  const variants = {
    default: 'border-[#1566D1]/20 text-[#1566D1] bg-[#1566D1]/10 dark:border-[#7fb0f5]/30 dark:text-[#7fb0f5] dark:bg-[#1566D1]/20',
    success: 'border-emerald-500/20 text-emerald-700 bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
    warning: 'border-amber-500/20 text-amber-700 bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
    danger: 'border-red-500/20 text-red-700 bg-red-500/10 dark:border-red-500/30 dark:text-red-400',
    neutral: 'border-slate-200 text-slate-600 bg-white shadow-sm dark:border-white/10 dark:text-slate-300 dark:bg-white/10 backdrop-blur-sm',
  };
  return <span className={classNames(base, variants[variant], className)}>{children}</span>;
};

// Kartu Glassmorphism yang Interaktif & Premium
export const GlassCard = ({ children, className = '', hover = true, ...props }) => (
  <div className={classNames('bg-white/80 dark:bg-[#0B2F6B]/40 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 transition-all duration-300', hover && 'hover:border-[#1566D1]/50 dark:hover:border-white/30 hover:shadow-2xl hover:shadow-[#1566D1]/10 dark:hover:shadow-black/50 hover:-translate-y-1.5', className)} {...props}>{children}</div>
);

export const SectionHeading = ({ eyebrow, title, description, center = false }) => (
  <div className={classNames('max-w-3xl relative z-10', center && 'mx-auto text-center')}>
    {eyebrow && <Reveal><p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#1566D1] dark:text-[#7fb0f5]">{eyebrow}</p></Reveal>}
    <Reveal delay={80}><h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{title}</h2></Reveal>
    {description && <Reveal delay={160}><p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{description}</p></Reveal>}
  </div>
);

export const StarRating = ({ value = 5, size = 'h-4 w-4', interactive = false, onChange, className = '' }) => (
  <div className={classNames('inline-flex items-center gap-1', className)}>
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" disabled={!interactive} onClick={() => interactive && onChange?.(i)} className={classNames('p-1 -m-1 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]', interactive && 'cursor-pointer hover:scale-110 transition-transform')}>
        <Star className={classNames(size, i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-600')} />
      </button>
    ))}
  </div>
);

export const Field = ({ label, error, required, children, hint }) => (
  <label className="block">
    {label && <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label} {required && <span className="text-red-500">*</span>}</span>}
    {children}
    {hint && !error && <span className="mt-1.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    {error && <span className="mt-1.5 block text-xs font-bold text-red-600">{error}</span>}
  </label>
);

export const inputClass = 'w-full min-h-[52px] rounded-xl border-2 border-slate-200/80 bg-white/60 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 hover:border-[#1566D1]/40 focus:bg-white focus:border-[#1566D1] focus:ring-4 focus:ring-[#1566D1]/10 outline-none transition-all duration-300 dark:border-white/10 dark:bg-[#051C48]/50 dark:text-white dark:hover:border-[#7fb0f5]/40 dark:hover:bg-[#051C48] dark:focus:border-[#7fb0f5] dark:focus:bg-[#030F26]';
export const Input = ({ className = '', ...props }) => <input className={classNames(inputClass, className)} {...props} />;
export const Textarea = ({ className = '', rows = 4, ...props }) => <textarea rows={rows} className={classNames(inputClass, 'h-auto py-3 resize-y', className)} {...props} />;
export const Select = ({ className = '', children, ...props }) => <select className={classNames(inputClass, 'appearance-none pr-10', className)} {...props}>{children}</select>;

export const Toggle = ({ checked, onChange, label }) => (
  <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]">
    <span className={classNames('relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-[#1566D1]' : 'bg-slate-300 dark:bg-slate-600')}>
      <span className={classNames('absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300', checked ? 'translate-x-6' : 'translate-x-1')} />
    </span>
    {label && <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>}
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-[#030F26]/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={classNames('relative z-10 my-8 w-full rounded-2xl bg-white dark:bg-[#0B2F6B] shadow-2xl border border-slate-200 dark:border-white/10', sizes[size])}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 p-5 sm:p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300/80 dark:border-white/20 bg-slate-50/80 dark:bg-white/5 py-14 px-6 text-center transition-all hover:bg-white dark:hover:bg-white/10">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1]"><Icon className="h-8 w-8" /></div>
    <p className="text-lg font-bold text-slate-900 dark:text-white">{title}</p>
    {description && <p className="mt-2 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
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
          <div key={t.id} className={classNames('flex items-center gap-3 rounded-xl px-5 py-4 text-sm font-bold text-white shadow-2xl transition-all', t.type === 'success' && 'bg-emerald-600', t.type === 'error' && 'bg-red-600', t.type === 'info' && 'bg-[#1566D1]')}>
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5" />}{t.type === 'error' && <XCircle className="h-5 w-5" />}{t.type === 'info' && <Inbox className="h-5 w-5" />}{t.message}
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
  <button type="button" onClick={onClick} className="group flex items-center gap-3 text-left outline-none transition-transform active:scale-95">
    <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white p-2 border border-slate-200/80 dark:border-white/10 shadow-sm transition-all group-hover:border-[#1566D1]/50 group-hover:shadow-md">
      <img src={BRAND.logo} alt="Logo" className="h-full w-full object-contain" />
    </span>
    <span className="flex flex-col">
      <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">VISKA LABS</span>
    </span>
  </button>
);