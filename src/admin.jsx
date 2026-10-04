import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FolderKanban, Wrench, Tag, MessageSquare, Inbox, HelpCircle, Users, Settings as SettingsIcon, LogOut, ArrowLeft, ShieldCheck, EyeOff, Eye, ArrowRight, Menu, X, TrendingUp, ChevronRight, CheckCircle2, XCircle, Pencil, Trash2, Search, Download, Plus, Save, ImageIcon, Mail, MessageCircle, Check,
} from 'lucide-react';

import {
  useToast, GlassCard, Field, Input, Button, Logo, Badge, EmptyState, Modal, Select, Textarea, Toggle, StarRating, ServiceIcon, ROUTES, classNames, formatDateTime, formatPriceRange, formatDate, slugify, PORTFOLIO_CATEGORIES, TESTIMONIAL_STATUSES, LEAD_STATUSES, ICON_NAMES, downloadCSV, buildWhatsAppLink, uid, inputClass,
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
  const [password, setPassword] = useState(SUPABASE_ENABLED ? '' : DEMO_ADMIN.password);
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
    <div className="flex min-h-screen items-center justify-center px-4 py-20 z-10 relative">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="mb-8 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 transition hover:text-[#1566D1] dark:text-slate-400 dark:hover:text-white mx-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Website
        </button>
        <GlassCard hover={false} className="sm:p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1566D1]/10 text-[#1566D1]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Sistem Inti
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Otentikasi diperlukan untuk akses panel.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={loading} className="space-y-5">
              <Field label="Alamat Email" required>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@viskalabs.id" autoComplete="email" />
              </Field>
              <Field label="Kata Sandi" required>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="pr-12" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1566D1] dark:hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">{error}</p>}
              <Button type="submit" size="lg" className="w-full mt-2" loading={loading} icon={loading ? undefined : ArrowRight}>
                {loading ? 'Memverifikasi...' : 'Akses Panel'}
              </Button>
            </fieldset>
          </form>
          {!SUPABASE_ENABLED && (
            <p className="mt-6 rounded-xl border border-[#1566D1]/20 bg-[#1566D1]/5 px-4 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
              Mode demo aktif. Login: <strong>{DEMO_ADMIN.email}</strong> / <strong>{DEMO_ADMIN.password}</strong>
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const AdminLayout = ({ active, setActive, onLogout, navigate, children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const NavItems = ({ onClick }) => (
    <>
      {ADMIN_MODULES.map((m) => (
        <button
          key={m.key}
          onClick={() => { setActive(m.key); onClick?.(); }}
          className={classNames(
            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1566D1]',
            active === m.key
              ? 'bg-[#1566D1] text-white shadow-md shadow-[#1566D1]/30'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
          )}
        >
          <m.icon className="h-5 w-5" /> {m.label}
        </button>
      ))}
    </>
  );
  return (
    <div className="min-h-screen px-0 pb-6 pt-0 sm:pt-4 relative z-10">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#030F26]/80 lg:hidden">
        <Logo onClick={() => navigate(ROUTES.HOME)} />
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="rounded-xl p-2 text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 outline-none"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-6 rounded-3xl glass dark:glass p-5 shadow-xl">
            <div className="mb-6 px-2">
              <Logo onClick={() => navigate(ROUTES.HOME)} />
            </div>
            <nav className="space-y-1.5">
              <NavItems />
            </nav>
            <div className="mt-6 border-t border-slate-200/70 pt-6 dark:border-white/10">
              <div className="mb-4 rounded-2xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                <p className="break-all font-bold text-slate-900 dark:text-white">
                  {user?.email}
                </p>
                <p className="mt-1 font-medium">{SUPABASE_ENABLED ? 'Supabase Auth' : 'Mode Demo'}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400 outline-none"
              >
                <LogOut className="h-5 w-5" /> Akhiri Sesi
              </button>
            </div>
          </div>
        </aside>
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-[min(20rem,86vw)] overflow-y-auto border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#030F26] p-5 shadow-2xl">
              <div className="mb-8 px-2">
                <Logo onClick={() => navigate(ROUTES.HOME)} />
              </div>
              <nav className="space-y-1.5">
                <NavItems onClick={() => setSidebarOpen(false)} />
              </nav>
              <button
                onClick={onLogout}
                className="mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400"
              >
                <LogOut className="h-5 w-5" /> Akhiri Sesi
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
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
    {action && (
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
        {action}
      </div>
    )}
  </div>
);

const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
      {message}
    </p>
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button variant="ghost" onClick={onClose}>Batal</Button>
      <Button variant="danger" onClick={onConfirm} icon={Trash2}>Hapus Permanen</Button>
    </div>
  </Modal>
);

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <GlassCard className="flex items-center gap-4 !p-5">
    <div className={classNames('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', accent)}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  </GlassCard>
);

const AdminDashboard = ({ data, setActive }) => {
  const newLeads = data.leads.filter((l) => l.status === 'new').length;
  const pendingTestimonials = data.testimonials.filter((t) => t.status === 'pending').length;
  const publishedPortfolio = data.portfolios.filter((p) => p.is_published).length;

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
      <AdminHeader title="Dashboard Analitik" description="Ringkasan aktivitas operasional dan metrik platform." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Arsip Aktif" value={publishedPortfolio} accent="bg-gradient-to-br from-[#1566D1] to-[#0B2F6B]" />
        <StatCard icon={Inbox} label="Briefing Baru" value={newLeads} accent="bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <StatCard icon={MessageSquare} label="Ulasan Pending" value={pendingTestimonials} accent="bg-gradient-to-br from-amber-400 to-amber-600" />
        <StatCard icon={Wrench} label="Layanan Aktif" value={data.services.filter((s) => s.is_active).length} accent="bg-gradient-to-br from-slate-700 to-slate-900" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <GlassCard hover={false} className="lg:col-span-2">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1566D1]/10 text-[#1566D1]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">Akuisisi Klien (14 Hari)</h3>
          </div>
          <div className="flex h-48 items-end gap-2">
            {counts.map((c, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center justify-end gap-2 h-full">
                <span className="absolute -top-6 text-[10px] font-bold text-slate-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {c}
                </span>
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-[#1566D1]/20 to-[#1566D1]/60 transition-all duration-300 group-hover:from-[#1566D1]/80 group-hover:to-[#1566D1]"
                  style={{ height: `${(c / maxCount) * 100}%`, minHeight: c ? '8px' : '4px' }}
                />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <h3 className="mb-6 font-bold tracking-tight text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-white/10 pb-4">
            Pintasan Operasional
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Registrasi Arsip Proyek', key: 'portfolio', icon: FolderKanban },
              { label: 'Tinjau Briefing Klien', key: 'leads', icon: Inbox },
              { label: 'Moderasi Ulasan', key: 'testimonials', icon: MessageSquare },
              { label: 'Konfigurasi Sistem', key: 'settings', icon: SettingsIcon },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setActive(a.key)}
                className="group flex w-full items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-[#1566D1]/10 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <span className="flex items-center gap-3">
                  <a.icon className="h-5 w-5 text-[#1566D1] dark:text-[#7fb0f5]" /> {a.label}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
      <GlassCard hover={false} className="mt-8">
        <h3 className="mb-6 font-bold tracking-tight text-slate-900 dark:text-white text-lg border-b border-slate-200 dark:border-white/10 pb-4">
          Antrean Briefing Terbaru
        </h3>
        {recentLeads.length ? (
          <div className="space-y-3">
            {recentLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-5 py-4 transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-white">{l.full_name}</p>
                  <p className="truncate text-xs font-medium text-slate-500 mt-1">{l.email} · <span className="font-bold text-slate-400">{l.service_interest || 'Umum'}</span></p>
                </div>
                <LeadStatusBadge status={l.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} title="Antrean kosong" description="Belum ada briefing proyek baru." />
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
  <GlassCard hover={false} className="!p-0 overflow-hidden border border-slate-200/80 dark:border-white/10">
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-left">
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-6 py-5 text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  </GlassCard>
);

const RowActions = ({ onEdit, onDelete, extra }) => (
  <div className="flex items-center justify-end gap-2">
    {extra}
    {onEdit && (
      <button type="button" onClick={onEdit} aria-label="Edit data" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#1566D1] hover:text-white dark:bg-white/5 dark:hover:bg-[#1566D1]">
        <Pencil className="h-4 w-4" />
      </button>
    )}
    {onDelete && (
      <button type="button" onClick={onDelete} aria-label="Hapus data" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-red-500 hover:text-white dark:bg-white/5 dark:hover:bg-red-500">
        <Trash2 className="h-4 w-4" />
      </button>
    )}
  </div>
);

const linesToArray = (text) => (text || '').split('\n').map((s) => s.trim()).filter(Boolean);
const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const csvToArray = (text) => (text || '').split(',').map((s) => s.trim()).filter(Boolean);

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
      toast?.success('Aset berhasil diunggah!');
    } catch (err) {
      toast?.error('Gagal mengunggah aset.');
    } finally { setUploading(false); }
  };

  const blank = { title: '', slug: '', category: PORTFOLIO_CATEGORIES[1], short_description: '', full_description: '', client_name: '', tech_stack: '', thumbnail_url: '', images: [], project_url: '', completed_at: '', is_featured: false, is_published: true, sort_order: 0 };
  const [form, setForm] = useState(blank);

  const handleMultipleUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await db.uploadImage(file, `portfolio/${editing?.id || slugify(form.title) || 'new'}/gallery`);
      setForm((f) => { const newImages = [...f.images]; newImages[index] = url; return { ...f, images: newImages }; });
      toast?.success('Aset galeri berhasil diunggah!');
    } catch (err) { toast?.error('Gagal mengunggah aset galeri.'); } finally { setUploading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...blank, ...p, tech_stack: (p.tech_stack || []).join(', '), images: p.images || [], completed_at: p.completed_at || '' }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast?.error('Judul arsip wajib diisi'); return; }
    const payload = { ...form, slug: form.slug.trim() || slugify(form.title), tech_stack: csvToArray(form.tech_stack), images: form.images.filter(Boolean), sort_order: Number(form.sort_order) || 0, completed_at: form.completed_at || null };
    if (editing) { await crud.portfolios.update(editing.id, payload); toast?.success('Arsip diperbarui'); } else { await crud.portfolios.create(payload); toast?.success('Arsip didaftarkan'); }
    setModalOpen(false);
  };

  const filtered = data.portfolios.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <AdminHeader title="Arsip Portfolio" description="Manajemen direktori proyek dan studi kasus." action={<Button onClick={openCreate} icon={Plus}>Registrasi Arsip</Button>} />
      <div className="relative mb-6 w-full max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari arsip..." className={classNames(inputClass, 'pl-12')} />
      </div>
      {filtered.length ? (
        <AdminTable columns={['Identitas Proyek', 'Kategori', 'Status Publikasi', 'Aksi']}>
          {filtered.map((p) => (
            <tr key={p.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              <td className="px-6 py-4 align-middle">
                <div className="flex min-w-[240px] items-center gap-4">
                  <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                    {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-auto mt-4 h-6 w-6 text-slate-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 dark:text-white">{p.title}</p>
                    <p className="truncate text-xs font-medium text-slate-500 mt-1">{p.client_name}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 align-middle"><Badge variant="neutral">{p.category}</Badge></td>
              <td className="px-6 py-4 align-middle">
                <div className="flex flex-wrap gap-2">
                  {p.is_published ? <Badge variant="success">Publik</Badge> : <Badge variant="neutral">Draft</Badge>}
                  {p.is_featured && <Badge variant="default">Disorot</Badge>}
                </div>
              </td>
              <td className="px-6 py-4 text-right align-middle">
                <RowActions
                  onEdit={() => openEdit(p)} onDelete={() => setConfirmId(p.id)}
                  extra={
                    <button onClick={async () => { await crud.portfolios.update(p.id, { is_published: !p.is_published }); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#1566D1] hover:text-white dark:bg-white/5 dark:hover:bg-[#1566D1]" title="Ubah Visibilitas">
                      {p.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  }
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (<EmptyState icon={FolderKanban} title="Arsip kosong" action={<Button onClick={openCreate} icon={Plus}>Registrasi Arsip Baru</Button>} />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Arsip' : 'Registrasi Arsip Baru'} size="lg">
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Nama Proyek" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field><Field label="Slug URL" hint="Kosongkan untuk otomatisasi"><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={slugify(form.title)} /></Field></div>
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Klasifikasi Kategori"><Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>{PORTFOLIO_CATEGORIES.slice(1).map((c) => (<option key={c}>{c}</option>))}</Select></Field><Field label="Nama Entitas/Klien"><Input value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} /></Field></div>
          <Field label="Ringkasan Eksekutif"><Textarea rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} /></Field>
          <Field label="Uraian Komprehensif"><Textarea rows={4} value={form.full_description} onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))} /></Field>
          <Field label="Tumpukan Teknologi (Tech Stack)" hint="Pisahkan nilai dengan koma"><Input value={form.tech_stack} onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))} placeholder="React, Node.js, Vercel" /></Field>
          <Field label="Aset Thumbnail">
            <div className="flex flex-col gap-4">
              {form.thumbnail_url && <img src={form.thumbnail_url} alt="preview" className="h-32 w-auto max-w-[200px] object-cover rounded-2xl shadow-md border border-slate-200 dark:border-white/10" />}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'thumbnail_url')} className="block w-full text-sm font-medium text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[#1566D1] file:text-white hover:file:bg-[#124691] cursor-pointer disabled:opacity-50 transition" />
            </div>
          </Field>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Aset Galeri Pendukung</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setForm((f) => ({ ...f, images: [...f.images, ''] }))} icon={Plus}>Tambah Slot Aset</Button>
            </div>
            <div className="space-y-4">
              {form.images.map((imgUrl, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5">
                  {imgUrl ? <img src={imgUrl} alt="gallery" className="h-20 w-32 object-cover rounded-xl border border-slate-200 dark:border-white/10" /> : <div className="h-20 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">Pratinjau</div>}
                  <div className="flex-1 w-full"><input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleMultipleUpload(e, idx)} className="block w-full text-sm font-medium text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-slate-200 file:text-slate-700 dark:file:bg-white/10 dark:file:text-white cursor-pointer disabled:opacity-50 transition" /></div>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.images.length === 0 && <p className="text-xs font-medium text-slate-400 italic">Belum ada aset galeri tambahan.</p>}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Tautan Tinjauan (URL)"><Input value={form.project_url} onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))} /></Field><Field label="Waktu Penyelesaian"><Input type="date" value={form.completed_at || ''} onChange={(e) => setForm((f) => ({ ...f, completed_at: e.target.value }))} /></Field></div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5"><Toggle checked={form.is_published} onChange={(v) => setForm((f) => ({ ...f, is_published: v }))} label="Visibilitas Publik" /></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5"><Toggle checked={form.is_featured} onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} label="Sorotan Beranda" /></div>
            <Field label="Prioritas Urutan"><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className="w-full sm:w-32" /></Field>
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Arsip</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.portfolios.remove(confirmId); setConfirmId(null); toast?.success('Arsip dihapus permanen'); }} title="Hapus Arsip Portfolio" message="Apakah Anda yakin ingin menghapus arsip ini? Tindakan penghapusan tidak dapat dibatalkan." />
    </>
  );
};

const ServiceManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = { name: '', slug: '', short_description: '', full_description: '', icon_name: 'Code2', features: '', is_active: true, sort_order: 0 };
  const [form, setForm] = useState(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...blank, ...s, features: arrayToLines(s.features) }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast?.error('Identitas layanan wajib diisi'); return; }
    const payload = { ...form, slug: form.slug.trim() || slugify(form.name), features: linesToArray(form.features), sort_order: Number(form.sort_order) || 0 };
    if (editing) { await crud.services.update(editing.id, payload); toast?.success('Layanan diperbarui'); } else { await crud.services.create(payload); toast?.success('Layanan diaktivasi'); }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader title="Konfigurasi Layanan" description="Manajemen parameter dan detail layanan operasional." action={<Button onClick={openCreate} icon={Plus}>Aktivasi Layanan</Button>} />
      {data.services.length ? (
        <AdminTable columns={['Identitas Layanan', 'Ikonografi', 'Status', 'Aksi']}>
          {data.services.map((s) => (
            <tr key={s.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              <td className="px-6 py-4 align-middle">
                <div className="min-w-[260px]">
                  <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                  <p className="line-clamp-2 text-xs font-medium text-slate-500 mt-1">{s.short_description}</p>
                </div>
              </td>
              <td className="px-6 py-4 align-middle"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1566D1]/10 text-[#1566D1]"><ServiceIcon name={s.icon_name} className="h-6 w-6" /></div></td>
              <td className="px-6 py-4 align-middle">{s.is_active ? <Badge variant="success">Aktif</Badge> : <Badge variant="neutral">Dibekukan</Badge>}</td>
              <td className="px-6 py-4 text-right align-middle"><RowActions onEdit={() => openEdit(s)} onDelete={() => setConfirmId(s.id)} /></td>
            </tr>
          ))}
        </AdminTable>
      ) : (<EmptyState icon={Wrench} title="Daftar layanan kosong" action={<Button onClick={openCreate} icon={Plus}>Aktivasi Layanan Dasar</Button>} />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Layanan' : 'Aktivasi Layanan Baru'}>
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Nama Layanan" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field><Field label="Slug URL"><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={slugify(form.name)} /></Field></div>
          <Field label="Ikonografi Visual">
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-8">
              {ICON_NAMES.map((name) => (
                <button key={name} type="button" onClick={() => setForm((f) => ({ ...f, icon_name: name }))} className={classNames('flex h-12 w-full items-center justify-center rounded-xl border-2 transition-all', form.icon_name === name ? 'border-[#1566D1] bg-[#1566D1] text-white shadow-md' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-[#1566D1]/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#7fb0f5]/50')}>
                  <ServiceIcon name={name} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Ringkasan Eksekutif"><Textarea rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} /></Field>
          <Field label="Spesifikasi Lengkap"><Textarea rows={4} value={form.full_description} onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))} /></Field>
          <Field label="Fitur Pendukung" hint="Masukkan satu nilai fungsionalitas per baris"><Textarea rows={5} value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} /></Field>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 flex-1"><Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Status Operasional" /></div>
            <Field label="Prioritas Urutan"><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className="w-full sm:w-32" /></Field>
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Parameter</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.services.remove(confirmId); setConfirmId(null); toast?.success('Layanan dihapus permanen'); }} title="Hapus Layanan" message="Penghapusan layanan bersifat permanen. Yakin ingin melanjutkan?" />
    </>
  );
};

const PricingManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = { name: '', service_id: '', price_from: '', price_to: '', price_label: '', cta_label: 'Konsultasi Sekarang', is_highlighted: false, is_active: true, sort_order: 0, features: [] };
  const [form, setForm] = useState(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...blank, ...p, price_from: p.price_from ?? '', price_to: p.price_to ?? '', features: (p.features || []).map((f) => ({ ...f })) }); setModalOpen(true); };

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, { id: uid(), feature_text: '', is_included: true }] }));
  const updateFeature = (id, patch) => setForm((f) => ({ ...f, features: f.features.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeFeature = (id) => setForm((f) => ({ ...f, features: f.features.filter((x) => x.id !== id) }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast?.error('Identitas skema wajib diisi'); return; }
    const payload = { ...form, price_from: form.price_from === '' ? null : Number(form.price_from), price_to: form.price_to === '' ? null : Number(form.price_to), sort_order: Number(form.sort_order) || 0, features: form.features.filter((f) => f.feature_text.trim()) };
    if (editing) { await crud.pricing_packages.update(editing.id, payload); toast?.success('Skema diperbarui'); } else { await crud.pricing_packages.create(payload); toast?.success('Skema didaftarkan'); }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader title="Skema Harga" description="Manajemen struktur penagihan dan paket fungsionalitas." action={<Button onClick={openCreate} icon={Plus}>Formulasi Skema</Button>} />
      {data.pricing_packages.length ? (
        <AdminTable columns={['Identitas Skema', 'Valuasi', 'Status', 'Aksi']}>
          {data.pricing_packages.map((p) => (
            <tr key={p.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              <td className="px-6 py-4 align-middle"><div className="min-w-[200px]"><p className="font-bold text-slate-900 dark:text-white">{p.name}</p><p className="text-xs font-medium text-slate-500 mt-1">{(p.features || []).length} komponen fitur</p></div></td>
              <td className="px-6 py-4 align-middle font-bold text-slate-700 dark:text-slate-200">{formatPriceRange(p)}</td>
              <td className="px-6 py-4 align-middle"><div className="flex flex-wrap gap-2">{p.is_active ? <Badge variant="success">Aktif</Badge> : <Badge variant="neutral">Dibekukan</Badge>}{p.is_highlighted && <Badge variant="default">Rekomendasi</Badge>}</div></td>
              <td className="px-6 py-4 text-right align-middle"><RowActions onEdit={() => openEdit(p)} onDelete={() => setConfirmId(p.id)} /></td>
            </tr>
          ))}
        </AdminTable>
      ) : (<EmptyState icon={Tag} title="Daftar skema kosong" action={<Button onClick={openCreate} icon={Plus}>Formulasi Skema Baru</Button>} />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Skema' : 'Formulasi Skema Baru'} size="lg">
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Identitas Skema" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enterprise / Pro" /></Field><Field label="Tautan Layanan Inti"><Select value={form.service_id} onChange={(e) => setForm((f) => ({ ...f, service_id: e.target.value }))}><option value="">— Independen —</option>{data.services.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}</Select></Field></div>
          <div className="grid gap-6 sm:grid-cols-3"><Field label="Ambang Bawah (Rp)"><Input type="number" value={form.price_from} onChange={(e) => setForm((f) => ({ ...f, price_from: e.target.value }))} /></Field><Field label="Ambang Atas (Rp)"><Input type="number" value={form.price_to} onChange={(e) => setForm((f) => ({ ...f, price_to: e.target.value }))} /></Field><Field label="Label Kustom" hint="Gunakan untuk teks seperti 'Hubungi Kami'"><Input value={form.price_label} onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))} placeholder="Kustom Quote" /></Field></div>
          <Field label="Label Aksi (CTA)"><Input value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))} /></Field>
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Komponen Fungsionalitas</span>
              <Button type="button" size="sm" variant="outline" onClick={addFeature} icon={Plus}>Sisipkan Komponen</Button>
            </div>
            <div className="space-y-3">
              {form.features.map((f) => (
                <div key={f.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
                  <button type="button" onClick={() => updateFeature(f.id, { is_included: !f.is_included })} className={classNames('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all', f.is_included ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 text-slate-400 dark:bg-slate-700')}>
                    {f.is_included ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </button>
                  <Input value={f.feature_text} onChange={(e) => updateFeature(f.id, { feature_text: e.target.value })} placeholder="Spesifikasi fungsional" className="!h-12" />
                  <button type="button" onClick={() => removeFeature(f.id)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:bg-red-500/20 dark:hover:bg-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!form.features.length && <p className="text-sm font-medium text-slate-400">Belum ada komponen terdefinisi.</p>}
            </div>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Status Operasional" /></div>
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><Toggle checked={form.is_highlighted} onChange={(v) => setForm((f) => ({ ...f, is_highlighted: v }))} label="Sorotan Rekomendasi" /></div>
            <Field label="Prioritas"><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className="w-full sm:w-28" /></Field>
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Skema</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.pricing_packages.remove(confirmId); setConfirmId(null); toast?.success('Skema dihapus permanen'); }} title="Hapus Skema Harga" message="Tindakan ini tidak dapat dikembalikan. Lanjutkan penghapusan?" />
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
      toast?.success('Aset foto terunggah!');
    } catch (err) { toast?.error('Gagal mengunggah foto.'); } finally { setUploading(false); }
  };

  const blank = { client_name: '', client_title: '', client_company: '', client_photo_url: '', content: '', rating: 5, is_featured: false, status: 'pending', sort_order: 0 };
  const [form, setForm] = useState(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...blank, ...t }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.content.trim()) { toast?.error('Identitas dan substansi ulasan wajib diisi'); return; }
    const payload = { ...form, rating: Number(form.rating) || 5, sort_order: Number(form.sort_order) || 0 };
    if (editing) { await crud.testimonials.update(editing.id, payload); toast?.success('Ulasan diperbarui'); } else { await crud.testimonials.create(payload); toast?.success('Ulasan didaftarkan'); }
    setModalOpen(false);
  };

  const setStatus = async (id, status) => {
    await crud.testimonials.update(id, { status });
    toast?.success(`Status ulasan diganti menjadi ${status}`);
  };

  const filtered = data.testimonials.filter((t) => filter === 'all' || t.status === filter);

  return (
    <>
      <AdminHeader title="Moderasi Ulasan" description="Sistem kontrol reputasi dan umpan balik klien." action={<Button onClick={openCreate} icon={Plus}>Registrasi Ulasan</Button>} />
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', ...TESTIMONIAL_STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={classNames('rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all', filter === s ? 'bg-[#1566D1] text-white shadow-md shadow-[#1566D1]/30' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10')}>
            {s === 'all' ? 'Semua Entri' : s === 'pending' ? 'Menunggu Peninjauan' : s === 'approved' ? 'Tervalidasi' : 'Dianulir'}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {filtered.map((t) => (
            <GlassCard key={t.id} hover={false} className="flex flex-col !p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex min-w-0 items-center gap-4">
                  {t.client_photo_url ? <img src={t.client_photo_url} alt="" className="h-12 w-12 rounded-full object-cover shadow-sm" /> : <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 dark:text-white">{t.client_name}</p>
                    <p className="truncate text-xs font-medium text-slate-500 mt-1">{t.client_title}{t.client_company ? `, ${t.client_company}` : ''}</p>
                  </div>
                </div>
                <Badge variant={t.status === 'approved' ? 'success' : t.status === 'rejected' ? 'danger' : 'warning'}>
                  {t.status === 'approved' ? 'Tervalidasi' : t.status === 'rejected' ? 'Dianulir' : 'Pending'}
                </Badge>
              </div>
              <StarRating value={t.rating} className="mt-5" />
              <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">“{t.content}”</p>
              <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 dark:border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {t.status !== 'approved' && <Button size="sm" variant="success" onClick={() => setStatus(t.id, 'approved')} icon={CheckCircle2}>Validasi</Button>}
                  {t.status !== 'rejected' && <Button size="sm" variant="danger" className="!bg-red-100 !text-red-600 hover:!bg-red-200 dark:!bg-red-500/20 dark:!text-red-400 dark:hover:!bg-red-500/30" onClick={() => setStatus(t.id, 'rejected')} icon={XCircle}>Anulir</Button>}
                </div>
                <RowActions onEdit={() => openEdit(t)} onDelete={() => setConfirmId(t.id)} />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (<EmptyState icon={MessageSquare} title="Arsip kosong" description="Belum ada ulasan yang sesuai kriteria filter." />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Ulasan' : 'Registrasi Ulasan'}>
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Identitas Klien" required><Input value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} /></Field><Field label="Posisi/Jabatan"><Input value={form.client_title} onChange={(e) => setForm((f) => ({ ...f, client_title: e.target.value }))} /></Field></div>
          <Field label="Entitas/Organisasi"><Input value={form.client_company} onChange={(e) => setForm((f) => ({ ...f, client_company: e.target.value }))} /></Field>
          <Field label="Aset Foto Profesional">
            <div className="flex flex-col gap-4">
              {form.client_photo_url && <img src={form.client_photo_url} alt="preview" className="h-20 w-20 object-cover rounded-full shadow-md border-2 border-white dark:border-slate-800" />}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'client_photo_url')} className="block w-full text-sm font-medium text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[#1566D1] file:text-white hover:file:bg-[#124691] cursor-pointer disabled:opacity-50 transition" />
            </div>
          </Field>
          <Field label="Substansi Ulasan" required><Textarea rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} /></Field>
          <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-200 dark:border-white/10 pt-6">
            <Field label="Rating Kepuasan"><div className="mt-2"><StarRating value={form.rating} interactive onChange={(v) => setForm((f) => ({ ...f, rating: v }))} size="h-8 w-8" /></div></Field>
            <Field label="Status Peninjauan"><Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>{TESTIMONIAL_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}</Select></Field>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 w-fit">
            <Toggle checked={form.is_featured} onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))} label="Tampilkan di Beranda" />
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Rekaman</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.testimonials.remove(confirmId); setConfirmId(null); toast?.success('Ulasan dihapus'); }} title="Hapus Ulasan" message="Proses ini akan menghapus data ulasan secara permanen. Lanjutkan?" />
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
    const matchSearch = !q || l.full_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const exportCsv = () => {
    const rows = data.leads.map((l) => ({ Nama: l.full_name, Email: l.email, WhatsApp: l.whatsapp, Perusahaan: l.company, Layanan: l.service_interest, Anggaran: l.budget_range, Pesan: l.message, Status: l.status, Sumber: l.source_page, Tanggal: formatDateTime(l.created_at) }));
    downloadCSV(rows, `viska-leads-${Date.now()}.csv`);
    toast?.success('Ekspor CSV berhasil dijalankan.');
  };

  const setStatus = async (id, status) => {
    await crud.leads.update(id, { status });
    setDetail((d) => (d && d.id === id ? { ...d, status } : d));
  };

  return (
    <>
      <AdminHeader title="Manajemen Briefing" description="Alur komunikasi dan inisiasi proyek dari klien." action={<Button variant="outline" onClick={exportCsv} icon={Download} disabled={!data.leads.length}>Ekspor Arsip CSV</Button>} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Identifikasi briefing berdasarkan nama/email..." className={classNames(inputClass, 'pl-12')} />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', ...LEAD_STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={classNames('rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all', statusFilter === s ? 'bg-[#1566D1] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10')}>
              {s === 'all' ? 'Indeks Total' : s === 'new' ? 'Terbaru' : s === 'in_progress' ? 'Evaluasi' : s === 'done' ? 'Selesai' : 'Spam'}
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <AdminTable columns={['Identitas Inisiator', 'Konsentrasi Layanan', 'Tanda Waktu', 'Status', 'Aksi']}>
          {filtered.map((l) => (
            <tr key={l.id} className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => setDetail(l)}>
              <td className="px-6 py-4 align-middle">
                <p className="font-bold text-slate-900 dark:text-white">{l.full_name}</p>
                <p className="max-w-[220px] truncate text-xs font-medium text-slate-500 mt-1">{l.email}</p>
              </td>
              <td className="px-6 py-4 align-middle font-bold text-slate-700 dark:text-slate-300">{l.service_interest || '-'}</td>
              <td className="px-6 py-4 align-middle text-xs font-bold text-slate-500">{formatDateTime(l.created_at)}</td>
              <td className="px-6 py-4 align-middle"><LeadStatusBadge status={l.status} /></td>
              <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                <RowActions onDelete={() => setConfirmId(l.id)} extra={<button onClick={() => setDetail(l)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-[#1566D1] hover:text-white dark:bg-white/5 dark:hover:bg-[#1566D1]"><Eye className="h-4 w-4" /></button>} />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (<EmptyState icon={Inbox} title="Indeks kosong" description="Tidak ditemukan riwayat briefing pada filter ini." />)}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Inspeksi Detail Briefing" size="lg">
        {detail && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Nama Entitas', value: detail.full_name },
                { label: 'Alamat Email', value: detail.email },
                { label: 'Saluran WhatsApp', value: detail.whatsapp || '-' },
                { label: 'Afiliasi Perusahaan', value: detail.company || '-' },
                { label: 'Objektif Layanan', value: detail.service_interest || '-' },
                { label: 'Skala Anggaran', value: detail.budget_range || '-' },
                { label: 'Tanda Waktu', value: formatDateTime(detail.created_at) },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl bg-slate-50 dark:bg-white/5 px-5 py-4 border border-slate-100 dark:border-white/5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400 mb-1">{row.label}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl bg-[#1566D1]/5 border border-[#1566D1]/10 px-6 py-5">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#1566D1] dark:text-[#7fb0f5] mb-3">Spesifikasi & Pesan</p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line">{detail.message}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-white/10 pt-6">
              <p className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Alokasi Status Evaluasi</p>
              <div className="flex flex-wrap gap-3">
                {LEAD_STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatus(detail.id, s)} className={classNames('rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all', detail.status === s ? 'bg-[#1566D1] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10')}>
                    {s === 'new' ? 'Terbaru' : s === 'in_progress' ? 'Evaluasi' : s === 'done' ? 'Selesai' : 'Spam'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row pt-4 border-t border-slate-200 dark:border-white/10">
              <a href={`mailto:${detail.email}`} className="flex-1"><Button variant="outline" className="w-full" icon={Mail}>Tanggapan Email</Button></a>
              {detail.whatsapp && (<a href={buildWhatsAppLink(detail.whatsapp, `Halo ${detail.full_name}, kami telah meninjau briefing proyek Anda untuk Viska Labs.`)} target="_blank" rel="noreferrer" className="flex-1"><Button className="w-full !bg-[#25D366] hover:!bg-[#1DA851] text-white border-none" icon={MessageCircle}>Jalur WhatsApp</Button></a>)}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.leads.remove(confirmId); setConfirmId(null); toast?.success('Arsip briefing dihapus'); }} title="Hapus Arsip Briefing" message="Arsip komunikasi ini akan dihapus secara permanen dari sistem." />
    </>
  );
};

const FaqManager = ({ data, crud }) => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const blank = { question: '', answer: '', category: 'General', is_published: true, sort_order: 0 };
  const [form, setForm] = useState(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ ...blank, ...f }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) { toast?.error('Seluruh kolom substansi wajib diisi'); return; }
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (editing) { await crud.faq_items.update(editing.id, payload); toast?.success('Entri diperbarui'); } else { await crud.faq_items.create(payload); toast?.success('Entri diregistrasi'); }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader title="Knowledge Base (FAQ)" description="Modul pengelolaan pusat informasi operasional." action={<Button onClick={openCreate} icon={Plus}>Registrasi Entri Baru</Button>} />
      {data.faq_items.length ? (
        <AdminTable columns={['Subjek Pertanyaan', 'Kategori', 'Visibilitas', 'Aksi']}>
          {data.faq_items.map((f) => (
            <tr key={f.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
              <td className="px-6 py-4 align-middle"><div className="min-w-[280px]"><p className="font-bold text-slate-900 dark:text-white">{f.question}</p><p className="line-clamp-2 text-xs font-medium text-slate-500 mt-1 sm:line-clamp-1">{f.answer}</p></div></td>
              <td className="px-6 py-4 align-middle"><Badge variant="neutral">{f.category || 'General'}</Badge></td>
              <td className="px-6 py-4 align-middle">{f.is_published ? <Badge variant="success">Publik</Badge> : <Badge variant="neutral">Draft</Badge>}</td>
              <td className="px-6 py-4 text-right align-middle"><RowActions onEdit={() => openEdit(f)} onDelete={() => setConfirmId(f.id)} /></td>
            </tr>
          ))}
        </AdminTable>
      ) : (<EmptyState icon={HelpCircle} title="Pusat data kosong" action={<Button onClick={openCreate} icon={Plus}>Registrasi Entri Awal</Button>} />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Entri' : 'Registrasi Entri Baru'}>
        <form onSubmit={save} className="space-y-6">
          <Field label="Formulasi Pertanyaan" required><Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} /></Field>
          <Field label="Penyelesaian/Jawaban" required><Textarea rows={5} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} /></Field>
          <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <Field label="Kategori Indeks"><Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>{['General', 'Pricing', 'Technical'].map((c) => (<option key={c}>{c}</option>))}</Select></Field>
            <Field label="Prioritas Urutan"><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></Field>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5 w-fit">
            <Toggle checked={form.is_published} onChange={(v) => setForm((f) => ({ ...f, is_published: v }))} label="Visibilitas Publik" />
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Entri</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.faq_items.remove(confirmId); setConfirmId(null); toast?.success('Entri dihapus permanen'); }} title="Penghapusan Entri" message="Entri informasi ini akan dihilangkan dari basis data sistem." />
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
      toast?.success('Aset foto personel terunggah!');
    } catch (err) { toast?.error('Gagal mengunggah foto.'); } finally { setUploading(false); }
  };

  const blank = { name: '', role: '', bio: '', photo_url: '', linkedin_url: '', instagram_url: '', is_active: true, sort_order: 0 };
  const [form, setForm] = useState(blank);

  const openCreate = () => { setEditing(null); setForm(blank); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...blank, ...m }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) { toast?.error('Identitas personel wajib dilengkapi'); return; }
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if (editing) { await crud.team_members.update(editing.id, payload); toast?.success('Data personel diperbarui'); } else { await crud.team_members.create(payload); toast?.success('Personel didaftarkan'); }
    setModalOpen(false);
  };

  return (
    <>
      <AdminHeader title="Struktur Personel" description="Direktori inti arsitek dan pelaksana platform." action={<Button onClick={openCreate} icon={Plus}>Registrasi Personel</Button>} />
      {data.team_members.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.team_members.map((m) => (
            <GlassCard key={m.id} hover={false} className="flex h-full flex-col text-center !p-8">
              <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-md bg-slate-200 dark:bg-slate-800">
                {m.photo_url ? <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" /> : <Users className="m-auto mt-7 h-8 w-8 text-slate-400" />}
              </div>
              <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{m.name}</p>
              <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-widest text-[#1566D1] dark:text-[#7fb0f5]">{m.role}</p>
              <p className="mt-4 flex-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{m.bio}</p>
              <div className="mt-6 border-t border-slate-200 dark:border-white/10 pt-5 flex items-center justify-between w-full">
                {m.is_active ? <Badge variant="success" className="!text-[0.6rem]">Personel Aktif</Badge> : <Badge variant="neutral" className="!text-[0.6rem]">Nonaktif</Badge>}
                <RowActions onEdit={() => openEdit(m)} onDelete={() => setConfirmId(m.id)} />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (<EmptyState icon={Users} title="Direktori personel kosong" action={<Button onClick={openCreate} icon={Plus}>Registrasi Personel Awal</Button>} />)}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Pembaruan Personel' : 'Registrasi Personel Baru'}>
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2"><Field label="Identitas Personel" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field><Field label="Posisi/Spesialisasi" required><Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Lead Engineer" /></Field></div>
          <Field label="Ringkasan Profesional (Bio)"><Textarea rows={4} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} /></Field>
          <Field label="Aset Foto Profil">
            <div className="flex flex-col gap-4">
              {form.photo_url && <img src={form.photo_url} alt="preview" className="h-24 w-24 object-cover rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-md" />}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleFileUpload(e, 'photo_url')} className="block w-full text-sm font-medium text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-[#1566D1] file:text-white hover:file:bg-[#124691] cursor-pointer disabled:opacity-50 transition" />
            </div>
          </Field>
          <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-200 dark:border-white/10 pt-6"><Field label="Tautan Instagram"><Input value={form.instagram_url} onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))} placeholder="@username atau URL" /></Field><Field label="Tautan LinkedIn"><Input value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} placeholder="username atau URL" /></Field></div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><Toggle checked={form.is_active} onChange={(v) => setForm((f) => ({ ...f, is_active: v }))} label="Status Aktivitas Publik" /></div>
            <Field label="Prioritas Urutan"><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className="w-full sm:w-32" /></Field>
          </div>
          <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end border-t border-slate-200 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" icon={Save}>Simpan Personel</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={async () => { await crud.team_members.remove(confirmId); setConfirmId(null); toast?.success('Personel dihapus'); }} title="Hapus Registrasi Personel" message="Tindakan pemecatan/penghapusan data ini tidak dapat dikembalikan." />
    </>
  );
};

const SettingsManager = ({ data, saveSettings }) => {
  const toast = useToast();
  const tabs = [{ key: 'general', label: 'Operasional Inti' }, { key: 'contact', label: 'Relasi Kontak' }, { key: 'social', label: 'Aset Eksternal' }, { key: 'seo', label: 'Optimasi Mesin' }];
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState(data.site_settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(data.site_settings); }, [data.site_settings]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e) => { e.preventDefault(); setSaving(true); await saveSettings(form); setSaving(false); toast?.success('Konfigurasi sistem berhasil diamankan.'); };

  return (
    <>
      <AdminHeader title="Konfigurasi Platform" description="Pusat kontrol parameter global dan variabel lingkungan situs." />
      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={classNames('rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all', tab === t.key ? 'bg-[#1566D1] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        <GlassCard hover={false} className="space-y-6 !p-8">
          {tab === 'general' && (<><Field label="Nama Entitas Resmi"><Input value={form.company_name || ''} onChange={(e) => setField('company_name', e.target.value)} /></Field><Field label="Slogan / Tagline"><Input value={form.company_tagline || ''} onChange={(e) => setField('company_tagline', e.target.value)} /></Field></>)}
          {tab === 'contact' && (<><div className="grid gap-6 sm:grid-cols-2"><Field label="Alamat Surel (Email) Pusat"><Input type="email" value={form.contact_email || ''} onChange={(e) => setField('contact_email', e.target.value)} /></Field><Field label="Nomor Telemetri (WhatsApp)" hint="Gunakan kode negara tanpa +, mis. 628xxx"><Input value={form.whatsapp_number || ''} onChange={(e) => setField('whatsapp_number', e.target.value)} /></Field></div><Field label="Titik Koordinat (Alamat Fisik)"><Input value={form.address || ''} onChange={(e) => setField('address', e.target.value)} /></Field><Field label="Jendela Operasional"><Input value={form.operating_hours || ''} onChange={(e) => setField('operating_hours', e.target.value)} /></Field></>)}
          {tab === 'social' && (<><Field label="Tautan Modul Instagram"><Input value={form.instagram_url || ''} onChange={(e) => setField('instagram_url', e.target.value)} /></Field><Field label="Tautan Modul LinkedIn"><Input value={form.linkedin_url || ''} onChange={(e) => setField('linkedin_url', e.target.value)} /></Field><Field label="Tautan Repositori GitHub"><Input value={form.github_url || ''} onChange={(e) => setField('github_url', e.target.value)} /></Field></>)}
          {tab === 'seo' && (<><Field label="Sintaks Judul Global (Meta Title)"><Input value={form.meta_title_default || ''} onChange={(e) => setField('meta_title_default', e.target.value)} /></Field><Field label="Deskripsi Indeksasi (Meta Description)"><Textarea rows={4} value={form.meta_description_default || ''} onChange={(e) => setField('meta_description_default', e.target.value)} /></Field><Field label="Kunci Google Analytics" hint="Format standar: G-XXXXXXXXXX"><Input value={form.google_analytics_id || ''} onChange={(e) => setField('google_analytics_id', e.target.value)} /></Field></>)}
          <div className="flex pt-6 border-t border-slate-200 dark:border-white/10 sm:justify-end"><Button type="submit" size="lg" loading={saving} icon={saving ? undefined : Save}>{saving ? 'Menginkripsi...' : 'Terapkan Konfigurasi'}</Button></div>
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
      db.getSession().then((u) => { if (mounted) { setUser(u); setChecking(false); } }).catch(() => mounted && setChecking(false));
    }
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => { if (SUPABASE_ENABLED) await db.signOut(); setUser(null); };

  if (checking) return (<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-[#030F26]"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1566D1]" /></div>);
  if (!user) return <AdminLogin onLogin={setUser} navigate={navigate} />;

  const modules = {
    dashboard: <AdminDashboard data={data} setActive={setActive} />, portfolio: <PortfolioManager data={data} crud={crud} />, services: <ServiceManager data={data} crud={crud} />, pricing: <PricingManager data={data} crud={crud} />, testimonials: <TestimonialManager data={data} crud={crud} />, leads: <LeadManager data={data} crud={crud} />, faq: <FaqManager data={data} crud={crud} />, team: <TeamManager data={data} crud={crud} />, settings: <SettingsManager data={data} saveSettings={saveSettings} />,
  };

  return (<AdminLayout active={active} setActive={setActive} onLogout={handleLogout} navigate={navigate} user={user}>{modules[active]}</AdminLayout>);
}