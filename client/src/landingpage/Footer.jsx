import { Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { logo } from '../assets';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const links = {
    [t('footer_links')]: [
      { label: t('nav_home'), id: 'home' },
      { label: t('nav_plans'), id: 'plans' },
      { label: t('nav_features'), id: 'features' },
      { label: t('nav_faq'), id: 'faq' },
      { label: t('nav_contact'), id: 'contact' },
    ],
  };

  return (
    <footer className="bg-dark-blue pt-16 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-premium-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-premium-gold/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-blue/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-5">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md shadow-black/10 overflow-hidden">
                <img src={logo} alt="NVS CHIT ENTERPRISES" className="w-[120%] h-[120%] object-cover object-center" />
              </div>
              <span className="flex flex-col leading-none text-left">
                <span className="text-xl font-extrabold tracking-widest text-white">NVS</span>
                <span className="text-[9px] font-bold tracking-[0.35em] text-white/50 uppercase">CHIT ENTERPRISES</span>
              </span>
            </button>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              {t('footer_desc')}
            </p>
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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('footer_contact')}</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 text-sm text-white/55">
                <MapPin className="w-4 h-4 text-premium-gold shrink-0 mt-0.5" />
                <span>1538, North Veli Street, Simmakkal, Madurai – 625001</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Phone className="w-4 h-4 text-premium-gold shrink-0" />
                <a href="tel:9600924752" className="hover:text-premium-gold transition-colors">96009 24752</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Mail className="w-4 h-4 text-premium-gold shrink-0" />
                <a href="mailto:nvschit@gmail.com" className="hover:text-premium-gold transition-colors">nvschit@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-white/8 mb-8" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/35">
          <div className="space-y-1">
            <p>© {year} NVS CHIT ENTERPRISES. {t('footer_rights')}</p>
            <p className="text-white/25">{t('footer_disclaimer')}</p>
          </div>
          <div className="flex gap-4">
            {[t('footer_privacy'), t('footer_terms'), t('footer_filings')].map((label) => (
              <a key={label} href="#" className="hover:text-premium-gold transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
