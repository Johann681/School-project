import React, { useState } from "react";
import { Mail, User, Calendar, Phone } from "react-feather";
import axios from "axios";
import signupImage from "../assets/signup.jpg";

const Enroll = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    phone: "",
    class: "",
    department: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Updated to use dynamic Base URL for API
  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://school-project-i40q.onrender.com/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    for (let key in formData) {
      if (!formData[key]) {
        setMessage({ text: "All fields are required. Please check your inputs.", type: "error" });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/enroll`, formData);

      if (response.data.success) {
        setMessage({
          text: "Enrollment application submitted successfully! Our admissions team will contact you shortly.",
          type: "success",
        });
        setFormData({
          fullName: "",
          email: "",
          dob: "",
          phone: "",
          class: "",
          department: "",
        });
      } else {
        setMessage({
          text: response.data.message || "Failed to submit enrollment. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Enrollment error:", err.response?.data || err.message);
      if (err.response?.status === 409) {
        setMessage({
          text: err.response.data.message || "This email has already been registered for enrollment.",
          type: "error",
        });
      } else {
        setMessage({ 
          text: "A server error occurred while processing your application. Please try again later.", 
          type: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Decorative Side Image */}
        <div className="hidden md:block">
          <img
            src={signupImage}
            alt="Greater Access Private School Admissions"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Enrollment Form Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2 text-center md:text-left">
            Enrollment Form
          </h2>
          <p className="text-gray-500 mb-8 text-center md:text-left text-sm">
            Begin your journey toward academic excellence. Complete the fields below to apply.
          </p>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-center text-sm font-medium ${
                message.type === "error" 
                  ? "bg-red-50 text-red-700 border border-red-100" 
                  : "bg-green-50 text-green-700 border border-green-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 font-medium mb-1.5 text-sm">
                Full Legal Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <User className="text-gray-400 mr-3" size={18} />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className="w-full outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1.5 text-sm">
                Parent/Guardian Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Mail className="text-gray-400 mr-3" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* DOB */}
              <div>
                <label htmlFor="dob" className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Date of Birth
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <Calendar className="text-gray-400 mr-3" size={18} />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full outline-none text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Contact Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <Phone className="text-gray-400 mr-3" size={18} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="080 0000 0000"
                    className="w-full outline-none text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Class */}
              <div>
                <label htmlFor="class" className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Class Applying For
                </label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="JSS1">JSS 1</option>
                  <option value="JSS2">JSS 2</option>
                  <option value="JSS3">JSS 3</option>
                  <option value="SS1">SS 1</option>
                  <option value="SS2">SS 2</option>
                  <option value="SS3">SS 3</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-gray-700 font-medium mb-1.5 text-sm">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                  required
                >
                  <option value="">Select Field</option>
                  <option value="Science">Science (Pure Arts & Lab)</option>
                  <option value="Art">Humanities & Social Sciences</option>
                  <option value="Commercial">Commercial & Management</option>
                </select>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Enroll;
