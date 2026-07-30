import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Tag,
  MessageSquare,
  Inbox,
  HelpCircle,
  Users,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  EyeOff,
  Eye,
  ArrowRight,
  Menu,
  X,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Search,
  Download,
  Plus,
  Save,
  ImageIcon,
  Mail,
  MessageCircle,
  Check,
} from 'lucide-react';

import {
  useToast,
  GlassCard,
  Field,
  Input,
  Button,
  Logo,
  Badge,
  EmptyState,
  Modal,
  Select,
  Textarea,
  Toggle,
  StarRating,
  ServiceIcon,
  ROUTES,
  classNames,
  formatDateTime,
  formatPriceRange,
  formatDate,
  slugify,
  PORTFOLIO_CATEGORIES,
  TESTIMONIAL_STATUSES,
  LEAD_STATUSES,
  ICON_NAMES,
  downloadCSV,
  buildWhatsAppLink,
  uid,
  inputClass,
} from './ui';

import { SUPABASE_ENABLED, DEMO_ADMIN, db } from './supabase';

// =========================================
// ADMIN COMPONENTS
// =========================================

const ADMIN_MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'portfolio', label: 'Portfolio', icon: FolderKanban },
  { key: 'services', label: 'Layanan', icon: Wrench },
  { key: 'pricing', label: 'Harga', icon: Tag },
  { key: 'testimonials', label: 'Testimoni', icon: MessageSquare },
  { key: 'leads', label: 'Leads', icon: Inbox },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'team', label: 'Tim', icon: Users },
  { key: 'settings', label: 'Pengaturan', icon: SettingsIcon },
];

