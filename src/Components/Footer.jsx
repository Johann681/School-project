import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaInstagram } from 'react-icons/fa';
import { Link } from "react-router-dom"; // Add this at the top

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Footer Left */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Greater Access Private Schools</h3>
            <p className="text-sm">
  <Link to="/login" className="bg-white text-green-700 px-5 py-2 rounded font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 shadow">
    Sign Up
  </Link>
</p>
            <p className="text-xs mt-2">© 2023 Greater Access Schools. All rights reserved.</p>
          </div>

          {/* Footer Center */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <FaMapMarkerAlt className="text-xl text-green-400" />
              <p>15-17 Irepodun Close, Isahsi/Akute, Ogun State</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaPhoneAlt className="text-xl text-green-400" />
              <p>08032066606</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaEnvelope className="text-xl text-green-400" />
              <p>
                <a href="mailto:greateraccessprivate.schools@gmail.com" className="hover:text-green-400">greateraccessprivate.schools@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Footer Right */}
          <div className="space-y-4">
            <p className="text-sm">
              <span className="font-semibold">About us</span>
              <br />
              Greater Access Private Schools... Your gateway to greater heights.
              <br />
              Stay connected with us on Instagram!
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/greateraccessschools?utm_source=qr&igsh=bjBjMm9idjFpYzE1" className="text-green-400 hover:text-white text-xl">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-slate-400">
          <p className="text-xs">© 2023 Greater Access Private Schools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
