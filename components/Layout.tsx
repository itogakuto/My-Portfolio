import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, targetId?: string) => {
    // Check if we need to navigate or just scroll
    const isHome = location.pathname === '/' || location.pathname === '';

    if (targetId && isHome) {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80; // Offset for header height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    // If not on home, the Link's 'to' will handle the navigation to '/' with hash if configured
  };

  const navLinks = [
    { name: 'Home', path: '/', id: 'hero' },
    { name: 'Profile', path: '/', id: 'profile' },
    { name: 'Skills', path: '/', id: 'skills' },
    { name: 'Projects', path: '/', id: 'projects' },
    { name: 'Contact', path: '/', id: 'contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-earth-50/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider serif text-earth-900 group">
          <span className="text-forest-600 transition-colors group-hover:text-earth-900">ITO GAKUTO's Portfolio </span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => {
            const isHome = location.pathname === '/' || location.pathname === '';
            // If it's a target on home, use # so smooth scroll logic triggers, otherwise full path
            const toPath = link.id ? (isHome ? '#' : `/${link.id === 'hero' ? '' : '#' + link.id}`) : link.path;
            
            return (
              <Link 
                key={link.name} 
                to={toPath}
                onClick={(e) => handleNavClick(e, link.path, link.id)}
                className="text-xs font-bold text-earth-800 hover:text-forest-600 tracking-[0.2em] uppercase transition-colors"
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-earth-900 text-earth-100 py-12">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-4 md:mb-0">
        <h2 className="text-2xl font-bold serif mb-2">ITO GAKUTO</h2>
      </div>
      <div className="flex space-x-6 text-sm text-earth-300">
        <Link to="/admin" className="hover:text-white transition-colors">Click To Admin Page</Link>
        <span>&copy; {new Date().getFullYear()} Gakuto Ito</span>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};