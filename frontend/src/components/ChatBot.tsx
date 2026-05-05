import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Crown, Minimize2 } from 'lucide-react';
import gsap from 'gsap';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hello', 'hi', 'bonjour', 'مرحبا', 'hey', 'greet'],
    response: "Welcome to Velora Palace. I'm your personal concierge assistant. How may I assist you today?",
  },
  {
    keywords: ['room', 'suite', 'villa', 'accommodation', 'stay', 'sleep'],
    response: "We offer four exquisite categories: Classic & Superior Rooms (from 350 DZD/night), Deluxe Rooms & Suites (from 650 DZD/night), Palace & Royal Suites (from 1,800 DZD/night), and our exclusive Garden & Ocean Villas (from 3,500 DZD/night). Each is meticulously appointed with bespoke furnishings.",
  },
  {
    keywords: ['book', 'reserve', 'reservation', 'booking', 'availability'],
    response: "To reserve your accommodation, you may visit our Reservations page or I can guide you. We recommend booking at least 2 weeks in advance for suites. Would you like to check availability for specific dates?",
  },
  {
    keywords: ['price', 'cost', 'rate', 'fee', 'expensive', 'cheap', 'afford'],
    response: "Our rates begin at 350 DZD per night for our Classic Rooms. Suites start at 1,800 DZD/night and our private villas from 3,500 DZD/night. All rates include daily housekeeping, WiFi, and access to our world-class amenities. Complimentary breakfast is included in select packages.",
  },
  {
    keywords: ['spa', 'wellness', 'massage', 'treatment', 'relax', 'beauty'],
    response: "The Velora Wellness Sanctuary spans 3,000 sqm featuring: 12 private treatment rooms, a heated indoor pool, steam room and sauna, Hammam experience, and a full fitness center. Our therapists offer bespoke treatments using La Mer and Sisley products.",
  },
  {
    keywords: ['restaurant', 'dining', 'eat', 'food', 'menu', 'dinner', 'lunch', 'breakfast'],
    response: "Velora Palace features three dining venues: Le Ciel (Michelin-starred fine dining, 7th floor), La Terrasse (all-day dining with sea views), and The Palace Bar (artisanal cocktails and light bites). All offer seasonal menus curated by our Executive Chef.",
  },
  {
    keywords: ['check in', 'checkin', 'checkout', 'check out', 'arrival', 'departure'],
    response: "Check-in time is from 3:00 PM and check-out is by 12:00 PM noon. Early check-in and late check-out may be arranged upon availability. Suite guests enjoy flexible timing as part of our Palace Promise.",
  },
  {
    keywords: ['pool', 'swim', 'beach', 'water', 'ocean'],
    response: "We feature three exceptional pools: a heated rooftop infinity pool (panoramic views), the Garden Pool, and private plunge pools in our villas. Villa guests enjoy direct ocean access. Pool service is available daily from 7:00 AM to 10:00 PM.",
  },
  {
    keywords: ['location', 'address', 'where', 'direction', 'map', 'how to get', 'monaco'],
    response: "Velora Palace is located at 1 Royal Palace Boulevard, Monte Carlo, Monaco. We are 15 minutes from Nice Côte d'Azur International Airport. Complimentary limousine transfers are available for suite and villa guests.",
  },
  {
    keywords: ['wifi', 'internet', 'connection', 'network'],
    response: "Complimentary high-speed WiFi (1 Gbps) is available throughout the property. Suite and villa guests receive dedicated bandwidth for seamless connectivity.",
  },
  {
    keywords: ['concierge', 'service', 'butler', 'staff', 'help', 'assistance'],
    response: "Our concierge team is available 24/7 to curate every aspect of your stay, from private yacht charters and helicopter tours to exclusive restaurant reservations and bespoke shopping experiences on the French Riviera.",
  },
  {
    keywords: ['pet', 'dog', 'cat', 'animal'],
    response: "Velora Palace warmly welcomes pets in select rooms and villas. We offer a bespoke pet amenity package including gourmet meals and a dedicated pet concierge. Please inform us at reservation to arrange accordingly.",
  },
  {
    keywords: ['cancel', 'cancellation', 'refund', 'change', 'modify'],
    response: "Our flexible cancellation policy allows free cancellation up to 48 hours before arrival for standard rooms. Suite and villa bookings require 7 days notice. Please contact our reservations team for modifications.",
  },
  {
    keywords: ['promo', 'discount', 'code', 'offer', 'deal', 'promotion'],
    response: "We offer exclusive promotional codes for our members. Try VELORA10 for 10% off, LUXURY20 for 20% off returning guests, or WELCOME15 for new members. Apply these at checkout.",
  },
  {
    keywords: ['wedding', 'event', 'party', 'celebration', 'conference', 'meeting'],
    response: "Velora Palace hosts intimate weddings and exclusive events in our Grand Ballroom (up to 400 guests) and several private salons. Our dedicated events team will orchestrate every detail to perfection.",
  },
  {
    keywords: ['parking', 'car', 'valet'],
    response: "Complimentary valet parking is available for all guests. We accommodate standard and oversized vehicles, as well as supercars with additional protective measures.",
  },
  {
    keywords: ['gym', 'fitness', 'exercise', 'workout'],
    response: "Our Fitness Atelier is equipped with Technogym Artis machines, a yoga studio with sea views, and personal training. Open 5:30 AM — 11:00 PM daily. Towels and refreshments are complimentary.",
  },
];

