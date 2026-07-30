import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  Code2,
  Smartphone,
  PenTool,
  Database,
  Cpu,
  Palette,
  MonitorSmartphone,
  Boxes,
  Layers,
  Globe,
  Wrench,
  Rocket,
  ShieldCheck,
  Gauge,
  Zap,
  Sparkles,
  Star,
  X,
  Inbox,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

// =========================================
// CONSTANTS
// =========================================

export const BRAND = {
  name: 'Viska Labs Indonesia',
  short: 'Viska Labs',
  tagline: 'Creative Technology Agency',
  logo: '/assets/logo/logo_viskalabs.png',
  email: 'hello@viskalabs.id',
  whatsapp: '6281234567890',
  address: 'Kalimantan Selatan, Indonesia',
  hours: 'Senin – Minggu, 09.00 – 21.00 WITA',
  instagram: 'https://instagram.com/viskalabs',
  linkedin: 'https://linkedin.com/company/viskalabs',
  github: 'https://github.com/viskalabs',
};

export const ROUTES = {
  HOME: 'home',
  ABOUT: 'about',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  PORTFOLIO_DETAIL: 'portfolio-detail',
  PRICING: 'pricing',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  CONTACT: 'contact',
  ADMIN: 'admin',
};

export const NAV_LINKS = [
  { label: 'Beranda', route: ROUTES.HOME },
  { label: 'Tentang', route: ROUTES.ABOUT },
  { label: 'Layanan', route: ROUTES.SERVICES },
  { label: 'Portfolio', route: ROUTES.PORTFOLIO },
  { label: 'Harga', route: ROUTES.PRICING },
  { label: 'Testimoni', route: ROUTES.TESTIMONIALS },
  { label: 'FAQ', route: ROUTES.FAQ },
  { label: 'Kontak', route: ROUTES.CONTACT },
];

export const PORTFOLIO_CATEGORIES = [
  'Semua',
  'Web Development',
  'Web Application',
  'Mobile App',
  'UI/UX Design',
  'Sistem Informasi',
];

export const SERVICE_INTEREST_OPTIONS = [
  'Website Development',
  'Web Application',
  'Mobile App',
  'UI/UX Design',
  'Sistem Informasi',
  'Maintenance & Support',
  'Lainnya',
];

export const BUDGET_OPTIONS = [
  '< Rp 5 juta',
  'Rp 5 – 15 juta',
  'Rp 15 – 50 juta',
  'Rp 50 – 100 juta',
  '> Rp 100 juta',
];

export const LEAD_STATUSES = ['new', 'in_progress', 'done', 'spam'];
export const TESTIMONIAL_STATUSES = ['pending', 'approved', 'rejected'];

