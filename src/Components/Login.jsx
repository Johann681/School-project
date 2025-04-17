import React, { useState } from "react";
import { Mail, User, Calendar, Phone } from "react-feather";
import axios from "axios";
import signupImage from "../assets/signup.jpg"; // Place signup.jpg in src/assets/

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    studentId: "",
    dob: "",
    phone: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    // Validation
    for (let key in formData) {
      if (!formData[key]) {
        setMessage({ text: "All fields are required.", type: "error" });
        return;
      }
    }

    try {
      const response = await axios.post(
        "https://your-backend-endpoint.com/submit",
        formData
      );

      if (response.data.success) {
        setMessage({ text: "Login successful. Confirmation sent.", type: "success" });
        setFormData({ email: "", studentId: "", dob: "", phone: "" });
      } else {
        setMessage({ text: "Something went wrong, please try again.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error. Please try later.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Image Section */}
        <div className="hidden md:block">
          <img
            src={signupImage}
            alt="Signup"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">
            Student Login
          </h2>

          {message.text && (
            <p
              className={`mb-4 text-center ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/** Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 transition">
                <Mail className="text-gray-500 mr-2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            {/** Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-gray-700 mb-1">
                Student ID
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 transition">
                <User className="text-gray-500 mr-2" />
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Your Student ID"
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            {/** Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 transition">
                <Calendar className="text-gray-500 mr-2" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            {/** Phone */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 transition">
                <Phone className="text-gray-500 mr-2" />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +234 800 000 0000"
                  className="w-full outline-none text-gray-800"
                />
              </div>
            </div>

            {/** Submit Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-blue-700 transition duration-300"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
