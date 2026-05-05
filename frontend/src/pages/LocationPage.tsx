import { useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Navigation, Car } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function LocationPage() {
  const { t } = useLanguage();
  const headerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useGSAP(() => {
    // Parallax Header Background
    if (parallaxBgRef.current) {
        gsap.to(parallaxBgRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
    }

    // Hero text entrance
    if(headerRef.current) {
        gsap.fromTo(headerRef.current.children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out', delay: 0.2 }
        );
    }

    // Map and info side-by-side reveal
    if (mapRef.current && infoRef.current) {
      gsap.fromTo(mapRef.current,
        { x: -50, opacity: 0, scale: 0.95 },
        {
          x: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out',
          scrollTrigger: { trigger: mapRef.current, start: 'top 85%' }
        }
      );
      gsap.fromTo(infoRef.current.children,
        { x: 50, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, stagger:0.2, ease: 'power2.out', delay: 0.2,
          scrollTrigger: { trigger: infoRef.current, start: 'top 85%' }
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-bg">
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          ref={parallaxBgRef}
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-bg" />
        <div ref={headerRef} className="relative z-10 text-center px-6">
          <p className="section-eyebrow mb-4 uppercase text-gold tracking-widest text-xs">{t.location.eyebrow}</p>
          <div className="w-16 h-px bg-gold mb-6 mx-auto" />
          <h1 className="text-5xl md:text-7xl font-display text-text-primary mb-6">{t.location.title}</h1>
          <p className="text-text-muted text-sm font-light leading-relaxed max-w-2xl mx-auto opacity-90">
            {t.location.desc}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div ref={mapRef} className="luxury-card p-0 overflow-hidden h-[600px] border border-gold/20 relative group">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11545.923485073099!2d7.268712213795554!3d43.700935105273395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12cddab7066bc4e1%3A0x3e1577903bd8d3f7!2sNice%2C%20France!5e0!3m2!1sen!2sus!4v1704207198754!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(1) contrast(1.1) brightness(0.6) sepia(0.3) hue-rotate(15deg)' }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="transition-all duration-1000"
            onMouseEnter={e => { (e.target as HTMLIFrameElement).style.filter = 'grayscale(0.3) contrast(1) brightness(0.8)'; }}
            onMouseLeave={e => { (e.target as HTMLIFrameElement).style.filter = 'grayscale(1) contrast(1.1) brightness(0.6) sepia(0.3) hue-rotate(15deg)'; }}
          />
          <div className="absolute inset-0 pointer-events-none border border-gold/10" />
        </div>

        <div ref={infoRef} className="flex flex-col gap-12">
          <div>
            <h3 className="text-3xl font-display text-text-primary mb-6 tracking-wide">{t.location.contactInfo}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 border border-border/50 hover:border-gold/30 transition-colors bg-black-soft/50">
                <MapPin className="text-gold mt-1 shrink-0" size={24} strokeWidth={1} />
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">{t.location.address}</p>
                    <p className="text-sm text-text-muted whitespace-pre-line">{t.location.addressVal}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-border/50 hover:border-gold/30 transition-colors bg-black-soft/50">
                <Phone className="text-gold mt-1 shrink-0" size={24} strokeWidth={1} />
                <div>
                     <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">{t.location.telephone}</p>
                     <p className="text-sm text-text-muted">{t.location.telVal}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-border/50 hover:border-gold/30 transition-colors bg-black-soft/50">
                <Mail className="text-gold mt-1 shrink-0" size={24} strokeWidth={1} />
                <div>
                     <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">{t.location.email}</p>
                     <p className="text-sm text-text-muted">{t.location.emailVal}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-display text-text-primary mb-6 tracking-wide">{t.location.transportProtocol}</h3>
            <p className="text-sm text-text-muted font-light leading-relaxed mb-6">
              {t.location.transportDesc}
            </p>
            <div className="flex gap-4">
              <button className="flex-1 btn-outline-luxury flex items-center justify-center gap-2 text-xs">
                 <Car size={16} /> {t.location.reqTransfer}
              </button>
              <button className="flex-1 btn-luxury flex items-center justify-center gap-2 text-xs">
                 <Navigation size={16} /> {t.location.getDirections}
              </button>
            </div>
          </div>

          <div className="luxury-card p-8 bg-black-soft border border-border">
            <p className="text-[10px] text-gold uppercase tracking-widest mb-6">{t.location.distances}</p>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-sm text-text-primary font-light">{t.location.beach}</span>
                  <span className="text-xs text-text-muted italic">{t.location.mins2}</span>
               </div>
               <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-sm text-text-primary font-light">{t.location.oldTown}</span>
                  <span className="text-xs text-text-muted italic">{t.location.mins10}</span>
               </div>
               <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-sm text-text-primary font-light">{t.location.airport}</span>
                  <span className="text-xs text-text-muted italic">{t.location.mins15}</span>
               </div>
               <div className="flex justify-between items-center pb-0 border-b-0 border-border/30">
                  <span className="text-sm text-text-primary font-light">{t.location.monaco}</span>
                  <span className="text-xs text-text-muted italic">{t.location.mins35}</span>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
