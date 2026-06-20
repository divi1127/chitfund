import { useState } from 'react';
import { Mail, Phone, MapPin, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/jod.png';

export const Footer = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => { setSubscribed(false); setEmail(''); }, 3000);
    }
  };

  const socials = [
    { path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', label: 'Facebook', viewBox: '0 0 24 24' },
    { path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z', label: 'Twitter', viewBox: '0 0 24 24' },
    { path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4', label: 'LinkedIn', viewBox: '0 0 24 24' },
    { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', label: 'Instagram', viewBox: '0 0 24 24' },
  ];

  return (
    <footer className="bg-dark-blue pt-16 sm:pt-20 lg:pt-24 pb-10 sm:pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-premium-gold/30 to-transparent" />
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/15 backdrop-blur-sm shadow-lg group-hover:shadow-premium-gold/20 transition-shadow">
                <img src={logo} alt="JOD Chits" className="w-6 h-6 sm:w-7 sm:h-7 object-contain brightness-0 invert" />
              </div>
              <span className="flex flex-col leading-none">
                <span className="text-lg sm:text-xl font-bold tracking-wider text-white">JOD</span>
                <span className="text-[10px] font-semibold tracking-[0.3em] text-white/60 uppercase">CHITS</span>
              </span>
            </button>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-sm">
              Next-generation financial platform introducing transparency and security to mutual credit chit investments. Registered under the central Chit Funds Act, 1982.
            </p>
            <div className="flex gap-3">
              {socials.map((social, idx) => (
                <a key={idx} href="#" aria-label={social.label} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/10 hover:border-premium-gold/40 hover:bg-premium-gold/10 hover:shadow-lg hover:shadow-premium-gold/10 flex items-center justify-center text-white/50 hover:text-premium-gold transition-all">
                  <svg className="w-5 h-5" viewBox={social.viewBox} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'Plans', 'Features', 'About', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <button onClick={() => onNavigate(item.toLowerCase())} className="text-sm text-white/50 hover:text-premium-gold flex items-center transition-colors cursor-pointer group">
                    <ChevronRight className="w-4 h-4 text-premium-gold/50 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 mr-1.5" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-white/50 leading-relaxed">Get weekly chit fund insights and dividend tips delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-premium-gold/50 focus:bg-white/15 transition-all"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center text-white shrink-0 hover:shadow-xl hover:shadow-premium-gold/20 transition-all disabled:opacity-70"
              >
                {subscribed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Chit Schemes</h4>
            <ul className="space-y-3">
              {[
                { name: 'Silver Standard (₹2.5L)', id: 'plans' },
                { name: 'Gold Wealth Booster (₹10L)', id: 'plans' },
                { name: 'Platinum Corporate Elite (₹25L)', id: 'plans' },
              ].map((plan, idx) => (
                <li key={idx}>
                  <button onClick={() => onNavigate(plan.id)} className="text-sm text-white/50 hover:text-premium-gold transition-colors cursor-pointer text-left">
                    {plan.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-5 h-5 text-premium-gold shrink-0 mt-0.5" />
                <span>JOD Fintech Chambers, Plot 142, Sector 5, HSR Layout, Bengaluru, KA - 560102</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-5 h-5 text-premium-gold shrink-0" />
                <span>+91 80 4952 8200</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-5 h-5 text-premium-gold shrink-0" />
                <span>support@jodchits.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-white/10 my-10" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-white/40 gap-4">
          <div className="space-y-1">
            <p>&copy; {currentYear} JOD Chit Funds Private Limited. All rights reserved.</p>
            <p className="text-white/30">Disclaimer: Chit Funds are financial saving-cum-borrowing systems. Member bidding choices determine dividend outcomes.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <a href="#" className="hover:text-premium-gold transition-colors">Privacy Policy</a>
            <span className="text-white/30">&bull;</span>
            <a href="#" className="hover:text-premium-gold transition-colors">Terms of Service</a>
            <span className="text-white/30">&bull;</span>
            <a href="#" className="hover:text-premium-gold transition-colors">Regulatory Filings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
