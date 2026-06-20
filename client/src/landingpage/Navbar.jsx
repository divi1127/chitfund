import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '../assets/jod.png';
import { Link } from 'react-router-dom';

export const Navbar = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const sections = ['home', 'plans', 'features', 'about', 'faq', 'contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Plans', id: 'plans' },
    { name: 'Features', id: 'features' },
    { name: 'About', id: 'about' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-border-light shadow-sm'
          : 'bg-white/80 backdrop-blur-md border-b border-transparent'
      } py-3`}
      role="navigation"
      aria-label="Site navigation"
    >
      <div className="section-container flex items-center justify-between">
        <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="flex items-center gap-2 cursor-pointer shrink-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary-blue to-dark-blue shadow-md">
            <img src={logo} alt="JOD Chits" className="w-5 h-5 sm:w-6 sm:h-6 object-contain brightness-0 invert" />
          </div>
          <span className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-bold tracking-wider text-primary-blue">JOD</span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-text-secondary uppercase">CHITS</span>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-6 xl:gap-8" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { onNavigate(link.id); setIsOpen(false); }}
              className={`text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2.5px] after:bg-premium-gold after:transition-all after:duration-300 cursor-pointer ${
                activeSection === link.id
                  ? 'text-primary-blue after:w-full after:bg-premium-gold'
                  : 'text-text-secondary hover:text-primary-blue after:w-0 hover:after:w-full'
              }`}
              aria-current={activeSection === link.id ? 'true' : undefined}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-primary-blue hover:text-dark-blue px-4 py-2 rounded-lg transition-all cursor-pointer"
          >
            Login
          </Link>
          <button
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-2 font-bold text-sm text-white bg-gradient-to-r from-premium-gold to-gold-600 px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-premium-gold/25 hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => handleKeyDown(e, () => setIsOpen(!isOpen))}
            className="text-text-secondary hover:text-primary-blue p-1 cursor-pointer"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-border-light" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="section-container flex flex-col gap-3 py-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setIsOpen(false); }}
                className={`text-left text-base font-semibold transition-colors py-1.5 cursor-pointer ${
                  activeSection === link.id ? 'text-primary-blue' : 'text-text-secondary hover:text-primary-blue'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="h-px bg-border-light my-1" />
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center font-semibold text-primary-blue py-3 border border-border-light rounded-lg hover:bg-primary-blue/5 text-sm cursor-pointer"
              >
                Login
              </Link>
              <button
                onClick={() => { onNavigate('contact'); setIsOpen(false); }}
                className="w-full text-center font-bold text-sm text-white bg-gradient-to-r from-premium-gold to-gold-600 py-3 rounded-xl hover:shadow-lg hover:shadow-premium-gold/25 transition-all cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};
