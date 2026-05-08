import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Client, ReservationChambre } from '../../types';
import { COUNTRIES } from '../../lib/countries';
import {
  User, Calendar, Star, Crown, History, Settings, LogOut,
  Camera, Save, Mail, BedDouble,
  CheckCircle, XCircle, Loader2, ChevronRight, Utensils,
  Bell, AlertTriangle, X, Trash2, Edit2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type Tab = 'profile' | 'bookings' | 'settings';

export default function ClientDashboard() {
  const { user, profile, signOut, updateProfile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [clientData, setClientData] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<ReservationChambre[]>([]);
  const [restaurantReservations, setRestaurantReservations] = useState<any[]>([]);
  const [bookingType, setBookingType] = useState<'rooms' | 'restaurant'>('rooms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Room reservation edit/cancel
  const [editingRes, setEditingRes] = useState<ReservationChambre | null>(null);
  const [editArrival, setEditArrival] = useState('');
  const [editDeparture, setEditDeparture] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancellingRes, setCancellingRes] = useState<string | null>(null);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  // Editable fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [codePays, setCodePays] = useState('+213');
  const [dateNaissance, setDateNaissance] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [documentIdentite, setDocumentIdentite] = useState('');
  const [adresseFacturation, setAdresseFacturation] = useState('');
  const [sexe, setSexe] = useState('');

  useEffect(() => {
    if (user) {
      fetchAllData();
      fetchNotifications();
      const notifInterval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(notifInterval);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setNom(profile.nom_utilisateur || '');
      setPrenom(profile.prenom || '');
      setTelephone(profile.telephone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (clientData) {
      setCodePays(clientData.code_pays || '+213');
      setDateNaissance(clientData.date_naissance || '');
      setNationalite(clientData.nationalite || '');
      setDocumentIdentite(clientData.document_identite || '');
      setAdresseFacturation(clientData.adresse_facturation || '');
      setSexe(clientData.sexe || '');
    }
  }, [clientData]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch client record
      const { data: cd } = await supabase
        .from('clients')
        .select('*')
        .eq('utilisateur_id', user!.id)
        .maybeSingle();
      if (cd) setClientData(cd);

      // Fetch reservations
      if (cd) {
        const { data: res } = await supabase
          .from('reservations_chambres')
          .select('*, chambres(*)')
          .eq('client_id', cd.id)
          .order('date_reservation', { ascending: false });
        if (res) setReservations(res);

        const { data: restRes } = await supabase
          .from('reservations_tables')
          .select('*, tables_restaurant(*)')
          .eq('client_id', cd.id)
          .order('date_reservation', { ascending: false });
        if (restRes) setRestaurantReservations(restRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('utilisateur_id', user.id)
        .order('date_creation', { ascending: false })
        .limit(20);
      if (data) setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markNotifAsRead = async (notifId: string) => {
    await supabase.from('notifications').update({ lu: true }).eq('id', notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, lu: true } : n));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.lu).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ lu: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();
      await updateProfile({ avatar_url: avatarUrl } as any);
      await refreshProfile();
    } catch (err: any) {
      alert('Avatar upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Validate age if birthdate provided
      if (dateNaissance) {
        const birth = new Date(dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 18) {
          alert('You must be at least 18 years old.');
          setSaving(false);
          return;
        }
      }

      // Update utilisateurs table
      const { error: userErr } = await supabase.from('utilisateurs').update({
        nom_utilisateur: nom,
        prenom: prenom,
        telephone: telephone,
      }).eq('id', user.id);
      if (userErr) throw userErr;

      // Upsert client record
      const clientPayload = {
        utilisateur_id: user.id,
        date_naissance: dateNaissance || null,
        nationalite: nationalite || null,
        document_identite: documentIdentite || null,
        adresse_facturation: adresseFacturation || null,
        code_pays: codePays,
        sexe: sexe || null,
      };

      if (clientData?.id) {
        const { error: clientErr } = await supabase.from('clients')
          .update(clientPayload)
          .eq('id', clientData.id);
        if (clientErr) throw clientErr;
      } else {
        const { error: clientErr } = await supabase.from('clients')
          .insert({ ...clientPayload, points_fidelite: 0 });
        if (clientErr) throw clientErr;
      }

      await refreshProfile();
      await fetchAllData();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Error saving: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const handleConfirmModalAction = () => {
    confirmModal.onConfirm();
    setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleCancelRoomRes = async (id: string) => {
    setCancellingRes(id);
    try {
      const { error } = await supabase
        .from('reservations_chambres')
        .update({ statut: 'annulee' })
        .eq('id', id);
      if (error) throw error;
      setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'annulee' } : r));
      setSuccessMsg('Room reservation cancelled.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Error cancelling: ' + err.message);
    } finally {
      setCancellingRes(null);
    }
  };

  const handleOpenEditRes = (res: ReservationChambre) => {
    setEditingRes(res);
    setEditArrival(res.date_arrivee);
    setEditDeparture(res.date_depart);
  };

  const handleSaveEditRes = async () => {
    if (!editingRes) return;
    if (!editArrival || !editDeparture) {
      alert('Please select both arrival and departure dates.');
      return;
    }
    const arrival = new Date(editArrival);
    const departure = new Date(editDeparture);
    if (departure <= arrival) {
      alert('Check-out date must be after check-in date.');
      return;
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('reservations_chambres')
        .update({ date_arrivee: editArrival, date_depart: editDeparture })
        .eq('id', editingRes.id);
      if (error) throw error;
      setReservations(prev =>
        prev.map(r => r.id === editingRes.id
          ? { ...r, date_arrivee: editArrival, date_depart: editDeparture }
          : r
        )
      );
      setSuccessMsg('Reservation updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingRes(null);
    } catch (err: any) {
      alert('Error saving changes: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelRestaurantRes = async (id: string, elId: string) => {
    try {
      const el = document.getElementById(elId);
      if (el) {
        gsap.to(el, { opacity: 0.5, scale: 0.98, duration: 0.3 });
      }
      const { error } = await supabase.from('reservations_tables').update({ statut: 'annulee' }).eq('id', id);
      if (error) throw error;

      setRestaurantReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'annulee' } : r));
      setSuccessMsg('Table reservation cancelled.');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (el) {
        gsap.to(el, { opacity: 1, scale: 1, duration: 0.3 });
      }
    } catch (err: any) {
      alert('Error cancelling: ' + err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleNotifs = () => {
    setNotifsEnabled(!notifsEnabled);
    setSuccessMsg(notifsEnabled ? "Notifications Disabled" : "Notifications Enabled");
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await signOut();
      navigate('/');
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  useGSAP(() => {
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
    }
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }
  }, []);

  useGSAP(() => {
    gsap.fromTo('.client-tab-content', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
  }, [activeTab]);

  if (!user) return null;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmee': return 'border-green-500/30 text-green-400 bg-green-500/10';
      case 'en_attente': return 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10';
      case 'annulee': return 'border-red-500/30 text-red-400 bg-red-500/10';
      case 'terminee': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
      default: return 'border-border text-text-muted';
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'profile', label: t.clientDashboard.myProfile, icon: User },
    { key: 'bookings', label: t.clientDashboard.myBookings, icon: Calendar },
    { key: 'settings', label: t.clientDashboard.settings, icon: Settings },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div ref={sidebarRef} className="md:col-span-1" style={{ opacity: 0 }}>
          <div className="luxury-card p-6 text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              <div className="w-24 h-24 rounded-full border-2 border-gold flex items-center justify-center bg-black-soft overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.prenom} className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-gold" />
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                {uploadingAvatar ? (
                  <Loader2 size={20} className="text-gold animate-spin" />
                ) : (
                  <Camera size={20} className="text-gold" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>

            <h2 className="text-lg font-display text-text-primary">
              {profile ? `${profile.prenom} ${profile.nom_utilisateur}` : user.email}
            </h2>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{t.clientDashboard.member}</p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-6">
              <div className="flex flex-col items-center gap-1">
                <Calendar size={14} className="text-gold" />
                <span className="text-sm font-display text-text-primary">{reservations.length}</span>
                <span className="text-[8px] text-text-muted uppercase tracking-wider leading-tight text-center">{t.clientDashboard.bookings}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Star size={14} className="text-gold" />
                <span className="text-sm font-display text-text-primary">{clientData?.points_fidelite || 0}</span>
                <span className="text-[8px] text-text-muted uppercase tracking-wider leading-tight text-center">{t.clientDashboard.points}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Crown size={14} className="text-gold" />
                <span className="text-sm font-display text-text-primary">{profile?.date_creation?.substring(0, 4) || '--'}</span>
                <span className="text-[8px] text-text-muted uppercase tracking-wider leading-tight text-center">{t.clientDashboard.since}</span>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="mt-6 space-y-2 border-t border-border pt-6 text-left">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full px-4 py-2 text-sm tracking-widest flex items-center gap-2 transition-colors ${activeTab === tab.key
                      ? 'text-gold bg-gold-glow border border-gold/30'
                      : 'text-text-muted hover:text-gold'
                    }`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
              <button onClick={() => signOut()} className="w-full px-4 py-2 text-text-muted hover:text-gold transition-colors text-sm tracking-widest flex items-center gap-2 mt-4">
                <LogOut size={14} /> {t.clientDashboard.signOut}
              </button>
            </div>

            {/* Notification Bell */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setShowNotifPanel(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-border/50 hover:border-gold/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-gold" />
                  <span className="text-sm text-text-muted group-hover:text-gold transition-colors tracking-widest">Notifications</span>
                </div>
                {notifications.filter(n => !n.lu).length > 0 && (
                  <span className="w-6 h-6 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.lu).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="md:col-span-3 space-y-6" style={{ opacity: 0 }}>
          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm tracking-wider flex items-center gap-3 animate-fade-in-up">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <div className="client-tab-content">
            {/* ═══ PROFILE TAB ═══ */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="luxury-card p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="relative z-10">
                    <p className="section-eyebrow mb-2">{t.clientDashboard.welcomeBack}</p>
                    <h2 className="text-3xl font-display text-text-primary mb-2">{profile?.prenom ? `${profile.prenom}.` : t.clientDashboard.dearGuest}</h2>
                    <p className="text-text-muted text-sm font-light max-w-md">{t.clientDashboard.manageDesc}</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="luxury-card p-8">
                  <h3 className="text-2xl font-display text-gold mb-8 border-b border-border pb-4">{t.clientDashboard.personalInfo}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.firstName}</label>
                      <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="luxury-input w-full bg-black/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.lastName}</label>
                      <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="luxury-input w-full bg-black/50" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Email</label>
                      <div className="luxury-input w-full bg-black/50 text-text-muted flex items-center gap-2">
                        <Mail size={14} className="text-gold" /> {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.gender}</label>
                      <select value={sexe} onChange={e => setSexe(e.target.value)} className="luxury-input w-full bg-black/50">
                        <option value="">{t.clientDashboard.select}</option>
                        <option value="homme">{t.clientDashboard.male}</option>
                        <option value="femme">{t.clientDashboard.female}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.dob}</label>
                      <input type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} className="luxury-input w-full bg-black/50" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.phone}</label>
                      <div className="flex gap-2">
                        <select value={codePays} onChange={e => setCodePays(e.target.value)} className="luxury-input bg-black/50 !w-[110px] px-2 text-xs flex-shrink-0">
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.dialCode}>{c.flag} {c.dialCode}</option>
                          ))}
                        </select>
                        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="luxury-input flex-1 bg-black/50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.nationality}</label>
                      <select value={nationalite} onChange={e => setNationalite(e.target.value)} className="luxury-input w-full bg-black/50">
                        <option value="">{t.clientDashboard.selectNat}</option>
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.idPassport}</label>
                      <input type="text" value={documentIdentite} onChange={e => setDocumentIdentite(e.target.value)} className="luxury-input w-full bg-black/50" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.billingAddress}</label>
                      <input type="text" value={adresseFacturation} onChange={e => setAdresseFacturation(e.target.value)} className="luxury-input w-full bg-black/50" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-luxury flex items-center gap-3">
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? t.clientDashboard.saving : t.clientDashboard.saveChanges}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ BOOKINGS TAB ═══ */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="luxury-card p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-border pb-4 gap-4">
                    <h3 className="text-2xl font-display text-gold flex items-center gap-3">
                      <History size={24} /> {t.clientDashboard.resHistory}
                    </h3>
                    <div className="flex p-1 bg-black/40 border border-border/50 rounded">
                      <button
                        onClick={() => setBookingType('rooms')}
                        className={`px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${bookingType === 'rooms' ? 'bg-gold text-black' : 'text-text-muted hover:text-white'}`}
                      >
                        {t.clientDashboard.suites}
                      </button>
                      <button
                        onClick={() => setBookingType('restaurant')}
                        className={`px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${bookingType === 'restaurant' ? 'bg-gold text-black' : 'text-text-muted hover:text-white'}`}
                      >
                        {t.clientDashboard.dining}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-gold animate-spin" /></div>
                  ) : bookingType === 'rooms' ? (
                    reservations.length > 0 ? (
                      <div className="space-y-4">
                        {reservations.map(res => (
                          <div key={res.id} className="p-6 bg-white/5 border border-border/50 hover:border-gold/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-border/30">
                                  <img src={res.chambres?.image_urls?.[0] || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-display text-gold">{res.reference_reservation}</p>
                                  <p className="text-xs text-text-muted mt-1">
                                    {res.chambres?.type_chambre}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-xs">
                                <div className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.clientDashboard.checkIn}</p>
                                  <p className="text-text-primary">{res.date_arrivee}</p>
                                </div>
                                <ChevronRight size={14} className="text-border" />
                                <div className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.clientDashboard.checkOut}</p>
                                  <p className="text-text-primary">{res.date_depart}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.clientDashboard.guests}</p>
                                  <p className="text-text-primary">{res.nombre_adultes}A + {res.nombre_enfants}C</p>
                                </div>
                                <span className={`px-3 py-1 text-[8px] uppercase tracking-widest rounded-full border ${getStatusColor(res.statut)}`}>
                                  {res.statut}
                                </span>
                              </div>
                            </div>
                            {/* Edit / Cancel actions */}
                            {res.statut === 'en_attente' && (
                              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-end gap-4">
                                <button
                                  onClick={() => handleOpenEditRes(res)}
                                  className="text-[10px] uppercase tracking-widest text-gold hover:text-white transition-colors flex items-center gap-2"
                                >
                                  <Edit2 size={12} /> {t.clientDashboard.editRes}
                                </button>
                                <button
                                  onClick={() => showConfirmModal(
                                    t.clientDashboard.cancelRes,
                                    'Are you sure you want to cancel this room reservation?',
                                    () => handleCancelRoomRes(res.id)
                                  )}
                                  disabled={cancellingRes === res.id}
                                  className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  {cancellingRes === res.id
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <XCircle size={12} />}
                                  {t.clientDashboard.cancelRes}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <BedDouble size={40} className="text-border mb-4" />
                        <p className="text-text-muted mb-6 font-light">{t.clientDashboard.noRoomRes}</p>
                        <button onClick={() => navigate('/rooms')} className="btn-outline-luxury">{t.clientDashboard.exploreAcc}</button>
                      </div>
                    )
                  ) : (
                    restaurantReservations.length > 0 ? (
                      <div className="space-y-4">
                        {restaurantReservations.map(res => (
                          <div id={`rest-res-${res.id}`} key={res.id} className="p-6 bg-white/5 border border-border/50 hover:border-gold/30 transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-border/30 bg-black/50 flex items-center justify-center">
                                  <Utensils size={24} className="text-gold/50" />
                                </div>
                                <div>
                                  <p className="text-sm font-display text-gold">L'Aura Noire</p>
                                  <p className="text-xs text-text-muted mt-1">
                                    {res.tables_restaurant?.numero_table || 'Pending'} • {res.nombre_adultes}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 text-xs">
                                <div className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.clientDashboard.date}</p>
                                  <p className="text-text-primary">{res.date_reservation}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.clientDashboard.time}</p>
                                  <p className="text-text-primary">{res.heure_reservation?.substring(0, 5)}</p>
                                </div>
                                <span className={`px-3 py-1 text-[8px] uppercase tracking-widest rounded-full border ${getStatusColor(res.statut || 'confirmee')}`}>
                                  {res.statut || 'confirmee'}
                                </span>
                              </div>
                            </div>
                            {res.statut !== 'annulee' && res.statut !== 'terminee' && (
                              <div className="mt-4 pt-4 border-t border-border/30 flex justify-end">
                                <button
                                  onClick={() => showConfirmModal(
                                    t.clientDashboard.cancelRes,
                                    'Are you sure you want to cancel this table reservation?',
                                    () => handleCancelRestaurantRes(res.id, `rest-res-${res.id}`)
                                  )}
                                  className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                                >
                                  <XCircle size={12} /> {t.clientDashboard.cancelRes}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Utensils size={40} className="text-border mb-4" />
                        <p className="text-text-muted mb-6 font-light">{t.clientDashboard.noDiningRes}</p>
                        <button onClick={() => navigate('/dining')} className="btn-outline-luxury">{t.clientDashboard.bookTable}</button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ═══ SETTINGS TAB ═══ */}
            {activeTab === 'settings' && (
              <div className="luxury-card p-8">
                <h3 className="text-2xl font-display text-gold mb-8 border-b border-border pb-4">{t.clientDashboard.accountSettings}</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{t.clientDashboard.changePass}</p>
                      <p className="text-[10px] text-text-muted mt-1">{t.clientDashboard.changePassDesc}</p>
                    </div>
                    <button onClick={handleResetPassword} className="btn-outline-luxury text-[10px] py-2 px-4 w-32 flex justify-center">
                      <span className="relative z-10">{resetSent ? 'LINK SENT' : t.clientDashboard.update}</span>
                    </button>
                  </div>
                  <div className="p-6 bg-white/5 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-primary font-medium">{t.clientDashboard.emailNotif}</p>
                      <p className="text-[10px] text-text-muted mt-1">{t.clientDashboard.emailNotifDesc}</p>
                    </div>
                    <button onClick={handleToggleNotifs} className="btn-outline-luxury text-[10px] py-2 px-4 w-32 flex justify-center">
                      <span className="relative z-10">{notifsEnabled ? 'DISABLE' : 'ENABLE'}</span>
                    </button>
                  </div>
                  <div className="p-6 bg-red-500/5 border border-red-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-400 font-medium">{t.clientDashboard.deleteAccount}</p>
                      <p className="text-[10px] text-text-muted mt-1">{t.clientDashboard.deleteAccountDesc}</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="text-[10px] uppercase tracking-widest border border-red-500/30 text-red-400 px-4 py-2 hover:bg-red-500 hover:text-white transition-colors">
                      {t.clientDashboard.delete}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Promo Card */}
          {activeTab === 'profile' && (
            <div className="luxury-card p-6" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.05), transparent)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-eyebrow mb-1">{t.clientDashboard.memberExclusive}</p>
                  <h3 className="text-xl font-display text-text-primary mb-1">{t.clientDashboard.spaCredit}</h3>
                  <p className="text-text-muted text-xs font-light">{t.clientDashboard.useCode} <span className="text-gold font-semibold tracking-widest">VELORA10</span></p>
                </div>
                <Crown size={40} className="text-gold opacity-40" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ EDIT ROOM RESERVATION MODAL ═══ */}
      {editingRes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="luxury-card max-w-md w-full p-8" style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display text-gold">{t.clientDashboard.editResTitle}</h3>
              <button onClick={() => setEditingRes(null)} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="mb-3 p-3 bg-gold/5 border border-gold/20 rounded">
              <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Reference</p>
              <p className="text-sm text-white font-display">{editingRes.reference_reservation}</p>
              <p className="text-xs text-text-muted mt-1">{editingRes.chambres?.type_chambre}</p>
            </div>

            <div className="space-y-5 mt-6">
              <div>
                <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.checkIn}</label>
                <input
                  type="date"
                  value={editArrival}
                  onChange={e => setEditArrival(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="luxury-input w-full bg-black/50"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">{t.clientDashboard.checkOut}</label>
                <input
                  type="date"
                  value={editDeparture}
                  onChange={e => setEditDeparture(e.target.value)}
                  min={editArrival || new Date().toISOString().split('T')[0]}
                  className="luxury-input w-full bg-black/50"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setEditingRes(null)}
                className="flex-1 py-3 text-[10px] tracking-widest uppercase border border-border/50 text-text-muted hover:text-white transition-colors"
              >
                {t.clientDashboard.cancelEdit}
              </button>
              <button
                onClick={handleSaveEditRes}
                disabled={savingEdit}
                className="flex-1 py-3 text-[10px] tracking-widest uppercase btn-luxury flex items-center justify-center gap-2"
              >
                {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {savingEdit ? t.clientDashboard.saving : t.clientDashboard.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE ACCOUNT MODAL ═══ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="luxury-card max-w-md w-full p-8 text-center" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h3 className="text-xl font-display text-white mb-2">Delete Your Account?</h3>
            <p className="text-xs text-text-muted mb-2 leading-relaxed">
              This action is permanent and cannot be undone. All your reservations, profile data, and loyalty points will be permanently removed.
            </p>
            <p className="text-xs text-red-400/80 mb-8 font-medium">
              Cette action est irréversible.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 text-[10px] tracking-widest uppercase border border-border/50 text-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-3 text-[10px] tracking-widest uppercase bg-red-500 text-white hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deletingAccount ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NOTIFICATIONS PANEL ═══ */}
      {showNotifPanel && (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setShowNotifPanel(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md h-full bg-bg border-l border-border/50 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-gold" />
                <h3 className="text-lg font-display text-white">Notifications</h3>
                {notifications.filter(n => !n.lu).length > 0 && (
                  <span className="text-[10px] bg-gold text-black px-2 py-0.5 rounded-full font-bold">
                    {notifications.filter(n => !n.lu).length} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {notifications.filter(n => !n.lu).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[9px] uppercase tracking-widest text-gold hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setShowNotifPanel(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bell size={40} className="text-border mb-4" />
                  <p className="text-text-muted font-light text-sm">No notifications yet</p>
                  <p className="text-text-muted/50 text-xs mt-1">You'll receive updates about your bookings here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.lu && markNotifAsRead(notif.id)}
                      className={`p-5 transition-colors cursor-pointer ${notif.lu
                          ? 'bg-transparent hover:bg-white/5'
                          : 'bg-gold/5 hover:bg-gold/10 border-l-2 border-l-gold'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notif.type_notification === 'reservation_chambre'
                            ? 'bg-green-500/10 border border-green-500/30'
                            : notif.type_notification === 'commande_restaurant'
                              ? 'bg-blue-500/10 border border-blue-500/30'
                              : 'bg-gold/10 border border-gold/30'
                          }`}>
                          {notif.type_notification === 'reservation_chambre' ? (
                            <BedDouble size={14} className="text-green-400" />
                          ) : notif.type_notification === 'commande_restaurant' ? (
                            <Utensils size={14} className="text-blue-400" />
                          ) : (
                            <Bell size={14} className="text-gold" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-text-primary font-medium truncate">{notif.titre}</p>
                            {!notif.lu && (
                              <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">{notif.message}</p>
                          <p className="text-[10px] text-text-muted/50 mt-2">
                            {new Date(notif.date_creation).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM CONFIRMATION MODAL ═══ */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="luxury-card max-w-sm w-full p-8 animate-scale-in" style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-display text-text-primary mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-text-muted font-light">{confirmModal.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} })}
                className="flex-1 py-3 text-[10px] uppercase tracking-widest border border-border text-text-muted hover:text-white hover:border-white/30 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModalAction}
                className="flex-1 py-3 text-[10px] uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `}</style>
    </>
  );
}
