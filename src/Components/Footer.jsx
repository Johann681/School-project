import React, { useState } from "react";
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
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-5 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-white">
              Greater Access Schools
            </h3>
            <p className="text-sm">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 text-white px-5 py-2 rounded-full font-medium hover:bg-green-600 transition duration-300 shadow-md"
              >
                Contact
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-4">
              © 2025 Greater Access Schools. All rights reserved.
            </p>
          </div>

          {/* Center Column */}
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-xl text-green-400 mt-1" />
              <p>15-17 Irepodun Close, Isahsi/Akute, Ogun State</p>
            </div>
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-xl text-green-400" />
              <p>{phoneNumber}</p>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-xl text-green-400" />
              <a
                href="mailto:greateraccessprivate.schools@gmail.com"
                className="hover:text-green-400 transition"
              >
                greateraccessprivate.schools@gmail.com
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5 text-sm">
            <p>
              <span className="font-semibold text-white">About Us</span>
              <br />
              Greater Access Private Schools... Your gateway to greater heights.
              Stay connected with us!
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/greateraccessschools?utm_source=qr&igsh=bjBjMm9idjFpYzE1"
                className="text-green-400 hover:text-pink-500 text-2xl transition"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center text-xs text-gray-500 mt-12">
          &copy; {new Date().getFullYear()} Greater Access Private Schools
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-3">📞 Call School</h3>
            <p className="mb-5">
              Do you want to call{" "}
              <span className="font-semibold text-green-700">{phoneNumber}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <a
                href={`tel:${phoneNumber}`}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
