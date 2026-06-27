import { useState, useEffect, useCallback } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import logo from '../assets/jod.png';
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

  /* ── scroll spy ── */
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

  /* ── lock body scroll when drawer open ── */
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
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav
        role="navigation"
        aria-label="Site navigation"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
          background: isScrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          borderBottom: isScrolled ? '1px solid #E2E8F0' : '1px solid transparent',
          boxShadow: isScrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div
          className="section-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            paddingBottom: '1rem',
          }}
        >
          {/* ── Logo ── */}
          <button
            onClick={() => handleNav('home')}
            aria-label="Go to home"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(21,101,192,0.25)',
              }}
            >
              <img src={logo} alt="JOD Chits logo" style={{ width: 20, height: 20, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '0.12em', color: '#1565C0' }}>JOD</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.35em', color: '#64748B', textTransform: 'uppercase' }}>CHITS</span>
            </span>
          </button>

          {/* ── Desktop nav links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="max-md:hidden">
            {NAV_LINKS.map(link => {
              const isActive = activeId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.625rem',
                    fontSize: '0.85rem', fontWeight: 600,
                    color: isActive ? '#1565C0' : '#64748B',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#1E293B'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#64748B'; }}
                >
                  {link.name}
                  <span
                    style={{
                      position: 'absolute', bottom: -2, left: 0,
                      height: 2, borderRadius: 2,
                      background: '#D4AF37',
                      width: isActive ? '100%' : '0%',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </button>
              );
            })}
            <Link
              to="/login"
              style={{
                fontSize: '0.85rem', fontWeight: 600,
                color: '#64748B', textDecoration: 'none',
                padding: '0.5rem 0.875rem', borderRadius: 8,
                transition: 'color 0.2s, background 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1565C0'; e.currentTarget.style.background = 'rgba(21,101,192,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
            >
              Login
            </Link>
            <button
              onClick={() => handleNav('contact')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                fontWeight: 700, fontSize: '0.85rem', color: '#fff',
                background: 'linear-gradient(135deg, #1565C0, #1E88E5)',
                border: 'none', cursor: 'pointer',
                padding: '0.5rem 1rem', borderRadius: 10,
                transition: 'box-shadow 0.2s, transform 0.2s',
                boxShadow: '0 2px 8px rgba(21,101,192,0.2)',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(21,101,192,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(21,101,192,0.2)'; }}
            >
              Start <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className="md:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.5rem', borderRadius: 8,
              color: '#64748B',
            }}
          >
            {isOpen
              ? <X style={{ width: 24, height: 24 }} />
              : <Menu style={{ width: 24, height: 24 }} />
            }
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                background: '#fff',
                borderTop: '1px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                maxHeight: 'calc(100vh - 72px)',
                overflowY: 'auto',
              }}
              className="md:hidden"
            >
              <div
                className="section-container"
                style={{ paddingTop: '1rem', paddingBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
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
                        padding: '0.875rem', borderRadius: 10,
                        fontSize: '1rem', fontWeight: 600,
                        color: isActive ? '#1565C0' : '#475569',
                        borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent',
                      }}
                    >
                      {link.name}
                    </button>
                  );
                })}

                <div style={{ height: 1, background: '#E2E8F0', margin: '0.75rem 0' }} />

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  style={{
                    textAlign: 'center', fontWeight: 600, fontSize: '1rem',
                    color: '#1565C0', textDecoration: 'none',
                    padding: '0.875rem', borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    background: '#fff',
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
    </>
  );
};
