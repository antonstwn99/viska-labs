import { createClient } from '@supabase/supabase-js';
import { slugify, uid } from './ui';

// =========================================
// CONFIG (AMAN DARI GITHUB)
// =========================================

// Kita mengambil URL dan KEY dari Environment Variables (.env)
// Pastikan variabel ini diset di server hosting (seperti Vercel/Netlify) 
// atau di file .env lokal Anda.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Demo credential disembunyikan. Jika tidak ada di .env, kita beri nilai acak
// agar aman meskipun seseorang mencoba login pakai ini.
export const DEMO_ADMIN = {
  email: process.env.REACT_APP_ADMIN_EMAIL || 'demo@hidden.com',
  password: process.env.REACT_APP_ADMIN_PASSWORD || 'hidden_password_123',
};

// =========================================
// SUPABASE FUNCTIONS
// =========================================

export const db = {
  async list(table, { match, order } = {}) {
    let query = supabase.from(table).select('*');
    if (match) {
      Object.entries(match).forEach(([k, v]) => {
        query = query.eq(k, v);
      });
    }
    if (order)
      query = query.order(order.column, { ascending: order.ascending ?? true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async insert(table, payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(table, id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  getPortfolios: () =>
    db.list('portfolios', { order: { column: 'sort_order', ascending: true } }),
  createPortfolio: (data) => db.insert('portfolios', data),
  updatePortfolio: (id, data) => db.update('portfolios', id, data),
  deletePortfolio: (id) => db.remove('portfolios', id),

  getServices: () =>
    db.list('services', { order: { column: 'sort_order', ascending: true } }),
  createService: (data) => db.insert('services', data),
  updateService: (id, data) => db.update('services', id, data),
  deleteService: (id) => db.remove('services', id),

  getPricingPackages: () =>
    db.list('pricing_packages', {
      order: { column: 'sort_order', ascending: true },
    }),
  createPricingPackage: (data) => db.insert('pricing_packages', data),
  updatePricingPackage: (id, data) => db.update('pricing_packages', id, data),
  deletePricingPackage: (id) => db.remove('pricing_packages', id),

  getTestimonials: () =>
    db.list('testimonials', {
      order: { column: 'sort_order', ascending: true },
    }),
  createTestimonial: (data) => db.insert('testimonials', data),
  updateTestimonial: (id, data) => db.update('testimonials', id, data),
  deleteTestimonial: (id) => db.remove('testimonials', id),

  getLeads: () =>
    db.list('leads', { order: { column: 'created_at', ascending: false } }),
  createLead: (data) => db.insert('leads', data),
  updateLead: (id, data) => db.update('leads', id, data),
  deleteLead: (id) => db.remove('leads', id),

  getFaqItems: () =>
    db.list('faq_items', { order: { column: 'sort_order', ascending: true } }),
  createFaqItem: (data) => db.insert('faq_items', data),
  updateFaqItem: (id, data) => db.update('faq_items', id, data),
  deleteFaqItem: (id) => db.remove('faq_items', id),

  getTeamMembers: () =>
    db.list('team_members', {
      order: { column: 'sort_order', ascending: true },
    }),
  createTeamMember: (data) => db.insert('team_members', data),
  updateTeamMember: (id, data) => db.update('team_members', id, data),
  deleteTeamMember: (id) => db.remove('team_members', id),

  async getSiteSettings() {
    const rows = await db.list('site_settings');
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  },
  async upsertSiteSettings(settingsObj) {
    const payload = Object.entries(settingsObj).map(([key, value]) => ({
      key,
      value: value === null || value === undefined ? '' : String(value),
    }));
    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'key' });
    if (error) throw error;
    return true;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  },

  async uploadImage(file, folder = 'uploads') {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) throw new Error('Ukuran gambar maksimal 5MB.');
    if (!file.type.startsWith('image/'))
      throw new Error('Format file tidak didukung.');

    const bucket = 'portfolio-images';
    const fileExt =
      file.name
        .split('.')
        .pop()
        ?.replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase() || 'jpg';
    const safeFolder =
      String(folder || 'uploads')
        .split('/')
        .map((part) => slugify(part))
        .filter(Boolean)
        .join('/') || 'uploads';
    const safeBaseName = slugify(file.name.replace(/\.[^/.]+$/, '')) || 'image';
    const fileName = `${safeFolder}/${uid()}-${safeBaseName}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  },
};