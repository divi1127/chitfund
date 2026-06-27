import { useState, useEffect, useCallback } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { logo } from '../assets';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home',     id: 'home'     },
  { name: 'Plans',    id: 'plans'    },
  { name: 'Features', id: 'features' },
  { name: 'FAQ',      id: 'faq'      },
  { name: 'Contact',  id: 'contact'  },
];

export const Navbar = ({ onNavigate }) => {
  const [isOpen, setIsOpen]         = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId]     = useState('home');

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 24);
    const ids = NAV_LINKS.map(l => l.id);
    for (let i = ids.length - 1; i >= 0; i--) {
      const el = document.getElementById(ids[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        setActiveId(ids[i]);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNav = (id) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav
        role="navigation"
        aria-label="Site navigation"
        className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: isScrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div
          className="section-container flex items-center justify-between"
          style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
        >
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            aria-label="Go to home"
            className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 shrink-0"
          >
            <img src={logo} alt="HR Chits" style={{ height: 38, objectFit: 'contain' }} />
            <span className="flex flex-col leading-none">
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1565C0' }}>HR</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.35em', color: '#64748B', textTransform: 'uppercase' }}>CHITS</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isActive = activeId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.875rem', fontWeight: 600,
                    color: isActive ? '#1565C0' : '#64748B',
                    transition: 'color 0.2s',
                    borderRadius: 6,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#1E293B'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#64748B'; }}
                >
                  {link.name}
                  <span
                    style={{
                      position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                      height: 2, borderRadius: 2,
                      background: '#D4AF37',
                      width: isActive ? '70%' : '0%',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </button>
              );
            })}

            <Link
              to="/login"
              style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: '#64748B', textDecoration: 'none',
                padding: '0.5rem 0.875rem', borderRadius: 8,
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1565C0'; e.currentTarget.style.background = 'rgba(21,101,192,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
            >
              Login
            </Link>

            <button
              onClick={() => handleNav('contact')}
              className="inline-flex items-center gap-1 shrink-0"
              style={{
                fontWeight: 700, fontSize: '0.875rem', color: '#fff',
                background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
                border: 'none', cursor: 'pointer',
                padding: '0.5rem 1.125rem', borderRadius: 10,
                transition: 'box-shadow 0.2s, transform 0.2s',
                boxShadow: '0 2px 8px rgba(21,101,192,0.2)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(21,101,192,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(21,101,192,0.2)'; }}
            >
              Get Started <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="md:hidden flex items-center justify-center"
            style={{
              background: isOpen ? 'rgba(21,101,192,0.06)' : 'none',
              border: 'none', cursor: 'pointer',
              padding: '0.5rem', borderRadius: 8,
              color: isOpen ? '#1565C0' : '#64748B',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {isOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
              style={{
                background: '#fff',
                borderTop: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="section-container flex flex-col"
                style={{ paddingTop: '0.75rem', paddingBottom: '1.25rem', gap: '0.25rem' }}
              >
                {NAV_LINKS.map(link => {
                  const isActive = activeId === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNav(link.id)}
                      style={{
                        textAlign: 'left', width: '100%',
                        background: isActive ? 'rgba(21,101,192,0.06)' : 'none',
                        border: 'none', cursor: 'pointer',
                        padding: '0.875rem 1rem', borderRadius: 10,
                        fontSize: '1rem', fontWeight: 600,
                        color: isActive ? '#1565C0' : '#475569',
                        borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      {link.name}
                    </button>
                  );
                })}

                <div style={{ height: 1, background: '#E2E8F0', margin: '0.5rem 0' }} />

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  style={{
                    textAlign: 'center', fontWeight: 600, fontSize: '1rem',
                    color: '#1565C0', textDecoration: 'none',
                    padding: '0.875rem', borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                  }}
                >
                  Members Login
                </Link>

                <button
                  onClick={() => handleNav('contact')}
                  style={{
                    width: '100%', fontWeight: 700, fontSize: '1rem', color: '#fff',
                    background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
                    border: 'none', cursor: 'pointer',
                    padding: '0.875rem', borderRadius: 10,
                    marginTop: '0.25rem',
                    boxShadow: '0 2px 8px rgba(21,101,192,0.2)',
                  }}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop to close on outside click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.25)', top: 0 }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
