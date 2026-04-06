import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Trash2, 
  LogOut, 
  ChevronUp, 
  ChevronDown, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import axios from "axios";

const Admin = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  
  // ✅ Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  
  // ✅ Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://school-project-i40q.onrender.com/api";

  const fetchStudents = async () => {
    setFetchingStudents(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to synchronize student records. Please refresh the page.");
      }
    } finally {
      setFetchingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/admin/students/${studentToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(students.filter((s) => s._id !== studentToDelete));
      setStudentToDelete(null);
    } catch (err) {
      alert("Critical: Failed to delete record. Please check permissions.");
    } finally {
      setDeleting(false);
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // ✅ Sorting Logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Filter & Sort Performance Optimization
  const processedStudents = useMemo(() => {
    let result = [...students];

    // Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.class.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[sortConfig.key]?.toString().toLowerCase();
      const valB = b[sortConfig.key]?.toString().toLowerCase();
      
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchQuery, sortConfig]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Header / Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-700/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Enrollment Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout Session</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* Stats & Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Total Count Card */}
          <div className="lg:col-span-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Students</span>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900">
                {fetchingStudents ? "..." : students.length}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 mb-0 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> Latest enrollment: {students[0]?.fullName?.split(" ")[0] || "None"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="lg:col-span-9 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-1 w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 px-0.5" />
               <input 
                 type="text" 
                 placeholder="Search by student name, email address, or class designation..."
                 className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <button disabled className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-950/10 opacity-40">
               <Filter className="w-4 h-4" />
               Apply Filters
             </button>
          </div>
        </div>

        {/* Students Table Section */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Section Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">
              Application Records
              <span className="ml-3 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] rounded-full uppercase tracking-widest font-black">
                {processedStudents.length} Results
              </span>
            </h3>
            <button 
              onClick={fetchStudents} 
              className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1.5"
            >
              Refresh Data
            </button>
          </div>

          {fetchingStudents ? (
            /* ✅ Loading Skeleton */
            <div className="p-10 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse w-full"></div>
              ))}
            </div>
          ) : processedStudents.length === 0 ? (
            /* ✅ Empty State */
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-700">No Application Records Found</h4>
              <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                We couldn't find any students matching your current search parameters.
              </p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-6 text-blue-600 font-bold hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* ✅ Responsive Scrollable Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black border-b border-slate-100">
                    <th className="px-8 py-5 text-slate-800">#</th>
                    <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort("fullName")}>
                      <div className="flex items-center gap-2">
                        Student Details
                        {sortConfig.key === "fullName" ? (sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/>}
                      </div>
                    </th>
                    <th className="px-6 py-5">Contact Information</th>
                    <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort("class")}>
                       <div className="flex items-center gap-2">
                         Placement
                         {sortConfig.key === "class" ? (sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/>}
                       </div>
                    </th>
                    <th className="px-6 py-5 cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort("createdAt")}>
                      <div className="flex items-center gap-2">
                         Applied On
                         {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100"/>}
                       </div>
                    </th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedStudents.map((student, index) => (
                    <tr key={student._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5 text-xs font-bold text-slate-300">{(index + 1).toString().padStart(2, "0")}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{student.fullName}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> DOB: {new Date(student.dob).toLocaleDateString("en-GB")}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center text-xs text-slate-700">
                             <Mail className="w-3 h-3 mr-2 text-slate-400" />
                             {student.email}
                             <button 
                               onClick={() => copyEmail(student.email)}
                               className={`ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded transition ${copiedEmail === student.email ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                             >
                               {copiedEmail === student.email ? "Copied" : "Copy"}
                             </button>
                           </div>
                           <div className="flex items-center text-xs text-slate-700 mt-1">
                             <Phone className="w-3 h-3 mr-2 text-slate-400" />
                             {student.phone}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                           <div className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider w-fit">
                             <span className="mr-1"><GraduationCap className="w-3 h-3" /></span> {student.class}
                           </div>
                           <div className="inline-flex items-center px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider w-fit mt-1">
                             <span className="mr-1"><Briefcase className="w-3 h-3" /></span> {student.department}
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                        {new Date(student.createdAt || Date.now()).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                             <ExternalLink className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => setStudentToDelete(student._id)}
                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                             title="Delete Record"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Implementation of Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 scale-in-center transition-all">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Student Record?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              This action is <span className="font-bold text-red-600">permanent</span>. All data associated with this enrollment will be removed from the portal immediately.
            </p>
            <div className="flex gap-3">
              <button
                disabled={deleting}
                onClick={() => setStudentToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                No, Keep
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-[2] px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center"
              >
                {deleting ? "Processing..." : "Yes, Delete It"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
};

export default Admin;
