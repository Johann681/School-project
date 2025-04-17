import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, Mail, Menu as MenuIcon, X as XIcon } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/about', label: 'About', Icon: Info },
  { to: '/login', label: 'Contact', Icon: Mail },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowNavbar(true); // show when scrolling up or near top
      } else {
        setShowNavbar(false); // hide when scrolling down
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full bg-blue-900 text-white p-4 shadow transition-transform duration-300 z-50 ${
        showNavbar ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-semibold hover:opacity-90">
          Greater Access
        </Link>

        {/* Hamburger Button (small screens) */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden focus:outline-none"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <MenuIcon className="w-6 h-6" />
          )}
        </button>

        {/* Menu Items */}
        <ul
          className={`${open ? 'block' : 'hidden'} absolute left-0 top-full w-full bg-blue-900 md:static md:flex md:items-center md:space-x-6 md:w-auto z-50`}
        >
          {navItems.map(({ to, label, Icon }) => (
            <li
              key={to}
              className="w-full md:w-auto border-t border-blue-800 md:border-none"
            >
              <Link
                to={to}
                className="flex w-full md:w-auto items-center px-4 py-3 text-sm font-medium hover:bg-blue-800 md:hover:bg-transparent transition-colors"
                onClick={() => setOpen(false)}
              >
                <Icon className="w-5 h-5 md:mr-2" />
                <span className="md:inline block">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
