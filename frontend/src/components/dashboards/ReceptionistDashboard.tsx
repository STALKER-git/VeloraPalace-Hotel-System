import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Chambre } from '../../types';
import {
  Hotel, Utensils, LogOut, CheckCircle, XCircle,
  RefreshCw, Coffee, AlertCircle, Search, BedDouble, Truck
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Tab = 'hotel' | 'restaurant' | 'orders';

export default function ReceptionistDashboard() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('hotel');
  
  // Hotel state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reservations, setReservations] = useState<any[]>([]);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  
  // Restaurant state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tables, setTables] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tableReservations, setTableReservations] = useState<any[]>([]);
  
  // Orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  
  const [loggingOut, setLoggingOut] = useState(false);
  const [tableToFree, setTableToFree] = useState<{ res: any, tableNum: string } | null>(null);
  const prevReservationCount = useRef(0);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
    
    // Polling every 30 seconds for new data
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'hotel') {
        const { data: b } = await supabase.from('reservations_chambres').select('*, chambres(*), clients(utilisateur_id)').order('date_reservation', { ascending: false });
        const { data: r } = await supabase.from('chambres').select('*').order('numero_chambre');
        
        if (b) {
          // Check if new pending reservation arrived
          const currentPending = b.filter(x => x.statut === 'en_attente').length;
          if (currentPending > prevReservationCount.current && prevReservationCount.current !== 0) {
            playNotificationSound();
          }
          prevReservationCount.current = currentPending;
          setReservations(b);
        }
        if (r) setChambres(r);
      }
      if (activeTab === 'restaurant') {
        const { data: tr } = await supabase.from('tables_restaurant').select('*').order('numero_table');
        const { data: rt } = await supabase.from('reservations_tables').select('*, tables_restaurant(*), clients(utilisateur_id)').order('date_reservation', { ascending: false });
        
        if (tr) setTables(tr);
        if (rt) {
          const currentPending = rt.filter(x => x.statut === 'en_attente' || !x.statut).length;
          if (currentPending > prevReservationCount.current && prevReservationCount.current !== 0) {
            playNotificationSound();
          }
          prevReservationCount.current = currentPending;
          setTableReservations(rt);
        }
      }
      if (activeTab === 'orders') {
        const { data } = await supabase
          .from('commandes_restaurant')
          .select('*, clients(utilisateur_id, utilisateur:utilisateurs(nom_utilisateur, prenom)), contient(quantite, menu:menus(nom_plat, prix))')
          .order('heure_commande', { ascending: false });
        if (data) setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUpdateRoomReservation = async (id: string, newStatut: string, userId: string | undefined) => {
    try {
      const { error: updateErr } = await supabase.from('reservations_chambres').update({ statut: newStatut }).eq('id', id);
      if (updateErr) console.error('Reservation update error:', updateErr);
      
      if (userId) {
        const message = newStatut === 'confirmee' 
          ? 'Your room reservation has been approved! 🎉' 
          : 'Your room reservation has been declined.';
        const { error: notifErr } = await supabase.rpc('create_notification', {
          p_utilisateur_id: userId,
          p_type: 'reservation_chambre',
          p_titre: newStatut === 'confirmee' ? 'Reservation Confirmed ✓' : 'Reservation Update',
          p_message: message
        });
        if (notifErr) console.error('Notification RPC error:', notifErr);
      } else {
        console.warn('No userId found for notification — check clients join');
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTableReservation = async (id: string, newStatut: string, userId: string | undefined) => {
    try {
      await supabase.from('reservations_tables').update({ statut: newStatut }).eq('id', id);
      
      if (userId) {
        const message = newStatut === 'confirmee' 
          ? 'Your dining table reservation has been approved!' 
          : 'Your dining table reservation has been rejected.';
        await supabase.rpc('create_notification', {
          p_utilisateur_id: userId,
          p_type: 'reservation_table',
          p_titre: newStatut === 'confirmee' ? 'Table Confirmed ✓' : 'Table Reservation Update',
          p_message: message
        });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatut: string, userId: string | undefined) => {
    try {
      await supabase.from('commandes_restaurant').update({ statut: newStatut }).eq('id', orderId);
      
      if (userId) {
        const statusLabels: Record<string, string> = {
          'en_preparation': 'Your room service order is being prepared!',
          'livree': 'Your room service order has been delivered. Bon appétit!',
          'annulee': 'Your room service order has been cancelled.',
        };
        await supabase.rpc('create_notification', {
          p_utilisateur_id: userId,
          p_type: 'commande_restaurant',
          p_titre: 'Room Service Update',
          p_message: statusLabels[newStatut] || `Order status updated to ${newStatut}`
        });
      }
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useGSAP(() => {
    gsap.fromTo('.recep-tab-content',
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, [activeTab]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display text-text-primary">{t.recepDashboard.title}</h1>
          <p className="text-text-muted text-sm tracking-wider uppercase">{t.recepDashboard.subtitle}</p>
        </div>
        <div className="flex gap-2 p-1 bg-black-soft border border-border rounded-lg">
          {(['hotel', 'restaurant', 'orders'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 rounded flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-gold text-black font-semibold' 
                  : 'text-text-muted hover:text-gold'
              }`}
            >
              {tab === 'hotel' && <Hotel size={12}/>}
              {tab === 'restaurant' && <Utensils size={12}/>}
              {tab === 'orders' && <Coffee size={12}/>}
              {tab === 'hotel' ? t.recepDashboard.hotel : tab === 'restaurant' ? t.recepDashboard.restaurant : t.recepDashboard.orders}
            </button>
          ))}
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

      <div className="recep-tab-content">
        {activeTab === 'hotel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Room Status */}
            <div className="lg:col-span-1 space-y-6">
              <div className="luxury-card p-6">
                 <h3 className="text-xl font-display text-gold mb-4 flex items-center justify-between">
                   {t.dashboard.roomStatus}
                   <RefreshCw size={14} className="text-text-muted cursor-pointer hover:text-gold transition-colors" onClick={fetchData} />
                 </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {chambres.map(room => (
                      <div key={room.id} className="p-3 bg-black/40 border border-border rounded">
                         <p className="text-[9px] text-text-muted uppercase mb-1">CH#{room.numero_chambre}</p>
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              room.statut === 'disponible' ? 'bg-green-500' : 
                              room.statut === 'occupee' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-[10px] text-text-primary capitalize">{room.statut}</span>
                         </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>

            {/* Active Bookings List */}
            <div className="lg:col-span-2">
              <div className="luxury-card p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-display text-gold">{t.recepDashboard.roomRes}</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input 
                      type="text" 
                      placeholder={t.recepDashboard.searchGuest} 
                      className="bg-black/40 border border-border rounded px-10 py-2 text-xs focus:border-gold outline-none text-text-primary w-48"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {reservations.map((res) => (
                     <div key={res.id} className="p-4 bg-white/5 border border-border/50 rounded flex flex-col md:flex-row md:items-center justify-between group hover:border-gold/30 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full border border-gold/30 overflow-hidden flex items-center justify-center bg-black-soft shrink-0">
                             <span className="font-display text-gold">{res.chambres?.numero_chambre?.charAt(0) || 'R'}</span>
                           </div>
                           <div>
                             <p className="text-sm font-medium text-text-primary">
                               {res.reference_reservation}
                             </p>
                             <p className="text-[10px] text-text-muted">
                                Room: <span className="text-gold">{res.chambres?.numero_chambre}</span> • {res.nombre_adultes}A + {res.nombre_enfants}C
                             </p>
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] text-text-muted uppercase">{t.recepDashboard.stayDates}</p>
                           <p className="text-xs text-text-primary">{res.date_arrivee} — {res.date_depart}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-1 text-[8px] uppercase tracking-widest rounded border ${res.statut === 'confirmee' ? 'bg-green-500/10 text-green-500 border-green-500/20' : res.statut === 'annulee' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                             {res.statut}
                           </span>
                           {res.statut === 'en_attente' && (
                             <>
                               <button 
                                 onClick={() => handleUpdateRoomReservation(res.id, 'confirmee', res.clients?.utilisateur_id)}
                                 className="p-1.5 border border-green-500/30 text-green-500 rounded hover:bg-green-500 hover:text-black transition-all" title="Approve"
                               >
                                  <CheckCircle size={14} />
                               </button>
                               <button 
                                 onClick={() => handleUpdateRoomReservation(res.id, 'annulee', res.clients?.utilisateur_id)}
                                 className="p-1.5 border border-red-500/30 text-red-500 rounded hover:bg-red-500 hover:text-black transition-all" title="Reject"
                               >
                                  <XCircle size={14} />
                               </button>
                             </>
                           )}
                        </div>
                     </div>
                  ))}
                  {reservations.length === 0 && <p className="text-center py-12 text-text-muted font-light">{t.dashboard.noRes}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurant' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="luxury-card p-6">
                 <h3 className="text-xl font-display text-gold mb-4 flex items-center justify-between">
                   {t.recepDashboard.liveFloor} 
                   <RefreshCw size={14} className="text-text-muted cursor-pointer hover:text-gold transition-colors" onClick={fetchData} />
                 </h3>
                 <p className="text-[10px] text-text-muted mb-4 uppercase tracking-widest">{t.recepDashboard.occupancy}</p>
                 <div className="grid grid-cols-3 gap-3">
                    {tables.map(table => {
                      const activeRes = tableReservations.find(r => {
                        if (r.table_id !== table.id || r.date_reservation !== todayStr) return false;
                        if (r.statut !== 'confirmee' && r.statut !== 'en_attente' && r.statut) return false;
                        
                        if (r.heure_reservation) {
                          // Check if more than 2 hours have passed
                          const resDateTime = new Date(`${r.date_reservation}T${r.heure_reservation}`);
                          const now = new Date();
                          const diffMs = now.getTime() - resDateTime.getTime();
                          if (diffMs > 2 * 60 * 60 * 1000) {
                            return false;
                          }
                        }
                        return true;
                      });
                      
                      const isReservedToday = !!activeRes;
                      
                      return (
                        <div 
                          key={table.id} 
                          onClick={() => {
                            if (isReservedToday && activeRes) {
                              setTableToFree({ res: activeRes, tableNum: table.numero_table });
                            }
                          }}
                          className={`p-3 border rounded text-center transition-colors ${isReservedToday ? 'bg-red-500/20 border-red-500/50 cursor-pointer hover:bg-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}
                          title={isReservedToday ? "Click to free table" : ""}
                        >
                           <p className={`text-sm font-display ${isReservedToday ? 'text-red-400' : 'text-green-400'}`}>{table.numero_table}</p>
                           <p className="text-[9px] text-text-muted mt-1 uppercase">{table.capacite} {t.recepDashboard.seats}</p>
                        </div>
                      )
                    })}
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2">
               <div className="luxury-card p-8">
                 <h3 className="text-2xl font-display text-gold mb-6">{t.recepDashboard.tableRes}</h3>
                 <div className="space-y-4">
                    {tableReservations.map(res => (
                      <div key={res.id} className="p-4 bg-white/5 border border-border/50 rounded flex flex-col md:flex-row md:items-center justify-between group hover:border-gold/30 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full border border-gold/30 overflow-hidden flex items-center justify-center bg-black-soft shrink-0">
                             <Utensils size={16} className="text-gold" />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-text-primary">
                               Table {res.tables_restaurant?.numero_table || 'Pending'}
                             </p>
                             <p className="text-[10px] text-text-muted">
                                {res.nombre_adultes} Guests • {res.special_requests || 'No special requests'}
                             </p>
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] text-text-muted uppercase">Date & Time</p>
                           <p className="text-xs text-text-primary">{res.date_reservation} at {res.heure_reservation?.substring(0,5)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-1 text-[8px] uppercase tracking-widest rounded border ${res.statut === 'confirmee' ? 'bg-green-500/10 text-green-500 border-green-500/20' : res.statut === 'annulee' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                             {res.statut || 'en_attente'}
                           </span>
                           {(res.statut === 'en_attente' || !res.statut) && (
                             <>
                               <button 
                                 onClick={() => handleUpdateTableReservation(res.id, 'confirmee', res.clients?.utilisateur_id)}
                                 className="p-1.5 border border-green-500/30 text-green-500 rounded hover:bg-green-500 hover:text-black transition-all" title="Approve"
                               >
                                  <CheckCircle size={14} />
                               </button>
                               <button 
                                 onClick={() => handleUpdateTableReservation(res.id, 'annulee', res.clients?.utilisateur_id)}
                                 className="p-1.5 border border-red-500/30 text-red-500 rounded hover:bg-red-500 hover:text-black transition-all" title="Reject"
                               >
                                  <XCircle size={14} />
                               </button>
                             </>
                           )}
                        </div>
                      </div>
                    ))}
                    {tableReservations.length === 0 && <p className="text-center py-12 text-text-muted font-light">{t.recepDashboard.noTableRes}</p>}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
           <div className="luxury-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display text-gold flex items-center gap-3">
                  <Coffee size={24} /> {t.recepDashboard.roomService}
                </h3>
                <RefreshCw size={14} className="text-text-muted cursor-pointer hover:text-gold transition-colors" onClick={fetchData} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map(order => {
                  const clientUser = order.clients?.utilisateur;
                  const clientName = clientUser ? `${clientUser.prenom} ${clientUser.nom_utilisateur}` : '—';
                  const items: { quantite: number; menu: { nom_plat: string; prix: number } }[] = order.contient || [];
                  const statut = order.statut || 'en_attente';
                  const statusStyle = statut === 'livree'
                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                    : statut === 'en_preparation'
                    ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    : statut === 'annulee'
                    ? 'border-red-500/30 text-red-400 bg-red-500/10'
                    : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
                  const statusLabel = statut === 'en_attente' ? 'Pending' : statut === 'en_preparation' ? 'Preparing' : statut === 'livree' ? 'Delivered' : statut === 'annulee' ? 'Cancelled' : statut;

                  return (
                    <div key={order.id} className="bg-black/40 border border-border rounded-lg p-6 space-y-4 hover:border-gold/30 transition-colors">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest">{t.recepDashboard.order} {order.reference_commande}</p>
                          <h4 className="text-base font-display text-text-primary mt-1 capitalize">{order.type_commande === 'room_service' ? 'Room Service' : order.type_commande}</h4>
                        </div>
                        <span className={`px-3 py-1 text-[8px] uppercase tracking-widest rounded-full border ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* Room & Client */}
                      <div className="flex items-center gap-4">
                        {order.numero_chambre && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded">
                            <BedDouble size={12} className="text-gold" />
                            <span className="text-[10px] font-semibold text-gold tracking-wider">Room {order.numero_chambre}</span>
                          </div>
                        )}
                        <div className="text-xs text-text-muted">
                          <span className="text-text-secondary">{clientName}</span>
                        </div>
                      </div>
                    
                      {/* Order Items */}
                      <div className="space-y-1 border-y border-border/30 py-4">
                        {items.length > 0 ? items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-light">
                            <span className="text-text-secondary">{item.menu?.nom_plat || 'Item'} × {item.quantite}</span>
                            <span className="text-text-primary">{(item.menu?.prix || 0) * item.quantite} DZD</span>
                          </div>
                        )) : (
                          <p className="text-[10px] text-text-muted italic">No item details available</p>
                        )}
                        <div className="flex justify-between pt-2 mt-2 border-t border-gold/30">
                          <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">{t.recepDashboard.totalAmount}</span>
                          <span className="text-sm font-display text-gold">{order.montant_articles} DZD</span>
                        </div>
                        {order.notes_speciales && (
                          <div className="mt-2 text-[10px] text-gold italic">{t.recepDashboard.note}: {order.notes_speciales}</div>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-[10px] text-text-muted">
                        {order.heure_commande ? new Date(order.heure_commande).toLocaleString() : '—'}
                      </div>

                      {/* Action Buttons */}
                      {statut !== 'livree' && statut !== 'annulee' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                          {statut === 'en_attente' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'en_preparation', order.clients?.utilisateur_id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest border border-blue-500/30 text-blue-400 rounded hover:bg-blue-500/10 transition-colors"
                            >
                              <Coffee size={12} /> Start Preparing
                            </button>
                          )}
                          {statut === 'en_preparation' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'livree', order.clients?.utilisateur_id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest border border-green-500/30 text-green-400 rounded hover:bg-green-500/10 transition-colors"
                            >
                              <Truck size={12} /> Mark Delivered
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'annulee', order.clients?.utilisateur_id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest border border-red-500/30 text-red-400 rounded hover:bg-red-500/10 transition-colors ml-auto"
                          >
                            <XCircle size={12} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {orders.length === 0 && (
                   <div className="col-span-full py-20 text-center">
                     <AlertCircle size={40} className="text-border mx-auto mb-4" />
                     <p className="text-text-muted font-light">{t.recepDashboard.noOrders}</p>
                   </div>
                )}
              </div>
           </div>
        )}

      </div>

        {tableToFree && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="luxury-card max-w-sm w-full p-8 text-center animate-scale-in" style={{ borderColor: 'var(--gold)' }}>
              <div className="w-16 h-16 rounded-full border border-gold/30 bg-gold/10 text-gold flex items-center justify-center mx-auto mb-6">
                <Utensils size={24} />
              </div>
              <h3 className="text-xl font-display text-white mb-2">Libérer la table {tableToFree.tableNum} ?</h3>
              <p className="text-xs text-text-muted mb-8 leading-relaxed">Cette action marquera la réservation actuelle comme terminée et rendra la table disponible pour de nouveaux clients.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setTableToFree(null)}
                  className="flex-1 py-3 text-[10px] tracking-widest uppercase border border-border/50 text-text-muted hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    handleUpdateTableReservation(tableToFree.res.id, 'terminee', tableToFree.res.clients?.utilisateur_id);
                    setTableToFree(null);
                  }}
                  className="flex-1 py-3 text-[10px] tracking-widest uppercase bg-gold text-black hover:bg-gold/90 transition-colors font-medium"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
