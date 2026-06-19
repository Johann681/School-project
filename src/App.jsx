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
import AdminPanel from './Components/AdminPanel';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentProfile from './pages/StudentProfile';
import NewSection from './Components/New';
import Enroll from './Components/Enroll';
import NotFound from './Components/NotFound';
import ProtectedRoute from './Components/ProtectedRoute';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideLayout = ["/admin", "/teacher", "/student", "/login", "/admin-login", "/teacher-login", "/student-login"].some((path) => location.pathname.startsWith(path));

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
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfile />
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