const AdminLogin = ({ onLogin, navigate }) => {
  const toast = useToast();
  const [email, setEmail] = useState(SUPABASE_ENABLED ? '' : DEMO_ADMIN.email);
  const [password, setPassword] = useState(
    SUPABASE_ENABLED ? '' : DEMO_ADMIN.password
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (SUPABASE_ENABLED) {
        const user = await db.signIn(email, password);
        onLogin(user);
        toast?.success('Berhasil masuk');
      } else {
        await new Promise((r) => setTimeout(r, 600));
        if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
          onLogin({ email, id: 'demo-admin' });
          toast?.success('Berhasil masuk (mode demo)');
        } else {
          throw new Error('Email atau password salah');
        }
      }
    } catch (err) {
      setError(err?.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="mb-8 flex items-center justify-center gap-1.5 text-sm text-slate-400 transition hover:text-[#1566D1] mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Website
        </button>
        <GlassCard hover={false} className="sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-[#1566D1] to-[#0B2F6B] p-3.5 text-white shadow-lg shadow-[#1566D1]/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Masuk untuk mengelola konten website
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading} className="space-y-4">
              <Field label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@viskalabs.id"
                  autoComplete="email"
                />
              </Field>
              <Field label="Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1566D1]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>
              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                icon={loading ? undefined : ArrowRight}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </fieldset>
          </form>
          {!SUPABASE_ENABLED && (
            <p className="mt-5 rounded-lg bg-[#1566D1]/10 px-3 py-2.5 text-center text-xs text-slate-500 dark:text-slate-400">
              Mode demo aktif. Login: <strong>{DEMO_ADMIN.email}</strong> /{' '}
              <strong>{DEMO_ADMIN.password}</strong>
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const AdminLayout = ({
  active,
  setActive,
  onLogout,
  navigate,
  children,
  user,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const NavItems = ({ onClick }) => (
    <>
      {ADMIN_MODULES.map((m) => (
        <button
          key={m.key}
          onClick={() => {
            setActive(m.key);
            onClick?.();
          }}
          className={classNames(
            'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#061a3d]',
            active === m.key
              ? 'bg-[#1566D1] text-white shadow-lg shadow-[#1566D1]/25'
              : 'text-slate-600 hover:bg-[#1566D1]/10 hover:text-[#1566D1] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
          )}
        >
          <m.icon className="h-5 w-5" /> {m.label}
        </button>
      ))}
    </>
  );
  return (
    <div className="min-h-screen px-0 pb-6 pt-0 sm:pt-4">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#061a3d]/85 lg:hidden">
        <Logo onClick={() => navigate(ROUTES.HOME)} />
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label={sidebarOpen ? 'Tutup menu admin' : 'Buka menu admin'}
          className="rounded-xl border border-slate-200/70 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      <div className="mx-auto flex max-w-[1500px] gap-6 px-3 py-4 sm:px-6 sm:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-[#061a3d]/70 dark:shadow-black/20">
            <div className="mb-4 px-2">
              <Logo onClick={() => navigate(ROUTES.HOME)} />
            </div>
            <nav className="space-y-1">
              <NavItems />
            </nav>
            <div className="mt-4 border-t border-slate-200/70 pt-4 dark:border-white/10">
              <div className="mb-3 rounded-xl bg-slate-50/80 px-3 py-2 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <p className="break-all font-semibold text-slate-700 dark:text-slate-200">
                  {user?.email}
                </p>
                <p>{SUPABASE_ENABLED ? 'Supabase Auth' : 'Mode Demo'}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          </div>
        </aside>
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[min(20rem,86vw)] overflow-y-auto border-r border-slate-200/70 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#061a3d]">
              <div className="mb-5 px-1 pt-1">
                <Logo onClick={() => navigate(ROUTES.HOME)} />
              </div>
              <nav className="space-y-1">
                <NavItems onClick={() => setSidebarOpen(false)} />
              </nav>
              <button
                onClick={onLogout}
                className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

const AdminHeader = ({ title, description, action }) => (
  <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-white sm:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
    {action && (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
        {action}
      </div>
    )}
  </div>
);

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
      {message}
    </p>
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button variant="ghost" onClick={onClose}>
        Batal
      </Button>
      <Button variant="danger" onClick={onConfirm} icon={Trash2}>
        Hapus
      </Button>
    </div>
  </Modal>
);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <GlassCard className="flex items-center gap-3 sm:gap-4">
    <div
      className={classNames(
        'inline-flex rounded-2xl p-3.5 text-white shadow-lg',
        accent
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </GlassCard>
);

const AdminDashboard = ({ data, setActive }) => {
  const newLeads = data.leads.filter((l) => l.status === 'new').length;
  const pendingTestimonials = data.testimonials.filter(
    (t) => t.status === 'pending'
  ).length;
  const publishedPortfolio = data.portfolios.filter(
    (p) => p.is_published
  ).length;

  const days = 14;
  const counts = Array.from({ length: days }, (_, i) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (days - 1 - i));
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return data.leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
  });
  const maxCount = Math.max(1, ...counts);

  const recentLeads = [...data.leads].slice(0, 5);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Ringkasan aktivitas dan konten website."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Portfolio Publish"
          value={publishedPortfolio}
          accent="bg-gradient-to-br from-[#1566D1] to-[#0B2F6B]"
        />
        <StatCard
          icon={Inbox}
          label="Lead Baru"
          value={newLeads}
          accent="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
        <StatCard
          icon={MessageSquare}
          label="Testimoni Pending"
          value={pendingTestimonials}
          accent="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <StatCard
          icon={Wrench}
          label="Layanan Aktif"
          value={data.services.filter((s) => s.is_active).length}
          accent="bg-gradient-to-br from-[#124691] to-[#051C48]"
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard hover={false} className="lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#1566D1]" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Lead 14 Hari Terakhir
            </h3>
          </div>
          <div className="flex h-44 items-end gap-1.5">
            {counts.map((c, i) => (
              <div
                key={i}
                className="group flex flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="text-[10px] font-semibold text-slate-400 opacity-0 transition group-hover:opacity-100">
                  {c}
                </span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#0B2F6B] to-[#1566D1] transition-all hover:from-[#124691] hover:to-[#5b9bf0]"
                  style={{
                    height: `${(c / maxCount) * 100}%`,
                    minHeight: c ? '6px' : '2px',
                  }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
            Aksi Cepat
          </h3>
          <div className="space-y-2">
            {[
              {
                label: 'Tambah Portfolio',
                key: 'portfolio',
                icon: FolderKanban,
              },
              { label: 'Kelola Leads', key: 'leads', icon: Inbox },
              {
                label: 'Moderasi Testimoni',
                key: 'testimonials',
                icon: MessageSquare,
              },
              {
                label: 'Pengaturan Situs',
                key: 'settings',
                icon: SettingsIcon,
              },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setActive(a.key)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-500/5 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#1566D1]/10 dark:text-slate-200"
              >
                <span className="flex items-center gap-2.5">
                  <a.icon className="h-4 w-4 text-[#1566D1]" /> {a.label}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
      <GlassCard hover={false} className="mt-6">
        <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
          Lead Terbaru
        </h3>
        {recentLeads.length ? (
          <div className="space-y-2">
            {recentLeads.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl bg-slate-500/5 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {l.full_name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {l.email} · {l.service_interest || 'Umum'}
                  </p>
                </div>
                <LeadStatusBadge status={l.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-2">
            <EmptyState
              icon={Inbox}
              title="Belum ada lead"
              description="Lead yang masuk akan ditampilkan di sini."
            />
          </div>
        )}
      </GlassCard>
    </>
  );
};

const LeadStatusBadge = ({ status }) => {
  const map = {
    new: { v: 'default', label: 'Baru' },
    in_progress: { v: 'warning', label: 'Proses' },
    done: { v: 'success', label: 'Selesai' },
    spam: { v: 'danger', label: 'Spam' },
  };
  const cfg = map[status] || map.new;
  return <Badge variant={cfg.v}>{cfg.label}</Badge>;
};

const AdminTable = ({ columns, children }) => (
  <GlassCard hover={false} className="!p-0 overflow-hidden border-slate-200/80 dark:border-white/10">
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 bg-slate-50/70 text-left dark:border-white/10 dark:bg-white/5">
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  </GlassCard>
);

const RowActions = ({ onEdit, onDelete, extra }) => (
  <div className="flex items-center justify-end gap-1.5">
    {extra}
    {onEdit && (
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit data"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1] dark:text-slate-400"
      >
        <Pencil className="h-4 w-4" />
      </button>
    )}
    {onDelete && (
      <button
        type="button"
        onClick={onDelete}
        aria-label="Hapus data"
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )}
  </div>
);

const linesToArray = (text) =>
  (text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const csvToArray = (text) =>
  (text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const PortfolioManager = ({ data, crud }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await db.uploadImage(file, `portfolio/${editing?.id || slugify(form.title) || 'new'}/${field}`);
      setForm((f) => ({ ...f, [field]: url }));
      toast?.success('Gambar berhasil diunggah!');
    } catch (err) {
      console.error(err);
      toast?.error(
        'Gagal mengunggah gambar. Pastikan Bucket SQL sudah dijalankan.'
      );
    } finally {
      setUploading(false);
    }
  };

  const blank = {
    title: '',
    slug: '',
    category: PORTFOLIO_CATEGORIES[1],
    short_description: '',
    full_description: '',
    client_name: '',
    tech_stack: '',
    thumbnail_url: '',
    images: [],
    project_url: '',
    completed_at: '',
    is_featured: false,
    is_published: true,
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  const handleMultipleUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await db.uploadImage(file, `portfolio/${editing?.id || slugify(form.title) || 'new'}/gallery`);
      setForm((f) => {
        const newImages = [...f.images];
        newImages[index] = url;
        return { ...f, images: newImages };
      });
      toast?.success('Gambar galeri berhasil diunggah!');
    } catch (err) {
      console.error(err);
      toast?.error('Gagal mengunggah gambar tambahan.');
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...blank,
      ...p,
      tech_stack: (p.tech_stack || []).join(', '),
      images: p.images || [],
      completed_at: p.completed_at || '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast?.error('Judul wajib diisi');
      return;
    }
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      tech_stack: csvToArray(form.tech_stack),
      images: form.images.filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
      completed_at: form.completed_at || null,
    };
    if (editing) {
      await crud.portfolios.update(editing.id, payload);
      toast?.success('Portfolio diperbarui');
    } else {
      await crud.portfolios.create(payload);
      toast?.success('Portfolio ditambahkan');
    }
    setModalOpen(false);
  };

  const filtered = data.portfolios.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminHeader
        title="Portfolio"
        description="Kelola proyek yang ditampilkan di website."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah Portfolio
          </Button>
        }
      />
      <div className="relative mb-4 w-full max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari portfolio..."
          className={classNames(inputClass, 'pl-10')}
        />
      </div>
      {filtered.length ? (
        <AdminTable columns={['Proyek', 'Kategori', 'Status', 'Aksi']}>
          {filtered.map((p) => (
            <tr key={p.id} className="group">
              <td className="px-4 py-3 align-middle">
                <div className="flex min-w-[220px] items-center gap-3">
                  <div className="h-11 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-700">
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="m-auto mt-3 h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {p.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {p.client_name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                <Badge variant="neutral">{p.category}</Badge>
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex flex-wrap gap-1.5">
                  {p.is_published ? (
                    <Badge variant="success">Publish</Badge>
                  ) : (
                    <Badge variant="neutral">Draft</Badge>
                  )}
                  {p.is_featured && <Badge variant="default">Featured</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-right align-middle">
                <RowActions
                  onEdit={() => openEdit(p)}
                  onDelete={() => setConfirmId(p.id)}
                  extra={
                    <button
                      onClick={async () => {
                        await crud.portfolios.update(p.id, {
                          is_published: !p.is_published,
                        });
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-[#1566D1]/10 hover:text-[#1566D1]"
                      title="Toggle publish"
                    >
                      {p.is_published ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="Belum ada portfolio"
          action={
            <Button onClick={openCreate} icon={Plus}>
              Tambah Portfolio
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Portfolio' : 'Tambah Portfolio'}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul" required>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Slug" hint="Kosongkan untuk auto-generate">
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder={slugify(form.title)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori">
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {PORTFOLIO_CATEGORIES.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Nama Klien">
              <Input
                value={form.client_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, client_name: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Deskripsi Singkat">
            <Textarea
              rows={2}
              value={form.short_description}
              onChange={(e) =>
                setForm((f) => ({ ...f, short_description: e.target.value }))
              }
            />
          </Field>
          <Field label="Deskripsi Lengkap">
            <Textarea
              rows={4}
              value={form.full_description}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_description: e.target.value }))
              }
            />
          </Field>
          <Field label="Tech Stack" hint="Pisahkan dengan koma">
            <Input
              value={form.tech_stack}
              onChange={(e) =>
                setForm((f) => ({ ...f, tech_stack: e.target.value }))
              }
              placeholder="React, Supabase, Tailwind"
            />
          </Field>
          <Field label="Thumbnail Portfolio">
            <div className="flex flex-col gap-3">
              {form.thumbnail_url && (
                <img
                  src={form.thumbnail_url}
                  alt="preview"
                  className="h-32 w-auto max-w-[200px] object-cover rounded-xl border border-slate-300/60 dark:border-white/15"
                />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, 'thumbnail_url')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1566D1]/10 file:text-[#1566D1] hover:file:bg-[#1566D1]/20 cursor-pointer disabled:opacity-50 transition"
              />
              {uploading && (
                <p className="text-xs text-[#1566D1] animate-pulse">
                  Sedang mengunggah gambar...
                </p>
              )}
            </div>
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Galeri Gambar Tambahan
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm((f) => ({ ...f, images: [...f.images, ''] }))
                }
                icon={Plus}
              >
                Tambah Slot Foto
              </Button>
            </div>
            <div className="space-y-3">
              {form.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-slate-800/20"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt="gallery"
                      className="h-16 w-24 object-cover rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="h-16 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      Preview
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => handleMultipleUpload(e, idx)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1566D1]/10 file:text-[#1566D1] hover:file:bg-[#1566D1]/20 cursor-pointer disabled:opacity-50 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        images: f.images.filter((_, i) => i !== idx),
                      }))
                    }
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.images.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  Belum ada gambar tambahan.
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="URL Proyek">
              <Input
                value={form.project_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, project_url: e.target.value }))
                }
              />
            </Field>
            <Field label="Tanggal Selesai">
              <Input
                type="date"
                value={form.completed_at || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, completed_at: e.target.value }))
                }
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <Toggle
                checked={form.is_published}
                onChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                label="Publish"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
              <Toggle
                checked={form.is_featured}
                onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                label="Featured (Homepage)"
              />
            </div>
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
                className="w-full sm:w-28"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.portfolios.remove(confirmId);
          setConfirmId(null);
          toast?.success('Portfolio dihapus');
        }}
        title="Hapus Portfolio"
        message="Yakin ingin menghapus portfolio ini? Tindakan ini tidak dapat dibatalkan."
      />
    </>
  );
};

const ServiceManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = {
    name: '',
    slug: '',
    short_description: '',
    full_description: '',
    icon_name: 'Code2',
    features: '',
    is_active: true,
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...blank, ...s, features: arrayToLines(s.features) });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast?.error('Nama wajib diisi');
      return;
    }
    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      features: linesToArray(form.features),
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing) {
      await crud.services.update(editing.id, payload);
      toast?.success('Layanan diperbarui');
    } else {
      await crud.services.create(payload);
      toast?.success('Layanan ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader
        title="Layanan"
        description="Kelola layanan yang ditawarkan."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah Layanan
          </Button>
        }
      />
      {data.services.length ? (
        <AdminTable columns={['Layanan', 'Icon', 'Status', 'Aksi']}>
          {data.services.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 align-middle">
                <div className="min-w-[220px]">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {s.name}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:line-clamp-1">
                    {s.short_description}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                <span className="inline-flex rounded-lg bg-[#1566D1]/10 p-2 text-[#1566D1] ring-1 ring-[#1566D1]/10">
                  <ServiceIcon name={s.icon_name} className="h-4 w-4" />
                </span>
              </td>
              <td className="px-4 py-3 align-middle">
                {s.is_active ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="neutral">Nonaktif</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right align-middle">
                <RowActions
                  onEdit={() => openEdit(s)}
                  onDelete={() => setConfirmId(s.id)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Belum ada layanan"
          action={
            <Button onClick={openCreate} icon={Plus}>
              Tambah Layanan
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Layanan' : 'Tambah Layanan'}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama" required>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder={slugify(form.name)}
              />
            </Field>
          </div>
          <Field label="Icon">
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon_name: name }))}
                  className={classNames(
                    'flex items-center justify-center rounded-xl border p-2.5 transition',
                    form.icon_name === name
                      ? 'border-[#1566D1] bg-[#1566D1]/15 text-[#1566D1]'
                      : 'border-slate-300/40 text-slate-500 hover:border-[#1566D1]/50'
                  )}
                >
                  <ServiceIcon name={name} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Deskripsi Singkat">
            <Textarea
              rows={2}
              value={form.short_description}
              onChange={(e) =>
                setForm((f) => ({ ...f, short_description: e.target.value }))
              }
            />
          </Field>
          <Field label="Deskripsi Lengkap">
            <Textarea
              rows={3}
              value={form.full_description}
              onChange={(e) =>
                setForm((f) => ({ ...f, full_description: e.target.value }))
              }
            />
          </Field>
          <Field label="Fitur" hint="Satu fitur per baris">
            <Textarea
              rows={4}
              value={form.features}
              onChange={(e) =>
                setForm((f) => ({ ...f, features: e.target.value }))
              }
            />
          </Field>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <Toggle
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              label="Aktif"
            />
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
                className="w-full sm:w-24"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.services.remove(confirmId);
          setConfirmId(null);
          toast?.success('Layanan dihapus');
        }}
        title="Hapus Layanan"
        message="Yakin ingin menghapus layanan ini?"
      />
    </>
  );
};

const PricingManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = {
    name: '',
    service_id: '',
    price_from: '',
    price_to: '',
    price_label: '',
    cta_label: 'Konsultasi Gratis',
    is_highlighted: false,
    is_active: true,
    sort_order: 0,
    features: [],
  };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...blank,
      ...p,
      price_from: p.price_from ?? '',
      price_to: p.price_to ?? '',
      features: (p.features || []).map((f) => ({ ...f })),
    });
    setModalOpen(true);
  };

  const addFeature = () =>
    setForm((f) => ({
      ...f,
      features: [
        ...f.features,
        { id: uid(), feature_text: '', is_included: true },
      ],
    }));
  const updateFeature = (id, patch) =>
    setForm((f) => ({
      ...f,
      features: f.features.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  const removeFeature = (id) =>
    setForm((f) => ({ ...f, features: f.features.filter((x) => x.id !== id) }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast?.error('Nama paket wajib diisi');
      return;
    }
    const payload = {
      ...form,
      price_from: form.price_from === '' ? null : Number(form.price_from),
      price_to: form.price_to === '' ? null : Number(form.price_to),
      sort_order: Number(form.sort_order) || 0,
      features: form.features.filter((f) => f.feature_text.trim()),
    };
    if (editing) {
      await crud.pricing_packages.update(editing.id, payload);
      toast?.success('Paket diperbarui');
    } else {
      await crud.pricing_packages.create(payload);
      toast?.success('Paket ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader
        title="Harga"
        description="Kelola paket harga dan fiturnya."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah Paket
          </Button>
        }
      />
      {data.pricing_packages.length ? (
        <AdminTable columns={['Paket', 'Harga', 'Status', 'Aksi']}>
          {data.pricing_packages.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 align-middle">
                <div className="min-w-[180px]">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(p.features || []).length} fitur
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 align-middle font-medium text-slate-700 dark:text-slate-200">
                {formatPriceRange(p)}
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex flex-wrap gap-1.5">
                  {p.is_active ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="neutral">Nonaktif</Badge>
                  )}
                  {p.is_highlighted && <Badge variant="default">Populer</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-right align-middle">
                <RowActions
                  onEdit={() => openEdit(p)}
                  onDelete={() => setConfirmId(p.id)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState
          icon={Tag}
          title="Belum ada paket harga"
          action={
            <Button onClick={openCreate} icon={Plus}>
              Tambah Paket
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Paket' : 'Tambah Paket'}
        size="lg"
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Paket" required>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Starter / Pro / Enterprise"
              />
            </Field>
            <Field label="Layanan Terkait">
              <Select
                value={form.service_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, service_id: e.target.value }))
                }
              >
                <option value="">— Tidak terkait —</option>
                {data.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Harga Dari (Rp)">
              <Input
                type="number"
                value={form.price_from}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_from: e.target.value }))
                }
              />
            </Field>
            <Field label="Harga Hingga (Rp)">
              <Input
                type="number"
                value={form.price_to}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_to: e.target.value }))
                }
              />
            </Field>
            <Field label="Label Harga" hint="Override harga">
              <Input
                value={form.price_label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_label: e.target.value }))
                }
                placeholder="Custom Quote"
              />
            </Field>
          </div>
          <Field label="Label CTA">
            <Input
              value={form.cta_label}
              onChange={(e) =>
                setForm((f) => ({ ...f, cta_label: e.target.value }))
              }
            />
          </Field>
          <div>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Fitur Paket
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addFeature}
                icon={Plus}
              >
                Tambah Fitur
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((f) => (
                <div key={f.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 p-2 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() =>
                      updateFeature(f.id, { is_included: !f.is_included })
                    }
                    className={classNames(
                      'flex-shrink-0 rounded-lg p-2 transition focus:outline-none focus:ring-2 focus:ring-[#1566D1]/40',
                      f.is_included
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-slate-500/15 text-slate-400'
                    )}
                  >
                    {f.is_included ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                  <Input
                    value={f.feature_text}
                    onChange={(e) =>
                      updateFeature(f.id, { feature_text: e.target.value })
                    }
                    placeholder="Teks fitur"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(f.id)}
                    className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!form.features.length && (
                <p className="text-sm text-slate-400">Belum ada fitur.</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
            <Toggle
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              label="Aktif"
            />
            <Toggle
              checked={form.is_highlighted}
              onChange={(v) => setForm((f) => ({ ...f, is_highlighted: v }))}
              label="Paling Populer"
            />
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
                className="w-full sm:w-24"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.pricing_packages.remove(confirmId);
          setConfirmId(null);
          toast?.success('Paket dihapus');
        }}
        title="Hapus Paket"
        message="Yakin ingin menghapus paket harga ini?"
      />
    </>
  );
};

