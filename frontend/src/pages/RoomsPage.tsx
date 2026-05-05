import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowRight, Maximize, 
  Users, Search, Calendar, 
  Filter, X, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chambre } from '../types';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { format } from 'date-fns';

gsap.registerPlugin(ScrollTrigger);

export default function RoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  const TYPE_LABELS: Record<string, string> = {
    standard: t.rooms.standard,
    deluxe: t.rooms.deluxe,
    suite: t.rooms.suite,
    villa: t.rooms.villa,
  };
  
  // Search State
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [adults, setAdults] = useState(searchParams.get('adults') || '2');
  const [children, setChildren] = useState(searchParams.get('children') || '0');

  // Filter State
  const [filterType, setFilterType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [viewType, setViewType] = useState<string>('all');

  const roomsRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    const { data } = await supabase.from('chambres').select('*');
    if (data) setRooms(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ checkIn, checkOut, adults, children });
    // Scroll to results
    roomsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesType = filterType === 'all' || room.type_chambre === filterType;
      const matchesPrice = room.prix_base_nuit <= priceRange;
      const matchesCapacity = (room.capacite_adultes + room.capacite_enfants) >= (parseInt(adults) + parseInt(children));
      const matchesView = viewType === 'all' || (room.vue && room.vue.toLowerCase().includes(viewType.toLowerCase()));
      const isAvailable = room.statut === 'disponible'; // In a real app, we'd check against bookings table for checkIn/checkOut dates
      
      return matchesType && matchesPrice && matchesCapacity && matchesView && isAvailable;
    });
  }, [rooms, filterType, priceRange, adults, children, viewType]);

  useGSAP(() => {
    if (heroTextRef.current) {
      gsap.fromTo(heroTextRef.current.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );
    }
    if (searchBoxRef.current) {
      gsap.fromTo(searchBoxRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)', delay: 0.6 }
      );
    }
  }, []);

  useGSAP(() => {
    if (!loading && roomsRef.current) {
      const cards = roomsRef.current.querySelectorAll('.room-card');
      gsap.fromTo(cards,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: roomsRef.current, start: 'top 85%' } }
      );
    }
  }, [loading, filteredRooms]);

  return (
    <div className="min-h-screen pt-20 bg-bg">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1920" 
            className="w-full h-full object-cover brightness-50"
            alt="Velora Palace"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-bg" />
        </div>

        <div ref={heroTextRef} className="relative z-10 text-center px-6">
          <p className="section-eyebrow mb-4 tracking-[0.4em]">{t.rooms.eyebrow}</p>
          <h1 className="text-4xl md:text-7xl font-display text-white mb-6">{t.rooms.title}</h1>
          <p className="max-w-2xl mx-auto text-text-muted font-light text-sm md:text-base leading-relaxed">
            {t.rooms.desc}
          </p>
        </div>
      </section>

      {/* ═══════════ SEARCH BOX ═══════════ */}
      <section className="relative z-20 px-6 -mt-16 mb-20">
        <div ref={searchBoxRef} className="max-w-6xl mx-auto glass-gold p-8 md:p-10 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3 font-semibold">
                <Calendar size={12}/> Check-In
              </label>
              <input 
                type="date" 
                value={checkIn} 
                onChange={e => setCheckIn(e.target.value)}
                required
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-xs outline-none focus:border-gold transition-colors"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3 font-semibold">
                <Calendar size={12}/> {t.common.checkOut}
              </label>
              <input 
                type="date" 
                value={checkOut} 
                onChange={e => setCheckOut(e.target.value)}
                required
                className="w-full bg-black/40 border border-border/50 text-white p-3 text-xs outline-none focus:border-gold transition-colors"
                min={checkIn || format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3 font-semibold">
                  <Users size={12}/> {t.rooms.adults}
                </label>
                <select 
                  value={adults} 
                  onChange={e => setAdults(e.target.value)}
                  className="w-full bg-black/40 border border-border/50 text-white p-3 text-xs outline-none focus:border-gold transition-colors appearance-none"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-bg">{n}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold mb-3 font-semibold">
                  <Users size={12}/> {t.rooms.kids}
                </label>
                <select 
                  value={children} 
                  onChange={e => setChildren(e.target.value)}
                  className="w-full bg-black/40 border border-border/50 text-white p-3 text-xs outline-none focus:border-gold transition-colors appearance-none"
                >
                  {[0,1,2,3,4].map(n => <option key={n} value={n} className="bg-bg">{n}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full btn-luxury flex items-center justify-center gap-3 py-4 shadow-gold">
                <Search size={18} /> {t.rooms.findSanctuary}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4 space-y-10 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display text-text-primary flex items-center gap-2">
                <Filter size={18} className="text-gold" /> {t.rooms.filters}
              </h3>
              <button 
                onClick={() => { setFilterType('all'); setPriceRange(100000); setViewType('all'); }}
                className="text-[10px] uppercase tracking-widest text-text-muted hover:text-gold transition-colors"
              >
                {t.rooms.reset}
              </button>
            </div>

            {/* Room Type */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{t.rooms.roomCategory}</p>
              <div className="flex flex-col gap-2">
                {['all', 'standard', 'deluxe', 'suite', 'villa'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`text-left px-4 py-3 text-xs tracking-widest uppercase transition-all duration-300 border ${
                      filterType === type ? 'border-gold bg-gold/10 text-gold' : 'border-border/30 text-text-muted hover:border-gold/30'
                    }`}
                  >
                    {type === 'all' ? t.rooms.allCollections : TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{t.rooms.maxPrice}: {priceRange.toLocaleString()} DZD</p>
              <input 
                type="range" 
                min="300" 
                max="100000" 
                step="500"
                value={priceRange}
                onChange={e => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-gold bg-border/20 h-1 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-text-muted tracking-widest font-black uppercase">
                <span>300 DZD</span>
                <span>100,000+ DZD</span>
              </div>
            </div>

            {/* View Type */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{t.rooms.desiredVista}</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'Garden', 'City', 'Ocean', 'Panoramic'].map(view => (
                  <button
                    key={view}
                    onClick={() => setViewType(view)}
                    className={`px-3 py-2 text-[9px] uppercase tracking-widest border transition-colors ${
                      viewType === view ? 'border-gold text-gold bg-gold/5' : 'border-border/30 text-text-muted hover:border-gold/30'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Room Listings */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-border/30">
               <p className="text-xs text-text-muted font-light tracking-wide">
                 {t.rooms.showing} <span className="text-gold font-medium">{filteredRooms.length}</span> {t.rooms.results}
               </p>
               <div className="flex items-center gap-2 text-[10px] uppercase tracking-tighter text-text-muted">
                 {t.rooms.sort}: <span className="text-text-primary flex items-center gap-1 cursor-pointer hover:text-gold transition-colors">{t.rooms.priceHighLow} <ChevronDown size={14}/></span>
               </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-widest text-gold animate-pulse">{t.rooms.curating}</p>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div ref={roomsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredRooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="room-card group luxury-card p-0 overflow-hidden flex flex-col hover:border-gold/40 transition-all duration-500 hover:-translate-y-2 shadow-xl"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                       <img 
                        src={room.image_urls?.[0] || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                        alt={room.numero_chambre} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                       <div className="absolute top-4 right-4">
                         <span className="backdrop-blur-md bg-black/30 border border-gold/30 text-gold text-[8px] uppercase tracking-[0.3em] px-4 py-2 font-bold">
                           {TYPE_LABELS[room.type_chambre] || room.type_chambre}
                         </span>
                       </div>
                       <div className="absolute bottom-4 left-6 flex gap-6 text-[10px] text-white/80 font-light">
                          <span className="flex items-center gap-1.5"><Maximize size={12} className="text-gold" /> {room.superficie_m2}m²</span>
                          <span className="flex items-center gap-1.5"><Users size={12} className="text-gold" /> Max {room.capacite_adultes + room.capacite_enfants}</span>
                       </div>
                    </div>
                    
                    <div className="p-8 flex-grow flex flex-col bg-black-soft/30">
                       <h3 className="text-2xl font-display text-text-primary mb-3 group-hover:text-gold transition-colors">Chambre {room.numero_chambre}</h3>
                       <p className="text-xs text-text-muted font-light leading-relaxed mb-6 flex-grow line-clamp-3">
                         {t.rooms.roomDesc}
                       </p>
                       
                       <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/30">
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-text-muted mb-1">{t.rooms.startingFrom}</p>
                            <p className="text-2xl font-display text-white">
                              {room.prix_base_nuit.toLocaleString()} DZD
                              <span className="text-[10px] font-sans text-text-muted font-light uppercase tracking-tighter ml-1"> /{t.common.perNight.replace('per night', 'night').replace('par nuit', 'nuit').replace('في الليلة', 'ليلة')}</span>
                            </p>
                          </div>
                          <Link 
                            to={`/booking?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${parseInt(adults)+parseInt(children)}`}
                            className="w-12 h-12 flex items-center justify-center border border-gold text-gold rounded-full hover:bg-gold hover:text-black transition-all group/btn duration-500"
                          >
                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gold/5 border border-gold/20 rounded-full flex items-center justify-center mb-6">
                   <X className="text-gold" size={32} />
                </div>
                <h3 className="text-2xl font-display text-white mb-2">{t.rooms.noMatches}</h3>
                <p className="text-text-muted text-sm font-light max-w-sm mx-auto">
                    {t.rooms.noMatchesDesc}
                </p>
                <button 
                  onClick={() => { setFilterType('all'); setPriceRange(100000); setViewType('all'); }}
                  className="mt-8 btn-outline-luxury"
                >
                  {t.rooms.clearFilters}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
