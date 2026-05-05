import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface EditMenuModalProps {
  dish: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMenuModal({ dish, onClose, onSuccess }: EditMenuModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom_plat: dish.nom_plat || '',
    categorie: dish.categorie || 'Entrées',
    description: dish.description || '',
    prix: dish.prix?.toString() || '',
    image_url: dish.image_url || '',
    recommande_par_chef: dish.recommande_par_chef || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('menus')
        .update({
          nom_plat: formData.nom_plat,
          categorie: formData.categorie,
          description: formData.description,
          prix: parseFloat(formData.prix),
          image_url: formData.image_url,
          recommande_par_chef: formData.recommande_par_chef,
        })
        .eq('id', dish.id);

      if (updateError) throw updateError;
      
      onSuccess();
    } catch (err: any) {
      console.error('Error updating dish:', err);
      setError(err.message || 'An error occurred while updating the dish.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-gold/30 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto hidden-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-muted hover:text-gold transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-widest text-gold mb-2">Culinary Management</p>
          <h2 className="text-3xl font-display text-white">Edit Dish</h2>
          <p className="text-text-muted text-xs mt-1">Updating: <span className="text-gold">{dish.nom_plat}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Dish Name</label>
            <input 
              required
              type="text" 
              name="nom_plat"
              value={formData.nom_plat}
              onChange={handleChange}
              className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
              placeholder="e.g. Filet Mignon"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Category</label>
              <select 
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="Entrées">Entrées (Starters)</option>
                <option value="Plats">Plats (Mains)</option>
                <option value="Desserts">Desserts</option>
                <option value="Boissons">Boissons (Drinks)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Price (DZD)</label>
              <input 
                required
                type="number"
                step="0.01" 
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="e.g. 85.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors resize-none"
              placeholder="Dish ingredients and preparation..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-2">
              <ImageIcon size={14} /> Dish Image URL
            </label>
            <input 
              type="url" 
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
              placeholder="https://example.com/dish.jpg"
            />
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="edit_recommande_par_chef"
              name="recommande_par_chef"
              checked={formData.recommande_par_chef}
              onChange={handleChange}
              className="w-4 h-4 accent-gold bg-black/40 border-border/50"
            />
            <label htmlFor="edit_recommande_par_chef" className="text-sm text-white font-light">
              Chef's Recommendation (Signature Dish)
            </label>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-border/30">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-xs uppercase tracking-widest text-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-luxury flex items-center gap-2 py-3 px-8"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