export const ICON_MAP = {
  Code2,
  Smartphone,
  PenTool,
  Database,
  Cpu,
  Palette,
  MonitorSmartphone,
  Boxes,
  Layers,
  Globe,
  Wrench,
  Rocket,
  ShieldCheck,
  Gauge,
  Zap,
  Sparkles,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

// =========================================
// UTILITY FUNCTIONS
// =========================================

export const uid = () =>
  's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const slugify = (text) =>
  (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatPriceRange = (pkg) => {
  if (pkg.price_label) return pkg.price_label;
  if (pkg.price_from && pkg.price_to) {
    return `${formatRupiah(pkg.price_from)} – ${formatRupiah(pkg.price_to)}`;
  }
  if (pkg.price_from) return `Mulai ${formatRupiah(pkg.price_from)}`;
  return 'Hubungi Kami';
};

export const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

export const classNames = (...args) => args.filter(Boolean).join(' ');

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export const buildWhatsAppLink = (number, message) =>
  `https://wa.me/${(number || BRAND.whatsapp).replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(
    message || 'Halo Viska Labs, saya tertarik untuk berdiskusi tentang proyek.'
  )}`;

export const downloadCSV = (rows, filename) => {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = val === null || val === undefined ? '' : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const formatSocialDisplay = (input) => {
  if (!input) return '';
  let clean = input.trim().replace(/\/$/, '');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    clean = parts[parts.length - 1];
  }
  clean = clean.replace(/^@/, '');
  return clean ? `@${clean}` : '';
};

export const formatSocialLink = (input, platform) => {
  if (!input) return '#';
  const clean = input.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  const username = clean.replace(/^@/, '');
  if (platform === 'instagram') return `https://instagram.com/${username}`;
  if (platform === 'linkedin') return `https://www.linkedin.com/in/${username}`;
  return clean;
};

// =========================================
// SEED DATA
// =========================================

export const SEED = {
  services: [
    {
      id: 'svc-1',
      name: 'Website Development',
      slug: 'website-development',
      short_description:
        'Website company profile & landing page cepat, SEO-friendly, dan konversi tinggi.',
      full_description:
        'Kami membangun website modern berbasis arsitektur terbaru dengan performa kelas dunia, optimasi SEO menyeluruh, dan desain yang merepresentasikan brand Anda secara premium.',
      icon_name: 'Code2',
      features: [
        'Desain custom & responsif',
        'SEO on-page optimal',
        'Core Web Vitals hijau',
        'CMS untuk update mandiri',
      ],
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'svc-2',
      name: 'Web Application',
      slug: 'web-application',
      short_description:
        'Aplikasi web kompleks: dashboard, SaaS, hingga sistem internal yang scalable.',
      full_description:
        'Dari dashboard analitik hingga platform SaaS multi-tenant, kami merancang aplikasi web yang aman, cepat, dan mudah dikembangkan.',
      icon_name: 'Layers',
      features: [
        'Arsitektur scalable',
        'Realtime & API integration',
        'Role-based access',
        'Cloud-native deployment',
      ],
      is_active: true,
      sort_order: 2,
    },
    {
      id: 'svc-3',
      name: 'Mobile App',
      slug: 'mobile-app',
      short_description:
        'Aplikasi mobile iOS & Android dengan pengalaman native yang mulus.',
      full_description:
        'Aplikasi mobile cross-platform dengan animasi halus, offline support, dan integrasi penuh ke backend Anda.',
      icon_name: 'Smartphone',
      features: [
        'iOS & Android',
        'UX native & gestur halus',
        'Push notification',
        'Integrasi backend penuh',
      ],
      is_active: true,
      sort_order: 3,
    },
    {
      id: 'svc-4',
      name: 'UI/UX Design',
      slug: 'ui-ux-design',
      short_description:
        'Riset, wireframe, hingga design system yang konsisten dan memikat.',
      full_description:
        'Kami merancang pengalaman digital yang intuitif berbasis riset pengguna, lengkap dengan design system yang scalable.',
      icon_name: 'PenTool',
      features: [
        'User research & persona',
        'Wireframe & prototype',
        'Design system',
        'Usability testing',
      ],
      is_active: true,
      sort_order: 4,
    },
    {
      id: 'svc-5',
      name: 'Sistem Informasi',
      slug: 'sistem-informasi',
      short_description:
        'Sistem informasi sekolah, organisasi, dan bisnis yang stabil & terintegrasi.',
      full_description:
        'Sistem informasi terpadu untuk sekolah, yayasan, dan organisasi dengan modul lengkap dan dukungan jangka panjang.',
      icon_name: 'Database',
      features: [
        'Modul kustom sesuai kebutuhan',
        'Manajemen data terpusat',
        'Laporan & analitik',
        'Support & maintenance',
      ],
      is_active: true,
      sort_order: 5,
    },
    {
      id: 'svc-6',
      name: 'Maintenance & Support',
      slug: 'maintenance-support',
      short_description:
        'Dukungan teknis, monitoring, dan pengembangan berkelanjutan.',
      full_description:
        'Tim kami menjaga produk digital Anda tetap aman, cepat, dan up-to-date dengan layanan maintenance proaktif.',
      icon_name: 'Wrench',
      features: [
        'Monitoring 24/7',
        'Security patching',
        'Backup berkala',
        'Pengembangan fitur baru',
      ],
      is_active: true,
      sort_order: 6,
    },
  ],
  portfolios: [
    {
      id: 'pf-1',
      title: 'Nusantara EduCloud',
      slug: 'nusantara-educloud',
      short_description:
        'Platform sistem informasi sekolah berbasis cloud untuk 120+ sekolah.',
      full_description:
        'EduCloud adalah sistem informasi sekolah terpadu yang menangani manajemen siswa, nilai, presensi berbasis QR, dan pembayaran. Dibangun untuk skala nasional dengan arsitektur multi-tenant.',
      client_name: 'Yayasan Pendidikan Nusantara',
      tech_stack: ['React', 'Supabase', 'PostgreSQL', 'Tailwind'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
      ],
      category: 'Sistem Informasi',
      is_featured: true,
      is_published: true,
      sort_order: 1,
      completed_at: '2025-11-20',
    },
    {
      id: 'pf-2',
      title: 'Rasa Lokal Marketplace',
      slug: 'rasa-lokal-marketplace',
      short_description:
        'Marketplace kuliner UMKM dengan pengalaman belanja yang imersif.',
      full_description:
        'Marketplace yang menghubungkan UMKM kuliner dengan pelanggan. Dilengkapi pencarian cerdas, checkout mulus, dan dashboard penjual realtime.',
      client_name: 'Koperasi Rasa Lokal',
      tech_stack: ['Next.js', 'Supabase', 'Stripe', 'Framer Motion'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      ],
      category: 'Web Application',
      is_featured: true,
      is_published: true,
      sort_order: 2,
      completed_at: '2025-09-12',
    },
    {
      id: 'pf-3',
      title: 'Aurora Fitness App',
      slug: 'aurora-fitness-app',
      short_description:
        'Aplikasi mobile kebugaran dengan tracking realtime & gamifikasi.',
      full_description:
        'Aplikasi mobile kebugaran dengan rencana latihan personal, tracking aktivitas realtime, dan elemen gamifikasi untuk meningkatkan retensi pengguna.',
      client_name: 'Aurora Wellness',
      tech_stack: ['React Native', 'Expo', 'Supabase'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      ],
      category: 'Mobile App',
      is_featured: true,
      is_published: true,
      sort_order: 3,
      completed_at: '2025-07-01',
    },
    {
      id: 'pf-4',
      title: 'Meridian Bank Dashboard',
      slug: 'meridian-bank-dashboard',
      short_description:
        'Dashboard analitik finansial dengan visualisasi data kompleks.',
      full_description:
        'Dashboard internal untuk tim finansial dengan visualisasi data realtime, prediksi tren, dan kontrol akses berbasis peran.',
      client_name: 'Meridian Finance',
      tech_stack: ['React', 'D3.js', 'Tailwind', 'PostgreSQL'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      images: [],
      category: 'Web Application',
      is_featured: true,
      is_published: true,
      sort_order: 4,
      completed_at: '2025-05-18',
    },
    {
      id: 'pf-5',
      title: 'Lumina Brand Site',
      slug: 'lumina-brand-site',
      short_description:
        'Website brand premium dengan scrollytelling sinematik.',
      full_description:
        'Website brand dengan pengalaman scrollytelling sinematik, animasi halus, dan performa tinggi yang memenangkan award desain.',
      client_name: 'Lumina Studio',
      tech_stack: ['Next.js', 'GSAP', 'Tailwind'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
      images: [],
      category: 'Web Development',
      is_featured: false,
      is_published: true,
      sort_order: 5,
      completed_at: '2025-03-09',
    },
    {
      id: 'pf-6',
      title: 'Kanvas Design System',
      slug: 'kanvas-design-system',
      short_description:
        'Design system & komponen library untuk produk enterprise.',
      full_description:
        'Design system menyeluruh dengan token, komponen, dan dokumentasi untuk mempercepat pengembangan produk di seluruh tim.',
      client_name: 'Kanvas Tech',
      tech_stack: ['Figma', 'Storybook', 'React'],
      project_url: 'https://example.com',
      thumbnail_url:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
      images: [],
      category: 'UI/UX Design',
      is_featured: false,
      is_published: true,
      sort_order: 6,
      completed_at: '2025-01-22',
    },
  ],
  pricing_packages: [
    {
      id: 'pkg-1',
      service_id: 'svc-1',
      name: 'Starter',
      price_from: 3000000,
      price_to: 7000000,
      price_label: '',
      is_highlighted: false,
      is_active: true,
      sort_order: 1,
      cta_label: 'Konsultasi Gratis',
      features: [
        {
          id: 'f1',
          feature_text: 'Landing page hingga 5 section',
          is_included: true,
        },
        { id: 'f2', feature_text: 'Desain responsif', is_included: true },
        { id: 'f3', feature_text: 'SEO dasar', is_included: true },
        {
          id: 'f4',
          feature_text: 'Domain & hosting 1 tahun',
          is_included: true,
        },
        { id: 'f5', feature_text: 'CMS admin panel', is_included: false },
        { id: 'f6', feature_text: 'Integrasi pembayaran', is_included: false },
      ],
    },
    {
      id: 'pkg-2',
      service_id: 'svc-1',
      name: 'Professional',
      price_from: 12000000,
      price_to: 30000000,
      price_label: '',
      is_highlighted: true,
      is_active: true,
      sort_order: 2,
      cta_label: 'Mulai Sekarang',
      features: [
        { id: 'f1', feature_text: 'Website multi-halaman', is_included: true },
        { id: 'f2', feature_text: 'Desain custom premium', is_included: true },
        { id: 'f3', feature_text: 'SEO menyeluruh', is_included: true },
        {
          id: 'f4',
          feature_text: 'CMS admin panel lengkap',
          is_included: true,
        },
        { id: 'f5', feature_text: 'Animasi & interaksi', is_included: true },
        { id: 'f6', feature_text: 'Integrasi pembayaran', is_included: false },
      ],
    },
    {
      id: 'pkg-3',
      service_id: 'svc-2',
      name: 'Enterprise',
      price_from: null,
      price_to: null,
      price_label: 'Custom Quote',
      is_highlighted: false,
      is_active: true,
      sort_order: 3,
      cta_label: 'Hubungi Tim Kami',
      features: [
        { id: 'f1', feature_text: 'Aplikasi web kompleks', is_included: true },
        { id: 'f2', feature_text: 'Arsitektur scalable', is_included: true },
        { id: 'f3', feature_text: 'Integrasi sistem & API', is_included: true },
        { id: 'f4', feature_text: 'Dedicated support', is_included: true },
        { id: 'f5', feature_text: 'SLA & monitoring', is_included: true },
        { id: 'f6', feature_text: 'Pelatihan tim', is_included: true },
      ],
    },
  ],
  testimonials: [
    {
      id: 'ts-1',
      client_name: 'Andini Pratiwi',
      client_title: 'Founder',
      client_company: 'Rasa Lokal',
      client_photo_url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      content:
        'Viska Labs mengubah ide kami menjadi platform yang luar biasa. Detail desain dan performanya benar-benar kelas dunia.',
      rating: 5,
      is_featured: true,
      status: 'approved',
      sort_order: 1,
    },
    {
      id: 'ts-2',
      client_name: 'Budi Santoso',
      client_title: 'Kepala IT',
      client_company: 'Yayasan Nusantara',
      client_photo_url:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      content:
        'Sistem informasi sekolah yang dibangun sangat stabil dan mudah digunakan. Tim support-nya responsif sekali.',
      rating: 5,
      is_featured: true,
      status: 'approved',
      sort_order: 2,
    },
    {
      id: 'ts-3',
      client_name: 'Clara Wijaya',
      client_title: 'Marketing Lead',
      client_company: 'Lumina Studio',
      client_photo_url:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      content:
        'Website kami sekarang terasa hidup dan premium. Banyak klien yang memuji pengalaman scrolling-nya.',
      rating: 5,
      is_featured: true,
      status: 'approved',
      sort_order: 3,
    },
    {
      id: 'ts-4',
      client_name: 'Dimas Nugraha',
      client_title: 'CEO',
      client_company: 'Aurora Wellness',
      client_photo_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      content:
        'Aplikasi mobile kami mendapat rating tinggi di store. Eksekusi Viska Labs sangat profesional dari awal hingga akhir.',
      rating: 5,
      is_featured: false,
      status: 'approved',
      sort_order: 4,
    },
  ],
  leads: [
    {
      id: 'ld-1',
      full_name: 'Rina Maulida',
      email: 'rina@contohbisnis.id',
      whatsapp: '628111111111',
      company: 'Toko Berkah',
      service_interest: 'Website Development',
      budget_range: 'Rp 5 – 15 juta',
      message: 'Saya butuh website company profile untuk toko bangunan saya.',
      status: 'new',
      source_page: 'contact',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'ld-2',
      full_name: 'Fajar Ramadhan',
      email: 'fajar@startupx.io',
      whatsapp: '628222222222',
      company: 'StartupX',
      service_interest: 'Web Application',
      budget_range: 'Rp 50 – 100 juta',
      message: 'Butuh MVP SaaS dalam 8 minggu. Bisa diskusi timeline?',
      status: 'in_progress',
      source_page: 'pricing',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
  ],
  faq_items: [
    {
      id: 'faq-1',
      question: 'Berapa lama waktu pengerjaan sebuah proyek?',
      answer:
        'Bergantung kompleksitas. Landing page 1–2 minggu, website company profile 3–4 minggu, dan aplikasi web/mobile 8–14 minggu. Timeline pasti diberikan setelah sesi konsultasi.',
      category: 'General',
      is_published: true,
      sort_order: 1,
    },
    {
      id: 'faq-2',
      question: 'Apakah saya bisa mengelola konten sendiri setelah selesai?',
      answer:
        'Tentu. Setiap proyek dilengkapi CMS admin panel yang intuitif sehingga Anda bisa memperbarui konten tanpa keahlian teknis.',
      category: 'Technical',
      is_published: true,
      sort_order: 2,
    },
    {
      id: 'faq-3',
      question: 'Bagaimana skema pembayarannya?',
      answer:
        'Umumnya 50% di awal sebagai down payment dan 50% saat proyek selesai. Untuk proyek besar bisa dibagi per milestone.',
      category: 'Pricing',
      is_published: true,
      sort_order: 3,
    },
    {
      id: 'faq-4',
      question: 'Apakah ada garansi dan maintenance?',
      answer:
        'Ya. Setiap proyek mendapat garansi bug-fixing 30 hari, dan tersedia paket maintenance bulanan untuk dukungan berkelanjutan.',
      category: 'General',
      is_published: true,
      sort_order: 4,
    },
    {
      id: 'faq-5',
      question: 'Apakah Viska Labs menangani SEO?',
      answer:
        'Semua website kami dibangun dengan praktik SEO on-page terbaik. Kami juga menyediakan layanan SEO lanjutan sebagai add-on.',
      category: 'Technical',
      is_published: true,
      sort_order: 5,
    },
  ],
  team_members: [
    {
      id: 'tm-1',
      name: 'Arya Wibowo',
      role: 'CEO & Lead Architect',
      bio: 'Memimpin visi teknologi Viska Labs dengan 10+ tahun pengalaman membangun produk digital berskala besar.',
      photo_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      linkedin_url: 'https://linkedin.com',
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'tm-2',
      name: 'Nadia Putri',
      role: 'Head of Design',
      bio: 'Creative technologist yang menggabungkan estetika dan fungsi menjadi pengalaman digital yang memukau.',
      photo_url:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
      linkedin_url: 'https://linkedin.com',
      is_active: true,
      sort_order: 2,
    },
    {
      id: 'tm-3',
      name: 'Reza Maulana',
      role: 'Lead Engineer',
      bio: 'Spesialis arsitektur full-stack yang obsesif terhadap performa dan kode yang bersih.',
      photo_url:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      linkedin_url: 'https://linkedin.com',
      is_active: true,
      sort_order: 3,
    },
    {
      id: 'tm-4',
      name: 'Siti Anindya',
      role: 'Product Manager',
      bio: 'Menjembatani kebutuhan klien dan eksekusi tim agar setiap proyek tepat sasaran dan tepat waktu.',
      photo_url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      linkedin_url: 'https://linkedin.com',
      is_active: true,
      sort_order: 4,
    },
  ],
  site_settings: {
    company_name: BRAND.name,
    company_tagline: BRAND.tagline,
    whatsapp_number: BRAND.whatsapp,
    contact_email: BRAND.email,
    instagram_url: BRAND.instagram,
    linkedin_url: BRAND.linkedin,
    github_url: BRAND.github,
    address: BRAND.address,
    operating_hours: BRAND.hours,
    meta_title_default: `${BRAND.name} — ${BRAND.tagline}`,
    meta_description_default:
      'Viska Labs Indonesia adalah creative technology agency spesialis website, aplikasi, dan sistem informasi.',
  },
};

export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// =========================================
// CUSTOM HOOKS
// =========================================

export const useReveal = (options = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);
  return [ref, visible];
};

export const useCountUp = (target, { duration = 1800, start = false } = {}) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const startTime = performance.now();
    const numericTarget = Number(target) || 0;
    const tick = (now) => {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * numericTarget));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
};

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? clamp(scrollTop / height, 0, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return progress;
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('viska-theme') || 'dark';
  });
  React.useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('viska-theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  );
  return { theme, toggleTheme };
};

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

// =========================================
// SHARED COMPONENTS
// =========================================

export const GlobalStyles = () => (
  <style>{`
    :root {
      --c-deep: #051C48;
      --c-navy: #0B2F6B;
      --c-blue: #124691;
      --c-bright: #1566D1;
    }
    * { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); }
    .dark ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
    ::-webkit-scrollbar-thumb { background: rgba(21,102,209,0.4); border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(21,102,209,0.7); border: 2px solid transparent; background-clip: padding-box; }
    ::-webkit-scrollbar-corner { background: transparent; }

    @keyframes blob {
      0%,100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(30px,-40px) scale(1.1); }
      66% { transform: translate(-25px,25px) scale(0.95); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @keyframes gradient-pan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes shine {
      0% { transform: translateX(-150%) skewX(-20deg); }
      100% { transform: translateX(250%) skewX(-20deg); }
    }
    @keyframes pulse-glow {
      0%,100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-blob { animation: blob 18s ease-in-out infinite; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-gradient-pan { background-size: 200% 200%; animation: gradient-pan 8s ease infinite; }
    .animate-marquee { animation: marquee 28s linear infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    .animation-delay-4000 { animation-delay: 4s; }

    .reveal { opacity: 0; transform: translateY(36px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }

    .glass, .glass-light { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(11,47,107,0.08); }
    .dark .glass, .dark .glass-light { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); }
    .gradient-text { background: linear-gradient(120deg,#1566D1,#5b9bf0,#1566D1); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .dark .gradient-text { background: linear-gradient(120deg,#5b9bf0,#bae6fd,#5b9bf0); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .text-balance { text-wrap: balance; }
    .shine-overlay { position: relative; overflow: hidden; }
    .shine-overlay::after { content:''; position:absolute; top:0; left:0; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent); transform:translateX(-150%) skewX(-20deg); }
    .shine-overlay:hover::after { animation: shine 1s forwards; }
    
    /* Global Brand Color Override khusus Light Mode */
    html:not(.dark) .text-slate-900,
    html:not(.dark) .text-slate-800 { color: var(--c-deep) !important; }
    html:not(.dark) .text-slate-700 { color: var(--c-navy) !important; }
    
    html { overflow-x: hidden; }
  `}</style>
);

export const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={classNames('reveal', visible && 'is-visible', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

export const Spinner = ({ className = '' }) => (
  <Loader2 className={classNames('animate-spin', className)} />
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as: Tag = 'button',
  loading = false,
  icon: Icon,
  ...props
}) => {
  const base =
    'inline-flex min-w-0 items-center justify-center gap-2 rounded-xl text-center font-semibold leading-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97] active:duration-100 dark:focus-visible:ring-offset-[#0a2350] sm:whitespace-nowrap';
  const sizes = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-7 text-base py-3.5',
  };
  const variants = {
    primary:
      'text-white bg-gradient-to-r from-[#1566D1] to-[#124691] shadow-lg shadow-[#1566D1]/30 hover:shadow-xl hover:shadow-[#1566D1]/40 hover:-translate-y-0.5',
    secondary: 'text-white glass hover:bg-white/15 border border-white/20',
    outline:
      'text-[#1566D1] dark:text-white border border-[#1566D1]/40 dark:border-white/25 hover:bg-[#1566D1]/10 hover:border-[#1566D1]',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-500/10',
    danger:
      'text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20',
    success: 'text-white bg-emerald-500 hover:bg-emerald-600',
  };
  return (
    <Tag
      className={classNames(
        base,
        sizes[size],
        variants[variant],
        'shine-overlay',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : Icon ? (
        <Icon className="h-4 w-4 flex-shrink-0" />
      ) : null}
      {children}
    </Tag>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default:
      'bg-[#1566D1]/15 text-[#1566D1] dark:text-[#7fb0f5] border border-[#1566D1]/20',
    glass:
      'glass text-slate-900 dark:text-white border-slate-200/60 dark:border-white/15',
    success:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger:
      'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20',
    neutral:
      'bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/20',
  };
  return (
    <span
      className={classNames(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-tight whitespace-normal break-words',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const GlassCard = ({ children, className = '', hover = true, ...props }) => (
  <div
    className={classNames(
      'rounded-2xl glass dark:glass glass-light p-4 transition-all duration-500 sm:p-6',
      hover &&
        'hover:-translate-y-1.5 hover:border-[#1566D1]/40 hover:shadow-2xl hover:shadow-[#1566D1]/20',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  center = true,
  light,
}) => (
  <div className={classNames('max-w-3xl', center && 'mx-auto text-center')}>
    {eyebrow && (
      <Reveal>
        <Badge variant={light ? 'glass' : 'default'} className="mb-4">
          <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
        </Badge>
      </Reveal>
    )}
    <Reveal delay={80}>
      <h2
        className={classNames(
          'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-balance',
          light ? 'text-white' : 'text-slate-900 dark:text-white'
        )}
      >
        {title}
      </h2>
    </Reveal>
    {description && (
      <Reveal delay={160}>
        <p
          className={classNames(
            'mt-4 text-base sm:text-lg leading-relaxed',
            light ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'
          )}
        >
          {description}
        </p>
      </Reveal>
    )}
  </div>
);

export const StarRating = ({
  value = 5,
  size = 'h-4 w-4',
  interactive = false,
  onChange,
  className = '',
}) => (
  <div className={classNames('inline-flex items-center gap-0.5', className)}>
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        aria-label={`Beri rating ${i} bintang`}
        className={classNames(
          'p-1.5 -m-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]',
          interactive &&
            'cursor-pointer hover:scale-110 transition-transform duration-200',
          !interactive && 'cursor-default'
        )}
      >
        <Star
          className={classNames(
            size,
            i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-400/40'
          )}
        />
      </button>
    ))}
  </div>
);

export const Field = ({ label, error, required, children, hint }) => (
  <label className="block">
    {label && (
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    )}
    {children}
    {hint && !error && (
      <span className="mt-1 block text-xs text-slate-400">{hint}</span>
    )}
    {error && (
      <span className="mt-1 block text-xs font-medium text-red-500 dark:text-red-400">
        {error}
      </span>
    )}
  </label>
);

export const inputClass =
  'w-full h-11 rounded-xl border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 hover:border-slate-400/80 dark:hover:border-white/30 focus:border-[#1566D1] dark:focus:border-[#7fb0f5] focus:ring-4 focus:ring-[#1566D1]/20 dark:focus:ring-[#7fb0f5]/20 outline-none transition-all duration-300';

export const Input = ({ className = '', ...props }) => (
  <input className={classNames(inputClass, className)} {...props} />
);

export const Textarea = ({ className = '', rows = 4, ...props }) => (
  <textarea
    rows={rows}
    className={classNames(
      inputClass,
      'h-auto py-3 resize-none sm:resize-y',
      className
    )}
    {...props}
  />
);

export const Select = ({ className = '', children, ...props }) => (
  <select
    className={classNames(
      inputClass,
      'appearance-none pr-10 bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-18px)_50%,calc(100%-13px)_50%] bg-no-repeat text-slate-900 dark:text-white [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0a2350] dark:[&>option]:text-white',
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="inline-flex min-w-0 max-w-full items-center gap-3 rounded-full text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#1566D1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0a2350]"
  >
    <span
      className={classNames(
        'relative h-6 w-11 flex-shrink-0 rounded-full border border-transparent transition-all duration-200',
        checked
          ? 'bg-[#1566D1] shadow-[0_8px_20px_rgba(21,102,209,0.28)]'
          : 'bg-slate-300/80 dark:bg-white/15'
      )}
    >
      <span
        className={classNames(
          'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
      />
    </span>
    {label && (
      <span className="min-w-0 text-sm font-medium leading-5 text-slate-700 dark:text-slate-200 whitespace-normal break-words">
        {label}
      </span>
    )}
  </button>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-[#051C48]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={classNames(
          'relative z-10 my-8 w-full rounded-2xl border border-white/15 bg-white dark:bg-[#0a2350] shadow-2xl transition-all',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 p-5">
          <h3
            id="modal-title"
            className="min-w-0 pr-3 text-lg font-bold leading-tight text-slate-900 dark:text-white"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto overscroll-contain p-4 sm:max-h-[70vh] sm:p-5">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 dark:border-white/15 bg-slate-50/50 dark:bg-slate-800/20 py-16 px-4 text-center transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-400/50 dark:hover:border-white/30">
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-[#1566D1]/10 to-[#124691]/10 p-4 ring-1 ring-[#1566D1]/20">
      <Icon className="h-8 w-8 text-[#1566D1]" />
    </div>
    <p className="text-lg font-bold text-slate-900 dark:text-white">{title}</p>
    {description && (
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ServiceIcon = ({ name, className = 'h-6 w-6' }) => {
  const Icon = ICON_MAP[name] || Boxes;
  return <Icon className={className} />;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const api = useMemo(
    () => ({
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
    }),
    [push]
  );
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="assertive"
        role="alert"
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={classNames(
              'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl transition-all duration-300',
              t.type === 'success' && 'bg-emerald-500',
              t.type === 'error' && 'bg-red-500',
              t.type === 'info' && 'bg-[#1566D1]'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {t.type === 'error' && <XCircle className="h-4 w-4" />}
            {t.type === 'info' && <Sparkles className="h-4 w-4" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// =========================================
// BRAND ICONS & LOGO 
// =========================================

export const Instagram = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const Linkedin = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Github = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
  </svg>
);

export const Logo = ({ onClick, light }) => (
  <button
    type="button"
    onClick={onClick}
    className="group inline-flex max-w-full items-center gap-2.5 overflow-hidden rounded-2xl text-left outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#1566D1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#051C48] sm:gap-3"
    aria-label={`${BRAND.short} beranda`}
  >
    <span
      className={classNames(
        'relative isolate flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:ring-1 before:ring-inset before:ring-white/80 group-hover:shadow-md sm:h-12 sm:w-12',
        light
          ? 'ring-white/35 group-hover:ring-white/60'
          : 'ring-[#1566D1]/20 dark:ring-white/20 group-hover:ring-[#1566D1]/35 dark:group-hover:ring-white/35'
      )}
    >
      <img
        src={BRAND.logo}
        alt={`${BRAND.short} logo`}
        className="block h-full w-full select-none object-contain"
        draggable="false"
      />
    </span>
    <span className="flex min-w-0 flex-col leading-none">
      <span
        className={classNames(
          'truncate text-base font-black tracking-[0.1em] sm:text-lg sm:tracking-[0.12em]',
          light ? 'text-white' : 'text-slate-950 dark:text-white'
        )}
      >
        VISKA LABS
      </span>
      <span
        className={classNames(
          'mt-1 truncate text-[0.56rem] font-bold tracking-[0.18em] sm:text-[0.64rem] sm:tracking-[0.28em]',
          light ? 'text-white/75' : 'text-[#1566D1] dark:text-[#5b9bf0]'
        )}
      >
        CREATIVE TECHNOLOGY
      </span>
    </span>
  </button>
);