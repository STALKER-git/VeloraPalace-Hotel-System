import { Link, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { t } = useLanguage();
  const gridRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useGSAP(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    // Small delay to let page transitions and DOM updates finish
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <footer
      className="relative pt-20 pb-10"
      style={{ background: 'var(--black-soft)', borderTop: '1px solid var(--border)' }}
    >
      {/* Gold top accent */}
      <div className="absolute top-0 left-0 right-0 h-px gold-divider" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center mb-6" style={{ width: '45px', filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.25))' }}>
              <img src="/logo/tete 1.svg" alt="" style={{ width: '100%', marginBottom: '1px', transform: 'translateX(-3px)' }} />
              <img src="/logo/V.svg" alt="" style={{ width: '14px', marginTop: '1px', marginBottom: '1px' }} />
              <img src="/logo/body 1.svg" alt="" style={{ width: '100%', marginBottom: '2px' }} />
              <img src="/logo/VELORA.svg" alt="Velora" style={{ width: '40px', marginBottom: '1px' }} />
              <img src="/logo/PALACE.svg" alt="Palace" style={{ width: '24px' }} />
            </div>
            <p style={{ fontFamily: 'Montserrat', fontSize: '12px', lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: 300 }}>
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-4 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2 transition-all duration-200 hover:scale-110"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="section-eyebrow mb-6">{t.footer.explore}</h4>
            <ul className="space-y-3">
              {[
                { to: '/rooms', label: t.nav.rooms },
                { to: '/dining', label: t.nav.dining },
                { to: '/services', label: t.nav.services },
                { to: '/booking', label: t.common.reserve },
                { to: '/location', label: t.nav.location },
              ].map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition-colors duration-200"
                    style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.5px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guest Services */}
          <div>
            <h4 className="section-eyebrow mb-6">{t.footer.guestServices}</h4>
            <ul className="space-y-3">
              {t.footer.servicesList.map((item: string) => (
                <li key={item}>
                  <span
                    style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)', letterSpacing: '0.5px' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-eyebrow mb-6">{t.footer.contact}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  1 Royal Palace Boulevard<br />Monte Carlo, MC 98000<br />Monaco
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)' }}>
                  +377 99 999 9999
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontFamily: 'Montserrat', fontSize: '12px', fontWeight: 300, color: 'var(--text-muted)' }}>
                  reservations@velorapalace.com
                </span>
              </li>
            </ul>
            <div className="mt-8">
              <h5 className="section-eyebrow mb-3" style={{ fontSize: '9px', letterSpacing: '4px' }}>{t.footer.newsletter}</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="luxury-input flex-1"
                  style={{ fontSize: '11px', padding: '10px 14px' }}
                />
                <button
                  className="btn-luxury"
                  style={{ padding: '10px 16px', fontSize: '10px', letterSpacing: '1px', flexShrink: 0 }}
                >
                  {t.footer.join}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="gold-divider w-full mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '1px' }}>
            {t.footer.rights}
          </p>
          <div className="flex items-center gap-6">
            {[t.footer.privacy, t.footer.terms, t.footer.cookies].map(item => (
              <button
                key={item}
                style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '1px', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
