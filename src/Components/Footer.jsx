import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);
  const phoneNumber = "08032066606";

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-10 relative border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="flex flex-col space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Greater Access <span className="text-blue-400 font-light">Schools</span>
              </h3>
              <p className="text-sm mt-4 text-gray-400 leading-relaxed italic">
                "Never Say Fail" — Your gateway to greater heights and academic excellence since 2006.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/greateraccessschools"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 border border-gray-700 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900 hover:text-white transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white border-b border-gray-700 pb-2">Quick Links</h4>
            <nav className="flex flex-col space-y-2 text-sm text-gray-400">
              <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <Link to="/about" className="hover:text-blue-400 transition-colors">Our Story</Link>
              <Link to="/new" className="hover:text-blue-400 transition-colors">Events & News</Link>
              <Link to="/enroll" className="hover:text-blue-400 transition-colors">Admission Portal</Link>
              <Link to="/login" className="hover:text-blue-400 transition-colors text-[10px]">Portal Login</Link>
            </nav>
          </div>

          {/* Contact Details Column */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white border-b border-gray-700 pb-2">Contact Us</h4>
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-blue-400 mt-1 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                  15-17 Irepodun Close, Isashi/Akute,<br />Ifon, Ogun State
                </p>
              </div>
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-blue-400 flex-shrink-0" />
                <p className="text-xs">{phoneNumber}</p>
              </div>
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <a
                  href="mailto:greateraccessprivate.schools@gmail.com"
                  className="hover:text-blue-400 transition-colors text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  greateraccessprivate.schools@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white border-b border-gray-700 pb-2">Support</h4>
            <p className="text-xs text-gray-500">
              Have questions about registration or requirements? Get in touch with our admissions office.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white w-full py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/40 text-sm"
            >
              Contact Admissions
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-[10px] text-gray-500 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Greater Access Private Schools. Built for Excellence.
        </div>
      </div>

      {/* Admissions Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-gray-200">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FaPhoneAlt className="text-blue-600 text-sm" /> Call School Office
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
              Would you like to initiate a phone call to our admissions team at <span className="font-bold text-gray-900">{phoneNumber}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <a
                href={`tel:${phoneNumber}`}
                className="flex-[2] px-4 py-3 rounded-xl bg-blue-700 text-white font-bold hover:bg-blue-800 transition-transform active:scale-[0.98] text-center shadow-lg shadow-blue-700/20"
              >
                Call Now
              </a>
            </div>
            {/* Direct Link to Enrollment */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
               <Link to="/enroll" className="text-blue-600 text-xs font-semibold hover:underline" onClick={() => setShowModal(false)}>
                 Or submit an online application
               </Link>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
