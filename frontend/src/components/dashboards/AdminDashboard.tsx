import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Chambre, Utilisateur, ReservationChambre } from '../../types';
import { 
  Users, BedDouble, Calendar, 
  Plus, Trash2, Edit, 
  TrendingUp, DollarSign, Clock,
  LogOut
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AddRoomModal from './AddRoomModal';
import AddMenuModal from './AddMenuModal';
import EditRoomModal from './EditRoomModal';
import EditMenuModal from './EditMenuModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import VenuesManager from './VenuesManager';
import PromoCodesManager from './PromoCodesManager';

type Tab = 'overview' | 'rooms' | 'users' | 'bookings' | 'restaurant' | 'venues' | 'promos';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [reservations, setReservations] = useState<ReservationChambre[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [menus, setMenus] = useState<any[]>([]);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  // Edit state
  const [editingRoom, setEditingRoom] = useState<Chambre | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingDish, setEditingDish] = useState<any | null>(null);

  // Delete state
  const [deletingRoom, setDeletingRoom] = useState<Chambre | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingDish, setDeletingDish] = useState<any | null>(null);

  // Logout state
  const [loggingOut, setLoggingOut] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'overview' || activeTab === 'rooms') {
        const { data } = await supabase.from('chambres').select('*').order('numero_chambre', { ascending: true });
        if (data) setChambres(data);
      }
      if (activeTab === 'overview' || activeTab === 'users') {
        const { data } = await supabase.from('utilisateurs').select('*').order('date_creation', { ascending: false });
        if (data) setUsers(data);
      }
      if (activeTab === 'overview' || activeTab === 'bookings') {
        // Joining with chambres and utilisateurs (through clients usually, but for simplicity let's see)
        // Actually reservation_chambres joins with clients which joins with utilisateurs
        const { data } = await supabase.from('reservations_chambres').select('*, chambres(*)').order('date_reservation', { ascending: false });
        if (data) setReservations(data);
      }
      if (activeTab === 'overview' || activeTab === 'restaurant') {
        const { data } = await supabase.from('menus').select('*').order('nom_plat');
        if (data) setMenus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete handlers
  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    const { error } = await supabase.from('chambres').delete().eq('id', deletingRoom.id);
    if (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room: ' + error.message);
    } else {
      setDeletingRoom(null);
      fetchData();
    }
  };

  const handleDeleteDish = async () => {
    if (!deletingDish) return;
    const { error } = await supabase.from('menus').delete().eq('id', deletingDish.id);
    if (error) {
      console.error('Error deleting dish:', error);
      alert('Failed to delete dish: ' + error.message);
    } else {
      setDeletingDish(null);
      fetchData();
    }
  };

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('utilisateurs')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as Utilisateur['role'] } : u));
    } catch (err) {
      alert('Failed to update role: ' + (err as Error).message);
    }
  };

  useGSAP(() => {
    gsap.fromTo('.admin-tab-content',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, [activeTab]);

  const stats = [
    { label: t.dashboard.totalRev, value: '124,500 DZD', icon: DollarSign, color: 'text-gold' },
    { label: t.dashboard.activeRes, value: reservations.filter(r => r.statut === 'confirmee').length, icon: Calendar, color: 'text-blue-400' },
    { label: t.dashboard.totalUsers, value: users.length, icon: Users, color: 'text-green-400' },
    { label: t.dashboard.occRate, value: '78%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display text-text-primary">{t.adminDashboard.title}</h1>
          <p className="text-text-muted text-sm tracking-wider uppercase">{t.adminDashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 p-1 bg-black-soft border border-border rounded-lg">
            {(['overview', 'rooms', 'users', 'bookings', 'restaurant', 'venues', 'promos'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 rounded ${
                  activeTab === tab 
                    ? 'bg-gold text-black font-semibold' 
                    : 'text-text-muted hover:text-gold'
                }`}
              >
                {t.dashboard[tab]}
              </button>
            ))}
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-300 rounded"
            title="Sign Out"
          >
            <LogOut size={14} />
            {loggingOut ? '...' : t.dashboard.logout}
          </button>
        </div>
      </div>

      <div className="admin-tab-content">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="luxury-card p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-black/40 border border-border ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-display text-text-primary">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings & Room Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="luxury-card p-6">
                <h3 className="text-xl font-display text-gold mb-6 flex items-center gap-2">
                  <Clock size={20} /> {t.dashboard.recentRes}
                </h3>
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-3 border-b border-border/50 hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{res.reference_reservation}</p>
                        <p className="text-[10px] text-text-muted">{res.chambres?.type_chambre} • {res.date_arrivee}</p>
                      </div>
                      <span className={`px-3 py-1 text-[8px] uppercase tracking-widest rounded-full border ${
                        res.statut === 'confirmee' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'
                      }`}>
                        {res.statut}
                      </span>
                    </div>
                  ))}
                  {reservations.length === 0 && <p className="text-center text-text-muted py-8 italic font-light">{t.dashboard.noRes}</p>}
                </div>
              </div>

              <div className="luxury-card p-6">
                <h3 className="text-xl font-display text-gold mb-6 flex items-center gap-2">
                  <BedDouble size={20} /> {t.dashboard.roomStatus}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {chambres.slice(0, 6).map(chambre => (
                     <div key={chambre.id} className="p-4 bg-black/40 border border-border rounded text-center">
                        <p className="text-[10px] text-text-muted uppercase mb-1">{chambre.type_chambre}</p>
                        <p className="text-sm font-display text-text-primary truncate">{chambre.numero_chambre}</p>
                        <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${chambre.statut === 'disponible' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="luxury-card p-8">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-display text-gold">{t.adminDashboard.roomMgmt}</h3>
               <button 
                 className="btn-luxury flex items-center gap-2"
                 onClick={() => setShowAddRoomModal(true)}
               >
                 <Plus size={16} /> {t.adminDashboard.addRoom}
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.roomNo}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.type}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.price}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.status}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {chambres.map(chambre => (
                    <tr key={chambre.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-sm text-text-primary">{chambre.numero_chambre}</td>
                      <td className="py-4 px-4 text-[10px] uppercase tracking-widest text-gold">{chambre.type_chambre}</td>
                      <td className="py-4 px-4 text-sm text-text-primary">{chambre.prix_base_nuit} DZD</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-[8px] uppercase tracking-widest rounded ${chambre.statut === 'disponible' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {chambre.statut}
                        </span>
                      </td>
                      <td className="py-4 px-4 flex gap-2">
                        <button 
                          className="p-2 text-text-muted hover:text-gold transition-colors"
                          title="Edit Room"
                          onClick={() => setEditingRoom(chambre)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-2 text-text-muted hover:text-red-500 transition-colors"
                          title="Delete Room"
                          onClick={() => setDeletingRoom(chambre)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="luxury-card p-8">
            <h3 className="text-2xl font-display text-gold mb-8">{t.adminDashboard.userDir}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(u => (
                <div key={u.id} className="p-6 bg-black/40 border border-border rounded-lg flex items-center gap-4 hover:border-gold/30 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold overflow-hidden shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.prenom} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-lg">{u.prenom?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{u.prenom} {u.nom_utilisateur}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-tighter">{u.role || 'Client'}</p>
                    <p className="text-[9px] text-text-muted truncate">{u.email}</p>
                    {u.telephone && <p className="text-[9px] text-gold mt-0.5">{u.telephone}</p>}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                     {u.role !== 'admin' && (
                       <button 
                         onClick={() => toggleUserRole(u.id, u.role === 'personnel' ? 'client' : 'personnel')}
                         className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded border transition-colors ${
                           u.role === 'personnel' 
                             ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' 
                             : 'border-gold/30 text-gold hover:bg-gold/10'
                         }`}
                         title={u.role === 'personnel' ? 'Revoke Receptionist Access' : 'Make Receptionist'}
                       >
                         {u.role === 'personnel' ? t.adminDashboard.revokeAccess : t.adminDashboard.makeRecep}
                       </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'restaurant' && (
          <div className="luxury-card p-8">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-display text-gold">{t.adminDashboard.culinaryMgmt}</h3>
               <button 
                 className="btn-luxury flex items-center gap-2"
                 onClick={() => setShowAddMenuModal(true)}
               >
                 <Plus size={16} /> {t.adminDashboard.addDish}
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map(menu => (
                <div key={menu.id} className="p-4 bg-black/40 border border-border/50 group hover:border-gold/30 transition-all rounded relative">
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      className="p-1.5 bg-black/60 border border-border/50 hover:border-gold/50 text-text-muted hover:text-gold rounded transition-all"
                      title="Edit Dish"
                      onClick={() => setEditingDish(menu)}
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="p-1.5 bg-black/60 border border-border/50 hover:border-red-500/50 text-text-muted hover:text-red-500 rounded transition-all"
                      title="Delete Dish"
                      onClick={() => setDeletingDish(menu)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {menu.image_url && (
                     <div className="h-32 mb-4 overflow-hidden rounded">
                       <img src={menu.image_url} alt={menu.nom_plat} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                     </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-gold">{menu.categorie}</span>
                      <h4 className="text-sm font-display text-text-primary mt-1 group-hover:text-gold transition-colors">{menu.nom_plat}</h4>
                    </div>
                    <span className="text-sm text-text-primary">{menu.prix} DZD</span>
                  </div>
                  <p className="text-[10px] text-text-muted line-clamp-2 mt-2">{menu.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="luxury-card p-8">
            <h3 className="text-2xl font-display text-gold mb-8">{t.adminDashboard.allRes}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.reference}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">Client</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">Room</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.dates}</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">Guests</th>
                    <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-text-muted">{t.adminDashboard.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(res => (
                    <tr key={res.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-sm text-gold font-medium">{res.reference_reservation}</td>
                      <td className="py-4 px-4 text-sm text-text-primary">{res.nom_complet_client || '—'}</td>
                      <td className="py-4 px-4 text-sm text-text-primary">{res.chambres?.numero_chambre} <span className="text-[9px] text-text-muted ml-1">{res.chambres?.type_chambre}</span></td>
                      <td className="py-4 px-4 text-xs text-text-muted">{res.date_arrivee} → {res.date_depart}</td>
                      <td className="py-4 px-4 text-xs text-text-primary">{res.nombre_adultes}A + {res.nombre_enfants}C</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-[8px] uppercase tracking-widest rounded border ${
                          res.statut === 'confirmee' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          res.statut === 'annulee' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>{res.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservations.length === 0 && <p className="text-center text-text-muted py-8 italic font-light">{t.dashboard.noRes}</p>}
            </div>
          </div>
        )}

        {activeTab === 'venues' && (
          <VenuesManager />
        )}

        {activeTab === 'promos' && (
          <PromoCodesManager />
        )}
      </div>

      {/* Add Room Modal */}
      {showAddRoomModal && (
        <AddRoomModal 
          onClose={() => setShowAddRoomModal(false)}
          onSuccess={() => {
            setShowAddRoomModal(false);
            fetchData();
          }}
        />
      )}

      {/* Add Menu Modal */}
      {showAddMenuModal && (
        <AddMenuModal 
          onClose={() => setShowAddMenuModal(false)}
          onSuccess={() => {
            setShowAddMenuModal(false);
            fetchData();
          }}
        />
      )}

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={() => {
            setEditingRoom(null);
            fetchData();
          }}
        />
      )}

      {/* Edit Menu Modal */}
      {editingDish && (
        <EditMenuModal
          dish={editingDish}
          onClose={() => setEditingDish(null)}
          onSuccess={() => {
            setEditingDish(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Room Confirmation */}
      {deletingRoom && (
        <DeleteConfirmModal
          title="Delete Room"
          itemName={`Room ${deletingRoom.numero_chambre} (${deletingRoom.type_chambre})`}
          onClose={() => setDeletingRoom(null)}
          onConfirm={handleDeleteRoom}
        />
      )}

      {/* Delete Dish Confirmation */}
      {deletingDish && (
        <DeleteConfirmModal
          title="Delete Dish"
          itemName={deletingDish.nom_plat}
          onClose={() => setDeletingDish(null)}
          onConfirm={handleDeleteDish}
        />
      )}
    </div>
  );
}
