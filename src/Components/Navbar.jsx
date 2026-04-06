import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, Mail, Menu as MenuIcon, X as XIcon, UserCheck } from 'lucide-react';
import { Phone } from 'react-feather';

// ✅ Updated navItems with professional labels and routes
const navItems = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/about', label: 'Our Story', Icon: Info },
  { to: '/new', label: "What's New", Icon: Mail },
  { to: '/enroll', label: 'Enroll Now', Icon: UserCheck },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Smart navbar hide/show on scroll
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowNavbar(true); 
      } else {
        setShowNavbar(false); 
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-blue-900 text-white p-4 shadow-lg transition-transform duration-300 z-50 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* School Logo/Name */}
        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          Greater Access <span className="font-light text-blue-200">Schools</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1 focus:outline-none hover:bg-blue-800 rounded-md transition-colors"
          aria-label={open ? 'Close main menu' : 'Open main menu'}
        >
          {open ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>

        {/* Desktop and Mobile Navigation Links */}
        <ul
          className={`${
            open ? 'flex' : 'hidden'
          } flex-col absolute left-0 top-full w-full bg-blue-900 md:static md:flex md:flex-row md:items-center md:space-x-8 md:w-auto z-50 shadow-xl md:shadow-none transition-all duration-300`}
        >
          {navItems.map(({ to, label, Icon }) => (
            <li
              key={to}
              className="w-full md:w-auto border-t border-blue-800 md:border-none"
            >
              <Link
                to={to}
                className="flex items-center px-6 py-4 md:px-0 md:py-2 text-sm font-semibold hover:text-blue-200 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon className="w-4 h-4 mr-2 md:mr-1.5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
          {/* Admin Login Shortcut - subtle */}
          <li className="border-t border-blue-800 md:border-none">
             <Link 
               to="/login" 
               className="flex items-center px-6 py-4 md:px-3 md:py-1.5 text-[10px] uppercase tracking-widest text-blue-300 hover:text-white transition-colors"
               onClick={() => setOpen(false)}
             >
               Admin
             </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
