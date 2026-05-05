import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Crown, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', clearProps:"all" }
      );
    }
  }, [isLogin, showForgot]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) navigate('/account');
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setLoadingLocal(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/account' } });
    setLoadingLocal(false);
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (!isLogin) {
      if (name.trim().length < 3) {
        alert('Please enter your full legal name.');
        return;
      }
      if (!name.trim().includes(' ')) {
        alert('Please enter both your first and last name.');
        return;
      }
    }

    setLoadingLocal(true);
    let result;
    if (isLogin) {
      result = await signIn(email, password);
    } else {
      result = await signUp(email, password, name);
    }
    setLoadingLocal(false);
    
    if (result.error) {
      alert(result.error.message);
    } else {
      navigate('/account');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLocal(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const result = await response.json();
      if (result.success) {
        setResetSent(true);
      } else {
        alert(result.error || result.message);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-bg">
      {/* Background Section (Left on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16">
          <div 
              className="absolute inset-0 scale-105"
              style={{
                backgroundImage: 'url(https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1920)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black-soft/90" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 group w-max">
                <Crown size={28} className="text-gold" />
                <div className="flex flex-col leading-none">
                  <span className="font-display text-2xl tracking-[0.25em] font-light text-white">VELORA</span>
                </div>
              </div>
          </div>

          <div ref={decorRef} className="relative z-10 max-w-lg mb-12">
              <h2 className="text-4xl xl:text-5xl font-display text-white mb-6 leading-tight">Elevate Your Expectation of Luxury.</h2>
              <div className="space-y-4 text-sm text-text-secondary font-light">
                  <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gold" /> Exclusive access to VIP suites</p>
                  <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gold" /> Priority reservations at L'Aura Noire</p>
                  <p className="flex items-center gap-3"><CheckCircle2 size={16} className="text-gold" /> Complimentary chauffeur transfers</p>
              </div>
          </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10 bg-black-soft shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        <div ref={formRef} className="w-full max-w-md">
            {showForgot ? (
                <div className="animate-fade-in-up">
                    <div className="text-left mb-10">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4 font-semibold">Security</p>
                        <h1 className="text-3xl lg:text-4xl font-display text-white mb-3">Recover Access</h1>
                        <p className="text-xs text-text-muted font-light leading-relaxed">
                            {resetSent 
                              ? `A prestigious recovery link has been dispatched to ${resetEmail}. Please check your inbox.`
                              : 'Enter your designated email address to receive a secure password reset link.'}
                        </p>
                    </div>

                    {!resetSent ? (
                        <form onSubmit={handleForgotSubmit} className="space-y-8">
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    value={resetEmail} 
                                    onChange={e => setResetEmail(e.target.value)} 
                                    required 
                                    placeholder=" "
                                    className="block w-full px-4 pt-6 pb-2 text-sm text-white bg-black/30 border-b border-border/50 focus:outline-none focus:border-gold transition-colors duration-300 peer" 
                                />
                                <label className="absolute text-[10px] uppercase tracking-widest text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold">
                                    Email Address
                                </label>
                            </div>
                            <button type="submit" disabled={loadingLocal} className="btn-luxury w-full flex items-center justify-center gap-3 py-4 shadow-gold">
                                {loadingLocal ? 'Dispatching...' : 'Send Reset Link'} <ArrowRight size={16} />
                            </button>
                        </form>
                    ) : (
                        <button onClick={() => { setShowForgot(false); setResetSent(false); }} className="btn-outline-luxury w-full py-4 text-center">
                            Return to Selection
                        </button>
                    )}

                    {!resetSent && (
                        <div className="mt-8 text-center">
                            <button onClick={() => setShowForgot(false)} className="text-[10px] uppercase tracking-widest text-text-muted hover:text-gold transition-colors">
                                Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="text-left mb-10">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">Authentication</p>
                    <h1 className="text-3xl lg:text-4xl font-display text-white mb-3">
                        {isLogin ? 'Welcome Back' : 'Create an Account'}
                    </h1>
                    <p className="text-xs text-text-muted font-light leading-relaxed">
                        {isLogin ? 'Enter your credentials to manage your prestigious reservations.' : 'Join Velora Palace to unlock world-class privileges.'}
                    </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="relative group">
                           <input 
                               type="text" 
                               value={name} 
                               onChange={e => setName(e.target.value)} 
                               required 
                               placeholder=" "
                               className="block w-full px-4 pt-6 pb-2 text-sm text-white bg-black/30 border-b border-border/50 focus:outline-none focus:border-gold transition-colors duration-300 peer" 
                           />
                           <label className="absolute text-[10px] uppercase tracking-widest text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold">
                               Full Legal Name
                           </label>
                        </div>
                    )}
                    
                    <div className="relative group">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            placeholder=" "
                            className="block w-full px-4 pt-6 pb-2 text-sm text-white bg-black/30 border-b border-border/50 focus:outline-none focus:border-gold transition-colors duration-300 peer" 
                        />
                        <label className="absolute text-[10px] uppercase tracking-widest text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold">
                            Email Address
                        </label>
                    </div>

                    <div className="space-y-2">
                        <div className="relative group">
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                placeholder=" "
                                className="block w-full px-4 pt-6 pb-2 text-sm text-white bg-black/30 border-b border-border/50 focus:outline-none focus:border-gold transition-colors duration-300 peer" 
                            />
                            <label className="absolute text-[10px] uppercase tracking-widest text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold">
                                Password
                            </label>
                        </div>
                        {isLogin && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-[9px] uppercase tracking-widest text-gold hover:text-white transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loadingLocal} className="btn-luxury w-full flex items-center justify-center gap-3 mt-8 py-4 shadow-gold">
                        {loadingLocal ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')} <ArrowRight size={16} />
                    </button>
                    </form>

                    <div className="mt-8 flex items-center justify-center gap-4">
                       <div className="h-px bg-border/50 flex-1" />
                       <span className="text-[9px] text-text-muted uppercase tracking-[0.2em]">or continue with</span>
                       <div className="h-px bg-border/50 flex-1" />
                    </div>

                    <button 
                       type="button"
                       onClick={handleGoogleSignIn} 
                       disabled={loadingLocal}
                       className="btn-outline-luxury w-full justify-center mt-8 flex items-center gap-3 py-3"
                    >
                       <span className="flex items-center justify-center gap-3 relative z-10 w-full h-full font-medium">
                         <svg className="w-5 h-5" viewBox="0 0 24 24">
                             <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                             <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                             <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                             <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                         </svg>
                         Sign in with Google
                       </span>
                    </button>

                    <div className="mt-10 text-center font-light">
                       <p className="text-xs text-text-muted">
                           {isLogin ? "Don't have an account?" : "Already hold an account?"}{' '}
                           <button onClick={() => setIsLogin(!isLogin)} className="text-gold font-medium tracking-wide hover:underline hover:text-gold-light transition-colors">
                           {isLogin ? 'Register Here' : 'Sign In'}
                           </button>
                       </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
