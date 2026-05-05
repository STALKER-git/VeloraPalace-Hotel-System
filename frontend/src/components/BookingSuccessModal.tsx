import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, BedDouble, User, CreditCard } from 'lucide-react';
import gsap from 'gsap';

interface BookingSuccessModalProps {
  reference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  total: number;
  onClose: () => void;
}

export default function BookingSuccessModal({
  reference,
  roomName,
  checkIn,
  checkOut,
  guests,
  total,
  onClose,
}: BookingSuccessModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti animation
  const launchConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = [
      '#C9A84C', '#FFD700', '#FFA500', '#FF6347',
      '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
    ];

    interface Particle {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      gravity: number;
    }

    const particles: Particle[] = [];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        w: 4 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 8,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.05 + Math.random() * 0.05,
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let activeCount = 0;
      particles.forEach(p => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;
        
        if (p.y > canvas.height) {
          p.opacity -= 0.02;
        }
        
        if (p.opacity > 0) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (activeCount > 0) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    // Entry animation
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }

    // Animate the checkmark
    const checkEl = document.querySelector('.success-check-icon');
    if (checkEl) {
      gsap.fromTo(checkEl,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
      );
    }

    // Animate details
    gsap.fromTo('.success-detail-row',
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
    );

    // Launch confetti
    const cleanup = launchConfetti();

    // Second burst of confetti after a delay
    const timeout = setTimeout(() => {
      launchConfetti();
    }, 1500);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timeout);
    };
  }, [launchConfetti]);

  const goToDashboard = () => {
    onClose();
    navigate('/account');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-[101]"
      />

      {/* Backdrop */}
      <div ref={modalRef} className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Content */}
      <div ref={contentRef} className="relative z-[102] w-full max-w-md">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-gold/30 rounded-2xl shadow-[0_0_60px_rgba(201,168,76,0.15)] overflow-hidden">
          {/* Header glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="p-10 text-center relative">
            {/* Success Icon */}
            <div className="success-check-icon w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle size={40} className="text-emerald-400" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-display text-white mb-2">
              Reservation Confirmed
            </h2>
            <p className="text-text-muted text-sm mb-2">
              Your luxury experience awaits
            </p>

            {/* Reference */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/30 rounded-lg mb-8 mt-4">
              <span className="text-[9px] uppercase tracking-widest text-text-muted">Ref:</span>
              <span className="text-gold font-mono font-bold text-lg tracking-[0.3em]">{reference}</span>
            </div>

            {/* Details */}
            <div className="space-y-3 text-left mb-8 bg-black/40 border border-border/30 rounded-lg p-5">
              <div className="success-detail-row flex items-center gap-3 py-2 border-b border-border/20">
                <BedDouble size={16} className="text-gold shrink-0" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex-1">Room</span>
                <span className="text-sm text-white font-medium">{roomName}</span>
              </div>
              <div className="success-detail-row flex items-center gap-3 py-2 border-b border-border/20">
                <Calendar size={16} className="text-gold shrink-0" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex-1">Check-in</span>
                <span className="text-sm text-white font-medium">{checkIn}</span>
              </div>
              <div className="success-detail-row flex items-center gap-3 py-2 border-b border-border/20">
                <Calendar size={16} className="text-gold shrink-0" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex-1">Check-out</span>
                <span className="text-sm text-white font-medium">{checkOut}</span>
              </div>
              <div className="success-detail-row flex items-center gap-3 py-2 border-b border-border/20">
                <User size={16} className="text-gold shrink-0" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex-1">Guests</span>
                <span className="text-sm text-white font-medium">{guests}</span>
              </div>
              <div className="success-detail-row flex items-center gap-3 py-2">
                <CreditCard size={16} className="text-gold shrink-0" />
                <span className="text-[10px] uppercase tracking-widest text-text-muted flex-1">Total</span>
                <span className="text-lg font-display text-gold">{total.toLocaleString()} DZD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={goToDashboard}
                className="w-full py-4 bg-gold text-black text-[11px] uppercase tracking-[0.2em] font-bold rounded-lg hover:bg-gold/90 transition-all duration-300 shadow-[0_0_20px_rgba(201,168,76,0.3)]"
              >
                View My Bookings
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-[10px] uppercase tracking-widest text-text-muted hover:text-gold transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
