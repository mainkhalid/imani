import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshakeIcon, MenuIcon, XIcon } from 'lucide-react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900 shadow-lg py-2' : 'bg-slate-800 py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/user" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <HeartHandshakeIcon className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">
              Imani Foundation
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/user" isActive={location.pathname === '/user'}>Home</NavLink>
            <NavLink to="/user/about" isActive={location.pathname === '/user/about'}>About Us</NavLink>
            <NavLink to="/user/programs" isActive={location.pathname === '/user/programs'}>Our Programs</NavLink>
            <NavLink to="/user/donate" highlight isActive={location.pathname === '/user/donate'}>Donate</NavLink>
            <NavLink to="/user/contact" isActive={location.pathname === '/user/contact'}>Contact</NavLink>
          </nav>
          
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-slate-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 rounded-md bg-slate-700 overflow-hidden">
            <MobileNavLink 
              to="/user" 
              onClick={() => setMobileMenuOpen(false)}
              isActive={location.pathname === '/user'}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              to="/user/about" 
              onClick={() => setMobileMenuOpen(false)}
              isActive={location.pathname === '/user/about'}
            >
              About Us
            </MobileNavLink>
            <MobileNavLink 
              to="/user/programs" 
              onClick={() => setMobileMenuOpen(false)}
              isActive={location.pathname === '/user/programs'}
            >
              Our Programs
            </MobileNavLink>
            <MobileNavLink 
              to="/user/donate" 
              onClick={() => setMobileMenuOpen(false)} 
              highlight
              isActive={location.pathname === '/user/donate'}
            >
              Donate
            </MobileNavLink>
            <MobileNavLink 
              to="/user/contact" 
              onClick={() => setMobileMenuOpen(false)}
              isActive={location.pathname === '/user/contact'}
            >
              Contact
            </MobileNavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

// Reusable desktop navigation link component
const NavLink = ({ to, children, highlight, isActive }) => (
  <Link
    to={to}
    className={`${
      highlight 
        ? 'bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md text-white font-medium'
        : isActive
          ? 'text-orange-300 font-medium border-b-2 border-orange-300'
          : 'text-white hover:text-orange-300 font-medium'
    } transition-colors duration-200`}
    aria-current={isActive ? 'page' : undefined}
  >
    {children}
  </Link>
);

// Reusable mobile navigation link component
const MobileNavLink = ({ to, children, onClick, highlight, isActive }) => (
  <Link
    to={to}
    className={`block py-3 px-4 ${
      highlight 
        ? 'bg-orange-500 text-white font-medium'
        : isActive
          ? 'bg-slate-600 text-orange-300 border-l-4 border-orange-500'
          : 'text-white hover:bg-slate-600'
    } transition-colors duration-200`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    {children}
  </Link>
);