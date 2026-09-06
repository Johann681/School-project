import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Footer from './Components/Footer';
import Navbar from './Components/Navbar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import StudentLogin from './pages/StudentLogin';
import ParentLogin from './pages/ParentLogin';
import ParentSignup from './pages/ParentSignup';
import ParentDashboard from './pages/ParentDashboard';
import AdminWorkspace from './Components/AdminWorkspace';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherTimetable from './pages/TeacherTimetable';
import TeacherAttendance from './pages/TeacherAttendance';
import StudentProfile from './pages/StudentProfile';
import StudentTimetable from './pages/StudentTimetable';
import NewSection from './Components/New';
import Enroll from './Components/Enroll';
import NotFound from './Components/NotFound';
import AdminAuditLogs from './pages/AdminAuditLogs';
import ProtectedRoute from './Components/ProtectedRoute';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideLayout = [
    "/admin",
    "/teacher",
    "/student",
    "/parent",
    "/login",
    "/admin-login",
    "/teacher-login",
    "/student-login",
    "/parent-login",
    "/parent-signup",
    "/teacher-timetable",
    "/teacher-attendance",
    "/student-timetable",
    "/admin/audit",
  ].some((path) => location.pathname.startsWith(path));

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/new" element={<NewSection />} />

          {/* Protected Admin / Teacher / Student Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <>
                  <AdminWorkspace />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["TEACHER"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/teacher-timetable" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherTimetable /></ProtectedRoute>} />
          <Route path="/teacher-attendance" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherAttendance /></ProtectedRoute>} />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-timetable"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentTimetable />
              </ProtectedRoute>
            }
          />
          <Route path="/parent-login" element={<ParentLogin />} />
          <Route path="/parent-signup" element={<ParentSignup />} />
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
};

export default App;
