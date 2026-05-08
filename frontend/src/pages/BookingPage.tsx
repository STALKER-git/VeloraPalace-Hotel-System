import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Chambre } from '../types';
import { COUNTRIES } from '../lib/countries';
import { ShieldCheck, ChevronRight, ChevronLeft, CreditCard, Wallet, Banknote, AlertCircle, CheckCircle, Tag, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ConfettiEffect from '../components/ConfettiEffect';
import BookingSuccessModal from '../components/BookingSuccessModal';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Step 1: Dates & Room
  const [roomId] = useState(searchParams.get('roomId') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [adults, setAdults] = useState(searchParams.get('guests') || searchParams.get('adults') || '2');
  const [children, setChildren] = useState(searchParams.get('children') || '0');
  const [room, setRoom] = useState<Chambre | null>(null);

  // Step 2: Personal Details
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState('');
  const [codePays, setCodePays] = useState('+213');
  const [passportId, setPassportId] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Promo code feedback
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const [promoMessage, setPromoMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');

  // Booking success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Availability
  const [availabilityError, setAvailabilityError] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Profile auto-fill
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (roomId) {
      supabase.from('chambres').select('*').eq('id', roomId).maybeSingle().then(({ data }) => {
        if (data) setRoom(data);
      });
    }
  }, [roomId]);

  // Auto-fill from profile
  useEffect(() => {
    if (user && !profileLoaded) {
      (async () => {
        const { data: profile } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('utilisateur_id', user.id)
          .maybeSingle();

        if (profile) {
          const name = `${profile.prenom || ''} ${profile.nom_utilisateur || ''}`.trim();
          if (name) setFullName(name);
          if (profile.telephone) setPhone(profile.telephone);
        }
        if (clientData) {
          if (clientData.document_identite) setPassportId(clientData.document_identite);
          if (clientData.date_naissance) setDateNaissance(clientData.date_naissance);
          if (clientData.code_pays) setCodePays(clientData.code_pays);
        }
        setProfileLoaded(true);
      })();
    }
  }, [user, profileLoaded]);

  // Check availability when dates change
  useEffect(() => {
    if (checkIn && checkOut && roomId) {
      checkAvailability();
    } else {
      setIsAvailable(null);
      setAvailabilityError('');
    }
  }, [checkIn, checkOut, roomId]);

  const checkAvailability = async () => {
    if (!roomId || !checkIn || !checkOut) return;

    const { data: conflicts, error } = await supabase
      .from('reservations_chambres')
      .select('id')
      .eq('chambre_id', roomId)
      .neq('statut', 'annulee')
      .lt('date_arrivee', checkOut)
      .gt('date_depart', checkIn);

    if (error) {
      console.error('Availability check error:', error);
      return;
    }

    if (conflicts && conflicts.length > 0) {
      setIsAvailable(false);
      setAvailabilityError('This room is already booked for the selected dates. Please choose different dates.');
    } else {
      setIsAvailable(true);
      setAvailabilityError('');
    }
  };

  useGSAP(() => {
    gsap.fromTo(formRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
    gsap.fromTo(summaryRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, { width: `${(step / 3) * 100}%`, duration: 0.6, ease: 'power3.inOut' });
    }
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, x: 10, scale: 0.99 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power2.out', clearProps: "all" });
    }
  }, [step]);

  const handleNext = () => {
    if (!user) {
      // Redirect to auth and come back after login
      navigate('/auth', { state: { from: window.location.pathname + window.location.search } });
      return;
    }
    if (step === 1) {
      if (!checkIn || !checkOut) { alert('Please select both Check-In and Check-Out dates.'); return; }
      if (isAvailable === false) { alert('This room is not available for the selected dates.'); return; }
    }
    if (step === 2) {
      // Validate age
      if (!dateNaissance) { alert('Please enter your date of birth.'); return; }
      const birth = new Date(dateNaissance);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age < 18) { alert('You must be at least 18 years old to make a reservation.'); return; }
      if (!phone || phone.length < 6) { alert('Please enter a valid phone number.'); return; }
      if (!passportId || passportId.length < 5) { alert('Please enter a valid ID/Passport number.'); return; }
    }
    setStep(prev => Math.min(prev + 1, 3));
  };
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoStatus('loading');
    setPromoMessage('');
    setBookingError('');
    
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: promoCode.trim()
      });

      if (error) throw error;

      const result = data?.[0];
      if (result?.valid) {
        setDiscountAmount(result.discount);
        setPromoStatus('valid');
        setPromoMessage(result.message);
        setAppliedPromoCode(promoCode.trim());
        // Trigger confetti!
        setShowConfetti(false);
        setTimeout(() => setShowConfetti(true), 50);
        // Animate the discount display
        gsap.fromTo('.promo-success-badge',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }
        );
      } else {
        setDiscountAmount(0);
        setPromoStatus('invalid');
        setPromoMessage(result?.message || 'Invalid promo code');
        setAppliedPromoCode('');
        // Shake animation on invalid
        gsap.fromTo('.promo-input-wrapper',
          { x: -8 },
          { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
        );
      }
    } catch (err: any) {
      setPromoStatus('invalid');
      setPromoMessage('Failed to validate promo code');
      setDiscountAmount(0);
      setAppliedPromoCode('');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    if (!user) { navigate('/auth'); return; }
    if (!roomId || !checkIn || !checkOut) { setBookingError('Booking details are incomplete.'); return; }
    if (isAvailable === false) { setBookingError('Room is not available for selected dates.'); return; }

    setIsSubmitting(true);
    try {
      // Update utilisateur
      const parts = fullName.trim().split(' ');
      const prenom = parts[0] || '';
      const nom = parts.slice(1).join(' ') || 'User';

      await supabase.from('utilisateurs').update({
        telephone: phone,
        nom_utilisateur: nom,
        prenom: prenom
      }).eq('id', user.id);

      // Create/Update client record
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('utilisateur_id', user.id)
        .maybeSingle();

      let clientId = clientRecord?.id;
      const clientPayload = {
        document_identite: passportId,
        date_naissance: dateNaissance || null,
        code_pays: codePays,
      };

      if (!clientId) {
        const { data: newClient, error: insertErr } = await supabase
          .from('clients')
          .insert({ ...clientPayload, utilisateur_id: user.id, points_fidelite: 0 })
          .select().single();
        if (insertErr) throw insertErr;
        clientId = newClient.id;
      } else {
        const { error: updateErr } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq('id', clientId);
        if (updateErr) throw updateErr;
      }

      // Final availability check
      const { data: lastCheck } = await supabase
        .from('reservations_chambres')
        .select('id')
        .eq('chambre_id', roomId)
        .neq('statut', 'annulee')
        .lt('date_arrivee', checkOut)
        .gt('date_depart', checkIn);

      if (lastCheck && lastCheck.length > 0) {
        throw new Error('Room just got booked. Please choose different dates.');
      }

      // Create reservation
      const ref = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error: resError } = await supabase.from('reservations_chambres').insert({
        reference_reservation: ref,
        date_arrivee: checkIn,
        date_depart: checkOut,
        nombre_adultes: parseInt(adults),
        nombre_enfants: parseInt(children),
        prix_nuit: room?.prix_base_nuit || 0,
        statut: 'en_attente',
        methode_paiement: paymentMethod,
        client_id: clientId,
        chambre_id: roomId,
        telephone_client: codePays + phone,
        code_pays_client: codePays,
        nom_complet_client: fullName,
        date_naissance_client: dateNaissance || null,
        document_identite_client: passportId,
      });

      if (resError) throw resError;

      // Increment promo code usage if one was applied
      if (appliedPromoCode) {
        await supabase.rpc('use_promo_code', { p_code: appliedPromoCode });
      }

      // Show success modal instead of alert
      setBookingRef(ref);
      setShowSuccessModal(true);
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];
  const days = (checkIn && checkOut) ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))) : 0;
  const subTotal = room && days ? room.prix_base_nuit * days : 0;
  const discount = (subTotal * discountAmount) / 100;
  const total = subTotal - discount;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-bg relative">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-black-soft to-bg z-0" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 pt-8">
          <p className="section-eyebrow mb-4 uppercase text-gold tracking-widest text-[10px]">Your Reservation</p>
          <div className="w-16 h-px bg-gold mb-6 mx-auto" />
          <h1 className="text-4xl md:text-6xl font-display text-white">Secure Your Stay</h1>
        </div>

        {/* Progress */}
        <div className="mb-16 max-w-3xl mx-auto">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] mb-4 font-semibold">
            <span className={step >= 1 ? 'text-gold' : 'text-text-muted'}>1. Stay Details</span>
            <span className={step >= 2 ? 'text-gold' : 'text-text-muted'}>2. Guest Info</span>
            <span className={step >= 3 ? 'text-gold' : 'text-text-muted'}>3. Payment</span>
          </div>
          <div className="w-full h-px bg-border relative">
            <div ref={progressRef} className="absolute top-[-1px] left-0 h-[3px] bg-gold" style={{ width: '33.33%', boxShadow: '0 0 10px rgba(201,168,76,0.5)' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2 luxury-card p-10 lg:p-14 min-h-[500px] bg-black-soft border border-border/50">
            <form onSubmit={step === 3 ? handleBooking : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6 h-full flex flex-col justify-between">
              <div ref={formRef}>
                {step === 1 && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-display text-white border-b border-border/50 pb-6">Stay Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Check-In</label>
                        <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} required className="luxury-input w-full bg-black/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Check-Out</label>
                        <input type="date" value={checkOut} min={checkIn || today} onChange={e => setCheckOut(e.target.value)} required className="luxury-input w-full bg-black/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Adults</label>
                        <select value={adults} onChange={e => setAdults(e.target.value)} required className="luxury-input w-full bg-black/50">
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Adult':'Adults'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Children</label>
                        <select value={children} onChange={e => setChildren(e.target.value)} className="luxury-input w-full bg-black/50">
                          {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} {n===1?'Child':'Children'}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Room Selection</label>
                        {roomId ? (
                          <div className="luxury-input w-full bg-black/50 text-text-primary flex items-center">Chambre {room?.numero_chambre || 'Loading...'}</div>
                        ) : (
                          <div className="luxury-input w-full bg-black/50 text-text-muted italic flex items-center">No room pre-selected</div>
                        )}
                      </div>
                    </div>
                    {/* Availability Status */}
                    {isAvailable === true && (
                      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs tracking-wider">
                        <CheckCircle size={16} /> Room is available for selected dates!
                      </div>
                    )}
                    {isAvailable === false && (
                      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wider">
                        <AlertCircle size={16} /> {availabilityError}
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-display text-white border-b border-border/50 pb-6">Guest Information</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Full Legal Name</label>
                        <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="luxury-input w-full bg-black/50" placeholder="As it appears on your ID" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Date of Birth <span className="text-gold">(Must be 18+)</span></label>
                        <input type="date" required value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} max={maxDob} className="luxury-input w-full bg-black/50" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Phone Number</label>
                          <div className="flex gap-2">
                            <select value={codePays} onChange={e => setCodePays(e.target.value)} className="luxury-input bg-black/50 !w-[110px] px-2 text-xs flex-shrink-0">
                              {COUNTRIES.map(c => (
                                <option key={c.code} value={c.dialCode}>{c.flag} {c.dialCode}</option>
                              ))}
                            </select>
                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="luxury-input flex-1 bg-black/50" placeholder="Phone number" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">National ID / Passport</label>
                          <input type="text" required value={passportId} onChange={e => setPassportId(e.target.value)} className="luxury-input w-full bg-black/50" placeholder="ID or Passport Number" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3">Special Requests (Optional)</label>
                        <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="luxury-input w-full bg-black/50 min-h-[100px] resize-none" placeholder="Late check-in, dietary requirements..." />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-display text-white border-b border-border/50 pb-6">Payment Method</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`border p-6 cursor-pointer flex flex-col items-center gap-4 transition-all duration-300 ${paymentMethod === 'credit_card' ? 'border-gold bg-gold/10' : 'border-border/50 hover:border-gold/30 bg-black/30'}`}>
                        <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="hidden" />
                        <CreditCard size={32} strokeWidth={1} className={paymentMethod === 'credit_card' ? 'text-gold' : 'text-text-muted'} />
                        <span className={`text-xs uppercase tracking-widest ${paymentMethod === 'credit_card' ? 'text-gold font-semibold' : 'text-text-muted'}`}>Credit Card</span>
                      </label>
                      <label className={`border p-6 cursor-pointer flex flex-col items-center gap-4 transition-all duration-300 ${paymentMethod === 'paypal' ? 'border-gold bg-gold/10' : 'border-border/50 hover:border-gold/30 bg-black/30'}`}>
                        <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="hidden" />
                        <Wallet size={32} strokeWidth={1} className={paymentMethod === 'paypal' ? 'text-gold' : 'text-text-muted'} />
                        <span className={`text-xs uppercase tracking-widest ${paymentMethod === 'paypal' ? 'text-gold font-semibold' : 'text-text-muted'}`}>PayPal</span>
                      </label>
                      <label className={`border p-6 cursor-pointer flex flex-col items-center gap-4 transition-all duration-300 ${paymentMethod === 'cash' ? 'border-gold bg-gold/10' : 'border-border/50 hover:border-gold/30 bg-black/30'}`}>
                        <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden" />
                        <Banknote size={32} strokeWidth={1} className={paymentMethod === 'cash' ? 'text-gold' : 'text-text-muted'} />
                        <span className={`text-xs uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-gold font-semibold' : 'text-text-muted'}`}>Upon Arrival</span>
                      </label>
                    </div>
                    {paymentMethod === 'credit_card' && (
                      <div className="space-y-4 pt-4 animate-fade-in-up">
                        <input type="text" placeholder="Card Number" className="luxury-input w-full bg-black/50" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="MM/YY" className="luxury-input w-full bg-black/50" />
                          <input type="text" placeholder="CVC" className="luxury-input w-full bg-black/50" />
                        </div>
                      </div>
                    )}

                    {/* Promo Code Section - Inline in Payment Step */}
                    <div className="pt-4 border-t border-border/30">
                      <label className="block text-[10px] uppercase text-text-secondary tracking-widest mb-3 flex items-center gap-2">
                        <Tag size={12} className="text-gold" /> Promo Code
                      </label>
                      <div className="promo-input-wrapper flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={e => { setPromoCode(e.target.value.toUpperCase()); if (promoStatus !== 'idle') { setPromoStatus('idle'); setPromoMessage(''); } }}
                            placeholder="Enter code"
                            className={`luxury-input w-full bg-black/50 text-sm font-mono tracking-widest pr-10 ${
                              promoStatus === 'valid' ? 'border-emerald-500/50' :
                              promoStatus === 'invalid' ? 'border-red-500/50' : ''
                            }`}
                            disabled={promoStatus === 'valid'}
                          />
                          {promoStatus === 'valid' && (
                            <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                          )}
                          {promoStatus === 'invalid' && (
                            <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                          )}
                        </div>
                        {promoStatus === 'valid' ? (
                          <button
                            type="button"
                            onClick={() => { setPromoCode(''); setPromoStatus('idle'); setPromoMessage(''); setDiscountAmount(0); setAppliedPromoCode(''); }}
                            className="text-[10px] px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 uppercase tracking-widest transition-all rounded"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={handleApplyPromo}
                            type="button"
                            disabled={promoStatus === 'loading' || !promoCode.trim()}
                            className="text-[10px] bg-gold text-black-soft px-4 py-2 font-semibold uppercase tracking-widest hover:bg-gold/90 transition-all rounded disabled:opacity-50"
                          >
                            {promoStatus === 'loading' ? '...' : 'Apply'}
                          </button>
                        )}
                      </div>
                      {/* Promo feedback */}
                      {promoMessage && (
                        <div className={`mt-3 flex items-center gap-2 text-xs ${
                          promoStatus === 'valid' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {promoStatus === 'valid' ? <Sparkles size={14} /> : <AlertCircle size={14} />}
                          {promoMessage}
                        </div>
                      )}
                      {promoStatus === 'valid' && (
                        <div className="promo-success-badge mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <Tag size={12} className="text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-semibold">{discountAmount}% OFF</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Error Display */}
              {bookingError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wider rounded mb-4">
                  <AlertCircle size={16} className="shrink-0" />
                  {bookingError}
                </div>
              )}

              <div className="pt-10 flex justify-between border-t border-border/50 mt-auto items-center">
                {step > 1 ? (
                  <button type="button" onClick={handlePrev} className="text-[10px] uppercase tracking-widest text-text-muted hover:text-gold flex items-center gap-2 transition-colors">
                    <ChevronLeft size={14} /> Previous Set
                  </button>
                ) : <div />}
                {step < 3 ? (
                  <button type="submit" className="btn-luxury flex items-center gap-3" disabled={step === 1 && isAvailable === false}>
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="btn-luxury flex items-center gap-3 shadow-[0_0_20px_rgba(201,168,76,0.3)]">
                    {isSubmitting ? 'Finalizing...' : 'Confirm Reservation'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div ref={summaryRef} className="luxury-card p-8 sticky top-28 bg-black-soft border border-border/50 shadow-2xl">
              <h3 className="text-xl font-display text-white border-b border-border/50 pb-4 mb-6">Reservation Summary</h3>
              {room ? (
                <div className="mb-6 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-sm overflow-hidden shrink-0">
                    <img src={room.image_urls?.[0]} alt={room.numero_chambre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-lg font-display text-gold mb-1 leading-none">Chambre {room.numero_chambre}</p>
                    <p className="text-[10px] uppercase tracking-widest text-text-muted">{room.prix_base_nuit} DZD / night</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted bg-black/30 p-3 border border-border/30">Select a room from the Rooms page.</p>
                </div>
              )}
              <div className="space-y-4 text-xs tracking-wider border-b border-border/50 pb-6 mb-6">
                <div className="flex justify-between text-text-secondary"><span>Check-In</span><span className="text-white">{checkIn || '--'}</span></div>
                <div className="flex justify-between text-text-secondary"><span>Check-Out</span><span className="text-white">{checkOut || '--'}</span></div>
                <div className="flex justify-between text-text-secondary"><span>Duration</span><span className="text-white">{days} Nights</span></div>
                <div className="flex justify-between text-text-secondary"><span>Adults</span><span className="text-white">{adults}</span></div>
                <div className="flex justify-between text-text-secondary"><span>Children</span><span className="text-white">{children}</span></div>
              </div>
              {step === 3 && (
                <div className="mb-6 border-b border-border/50 pb-6">
                  <p className="text-[9px] uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
                    <Tag size={10} className="text-gold" /> Promo Code
                  </p>
                  {promoStatus === 'valid' ? (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                      <CheckCircle size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-mono tracking-widest">{appliedPromoCode}</span>
                      <span className="text-emerald-400 text-[10px] ml-auto font-semibold">-{discountAmount}%</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter code" className="luxury-input bg-black/50 text-[10px] flex-1 min-w-0 px-3 py-2 font-mono tracking-widest" />
                      <button onClick={handleApplyPromo} type="button" disabled={promoStatus === 'loading' || !promoCode.trim()} className="text-[10px] bg-gold text-black-soft px-3 py-2 font-semibold uppercase tracking-widest disabled:opacity-50 rounded">Apply</button>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3 text-xs tracking-wider mb-8">
                <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span className="text-white">{subTotal.toLocaleString()} DZD</span></div>
                <div className="flex justify-between text-text-secondary"><span>Taxes & Fees (Included)</span><span className="text-white">0 DZD</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400"><span>Discount ({discountAmount}%)</span><span>-{discount.toLocaleString()} DZD</span></div>
                )}
              </div>
              <div className="flex justify-between items-end mb-8 pt-4 border-t border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-text-muted">Total Balance</span>
                <span className="text-3xl font-display text-gold leading-none">{total.toLocaleString()} DZD</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-text-muted justify-center border border-border/30 p-4 bg-black/40">
                <ShieldCheck size={16} className="text-gold" /> Secure 256-bit Encryption
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Effect for Promo Code */}
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Booking Success Modal */}
      {showSuccessModal && (
        <BookingSuccessModal
          reference={bookingRef}
          roomName={room ? `Chambre ${room.numero_chambre} (${room.type_chambre})` : ''}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={`${adults} Adults, ${children} Children`}
          total={total}
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/account');
          }}
        />
      )}
    </div>
  );
}
