import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Profile', path: '/#profile' },
    { name: 'Projects', path: '/topics' },
    { name: 'Contact', path: '/#contact' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-earth-50/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider serif text-earth-900">
          ITO GAKUTO
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-sm font-medium text-earth-800 hover:text-forest-600 tracking-wide transition-colors">
              {link.name}
            </Link>
          ))}
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
        <p className="text-earth-400 text-sm">Designing sustainable systems for wildlife and communities.</p>
      </div>
      <div className="flex space-x-6 text-sm text-earth-300">
        <Link to="/admin" className="hover:text-white transition-colors">Admin Area</Link>
        <span>&copy; {new Date().getFullYear()} Ito Gakuto</span>
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