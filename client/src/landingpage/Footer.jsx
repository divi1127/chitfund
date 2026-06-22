import { useState } from 'react';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import logo from '../assets/jod.png';

export const Footer = ({ onNavigate }) => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setTimeout(() => { setSubscribed(false); setEmail(''); }, 3000); }
  };

  const links = {
    'Quick Links': [
      { label: 'Home', id: 'home' },
      { label: 'Plans', id: 'plans' },
      { label: 'Features', id: 'features' },
      { label: 'About', id: 'about' },
      { label: 'FAQ', id: 'faq' },
      { label: 'Contact', id: 'contact' },
    ],
    'Schemes': [
      { label: 'Silver — ₹2.5L', id: 'plans' },
      { label: 'Gold — ₹10L', id: 'plans' },
      { label: 'Platinum — ₹25L', id: 'plans' },
    ],
  };

  return (
    <footer className="bg-dark-blue pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-premium-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-premium-gold/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-5">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/12 flex items-center justify-center">
                <img src={logo} alt="JOD Chits" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-widest text-white">JOD</span>
                <span className="text-[9px] font-bold tracking-[0.35em] text-white/50 uppercase">CHITS</span>
              </span>
            </button>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Next-generation digital chit fund platform. Transparent, regulated savings and credit under the Chit Funds Act, 1982.
            </p>
            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2.5">Newsletter</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/35 outline-none focus:border-premium-gold/40 transition-colors"
                />
                <button type="submit" disabled={subscribed} className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-white shrink-0 hover:shadow-lg hover:shadow-premium-gold/20 transition-all disabled:opacity-70">
                  {subscribed ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Nav links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className="text-sm text-white/50 hover:text-premium-gold flex items-center gap-1 group cursor-pointer transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-3.5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get In Touch</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-white/55">
                <MapPin className="w-4 h-4 text-premium-gold shrink-0 mt-0.5" />
                <span>JOD Fintech Chambers, Plot 142, Sector 5, HSR Layout, Bengaluru, KA – 560102</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Phone className="w-4 h-4 text-premium-gold shrink-0" />
                <span>+91 80 4952 8200</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Mail className="w-4 h-4 text-premium-gold shrink-0" />
                <span>support@jodchits.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-white/8 mb-8" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/35">
          <div className="space-y-1">
            <p>© {year} JOD Chit Funds Pvt. Ltd. All rights reserved.</p>
            <p className="text-white/25">Disclaimer: Dividend outcomes depend on member bidding choices.</p>
          </div>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Regulatory Filings'].map((label) => (
              <a key={label} href="#" className="hover:text-premium-gold transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
