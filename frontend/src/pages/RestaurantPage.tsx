import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Utensils, Clock, ConciergeBell, ShoppingBag, X, Plus, Minus, Star, CreditCard, CheckCircle, Loader2, AlertTriangle, Users, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const CATEGORIES = [
  { key: 'all', label: 'All Dishes' },
  { key: 'Entrées', label: 'Starters' },
  { key: 'Plats', label: 'Main Courses' },
  { key: 'Desserts', label: 'Desserts' },
  { key: 'Boissons', label: 'Drinks' },
];

export default function RestaurantPage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [reservationType, setReservationType] = useState('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomServiceNotes, setRoomServiceNotes] = useState('');
  const [roomServiceStep, setRoomServiceStep] = useState<'none' | 'payment' | 'success'>('none');
  const [roomServiceLoading, setRoomServiceLoading] = useState(false);
  const [roomServiceError, setRoomServiceError] = useState('');
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const reservationRef = useRef<HTMLDivElement>(null);

  // Reservation states
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('19:00');
  const [resAdults, setResAdults] = useState('2');
  const [resChildren, setResChildren] = useState('0');
  const [resRequests, setResRequests] = useState('');
  
  // Multi-step table booking flow (per sequence diagram)
  const [tableBookingStep, setTableBookingStep] = useState<'datetime' | 'tables' | 'confirm'>('datetime');
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [tableBookingError, setTableBookingError] = useState('');

  // Checkout/Payment Flow States
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'phone' | 'payment' | 'success'>('none');
  const [phoneInfo, setPhoneInfo] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [, setReservationId] = useState<string | null>(null);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    import('../lib/supabase').then(async ({ supabase }) => {
      const { data } = await supabase.from('menus').select('*');
      if (data) {
        const mapped = data.map(m => ({
          id: m.id,
          name: m.nom_plat,
          category: m.categorie,
          price: m.prix,
          desc: m.description,
          img: m.image_url || 'https://images.pexels.com/photos/10134267/pexels-photo-10134267.jpeg?auto=compress&cs=tinysrgb&w=600'
        }));
        setMenuItems(mapped);
      }
    });
  };

  /* ── Hero parallax + text entrance ── */
  useGSAP(() => {
    if (heroRef.current) {
      const children = heroRef.current.children;
      gsap.fromTo(children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.3, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
    }
    if (parallaxBgRef.current) {
      gsap.to(parallaxBgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxBgRef.current.parentElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  /* ── Intro section reveal ── */
  useGSAP(() => {
    if (introRef.current) {
      gsap.fromTo(introRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: introRef.current, start: 'top 80%' },
        }
      );
    }
  }, []);

  /* ── Card stagger animation on category change ── */
  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll('.menu-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 50, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'all' }
        );
      }
    }
  }, [activeCategory]);

  /* ── Reservation section reveal ── */
  useGSAP(() => {
    if (reservationRef.current) {
      gsap.fromTo(reservationRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: reservationRef.current, start: 'top 80%' },
        }
      );
    }
  }, []);

  const filteredMenu = activeCategory === 'all' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  /* ── Cart helpers ── */
  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing && existing.qty > 1) return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => c.id !== id);
    });
  };
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  // Step 1: Check availability and fetch available tables
  const handleCheckAvailability = async () => {
    if (!user) {
      navigate('/auth', { state: { from: '/dining' } });
      return;
    }
    if (!resDate || !resTime) {
      setTableBookingError('Please select both date and time.');
      return;
    }
    setCheckingAvailability(true);
    setTableBookingError('');
    try {
      const totalGuests = parseInt(resAdults) + parseInt(resChildren);
      const pgTime = resTime.length === 5 ? `${resTime}:00` : resTime;

      // Fetch all tables that can fit the guest count
      const { data: allTables, error: tErr } = await supabase
        .from('tables_restaurant')
        .select('*')
        .gte('capacite', totalGuests)
        .order('numero_table');

      if (tErr) throw tErr;

      // Fetch already-booked tables for the chosen date/time
      const { data: booked } = await supabase
        .from('reservations_tables')
        .select('table_id')
        .eq('date_reservation', resDate)
        .eq('heure_reservation', pgTime)
        .neq('statut', 'annulee');

      const bookedIds = new Set((booked || []).map((b: any) => b.table_id));
      const free = (allTables || []).filter((t: any) => !bookedIds.has(t.id));

      if (free.length === 0) {
        setTableBookingError('No tables available for the selected date, time, and guest count. Please try different options.');
        setAvailableTables([]);
      } else {
        setAvailableTables(free);
        setTableBookingStep('tables');
      }
    } catch (err: any) {
      setTableBookingError('Error checking availability: ' + (err.message || 'Unknown'));
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Step 2: Select a table
  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
    setTableBookingStep('confirm');
  };

  // Step 3: Confirm and save reservation
  const handleConfirmTableBooking = async () => {
    if (!user || !selectedTable) return;
    setPaymentLoading(true);
    setTableBookingError('');
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('id')
        .eq('utilisateur_id', user.id)
        .single();
      if (clientErr) throw clientErr;

      const pgTime = resTime.length === 5 ? `${resTime}:00` : resTime;
      const { data, error } = await supabase
        .from('reservations_tables')
        .insert({
          client_id: clientData.id,
          table_id: selectedTable.id,
          date_reservation: resDate,
          heure_reservation: pgTime,
          nombre_adultes: parseInt(resAdults),
          nombre_enfants: parseInt(resChildren),
          special_requests: resRequests || null,
          statut: 'en_attente',
        })
        .select('id')
        .single();

      if (error) throw error;
      setReservationId(data.id);

      // Move to payment checkout
      setPhoneInfo(profile?.telephone || '');
      setCheckoutStep('phone');
    } catch (err: any) {
      setTableBookingError('Booking failed: ' + (err.message || 'Unknown'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInfo) return;
    setCheckoutStep('payment');
  };

  const processPayment = () => {
    setPaymentLoading(true);
    setTimeout(async () => {
      setPaymentLoading(false);
      setCheckoutStep('success');
      // Reset the form
      setResDate('');
      setResRequests('');
      setSelectedTable(null);
      setAvailableTables([]);
      setTableBookingStep('datetime');
      setTimeout(() => setCheckoutStep('none'), 4000);
    }, 2500);
  };

  /* ── Room Service Order Flow ── */
  const handleRoomServiceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomServiceError('');

    if (!user) {
      alert('Please log in to place a room service order.');
      return;
    }

    if (!roomNumber.trim()) {
      setRoomServiceError('Please enter your room number.');
      return;
    }

    if (cart.length === 0) {
      setRoomServiceError('Please add items to your cart first.');
      return;
    }

    try {
      // 1. Get client_id
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('id')
        .eq('utilisateur_id', user.id)
        .single();

      if (clientErr || !clientData) {
        setRoomServiceError('Client profile not found. Please complete your profile first.');
        return;
      }

      // 2. Verify user has a confirmed booking in that room
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: booking, error: bookingErr } = await supabase
        .from('reservations_chambres')
        .select('id, chambres!inner(numero_chambre)')
        .eq('client_id', clientData.id)
        .eq('statut', 'confirmee')
        .eq('chambres.numero_chambre', roomNumber.trim())
        .lte('date_arrivee', todayStr)
        .gte('date_depart', todayStr)
        .maybeSingle();

      if (bookingErr) {
        console.error('Booking verification error:', bookingErr);
        setRoomServiceError('Error verifying your reservation. Please try again.');
        return;
      }

      if (!booking) {
        setRoomServiceError(`No active confirmed reservation found for room ${roomNumber}. Please verify your room number and ensure your booking is confirmed.`);
        return;
      }

      // 3. Booking verified → show payment modal
      setRoomServiceStep('payment');

    } catch (err: any) {
      setRoomServiceError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    }
  };

  const processRoomServicePayment = async () => {
    setRoomServiceLoading(true);
    try {
      // 1. Get client_id again
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('utilisateur_id', user!.id)
        .single();

      if (!clientData) throw new Error('Client not found');

      // 2. Get the active booking for this room
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: booking } = await supabase
        .from('reservations_chambres')
        .select('id, chambres!inner(numero_chambre)')
        .eq('client_id', clientData.id)
        .eq('statut', 'confirmee')
        .eq('chambres.numero_chambre', roomNumber.trim())
        .lte('date_arrivee', todayStr)
        .gte('date_depart', todayStr)
        .maybeSingle();

      // 3. Generate reference
      const ref = 'RS-' + Date.now().toString(36).toUpperCase();

      // 4. Insert order into commandes_restaurant
      const { data: order, error: orderErr } = await supabase
        .from('commandes_restaurant')
        .insert({
          reference_commande: ref,
          type_commande: 'room_service',
          montant_articles: cartTotal,
          notes_speciales: roomServiceNotes || null,
          methode_paiement: 'carte_credit',
          client_id: clientData.id,
          numero_chambre: roomNumber.trim(),
          statut: 'en_attente',
          reservation_chambre_id: booking?.id || null,
        })
        .select('id')
        .single();

      if (orderErr) throw orderErr;

      // 5. Insert order items into contient table
      const contientItems = cart.map(c => ({
        commande_id: order.id,
        menu_id: c.id,
        quantite: c.qty,
      }));

      const { error: contientErr } = await supabase
        .from('contient')
        .insert(contientItems);

      if (contientErr) {
        console.error('Contient insert error:', contientErr);
        // Order was created, items failed — not critical
      }

      // 6. Insert payment record
      const payRef = 'PAY-' + Date.now().toString(36).toUpperCase();
      await supabase.from('paiements').insert({
        reference_transaction: payRef,
        montant: cartTotal,
        devise: 'DZD',
        methode_paiement: 'carte_credit',
        statut: 'completee',
        commande_id: order.id,
      });

      // 7. Success
      setRoomServiceStep('success');
      setCart([]);
      setRoomNumber('');
      setRoomServiceNotes('');
      setRoomServiceError('');

      setTimeout(() => setRoomServiceStep('none'), 4000);

    } catch (err: any) {
      alert('Order failed: ' + (err.message || 'Unknown error'));
    } finally {
      setRoomServiceLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
      {/* ═══════════ CINEMATIC HERO ═══════════ */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div
          ref={parallaxBgRef}
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1813502/pexels-photo-1813502.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 50%, var(--bg) 100%)' }} />
        <div className="absolute inset-0 vignette" />

        <div ref={heroRef} className="relative text-center z-10 px-6">
          <div className="flex items-center justify-center gap-3 mb-5">
            {[...Array(3)].map((_, i) => (
              <Star key={i} size={12} fill="#c9a84c" style={{ color: '#c9a84c' }} />
            ))}
          </div>
          <p className="section-eyebrow mb-4" style={{ letterSpacing: '6px', opacity: 0 }}>{t.restaurant.eyebrow}</p>
          <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0 }} />
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 300,
              color: '#f5f0e8',
              letterSpacing: '0.06em',
              opacity: 0,
            }}
          >
            L'Aura Noire
          </h1>
          <p
            style={{
              fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300,
              color: 'rgba(245,240,232,0.65)', letterSpacing: '3px',
              textTransform: 'uppercase', marginTop: '16px', opacity: 0,
            }}
          >
            Michelin-Starred Fine Dining
          </p>
        </div>
      </section>

      {/* ═══════════ INTRO ═══════════ */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <div ref={introRef}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: 'var(--gold)', marginBottom: '20px' }}>
            {t.restaurant.title}
          </h2>
          <p style={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 2, maxWidth: '700px', margin: '0 auto', marginBottom: '2rem' }}>
            {t.restaurant.desc}
          </p>
          <div className="flex justify-center items-center gap-8 mt-8 border-t border-b border-border/50 py-6 max-w-xl mx-auto">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[3px] text-text-muted mb-2">Opening Hours</p>
              <p className="font-display text-gold text-xl">18:00 — 23:00</p>
            </div>
            <div className="w-px h-12 bg-border/50" />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[3px] text-text-muted mb-2">Dress Code</p>
              <p className="font-display text-gold text-xl">Smart Elegant</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MENU SECTION ═══════════ */}
      <section className="pb-24 max-w-7xl mx-auto px-6">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="transition-all duration-300"
              style={{
                padding: '10px 24px',
                fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: activeCategory === cat.key ? 'var(--gold)' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === cat.key ? 'var(--gold)' : 'var(--border)'}`,
                background: activeCategory === cat.key ? 'rgba(201,168,76,0.08)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {t.restaurant.categories[i] || cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 text-left mb-24">
          {filteredMenu.map(item => (
            <div
              key={item.id}
              className="menu-card luxury-card group overflow-hidden flex flex-col"
              style={{ opacity: 0 }}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, transparent 60%)' }} />
                <span
                  className="absolute bottom-4 left-4 backdrop-blur-sm"
                  style={{
                    fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
                    color: 'var(--gold)', background: 'rgba(0,0,0,0.7)',
                    padding: '5px 12px', fontFamily: 'Montserrat', fontWeight: 600,
                  }}
                >
                  {item.category}
                </span>
                <span
                  className="absolute bottom-4 right-4"
                  style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 500, color: '#f5f0e8' }}
                >
                  {item.price} DZD
                </span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3
                  className="group-hover:text-[var(--gold)] transition-colors duration-300"
                  style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}
                >
                  {item.name}
                </h3>
                <p style={{ fontFamily: 'Montserrat', fontSize: '11px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.7, flexGrow: 1 }}>
                  {item.desc}
                </p>

                <button
                  onClick={() => addToCart(item)}
                  className="mt-5 flex items-center justify-between transition-all duration-300"
                  style={{
                    padding: '12px 0', borderTop: '1px solid var(--border)',
                    fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: 'var(--gold)', cursor: 'pointer', background: 'none', border: 'none',
                    borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--border)',
                  }}
                >
                  <span>{t.restaurant.orderRoom}</span>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════ RESERVATION & ROOM SERVICE ═══════════ */}
        <div ref={reservationRef} style={{ opacity: 0 }}>
          <div className="luxury-card p-0 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            {/* Form Side */}
            <div className="p-10 lg:p-16 flex flex-col justify-center">
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {t.restaurant.reserveTable}
              </h3>
              <p style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>
                Reserve a table at L'Aura Noire or order directly to your suite using our 24/7 concierge service.
              </p>

              {/* Toggle */}
              <div className="flex p-1 mb-8" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setReservationType('table')}
                  className="flex-1 py-3 transition-all duration-300"
                  style={{
                    fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                    background: reservationType === 'table' ? 'var(--gold)' : 'transparent',
                    color: reservationType === 'table' ? '#0a0a0a' : 'var(--text-muted)',
                  }}
                >
                  {t.restaurant.tableRes}
                </button>
                <button
                  onClick={() => setReservationType('room')}
                  className="flex-1 py-3 transition-all duration-300"
                  style={{
                    fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                    background: reservationType === 'room' ? 'var(--gold)' : 'transparent',
                    color: reservationType === 'room' ? '#0a0a0a' : 'var(--text-muted)',
                  }}
                >
                  {t.restaurant.roomService}
                </button>
              </div>

              <form className="space-y-5" onSubmit={reservationType === 'table' ? (e: React.FormEvent) => { e.preventDefault(); } : handleRoomServiceOrder}>
                {reservationType === 'table' ? (
                  <>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      {['datetime', 'tables', 'confirm'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                            style={{
                              background: tableBookingStep === s ? 'var(--gold)' : 'transparent',
                              color: tableBookingStep === s ? '#0a0a0a' : 'var(--text-muted)',
                              border: `1px solid ${tableBookingStep === s ? 'var(--gold)' : 'var(--border)'}`,
                            }}
                          >
                            {i + 1}
                          </div>
                          {i < 2 && <div className="w-8 h-px" style={{ background: 'var(--border)' }} />}
                        </div>
                      ))}
                    </div>

                    {/* STEP 1: Date, Time, Guests */}
                    {tableBookingStep === 'datetime' && (
                      <div className="space-y-5 animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.date}</label>
                            <input type="date" value={resDate} onChange={e => setResDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="luxury-input w-full" style={{ background: 'rgba(0,0,0,0.3)' }} required />
                          </div>
                          <div>
                            <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.time}</label>
                            <select value={resTime} onChange={e => setResTime(e.target.value)} className="luxury-input w-full" style={{ background: 'rgba(0,0,0,0.3)' }} required>
                              {['18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(tt => (
                                <option key={tt} value={tt}>{tt}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.adults}</label>
                            <select value={resAdults} onChange={e => setResAdults(e.target.value)} className="luxury-input w-full" style={{ background: 'rgba(0,0,0,0.3)' }} required>
                              {[1,2,3,4,5,6,8].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.children}</label>
                            <select value={resChildren} onChange={e => setResChildren(e.target.value)} className="luxury-input w-full" style={{ background: 'rgba(0,0,0,0.3)' }}>
                              {[0,1,2,3,4,5].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'Child' : 'Children'}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {tableBookingError && (
                          <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs animate-fade-in-up">
                            <AlertTriangle size={14} /> {tableBookingError}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleCheckAvailability}
                          disabled={checkingAvailability}
                          className="btn-luxury w-full justify-center mt-4 flex items-center gap-2"
                        >
                          {checkingAvailability ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                          {checkingAvailability ? 'Checking...' : 'Check Availability'}
                        </button>
                      </div>
                    )}

                    {/* STEP 2: Select Table */}
                    {tableBookingStep === 'tables' && (
                      <div className="space-y-4 animate-fade-in-up">
                        <div className="flex items-center justify-between">
                          <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {resDate} • {resTime} • {parseInt(resAdults) + parseInt(resChildren)} guests
                          </p>
                          <button
                            type="button"
                            onClick={() => { setTableBookingStep('datetime'); setSelectedTable(null); setTableBookingError(''); }}
                            className="text-[9px] uppercase tracking-widest text-gold hover:text-white transition-colors"
                          >
                            Change
                          </button>
                        </div>
                        <p style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                          Available Tables ({availableTables.length})
                        </p>
                        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                          {availableTables.map(table => (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => handleSelectTable(table)}
                              className="w-full p-4 border text-left transition-all duration-300 hover:border-[var(--gold)] hover:bg-[rgba(201,168,76,0.05)] group"
                              style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                                    <MapPin size={16} className="text-gold" />
                                  </div>
                                  <div>
                                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                      Table {table.numero_table}
                                    </p>
                                    <p style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'var(--text-muted)' }}>
                                      {table.emplacement || 'Main Hall'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-text-muted group-hover:text-gold transition-colors">
                                  <Users size={14} />
                                  <span style={{ fontFamily: 'Montserrat', fontSize: '11px' }}>{table.capacite} seats</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Confirm */}
                    {tableBookingStep === 'confirm' && selectedTable && (
                      <div className="space-y-5 animate-fade-in-up">
                        <div className="p-4 border border-gold/30 bg-gold/5">
                          <p style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>
                            Reservation Summary
                          </p>
                          <div className="space-y-2 text-xs" style={{ fontFamily: 'Montserrat' }}>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Table</span><span style={{ color: 'var(--text-primary)' }}>Table {selectedTable.numero_table} — {selectedTable.emplacement || 'Main Hall'}</span></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Date</span><span style={{ color: 'var(--text-primary)' }}>{resDate}</span></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Time</span><span style={{ color: 'var(--text-primary)' }}>{resTime}</span></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Guests</span><span style={{ color: 'var(--text-primary)' }}>{resAdults} Adults, {resChildren} Children</span></div>
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.specialRequests}</label>
                          <textarea
                            rows={2}
                            value={resRequests}
                            onChange={e => setResRequests(e.target.value)}
                            placeholder="Dietary requirements, occasion..."
                            className="luxury-input w-full resize-none"
                            style={{ background: 'rgba(0,0,0,0.3)' }}
                          />
                        </div>
                        {tableBookingError && (
                          <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs animate-fade-in-up">
                            <AlertTriangle size={14} /> {tableBookingError}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setTableBookingStep('tables')}
                            className="flex-1 py-3 text-[10px] tracking-widest uppercase border text-text-muted hover:text-white transition-colors"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmTableBooking}
                            disabled={paymentLoading}
                            className="btn-luxury flex-1 justify-center flex items-center gap-2"
                          >
                            {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            {paymentLoading ? 'Saving...' : t.restaurant.confirmBooking}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.roomNumber}</label>
                      <input
                        type="text"
                        placeholder="E.g. 405"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                        className="luxury-input w-full"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                        required
                      />
                    </div>
                    {cart.length > 0 ? (
                      <div style={{ border: '1px solid var(--border)', padding: '16px' }}>
                        <p style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '12px' }}>
                          Your Order ({cartCount} items)
                        </p>
                        {cart.map(c => (
                          <div key={c.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(42,42,42,0.5)' }}>
                            <span style={{ fontFamily: 'Montserrat', fontSize: '11px', color: 'var(--text-secondary)' }}>{c.name} × {c.qty}</span>
                            <span style={{ fontFamily: 'Montserrat', fontSize: '11px', color: 'var(--text-primary)' }}>{c.price * c.qty} DZD</span>
                          </div>
                        ))}
                        <div className="flex justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--gold)' }}>
                          <span style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</span>
                          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 500, color: 'var(--gold)' }}>{cartTotal} DZD</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '24px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 300 }}>
                          {t.restaurant.emptyCart}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.restaurant.specialRequests}</label>
                      <textarea
                        rows={2}
                        value={roomServiceNotes}
                        onChange={e => setRoomServiceNotes(e.target.value)}
                        placeholder="Dietary requirements or special notes..."
                        className="luxury-input w-full resize-none"
                        style={{ background: 'rgba(0,0,0,0.3)' }}
                      />
                    </div>
                    {roomServiceError && (
                      <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs animate-fade-in-up">
                        <AlertTriangle size={14} />
                        {roomServiceError}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn-luxury w-full justify-center mt-4"
                      style={{ gap: '10px', opacity: cart.length === 0 ? 0.5 : 1, pointerEvents: cart.length === 0 ? 'none' : 'auto' }}
                    >
                      <ConciergeBell size={16} /> {t.restaurant.placeOrder}
                    </button>
                  </>
                )}
              </form>
            </div>

            {/* Image Side */}
            <div className="relative h-[400px] lg:h-auto overflow-hidden">
              <img
                src="https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Restaurant Interior"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--card-bg) 0%, transparent 40%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FLOATING CART BUTTON ═══════════ */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 left-6 z-40 flex items-center gap-3 animate-scale-in"
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #9a7a2e, #c9a84c)',
            color: '#0a0a0a',
            fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
            boxShadow: '0 8px 30px rgba(201,168,76,0.4)',
            border: 'none', cursor: 'pointer',
          }}
        >
          <ShoppingBag size={16} />
          {cartCount} Items · {cartTotal} DZD
        </button>
      )}

      {/* ═══════════ CART OVERLAY ═══════════ */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div
            className="luxury-card w-full max-w-md mx-6 animate-scale-in"
            style={{ maxHeight: '80vh', overflow: 'auto', padding: '32px' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '26px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Room Service Order
              </h3>
              <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {cart.map(c => (
              <div key={c.id} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</p>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: 'var(--text-muted)' }}>{c.price} DZD each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => removeFromCart(c.id)}
                    className="w-7 h-7 flex items-center justify-center transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', background: 'none' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: 'Montserrat', fontSize: '13px', color: 'var(--text-primary)', minWidth: '20px', textAlign: 'center' }}>
                    {c.qty}
                  </span>
                  <button
                    onClick={() => addToCart(menuItems.find(m => m.id === c.id)!)}
                    className="w-7 h-7 flex items-center justify-center transition-colors"
                    style={{ border: '1px solid var(--gold)', color: 'var(--gold)', cursor: 'pointer', background: 'none' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-6 mb-6 pt-4" style={{ borderTop: '1px solid var(--gold)' }}>
              <span style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 500, color: 'var(--gold)' }}>{cartTotal} DZD</span>
            </div>

            <button
              className="btn-luxury w-full justify-center"
              style={{ gap: '10px' }}
              onClick={() => {
                setCartOpen(false);
                // Scroll to room service form
                if (reservationRef.current) {
                  setReservationType('room');
                  reservationRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Utensils size={16} /> Proceed to Room Service
            </button>
          </div>
        </div>
      )}
      {/* ═══════════ TABLE BOOKING MODAL (Phone & Payment) ═══════════ */}
      {checkoutStep !== 'none' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="luxury-card w-full max-w-md relative overflow-hidden animate-scale-in" style={{ padding: '40px', borderColor: 'var(--gold)' }}>
            
            {checkoutStep === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Confirm Details
                  </h3>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Please verify your contact number for the reservation.
                  </p>
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneInfo}
                    onChange={e => setPhoneInfo(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="+213 555 123 456"
                    required
                  />
                </div>
                <button type="submit" className="btn-luxury w-full justify-center">
                  Proceed to Payment
                </button>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Secure Payment
                  </h3>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-muted)' }}>
                    A booking deposit of 50 DZD is required.
                  </p>
                </div>
                <div className="p-4 border border-border/50 bg-black/20 flex gap-4 items-center">
                  <CreditCard size={24} className="text-gold" />
                  <div>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '11px', fontWeight: 500, color: 'var(--text-primary)' }}>Reservation Deposit</p>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'var(--text-muted)' }}>Non-refundable</p>
                  </div>
                  <div className="ml-auto">
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', color: 'var(--gold)' }}>50 DZD</span>
                  </div>
                </div>
                <div className="space-y-4">
                   <input type="text" placeholder="Card Number" className="luxury-input w-full" />
                   <div className="grid grid-cols-2 gap-4">
                     <input type="text" placeholder="MM/YY" className="luxury-input w-full" />
                     <input type="text" placeholder="CVC" className="luxury-input w-full" />
                   </div>
                </div>
                <button onClick={processPayment} disabled={paymentLoading} className="btn-luxury w-full justify-center flex items-center gap-2">
                  {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                  {paymentLoading ? 'Processing...' : 'Pay Deposit & Confirm'}
                </button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center space-y-6 py-8 animate-fade-in-up">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: 'var(--text-primary)' }}>
                  Reservation Confirmed
                </h3>
                <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  We look forward to hosting you at L'Aura Noire.<br/>
                  Your booking reference has been sent to your email.
                </p>
              </div>
            )}
            
            {checkoutStep !== 'success' && !paymentLoading && (
              <button 
                onClick={() => setCheckoutStep('none')}
                className="absolute top-4 right-4 text-text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ ROOM SERVICE PAYMENT MODAL ═══════════ */}
      {roomServiceStep !== 'none' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="luxury-card w-full max-w-md relative overflow-hidden animate-scale-in" style={{ padding: '40px', borderColor: 'var(--gold)' }}>
            
            {roomServiceStep === 'payment' && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <ConciergeBell size={32} className="text-gold mx-auto mb-3" />
                  <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {t.restaurant.securePayment}
                  </h3>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Room {roomNumber} • {cartCount} items
                  </p>
                </div>

                {/* Order Summary */}
                <div className="p-4 border border-border/50 bg-black/20 space-y-2">
                  {cart.map(c => (
                    <div key={c.id} className="flex justify-between text-xs">
                      <span style={{ fontFamily: 'Montserrat', color: 'var(--text-secondary)' }}>{c.name} × {c.qty}</span>
                      <span style={{ fontFamily: 'Montserrat', color: 'var(--text-primary)' }}>{c.price * c.qty} DZD</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 mt-2" style={{ borderTop: '1px solid var(--gold)' }}>
                    <span style={{ fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.restaurant.total}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 500, color: 'var(--gold)' }}>{cartTotal} DZD</span>
                  </div>
                </div>

                {/* Card Fields */}
                <div className="space-y-4">
                  <input type="text" placeholder={t.restaurant.cardNumber} className="luxury-input w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder={t.restaurant.expiry} className="luxury-input w-full" />
                    <input type="text" placeholder={t.restaurant.cvc} className="luxury-input w-full" />
                  </div>
                </div>

                <button onClick={processRoomServicePayment} disabled={roomServiceLoading} className="btn-luxury w-full justify-center flex items-center gap-2">
                  {roomServiceLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {roomServiceLoading ? 'Processing...' : `Pay ${cartTotal} DZD & Confirm`}
                </button>
              </div>
            )}

            {roomServiceStep === 'success' && (
              <div className="text-center space-y-6 py-8 animate-fade-in-up">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
                <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '32px', color: 'var(--text-primary)' }}>
                  Order Confirmed
                </h3>
                <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Your room service order has been placed successfully.<br/>
                  Our team will deliver to your room shortly.
                </p>
              </div>
            )}
            
            {roomServiceStep !== 'success' && !roomServiceLoading && (
              <button 
                onClick={() => setRoomServiceStep('none')}
                className="absolute top-4 right-4 text-text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
