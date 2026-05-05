import { useEffect, useRef } from 'react';
import { Dumbbell, Waves, Wifi, Car, Shield, Clock, Tag, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    img: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Serenity Spa',
    desc: 'Indulge in ancient wellness rituals and bespoke therapies. Our 3,000 sqm sanctuary features twelve private treatment rooms, a Hammam experience, and therapists trained in La Mer and Sisley techniques. Rejuvenate your mind, body, and soul.',
    startTime: '08:00',
    endTime: '22:00',
    price: 'From 150 DZD',
    icon: Sparkles,
  },
  {
    img: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Infinity Pool',
    desc: 'Swim among the clouds in our rooftop temperature-controlled infinity pool overlooking the Mediterranean. Private cabanas, poolside champagne service, and dedicated attendants ensure a sublime aquatic experience.',
    startTime: '06:00',
    endTime: '22:00',
    price: 'Complimentary',
    icon: Waves,
  },
  {
    img: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Fitness Atelier',
    desc: 'A state-of-the-art gymnasium equipped with Technogym Artis machines, a dedicated yoga studio with panoramic sea views, personal training sessions, and a cold plunge recovery suite. Towels and refreshments provided.',
    startTime: '05:30',
    endTime: '23:00',
    price: 'Complimentary',
    icon: Dumbbell,
  },
  {
    img: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Chauffeur Fleet',
    desc: 'Travel the French Riviera in our exclusive fleet of Rolls-Royce Phantom and Maybach vehicles with your dedicated personal driver. Airport transfers, city tours, and day excursions to Monaco and Cannes available.',
    startTime: '00:00',
    endTime: '23:59',
    price: 'From 100 DZD/hr',
    icon: Car,
  },
  {
    img: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Business Lounge',
    desc: 'State-of-the-art facilities for our executive guests. Private meeting rooms with video conferencing, high-speed dedicated connectivity, multilingual secretarial services, and complimentary gourmet refreshments.',
    startTime: '07:00',
    endTime: '23:00',
    price: 'Complimentary for Suites',
    icon: Wifi,
  },
  {
    img: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200',
    title: 'Private Beach Club',
    desc: 'Exclusive access to our pristine private beach with sun loungers, Balinese daybeds, water sports equipment, and a beachside cocktail bar. Snorkeling, paddleboarding, and jet skiing available with certified instructors.',
    startTime: '07:00',
    endTime: '20:00',
    price: 'From 75 DZD/day',
    icon: Waves,
  },
];

