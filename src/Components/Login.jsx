import React, { useState } from "react";
import { Mail, User, Calendar, Phone } from "react-feather";
import axios from "axios";
import signupImage from "../assets/signup.jpg"; // ✅ Make sure this path is correct

const Login = () => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage({ text: "", type: "" });

  // Validate all fields are filled
  for (let key in formData) {
    if (!formData[key]) {
      setMessage({ text: "All fields are required.", type: "error" });
      return;
    }
  }

  setLoading(true);

  try {
    const response = await axios.post("http://localhost:5000/api/enroll", formData);

    if (response.data.success) {
      setMessage({ text: "Enrollment successful. Confirmation sent.", type: "success" });
      setFormData({
        fullName: "",
        email: "",
        dob: "",
        phone: "",
        class: "",
        department: "",
      });
    } else {
      setMessage({ text: response.data.message || "Submission failed.", type: "error" });
    }
  } catch (err) {
    console.error("Enrollment error:", err.response?.data || err.message);

    // Check if it's a duplicate email error from backend (status 409)
    if (err.response?.status === 409) {
      setMessage({ text: err.response.data.message || "This email has already been used.", type: "error" });
    } else {
      setMessage({ text: "Server error. Please try again.", type: "error" });
    }
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image Side */}
        <div className="hidden md:block">
          <img src={signupImage} alt="Signup" className="h-full w-full object-cover" />
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6 text-center">Enrollment Form</h2>

          {message.text && (
            <p className={`mb-4 text-center ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
              {message.text}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-gray-700 mb-1">Full Name</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <User className="text-gray-500 mr-2" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Mail className="text-gray-500 mr-2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* DOB */}
            <div>
              <label htmlFor="dob" className="block text-gray-700 mb-1">Date of Birth</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Calendar className="text-gray-500 mr-2" />
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-1">Phone</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Phone className="text-gray-500 mr-2" />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +234 800 000 0000"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {/* Class */}
            <div>
              <label htmlFor="class" className="block text-gray-700 mb-1">Class</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Class</option>
                <option value="JSS1">JSS1</option>
                <option value="JSS2">JSS2</option>
                <option value="JSS3">JSS3</option>
                <option value="SS1">SS1</option>
                <option value="SS2">SS2</option>
                <option value="SS3">SS3</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-gray-700 mb-1">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Department</option>
                <option value="Science">Science</option>
                <option value="Art">Art</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
