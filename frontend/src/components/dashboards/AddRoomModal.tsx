import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Image as ImageIcon } from 'lucide-react';

interface AddRoomModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddRoomModal({ onClose, onSuccess }: AddRoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    numero_chambre: '',
    type_chambre: 'standard',
    prix_base_nuit: '',
    capacite_adultes: 2,
    capacite_enfants: 0,
    etage: '',
    vue: '',
    superficie_m2: '',
    statut: 'disponible',
    image_url: '' // We will store this as a single element array in db
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('chambres').insert([
        {
          numero_chambre: formData.numero_chambre,
          type_chambre: formData.type_chambre,
          prix_base_nuit: parseFloat(formData.prix_base_nuit),
          capacite_adultes: parseInt(formData.capacite_adultes.toString()),
          capacite_enfants: parseInt(formData.capacite_enfants.toString()),
          etage: formData.etage ? parseInt(formData.etage) : null,
          vue: formData.vue,
          superficie_m2: formData.superficie_m2 ? parseInt(formData.superficie_m2) : null,
          statut: formData.statut,
          equipements: ["Wi-Fi", "TV", "Mini-bar"], // Default basic equipments
          image_urls: formData.image_url ? [formData.image_url] : []
        }
      ]);

      if (insertError) throw insertError;
      
      onSuccess();
    } catch (err: any) {
      console.error('Error adding room:', err);
      setError(err.message || 'An error occurred while adding the room.');
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
          <p className="text-[10px] uppercase tracking-widest text-gold mb-2">Sanctuary Management</p>
          <h2 className="text-3xl font-display text-white">Add New Room</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Room Number (Unique)</label>
              <input 
                required
                type="text" 
                name="numero_chambre"
                value={formData.numero_chambre}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="e.g. 101, 405A, Penthouse"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Room Type</label>
              <select 
                name="type_chambre"
                value={formData.type_chambre}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
                <option value="villa">Private Villa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Base Price / Night (DZD)</label>
              <input 
                required
                type="number"
                step="0.01" 
                name="prix_base_nuit"
                value={formData.prix_base_nuit}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="e.g. 350.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Status</label>
              <select 
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="disponible">Available</option>
                <option value="occupee">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Adult Capacity</label>
              <input 
                type="number" 
                min="1"
                name="capacite_adultes"
                value={formData.capacite_adultes}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Kids Capacity</label>
              <input 
                type="number" 
                min="0"
                name="capacite_enfants"
                value={formData.capacite_enfants}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Floor</label>
              <input 
                type="number" 
                name="etage"
                value={formData.etage}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="e.g. 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">Size (m²)</label>
              <input 
                type="number" 
                name="superficie_m2"
                value={formData.superficie_m2}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="e.g. 45"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold">View (Vista)</label>
              <select 
                name="vue"
                value={formData.vue}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors appearance-none"
              >
                <option value="">Select a View</option>
                <option value="Garden">Garden</option>
                <option value="City">City</option>
                <option value="Ocean">Ocean</option>
                <option value="Panoramic">Panoramic</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-2">
                <ImageIcon size={14} /> Room Image URL
              </label>
              <input 
                type="url" 
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-sm outline-none focus:border-gold transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>
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
              {loading ? 'Creating...' : 'Create Sanctuary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
