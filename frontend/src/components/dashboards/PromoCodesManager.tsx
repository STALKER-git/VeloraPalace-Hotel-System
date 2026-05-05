import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Trash2, Edit, Tag, Percent, Hash, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import gsap from 'gsap';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  expires_at: string | null;
}

export default function PromoCodesManager() {
  const { t } = useLanguage();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState(10);
  const [formMaxUses, setFormMaxUses] = useState(100);
  const [formDescription, setFormDescription] = useState('');
  const [formExpiresAt, setFormExpiresAt] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPromoCodes(data);
    if (error) console.error('Error fetching promo codes:', error);
    setLoading(false);
  };

  const resetForm = () => {
    setFormCode('');
    setFormDiscount(10);
    setFormMaxUses(100);
    setFormDescription('');
    setFormExpiresAt('');
    setFormError('');
  };

  const openAddModal = () => {
    resetForm();
    setEditingCode(null);
    setShowAddModal(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setFormCode(promo.code);
    setFormDiscount(promo.discount_percent);
    setFormMaxUses(promo.max_uses);
    setFormDescription(promo.description || '');
    setFormExpiresAt(promo.expires_at ? promo.expires_at.split('T')[0] : '');
    setFormError('');
    setEditingCode(promo);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!formCode.trim()) {
      setFormError('Promo code is required');
      return;
    }
    if (formDiscount < 1 || formDiscount > 100) {
      setFormError('Discount must be between 1% and 100%');
      return;
    }
    if (formMaxUses < 1) {
      setFormError('Max uses must be at least 1');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formCode.toUpperCase().trim(),
        discount_percent: formDiscount,
        max_uses: formMaxUses,
        description: formDescription.trim() || null,
        expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      };

      if (editingCode) {
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', editingCode.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert({ ...payload, is_active: true, current_uses: 0 });
        if (error) throw error;
      }

      setShowAddModal(false);
      resetForm();
      fetchPromoCodes();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id);
    
    if (!error) {
      setPromoCodes(codes =>
        codes.map(c => c.id === promo.id ? { ...c, is_active: !c.is_active } : c)
      );
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) {
      setPromoCodes(codes => codes.filter(c => c.id !== id));
    }
  };

  const getStatusColor = (promo: PromoCode) => {
    if (!promo.is_active) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (promo.current_uses >= promo.max_uses) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const getStatusText = (promo: PromoCode) => {
    if (!promo.is_active) return t.adminDashboard.promoInactive || 'Inactive';
    if (promo.current_uses >= promo.max_uses) return t.adminDashboard.promoExhausted || 'Exhausted';
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) return t.adminDashboard.promoExpired || 'Expired';
    return t.adminDashboard.promoActive || 'Active';
  };

  // Quick generate random code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'VP-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCode(result);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="luxury-card p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-display text-gold flex items-center gap-3">
              <Tag size={24} />
              {t.adminDashboard.promoMgmt || 'Promo Code Management'}
            </h3>
            <p className="text-text-muted text-xs tracking-wider mt-2 uppercase">
              {t.adminDashboard.promoMgmtDesc || 'Create and manage promotional discount codes'}
            </p>
          </div>
          <button 
            className="btn-luxury flex items-center gap-2"
            onClick={openAddModal}
          >
            <Plus size={16} /> {t.adminDashboard.addPromo || 'Add Promo Code'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-black/40 border border-border/50 rounded-lg text-center">
            <p className="text-2xl font-display text-gold">{promoCodes.length}</p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted mt-1">{t.adminDashboard.totalCodes || 'Total Codes'}</p>
          </div>
          <div className="p-4 bg-black/40 border border-border/50 rounded-lg text-center">
            <p className="text-2xl font-display text-emerald-400">{promoCodes.filter(p => p.is_active && p.current_uses < p.max_uses).length}</p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted mt-1">{t.adminDashboard.activeCodes || 'Active Codes'}</p>
          </div>
          <div className="p-4 bg-black/40 border border-border/50 rounded-lg text-center">
            <p className="text-2xl font-display text-blue-400">{promoCodes.reduce((sum, p) => sum + p.current_uses, 0)}</p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted mt-1">{t.adminDashboard.totalUses || 'Total Uses'}</p>
          </div>
          <div className="p-4 bg-black/40 border border-border/50 rounded-lg text-center">
            <p className="text-2xl font-display text-purple-400">
              {promoCodes.length > 0 ? Math.round(promoCodes.reduce((sum, p) => sum + p.discount_percent, 0) / promoCodes.length) : 0}%
            </p>
            <p className="text-[9px] uppercase tracking-widest text-text-muted mt-1">{t.adminDashboard.avgDiscount || 'Avg Discount'}</p>
          </div>
        </div>

        {/* Promo Codes Grid */}
        {loading ? (
          <div className="text-center py-12 text-text-muted italic text-sm">{t.common.loading}</div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border/50 rounded-lg">
            <Tag size={48} className="mx-auto text-text-muted/30 mb-4" />
            <p className="text-text-muted text-sm">{t.adminDashboard.noPromos || 'No promo codes yet. Create your first one!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {promoCodes.map((promo, index) => (
              <div
                key={promo.id}
                className="promo-card group relative p-6 bg-black/40 border border-border/50 rounded-lg hover:border-gold/30 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { y: -4, duration: 0.3, ease: 'power2.out' });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: 'power2.out' });
                }}
              >
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => toggleActive(promo)}
                    className="p-1.5 bg-black/60 border border-border/50 hover:border-gold/50 text-text-muted hover:text-gold rounded transition-all"
                    title={promo.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {promo.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button
                    onClick={() => openEditModal(promo)}
                    className="p-1.5 bg-black/60 border border-border/50 hover:border-gold/50 text-text-muted hover:text-gold rounded transition-all"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1.5 bg-black/60 border border-border/50 hover:border-red-500/50 text-text-muted hover:text-red-500 rounded transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Code display */}
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-md">
                    <Tag size={14} className="text-gold" />
                    <span className="text-gold font-mono font-bold text-lg tracking-widest">{promo.code}</span>
                  </div>
                </div>

                {/* Discount badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Percent size={14} className="text-emerald-400" />
                    <span className="text-2xl font-display text-white">{promo.discount_percent}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-text-muted">off</span>
                  </div>
                </div>

                {/* Description */}
                {promo.description && (
                  <p className="text-[10px] text-text-muted mb-4 line-clamp-2">{promo.description}</p>
                )}

                {/* Usage */}
                <div className="mb-3">
                  <div className="flex justify-between text-[9px] uppercase tracking-widest text-text-muted mb-1.5">
                    <span className="flex items-center gap-1"><Hash size={10} /> {t.adminDashboard.usage || 'Usage'}</span>
                    <span>{promo.current_uses} / {promo.max_uses}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((promo.current_uses / promo.max_uses) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <span className={`px-2 py-0.5 text-[8px] uppercase tracking-widest rounded border ${getStatusColor(promo)}`}>
                    {getStatusText(promo)}
                  </span>
                  {promo.expires_at && (
                    <span className="text-[9px] text-text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(promo.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-black-soft border border-border/50 rounded-lg shadow-2xl animate-fade-in-up">
            <div className="p-8">
              <h3 className="text-2xl font-display text-gold mb-2">
                {editingCode ? (t.adminDashboard.editPromo || 'Edit Promo Code') : (t.adminDashboard.addPromo || 'Add Promo Code')}
              </h3>
              <p className="text-text-muted text-[10px] uppercase tracking-widest mb-8">
                {t.adminDashboard.promoFormDesc || 'Configure discount code settings'}
              </p>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Code */}
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                    {t.adminDashboard.promoCodeLabel || 'Promo Code'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUMMER50"
                      className="luxury-input flex-1 bg-black/50 font-mono tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-4 py-2 text-[9px] uppercase tracking-widest border border-border/50 text-text-muted hover:text-gold hover:border-gold/30 transition-all rounded"
                    >
                      {t.adminDashboard.generate || 'Generate'}
                    </button>
                  </div>
                </div>

                {/* Discount & Max Uses */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                      {t.adminDashboard.discountPercent || 'Discount (%)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formDiscount}
                        onChange={e => setFormDiscount(parseInt(e.target.value) || 0)}
                        className="luxury-input w-full bg-black/50 pr-8"
                        required
                      />
                      <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                      {t.adminDashboard.maxUses || 'Max Uses'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formMaxUses}
                      onChange={e => setFormMaxUses(parseInt(e.target.value) || 1)}
                      className="luxury-input w-full bg-black/50"
                      required
                    />
                  </div>
                </div>

                {/* Quick Discount Presets */}
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                    {t.adminDashboard.quickPresets || 'Quick Presets'}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 15, 20, 25, 30, 40, 50, 75].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setFormDiscount(pct)}
                        className={`px-3 py-1.5 text-[10px] tracking-widest rounded border transition-all ${
                          formDiscount === pct
                            ? 'border-gold bg-gold/10 text-gold font-semibold'
                            : 'border-border/50 text-text-muted hover:border-gold/30 hover:text-gold'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                    {t.adminDashboard.promoDesc || 'Description (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="e.g. Summer special for VIP guests"
                    className="luxury-input w-full bg-black/50"
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-2">
                    {t.adminDashboard.expiryDate || 'Expiry Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={e => setFormExpiresAt(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="luxury-input w-full bg-black/50"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 text-[10px] uppercase tracking-widest border border-border/50 text-text-muted hover:text-white hover:border-white/30 transition-all rounded"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 text-[10px] uppercase tracking-widest bg-gold text-black font-semibold hover:bg-gold/90 transition-all rounded disabled:opacity-50"
                  >
                    {saving ? t.common.loading : (editingCode ? t.common.save : t.common.add)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
