import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Crown, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);
    const [success, setSuccess] = useState(false);

    const {} = useAuth();
    const navigate = useNavigate();
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useGSAP(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match. Integrity is paramount.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters for optimal security.");
            return;
        }

        setLoadingLocal(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (!error) {
                setSuccess(true);
                // Sign the user out so they have to log in with the new password
                await supabase.auth.signOut();
                
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            } else {
                alert(error.message || "Credential update failed.");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-6 py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-20 scale-110"
                    style={{
                        backgroundImage: 'url(https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black-soft via-bg to-bg" />
            </div>

            <div ref={formRef} className="w-full max-w-md relative z-10">
                <div className="luxury-card p-10 lg:p-14 border border-border/30 bg-black-soft/80 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto rounded-full border border-gold/30 flex items-center justify-center mb-6 bg-gold/5">
                            <Lock className="text-gold" size={28} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3 font-semibold">Security Vault</p>
                        <h1 className="text-3xl font-display text-white mb-3">Reset Credentials</h1>
                        <p className="text-xs text-text-muted font-light leading-relaxed">
                            Establish a new, impenetrable password for your prestigious account.
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center animate-fade-in py-8">
                            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mb-6">
                                <ShieldCheck className="text-emerald-400" size={24} />
                            </div>
                            <h3 className="text-xl font-display text-white mb-2">Update Successful</h3>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Your credentials have been updated. Redirecting to the inner sanctuary...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
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
                                        New Password
                                    </label>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder=" "
                                        className="block w-full px-4 pt-6 pb-2 text-sm text-white bg-black/30 border-b border-border/50 focus:outline-none focus:border-gold transition-colors duration-300 peer"
                                    />
                                    <label className="absolute text-[10px] uppercase tracking-widest text-text-muted duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-gold">
                                        Confirm New Password
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={loadingLocal} className="btn-luxury w-full flex items-center justify-center gap-3 py-4 shadow-gold">
                                {loadingLocal ? 'Securing...' : 'Reset Password'} <ArrowRight size={16} />
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Crown size={14} className="text-gold/50" />
                        <span className="text-[10px] tracking-[0.4em] text-gold/50 uppercase font-light">Velora Palace</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