const TestimonialManager = ({ data, crud }) => {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await db.uploadImage(file, `testimonials/${editing?.id || slugify(form.client_name) || 'new'}`);
      setForm((f) => ({ ...f, [field]: url }));
      toast?.success('Foto berhasil diunggah!');
    } catch (err) {
      console.error(err);
      toast?.error('Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  const blank = {
    client_name: '',
    client_title: '',
    client_company: '',
    client_photo_url: '',
    content: '',
    rating: 5,
    is_featured: false,
    status: 'pending',
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...blank, ...t });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.content.trim()) {
      toast?.error('Nama & isi testimoni wajib diisi');
      return;
    }
    const payload = {
      ...form,
      rating: Number(form.rating) || 5,
      sort_order: Number(form.sort_order) || 0,
    };
    if (editing) {
      await crud.testimonials.update(editing.id, payload);
      toast?.success('Testimoni diperbarui');
    } else {
      await crud.testimonials.create(payload);
      toast?.success('Testimoni ditambahkan');
    }
    setModalOpen(false);
  };

  const setStatus = async (id, status) => {
    await crud.testimonials.update(id, { status });
    toast?.success(
      `Testimoni di-${
        status === 'approved'
          ? 'setujui'
          : status === 'rejected'
          ? 'tolak'
          : 'ubah'
      }`
    );
  };

  const filtered = data.testimonials.filter(
    (t) => filter === 'all' || t.status === filter
  );

  return (
    <>
      <AdminHeader
        title="Testimoni"
        description="Moderasi dan kelola testimoni klien."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah Testimoni
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {['all', ...TESTIMONIAL_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={classNames(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
              filter === s
                ? 'bg-[#1566D1] text-white'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
            )}
          >
            {s === 'all'
              ? 'Semua'
              : s === 'pending'
              ? 'Pending'
              : s === 'approved'
              ? 'Disetujui'
              : 'Ditolak'}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((t) => (
            <GlassCard key={t.id} hover={false} className="flex flex-col">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  {t.client_photo_url && (
                    <img
                      src={t.client_photo_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">
                      {t.client_name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {t.client_title}
                      {t.client_company ? `, ${t.client_company}` : ''}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    t.status === 'approved'
                      ? 'success'
                      : t.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {t.status === 'approved'
                    ? 'Disetujui'
                    : t.status === 'rejected'
                    ? 'Ditolak'
                    : 'Pending'}
                </Badge>
              </div>
              <StarRating value={t.rating} className="mt-3" />
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                “{t.content}”
              </p>
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/60 pt-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {t.status !== 'approved' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => setStatus(t.id, 'approved')}
                      icon={CheckCircle2}
                    >
                      Setujui
                    </Button>
                  )}
                  {t.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setStatus(t.id, 'rejected')}
                      icon={XCircle}
                    >
                      Tolak
                    </Button>
                  )}
                </div>
                <RowActions
                  onEdit={() => openEdit(t)}
                  onDelete={() => setConfirmId(t.id)}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={MessageSquare} title="Tidak ada testimoni" />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Testimoni' : 'Tambah Testimoni'}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Klien" required>
              <Input
                value={form.client_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, client_name: e.target.value }))
                }
              />
            </Field>
            <Field label="Jabatan">
              <Input
                value={form.client_title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, client_title: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="Perusahaan">
            <Input
              value={form.client_company}
              onChange={(e) =>
                setForm((f) => ({ ...f, client_company: e.target.value }))
              }
            />
          </Field>
          <Field label="Foto Klien">
            <div className="flex flex-col gap-3">
              {form.client_photo_url && (
                <img
                  src={form.client_photo_url}
                  alt="preview"
                  className="h-16 w-16 object-cover rounded-full border border-slate-300/60 dark:border-white/15"
                />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, 'client_photo_url')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1566D1]/10 file:text-[#1566D1] hover:file:bg-[#1566D1]/20 cursor-pointer disabled:opacity-50 transition"
              />
            </div>
          </Field>
          <Field label="Isi Testimoni" required>
            <Textarea
              rows={4}
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </Field>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
            <Field label="Rating">
              <div className="mt-1">
                <StarRating
                  value={form.rating}
                  interactive
                  onChange={(v) => setForm((f) => ({ ...f, rating: v }))}
                  size="h-6 w-6"
                />
              </div>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {TESTIMONIAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Toggle
              checked={form.is_featured}
              onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
              label="Featured"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.testimonials.remove(confirmId);
          setConfirmId(null);
          toast?.success('Testimoni dihapus');
        }}
        title="Hapus Testimoni"
        message="Yakin ingin menghapus testimoni ini?"
      />
    </>
  );
};

const LeadManager = ({ data, crud }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = data.leads.filter((l) => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      l.full_name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const exportCsv = () => {
    const rows = data.leads.map((l) => ({
      Nama: l.full_name,
      Email: l.email,
      WhatsApp: l.whatsapp,
      Perusahaan: l.company,
      Layanan: l.service_interest,
      Anggaran: l.budget_range,
      Pesan: l.message,
      Status: l.status,
      Sumber: l.source_page,
      Tanggal: formatDateTime(l.created_at),
    }));
    downloadCSV(rows, `viska-leads-${Date.now()}.csv`);
    toast?.success('CSV diekspor');
  };

  const setStatus = async (id, status) => {
    await crud.leads.update(id, { status });
    setDetail((d) => (d && d.id === id ? { ...d, status } : d));
  };

  return (
    <>
      <AdminHeader
        title="Leads"
        description="Pesan masuk dari form kontak."
        action={
          <Button
            variant="outline"
            onClick={exportCsv}
            icon={Download}
            disabled={!data.leads.length}
          >
            Export CSV
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari lead..."
            className={classNames(inputClass, 'pl-10')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...LEAD_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={classNames(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                statusFilter === s
                  ? 'bg-[#1566D1] text-white'
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
              )}
            >
              {s === 'all'
                ? 'Semua'
                : s === 'new'
                ? 'Baru'
                : s === 'in_progress'
                ? 'Proses'
                : s === 'done'
                ? 'Selesai'
                : 'Spam'}
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <AdminTable
          columns={['Pengirim', 'Layanan', 'Tanggal', 'Status', 'Aksi']}
        >
          {filtered.map((l) => (
            <tr
              key={l.id}
              className="cursor-pointer hover:bg-[#1566D1]/5"
              onClick={() => setDetail(l)}
            >
              <td className="px-4 py-3 align-middle">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {l.full_name}
                </p>
                <p className="max-w-[220px] truncate text-xs text-slate-500 dark:text-slate-400">{l.email}</p>
              </td>
              <td className="px-4 py-3 align-middle text-slate-600 dark:text-slate-300">
                {l.service_interest || '-'}
              </td>
              <td className="px-4 py-3 align-middle text-xs text-slate-500 dark:text-slate-400">
                {formatDateTime(l.created_at)}
              </td>
              <td className="px-4 py-3 align-middle">
                <LeadStatusBadge status={l.status} />
              </td>
              <td
                className="px-4 py-3 text-right align-middle"
                onClick={(e) => e.stopPropagation()}
              >
                <RowActions
                  onDelete={() => setConfirmId(l.id)}
                  extra={
                    <button
                      onClick={() => setDetail(l)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-[#1566D1]/10 hover:text-[#1566D1] focus:outline-none focus:ring-2 focus:ring-[#1566D1]/30"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  }
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState
          icon={Inbox}
          title="Tidak ada lead"
          description="Lead dari form kontak akan muncul di sini."
        />
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Lead"
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Nama', value: detail.full_name },
                { label: 'Email', value: detail.email },
                { label: 'WhatsApp', value: detail.whatsapp || '-' },
                { label: 'Perusahaan', value: detail.company || '-' },
                { label: 'Layanan', value: detail.service_interest || '-' },
                { label: 'Anggaran', value: detail.budget_range || '-' },
                { label: 'Sumber', value: detail.source_page || '-' },
                { label: 'Tanggal', value: formatDateTime(detail.created_at) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl bg-slate-500/5 px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {row.label}
                  </p>
                  <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-500/5 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Pesan
              </p>
              <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                {detail.message}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Ubah Status
              </p>
              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(detail.id, s)}
                    className={classNames(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                      detail.status === s
                        ? 'bg-[#1566D1] text-white'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {s === 'new'
                      ? 'Baru'
                      : s === 'in_progress'
                      ? 'Proses'
                      : s === 'done'
                      ? 'Selesai'
                      : 'Spam'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <a href={`mailto:${detail.email}`} className="flex-1">
                <Button variant="outline" className="w-full" icon={Mail}>
                  Balas Email
                </Button>
              </a>
              {detail.whatsapp && (
                <a
                  href={buildWhatsAppLink(
                    detail.whatsapp,
                    `Halo ${detail.full_name}, terima kasih telah menghubungi Viska Labs.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="success"
                    className="w-full"
                    icon={MessageCircle}
                  >
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.leads.remove(confirmId);
          setConfirmId(null);
          toast?.success('Lead dihapus');
        }}
        title="Hapus Lead"
        message="Yakin ingin menghapus lead ini?"
      />
    </>
  );
};

const FaqManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = {
    question: '',
    answer: '',
    category: 'General',
    is_published: true,
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (f) => {
    setEditing(f);
    setForm({ ...blank, ...f });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast?.error('Pertanyaan & jawaban wajib diisi');
      return;
    }
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (editing) {
      await crud.faq_items.update(editing.id, payload);
      toast?.success('FAQ diperbarui');
    } else {
      await crud.faq_items.create(payload);
      toast?.success('FAQ ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader
        title="FAQ"
        description="Kelola pertanyaan yang sering diajukan."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah FAQ
          </Button>
        }
      />
      {data.faq_items.length ? (
        <AdminTable columns={['Pertanyaan', 'Kategori', 'Status', 'Aksi']}>
          {data.faq_items.map((f) => (
            <tr key={f.id}>
              <td className="px-4 py-3 align-middle">
                <div className="min-w-[240px]">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {f.question}
                  </p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:line-clamp-1">
                    {f.answer}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                <Badge variant="neutral">{f.category || 'General'}</Badge>
              </td>
              <td className="px-4 py-3 align-middle">
                {f.is_published ? (
                  <Badge variant="success">Publish</Badge>
                ) : (
                  <Badge variant="neutral">Draft</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-right align-middle">
                <RowActions
                  onEdit={() => openEdit(f)}
                  onDelete={() => setConfirmId(f.id)}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <EmptyState
          icon={HelpCircle}
          title="Belum ada FAQ"
          action={
            <Button onClick={openCreate} icon={Plus}>
              Tambah FAQ
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit FAQ' : 'Tambah FAQ'}
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Pertanyaan" required>
            <Input
              value={form.question}
              onChange={(e) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
            />
          </Field>
          <Field label="Jawaban" required>
            <Textarea
              rows={4}
              value={form.answer}
              onChange={(e) =>
                setForm((f) => ({ ...f, answer: e.target.value }))
              }
            />
          </Field>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
            <Field label="Kategori">
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {['General', 'Pricing', 'Technical'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Toggle
              checked={form.is_published}
              onChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              label="Publish"
            />
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
                className="w-full sm:w-24"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.faq_items.remove(confirmId);
          setConfirmId(null);
          toast?.success('FAQ dihapus');
        }}
        title="Hapus FAQ"
        message="Yakin ingin menghapus FAQ ini?"
      />
    </>
  );
};

const TeamManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await db.uploadImage(file, `team/${editing?.id || slugify(form.name) || 'new'}`);
      setForm((f) => ({ ...f, [field]: url }));
      toast?.success('Foto berhasil diunggah!');
    } catch (err) {
      console.error(err);
      toast?.error('Gagal mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  const blank = {
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    linkedin_url: '',
    instagram_url: '',
    is_active: true,
    sort_order: 0,
  };
  const [form, setForm] = useState(blank);

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setModalOpen(true);
  };
  const openEdit = (m) => {
    setEditing(m);
    setForm({ ...blank, ...m });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      toast?.error('Nama & peran wajib diisi');
      return;
    }
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (editing) {
      await crud.team_members.update(editing.id, payload);
      toast?.success('Anggota tim diperbarui');
    } else {
      await crud.team_members.create(payload);
      toast?.success('Anggota tim ditambahkan');
    }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader
        title="Tim"
        description="Kelola anggota tim untuk halaman About."
        action={
          <Button onClick={openCreate} icon={Plus}>
            Tambah Anggota
          </Button>
        }
      />
      {data.team_members.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.team_members.map((m) => (
            <GlassCard key={m.id} hover={false} className="flex h-full flex-col text-center">
              <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200/70 dark:bg-slate-700 dark:ring-white/10">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="m-auto mt-6 h-7 w-7 text-slate-400" />
                )}
              </div>
              <p className="font-bold text-slate-900 dark:text-white">
                {m.name}
              </p>
              <p className="text-sm font-medium text-[#1566D1]">{m.role}</p>
              {m.bio && (
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {m.bio}
                </p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {m.is_active ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="neutral">Nonaktif</Badge>
                )}
              </div>
              <div className="mt-3 flex justify-center">
                <RowActions
                  onEdit={() => openEdit(m)}
                  onDelete={() => setConfirmId(m.id)}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Belum ada anggota tim"
          action={
            <Button onClick={openCreate} icon={Plus}>
              Tambah Anggota
            </Button>
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Anggota' : 'Tambah Anggota'}
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama" required>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>
            <Field label="Peran" required>
              <Input
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                placeholder="CEO & Founder"
              />
            </Field>
          </div>
          <Field label="Bio">
            <Textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </Field>
          <Field label="Foto Profil">
            <div className="flex flex-col gap-3">
              {form.photo_url && (
                <img
                  src={form.photo_url}
                  alt="preview"
                  className="h-20 w-20 object-cover rounded-2xl border border-slate-300/60 dark:border-white/15"
                />
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e, 'photo_url')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1566D1]/10 file:text-[#1566D1] hover:file:bg-[#1566D1]/20 cursor-pointer disabled:opacity-50 transition"
              />
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram (Username / Link)">
              <Input
                value={form.instagram_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instagram_url: e.target.value }))
                }
                placeholder="@username atau https://..."
              />
            </Field>
            <Field label="LinkedIn (Username / Link)">
              <Input
                value={form.linkedin_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkedin_url: e.target.value }))
                }
                placeholder="username atau https://..."
              />
            </Field>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <Toggle
              checked={form.is_active}
              onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              label="Aktif"
            />
            <Field label="Urutan">
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: e.target.value }))
                }
                className="w-full sm:w-24"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" icon={Save}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          await crud.team_members.remove(confirmId);
          setConfirmId(null);
          toast?.success('Anggota tim dihapus');
        }}
        title="Hapus Anggota"
        message="Yakin ingin menghapus anggota tim ini?"
      />
    </>
  );
};

const SettingsManager = ({ data, saveSettings }) => {
  const toast = useToast();
  const tabs = [
    { key: 'general', label: 'Umum' },
    { key: 'contact', label: 'Kontak' },
    { key: 'social', label: 'Sosial Media' },
    { key: 'seo', label: 'SEO' },
  ];
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState(data.site_settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setForm(data.site_settings);
  }, [data.site_settings]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    toast?.success('Pengaturan disimpan');
  };

  return (
    <>
      <AdminHeader
        title="Pengaturan"
        description="Kelola informasi global website."
      />
      <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={classNames(
              'rounded-lg px-4 py-2 text-sm font-semibold transition',
              tab === t.key
                ? 'bg-[#1566D1] text-white'
                : 'text-slate-600 hover:bg-[#1566D1]/10 dark:text-slate-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <GlassCard hover={false} className="space-y-4">
          {tab === 'general' && (
            <>
              <Field label="Nama Perusahaan">
                <Input
                  value={form.company_name || ''}
                  onChange={(e) => setField('company_name', e.target.value)}
                />
              </Field>
              <Field label="Tagline">
                <Input
                  value={form.company_tagline || ''}
                  onChange={(e) => setField('company_tagline', e.target.value)}
                />
              </Field>
            </>
          )}
          {tab === 'contact' && (
            <>
              <Field label="Email Kontak">
                <Input
                  type="email"
                  value={form.contact_email || ''}
                  onChange={(e) => setField('contact_email', e.target.value)}
                />
              </Field>
              <Field
                label="Nomor WhatsApp"
                hint="Format internasional tanpa +, mis. 628xxx"
              >
                <Input
                  value={form.whatsapp_number || ''}
                  onChange={(e) => setField('whatsapp_number', e.target.value)}
                />
              </Field>
              <Field label="Alamat">
                <Input
                  value={form.address || ''}
                  onChange={(e) => setField('address', e.target.value)}
                />
              </Field>
              <Field label="Jam Operasional">
                <Input
                  value={form.operating_hours || ''}
                  onChange={(e) => setField('operating_hours', e.target.value)}
                />
              </Field>
            </>
          )}
          {tab === 'social' && (
            <>
              <Field label="Instagram URL">
                <Input
                  value={form.instagram_url || ''}
                  onChange={(e) => setField('instagram_url', e.target.value)}
                />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  value={form.linkedin_url || ''}
                  onChange={(e) => setField('linkedin_url', e.target.value)}
                />
              </Field>
              <Field label="GitHub URL">
                <Input
                  value={form.github_url || ''}
                  onChange={(e) => setField('github_url', e.target.value)}
                />
              </Field>
            </>
          )}
          {tab === 'seo' && (
            <>
              <Field label="Meta Title Default">
                <Input
                  value={form.meta_title_default || ''}
                  onChange={(e) =>
                    setField('meta_title_default', e.target.value)
                  }
                />
              </Field>
              <Field label="Meta Description Default">
                <Textarea
                  rows={3}
                  value={form.meta_description_default || ''}
                  onChange={(e) =>
                    setField('meta_description_default', e.target.value)
                  }
                />
              </Field>
              <Field label="Google Analytics ID" hint="mis. G-XXXXXXXXXX">
                <Input
                  value={form.google_analytics_id || ''}
                  onChange={(e) =>
                    setField('google_analytics_id', e.target.value)
                  }
                />
              </Field>
            </>
          )}
          <div className="flex pt-2 sm:justify-end">
            <Button
              type="submit"
              loading={saving}
              icon={saving ? undefined : Save}
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </GlassCard>
      </form>
    </>
  );
};

export default function AdminApp({ data, crud, saveSettings, navigate }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(SUPABASE_ENABLED);
  const [active, setActive] = useState('dashboard');

  useEffect(() => {
    let mounted = true;
    if (SUPABASE_ENABLED) {
      db.getSession()
        .then((u) => {
          if (mounted) {
            setUser(u);
            setChecking(false);
          }
        })
        .catch(() => mounted && setChecking(false));
    }
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    if (SUPABASE_ENABLED) await db.signOut();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1566D1]" />
      </div>
    );
  }
  if (!user) return <AdminLogin onLogin={setUser} navigate={navigate} />;

  const modules = {
    dashboard: <AdminDashboard data={data} setActive={setActive} />,
    portfolio: <PortfolioManager data={data} crud={crud} />,
    services: <ServiceManager data={data} crud={crud} />,
    pricing: <PricingManager data={data} crud={crud} />,
    testimonials: <TestimonialManager data={data} crud={crud} />,
    leads: <LeadManager data={data} crud={crud} />,
    faq: <FaqManager data={data} crud={crud} />,
    team: <TeamManager data={data} crud={crud} />,
    settings: <SettingsManager data={data} saveSettings={saveSettings} />,
  };

  return (
    <AdminLayout
      active={active}
      setActive={setActive}
      onLogout={handleLogout}
      navigate={navigate}
      user={user}
    >
      {modules[active]}
    </AdminLayout>
  );
}