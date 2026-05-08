import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', flag: '🇸🇦' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile } = useAuth();
  const location = useLocation();

  useGSAP(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/rooms', label: t.nav.rooms },
    { path: '/dining', label: t.nav.dining },
    { path: '/services', label: t.nav.services },
    { path: '/location', label: t.nav.location },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === '/';

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isHome
            ? 'glass border-b'
            : 'bg-transparent'
          }`}
        style={{
          borderBottomColor: scrolled || !isHome ? 'rgba(201,168,76,0.1)' : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div
                className="flex flex-col items-center transition-transform duration-300 group-hover:scale-105"
                style={{ width: '45px', filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.25))' }}
              >
                {/* Tete - Crown/Top ornament */}
                <img src="/logo/tete 1.svg" alt="" style={{ width: '100%', marginBottom: '1px', transform: 'translateX(-3px)' }} />
                {/* V Letter */}
                <img src="/logo/V.svg" alt="" style={{ width: '14px', marginTop: '1px', marginBottom: '1px' }} />
                {/* Body - Bottom ornament */}
                <img src="/logo/body 1.svg" alt="" style={{ width: '100%', marginBottom: '2px' }} />
                {/* VELORA text */}
                <img src="/logo/VELORA.svg" alt="Velora" style={{ width: '40px', marginBottom: '1px' }} />
                {/* PALACE text */}
                <img src="/logo/PALACE.svg" alt="Palace" style={{ width: '24px' }} />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Switcher */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-colors duration-200"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {LANGUAGES.find(l => l.code === language)?.label}
                  <ChevronDown
                    size={10}
                    className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--gold)' }}
                  />
                </button>
                {langOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 py-2 w-28 glass animate-slide-down"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 transition-colors duration-200 text-left"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '2px',
                          color: language === lang.code ? 'var(--gold)' : 'var(--text-secondary)',
                          background: language === lang.code ? 'rgba(201,168,76,0.05)' : 'transparent',
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 transition-colors duration-200 rounded-full"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {isDark
                  ? <Sun size={16} className="hover:text-gold transition-colors" style={{ color: 'inherit' }} />
                  : <Moon size={16} style={{ color: 'inherit' }} />
                }
              </button>

              {/* User Menu */}
              {user ? (
                <Link
                  to="/account"
                  className="flex items-center justify-center transition-all duration-300 rounded-full hover:scale-105"
                  style={{
                    width: '38px',
                    height: '38px',
                    border: '1px solid var(--gold)',
                    background: 'rgba(201,168,76,0.1)',
                    overflow: 'hidden'
                  }}
                  title={`${profile?.prenom || ''} ${profile?.nom_utilisateur || ''}`.trim() || 'My Profile'}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} style={{ color: 'var(--gold)' }} />
                  )}
                </Link>
              ) : (
                <Link to="/account" className="btn-outline-luxury" style={{ padding: '9px 22px' }}>
                  <span>{t.auth.signIn}</span>
                </Link>
              )}

              {/* Book Now CTA */}
              <Link to="/booking" className="btn-luxury" style={{ padding: '11px 24px' }}>
                {t.nav.book}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(prev => !prev)}
              style={{ color: 'var(--text-primary)' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden glass border-t animate-slide-down"
            style={{ borderTopColor: 'var(--border)' }}
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block py-3 nav-link"
                  style={{ fontSize: '12px', letterSpacing: '3px' }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />
              <div className="flex items-center gap-4 pt-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="transition-colors"
                    style={{
                      fontFamily: 'Montserrat', fontSize: '10px', fontWeight: 600,
                      letterSpacing: '2px',
                      color: language === lang.code ? 'var(--gold)' : 'var(--text-muted)',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
                <button onClick={toggleTheme} style={{ color: 'var(--text-muted)' }}>
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              <div className="pt-4 space-y-3">
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-4 block w-full btn-outline-luxury text-center">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-gold flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                        <User size={12} style={{ color: 'var(--gold)' }} />
                      </div>
                      <span>{`${profile?.prenom || ''} ${profile?.nom_utilisateur || ''}`.trim() || t.nav.account}</span>
                    </Link>
                  </>
                ) : (
                  <Link to="/account" className="block btn-luxury text-center">
                    {t.auth.signIn}
                  </Link>
                )}
                <Link to="/booking" className="block btn-luxury text-center">
                  {t.common.bookNow}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
