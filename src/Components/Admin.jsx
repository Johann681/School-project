import React, { useState, useEffect } from "react";
import axios from "axios";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        username,
        password,
      });
      const receivedToken = res.data.token;
      setToken(receivedToken);
      localStorage.setItem("adminToken", receivedToken);
      setError("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!token) return;
    setFetchingStudents(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/admin/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      setError("Failed to fetch students. Please login again.");
      localStorage.removeItem("adminToken");
      setToken("");
    } finally {
      setFetchingStudents(false);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  if (!token) {
    return (
      <div className="p-6 max-w-md mx-auto mt-16 bg-gray-50 rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full mb-3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
          disabled={loading}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            setToken("");
            setStudents([]);
            setError("");
          }}
          className="text-gray-600 hover:text-gray-900 border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-gray-800">Enrolled Students</h3>

      {fetchingStudents ? (
        <p className="text-gray-700">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-gray-600">No students enrolled</p>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white shadow rounded-lg p-4 text-sm md:grid md:grid-cols-6 md:gap-4"
            >
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">Name</p>
                <p className="text-gray-900">{student.fullName}</p>
              </div>
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">Email</p>
                <p className="flex items-center text-gray-900">
                  {student.email}
                  <button
                    onClick={() => copyEmail(student.email)}
                    className="ml-2 text-xs text-blue-600 hover:underline focus:outline-none"
                    aria-label={`Copy email ${student.email}`}
                  >
                    {copiedEmail === student.email ? "Copied!" : "Copy"}
                  </button>
                </p>
              </div>
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">Phone</p>
                <p className="text-gray-900">{student.phone}</p>
              </div>
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">DOB</p>
                <p className="text-gray-900">
                  {new Date(student.dob).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">Class</p>
                <p className="text-gray-900">{student.class}</p>
              </div>
              <div className="mb-2 md:mb-0">
                <p className="font-semibold text-gray-700">Department</p>
                <p className="text-gray-900">{student.department}</p>
                <button
                  onClick={() => deleteStudent(student._id)}
                  className="mt-2 text-red-600 hover:underline text-xs focus:outline-none"
                  aria-label={`Delete student ${student.fullName}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default Admin;
