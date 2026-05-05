import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin, Grid } from 'lucide-react';

export default function VenuesManager() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [restaurants, setRestaurants] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  // New Restaurant Form
  const [showAddRest, setShowAddRest] = useState(false);
  const [restNom, setRestNom] = useState('');
  const [restDesc, setRestDesc] = useState('');
  const [restCuisine, setRestCuisine] = useState('');
  
  // New Table Form
  const [showAddTable, setShowAddTable] = useState(false);
  const [tableNum, setTableNum] = useState('');
  const [tableCap, setTableCap] = useState('2');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTables(selectedRestaurant);
    } else {
      setTables([]);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('restaurants').select('*').order('nom');
    if (!error && data) {
      setRestaurants(data);
    }
    setLoading(false);
  };

  const fetchTables = async (restaurantId: string) => {
    const { data, error } = await supabase.from('tables_restaurant').select('*').eq('restaurant_id', restaurantId).order('capacite', { ascending: true });
    if (!error && data) {
      setTables(data);
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('restaurants').insert({
      nom: restNom,
      description: restDesc,
      type_cuisine: restCuisine,
      capacite_totale: 0,
      nombre_tables: 0
    }).select().single();

    if (error) {
      alert(error.message);
    } else if (data) {
      setRestaurants([...restaurants, data]);
      setRestNom(''); setRestDesc(''); setRestCuisine('');
      setShowAddRest(false);
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Delete this restaurant and ALL its tables?')) return;
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (!error) {
      setRestaurants(restaurants.filter(r => r.id !== id));
      if (selectedRestaurant === id) setSelectedRestaurant(null);
    } else {
      alert("Error deleting restaurant: " + error.message + "\n\n(This usually happens if the restaurant has existing reservations. You must delete or cancel them first.)");
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    const { data, error } = await supabase.from('tables_restaurant').insert({
      numero_table: tableNum,
      capacite: parseInt(tableCap),
      restaurant_id: selectedRestaurant
    }).select().single();

    if (error) {
      alert(error.message);
    } else if (data) {
      setTables([...tables, data]);
      setTableNum('');
      setTableCap('2');
      setShowAddTable(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Delete this table?')) return;
    const { error } = await supabase.from('tables_restaurant').delete().eq('id', id);
    if (!error) {
      setTables(tables.filter(t => t.id !== id));
    }
  };

  if (loading) return <div className="text-gold animate-pulse text-center p-8">Loading venues...</div>;

  return (
    <div className="space-y-8">
      {/* RESTAURANTS SECTION */}
      <div className="luxury-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display text-gold flex items-center gap-2"><MapPin size={24}/> Venues & Restaurants</h3>
          <button onClick={() => setShowAddRest(!showAddRest)} className="btn-luxury flex items-center gap-2">
            <Plus size={16} /> New Restaurant
          </button>
        </div>

        {showAddRest && (
          <form onSubmit={handleAddRestaurant} className="mb-8 p-6 bg-black/40 border border-gold/30 rounded-lg space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-text-muted mb-2 tracking-widest">Name</label>
                <input required value={restNom} onChange={e=>setRestNom(e.target.value)} className="luxury-input w-full bg-black/50" placeholder="e.g. L'Aura Noire" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-text-muted mb-2 tracking-widest">Cuisine Type</label>
                <input required value={restCuisine} onChange={e=>setRestCuisine(e.target.value)} className="luxury-input w-full bg-black/50" placeholder="e.g. Multi-Cuisine" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase text-text-muted mb-2 tracking-widest">Description</label>
                <textarea value={restDesc} onChange={e=>setRestDesc(e.target.value)} className="luxury-input w-full bg-black/50 min-h-[80px]" placeholder="Short description..." />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddRest(false)} className="text-text-muted text-xs uppercase tracking-widest px-4 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-gold text-black-soft text-xs uppercase tracking-widest px-6 py-2 font-semibold">Create Venue</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {restaurants.map(rest => (
            <div key={rest.id} className={`border rounded-lg overflow-hidden transition-all duration-300 ${selectedRestaurant === rest.id ? 'border-gold/50 bg-white/5' : 'border-border/50 bg-black/20 hover:border-border'}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setSelectedRestaurant(selectedRestaurant === rest.id ? null : rest.id)}>
                <div>
                  <h4 className="font-display text-lg text-text-primary">{rest.nom}</h4>
                  <p className="text-[10px] uppercase text-gold tracking-widest">{rest.type_cuisine}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(rest.id); }} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  {selectedRestaurant === rest.id ? <ChevronUp size={20} className="text-gold" /> : <ChevronDown size={20} className="text-text-muted" />}
                </div>
              </div>

              {/* TABLES SECTION (Collapsible) */}
              {selectedRestaurant === rest.id && (
                <div className="p-6 border-t border-border/50 bg-black/40">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="font-display text-text-primary flex items-center gap-2"><Grid size={18} className="text-text-muted"/> Tables for {rest.nom}</h5>
                    <button onClick={() => setShowAddTable(!showAddTable)} className="text-[10px] uppercase tracking-widest text-gold hover:text-white transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Table
                    </button>
                  </div>

                  {showAddTable && (
                    <form onSubmit={handleAddTable} className="mb-6 p-4 border border-border/50 rounded flex items-end gap-4 animate-fade-in-up">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase text-text-muted mb-2 tracking-widest">Table Number / Ref</label>
                        <input required value={tableNum} onChange={e=>setTableNum(e.target.value)} className="luxury-input w-full bg-black/50" placeholder="e.g. T21" />
                      </div>
                      <div className="w-32">
                        <label className="block text-[10px] uppercase text-text-muted mb-2 tracking-widest">Capacity</label>
                        <select required value={tableCap} onChange={e=>setTableCap(e.target.value)} className="luxury-input w-full bg-black/50">
                          {[2,4,6,8,10,12].map(n => <option key={n} value={n}>{n} Seats</option>)}
                        </select>
                      </div>
                      <button type="submit" className="bg-gold text-black-soft h-11 px-6 text-xs uppercase font-semibold tracking-widest">Add</button>
                    </form>
                  )}

                  {tables.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {tables.map(table => (
                        <div key={table.id} className="p-4 border border-border/30 rounded bg-black/20 text-center relative group">
                          <button onClick={() => handleDeleteTable(table.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500/70 hover:text-red-500 transition-opacity">
                            <Trash2 size={12} />
                          </button>
                          <p className="font-display text-xl text-white mb-1">{table.numero_table}</p>
                          <p className="text-[10px] uppercase text-text-muted tracking-widest">{table.capacite} Seats</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm italic py-4">No tables added to this restaurant yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {restaurants.length === 0 && <p className="text-center text-text-muted py-8 italic font-light">No restaurants found.</p>}
        </div>
      </div>
    </div>
  );
}