export default function ServicesPage() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxBgRef = useRef<HTMLDivElement>(null);
  const parallaxRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const amenitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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

  /* ── Alternating text reveals + image parallax ── */
  useGSAP(() => {
    textRefs.current.forEach((el, index) => {
      if (el) {
        gsap.fromTo(el,
          { x: index % 2 === 0 ? 60 : -60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          }
        );
      }
    });

    parallaxRefs.current.forEach(img => {
      if (img) {
        gsap.to(img, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    });
  }, []);

  /* ── Amenities stagger ── */
  useGSAP(() => {
    if (amenitiesRef.current) {
      gsap.fromTo(amenitiesRef.current.children,
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: amenitiesRef.current, start: 'top 85%' },
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg)' }}>
      {/* ═══════════ CINEMATIC HERO ═══════════ */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div
          ref={parallaxBgRef}
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 50%, var(--bg) 100%)' }} />
        <div className="absolute inset-0 vignette" />

        <div ref={heroRef} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p className="section-eyebrow mb-4" style={{ letterSpacing: '6px', opacity: 0 }}>{t.services.eyebrow}</p>
          <div className="w-16 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0 }} />
          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              fontWeight: 300,
              color: '#f5f0e8',
              letterSpacing: '0.06em',
              opacity: 0,
            }}
          >
            {t.services.title}
          </h1>
          <p
            style={{
              fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 300,
              color: 'rgba(245,240,232,0.7)', maxWidth: '520px', margin: '20px auto 0',
              lineHeight: 1.9, opacity: 0,
            }}
          >
            {t.services.desc}
          </p>
        </div>
      </section>

      {/* ═══════════ ALTERNATING SERVICE SECTIONS ═══════════ */}
      <section ref={containerRef} className="max-w-7xl mx-auto px-6 pb-32 pt-16 flex flex-col gap-28 lg:gap-36">
        {SERVICES.map((s, i) => (
          <div
            key={i}
            className={`flex flex-col md:flex-row gap-10 lg:gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Image Side with Parallax */}
            <div
              className="w-full md:w-1/2 overflow-hidden relative luxury-card p-0 rounded-none"
              style={{ height: '480px' }}
            >
              <img
                ref={el => { parallaxRefs.current[i] = el; }}
                src={s.img}
                alt={s.title}
                className="w-full object-cover scale-105"
                style={{ height: '130%', marginTop: '-15%' }}
              />
              <div className="absolute inset-0 transition-all duration-700" style={{ background: 'rgba(0,0,0,0.15)' }} />
              {/* Gold corner accent */}
              <div className="absolute top-0 left-0 w-16 h-16" style={{ borderTop: '2px solid var(--gold)', borderLeft: '2px solid var(--gold)' }} />
              <div className="absolute bottom-0 right-0 w-16 h-16" style={{ borderBottom: '2px solid var(--gold)', borderRight: '2px solid var(--gold)' }} />
            </div>

            {/* Content Side */}
            <div
              ref={el => { textRefs.current[i] = el; }}
              className="w-full md:w-1/2 flex flex-col justify-center px-2 md:px-8"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ border: '1px solid rgba(201,168,76,0.3)' }}
                >
                  <s.icon size={18} style={{ color: 'var(--gold)' }} />
                </div>
                <p className="section-eyebrow" style={{ fontSize: '9px', letterSpacing: '4px' }}>
                  {String(i + 1).padStart(2, '0')} — Experience
                </p>
              </div>

              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.03em' }}>
                {t.services.titles[i] || s.title}
              </h3>
              <p style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 2, marginBottom: '28px' }}>
                {t.services.descs[i] || s.desc}
              </p>

              {/* Time & Price */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div className="flex items-center gap-3">
                  <Clock size={18} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hours</p>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-primary)', letterSpacing: '1px' }}>
                      {s.startTime === '00:00' && s.endTime === '23:59' ? '24/7 Available' : `${s.startTime} — ${s.endTime}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag size={18} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pricing</p>
                    <p style={{ fontFamily: 'Montserrat', fontSize: '12px', color: 'var(--text-primary)', letterSpacing: '1px' }}>
                      {s.price}
                    </p>
                  </div>
                </div>
              </div>

              <button className="btn-outline-luxury w-max" style={{ padding: '12px 30px' }}>
                <span>{t.services.bookService}</span>
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════ COMPLIMENTARY AMENITIES ═══════════ */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} className="py-24 text-center">
        <p className="section-eyebrow mb-4">{t.services.included}</p>
        <div className="w-12 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, color: 'var(--gold)', marginBottom: '48px' }}>
          {t.services.complimentary}
        </h2>

        <div ref={amenitiesRef} className="flex flex-wrap justify-center gap-12 md:gap-16 max-w-5xl mx-auto px-6">
          {[
            { icon: Shield, label: '24/7 Security' },
            { icon: Wifi, label: 'Premium Wi-Fi' },
            { icon: Dumbbell, label: 'Fitness Center' },
            { icon: Waves, label: 'Pool Access' },
            { icon: Car, label: 'Valet Parking' },
            { icon: Sparkles, label: 'Turndown Service' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center group cursor-pointer" style={{ opacity: 0 }}>
              <div
                className="w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <Icon size={24} strokeWidth={1} style={{ color: 'var(--gold)' }} />
              </div>
              <span
                className="transition-colors duration-300 group-hover:text-[var(--gold)]"
                style={{ fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600, letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