function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const item of BOT_RESPONSES) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return item.response;
    }
  }
  return "Thank you for your inquiry. For personalized assistance, our concierge team is available 24/7 at +377 99 999 9999 or reservations@velorapalace.com. Is there anything specific about our rooms, dining, or amenities I can help with?";
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour. Welcome to Velora Palace. I'm your personal concierge assistant. How may I be of service today?",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  /* ── Smooth GSAP open/close ── */
  useEffect(() => {
    if (chatWindowRef.current) {
      if (isOpen) {
        gsap.fromTo(chatWindowRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
        );
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (chatWindowRef.current) {
      gsap.to(chatWindowRef.current, {
        opacity: 0, y: 20, scale: 0.9, duration: 0.25, ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(userText),
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 flex flex-col"
          style={{
            height: isMinimized ? 'auto' : '480px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0a0a0a, #161616)',
              borderBottom: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #9a7a2e, #c9a84c)' }}
              >
                <Crown size={16} style={{ color: '#0a0a0a' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '15px', fontWeight: 500, color: 'var(--cream)', letterSpacing: '0.5px' }}>
                  Palace Concierge
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span style={{ fontFamily: 'Montserrat', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    Available 24/7
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 transition-colors"
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 transition-colors"
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ background: 'var(--bg)' }}
              >
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%]">
                      {msg.sender === 'bot' && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center mb-1.5"
                          style={{ background: 'linear-gradient(135deg, #9a7a2e, #c9a84c)' }}
                        >
                          <Crown size={10} style={{ color: '#0a0a0a' }} />
                        </div>
                      )}
                      <div
                        className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
                        style={{ padding: '10px 14px' }}
                      >
                        <p style={{ fontFamily: 'Montserrat', fontSize: '12px', lineHeight: '1.6', fontWeight: 300 }}>
                          {msg.text}
                        </p>
                      </div>
                      <p
                        className={`mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                        style={{ fontFamily: 'Montserrat', fontSize: '9px', color: 'var(--text-muted)' }}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="chat-bubble-bot" style={{ padding: '10px 16px' }}>
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{
                              background: 'var(--gold)',
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div
                className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
              >
                {['Rooms', 'Dining', 'Spa', 'Rates', 'Pool'].map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => {
                        const userMsg: Message = {
                          id: Date.now().toString(),
                          text: q,
                          sender: 'user',
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setMessages(prev => [...prev, userMsg]);
                        setIsTyping(true);
                        setInput('');
                        setTimeout(() => {
                          const botMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            text: getBotResponse(q),
                            sender: 'bot',
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          };
                          setMessages(prev => [...prev, botMsg]);
                          setIsTyping(false);
                        }, 1200);
                      }, 0);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 transition-all duration-200"
                    style={{
                      border: '1px solid var(--border)',
                      fontFamily: 'Montserrat', fontSize: '9px', fontWeight: 600,
                      letterSpacing: '1.5px', color: 'var(--text-muted)',
                      background: 'transparent', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'var(--gold)';
                      el.style.color = 'var(--gold)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'var(--border)';
                      el.style.color = 'var(--text-muted)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div
                className="flex items-center gap-2 p-3 flex-shrink-0"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask your concierge..."
                  className="flex-1 luxury-input"
                  style={{ padding: '10px 14px', fontSize: '12px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="btn-luxury flex-shrink-0"
                  style={{ padding: '10px 14px', opacity: input.trim() ? 1 : 0.5 }}
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ CIRCULAR FAB BUTTON ═══════════ */}
      <button
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #9a7a2e, #c9a84c, #e8c97a)',
          boxShadow: '0 8px 30px rgba(201,168,76,0.4)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isOpen
          ? <X size={20} style={{ color: '#0a0a0a' }} />
          : <MessageCircle size={20} style={{ color: '#0a0a0a' }} />
        }
      </button>
    </>
  );
}
