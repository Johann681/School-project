import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Footer from './Components/Footer';
import Navbar from './Components/Navbar'; 
import Login from './Components/Login';
import Admin from './Components/Admin'; 
import NewSection from './Components/New';
import Enroll from './Components/Enroll';
import NotFound from './Components/NotFound';
import ProtectedRoute from './Components/ProtectedRoute';

// ✅ Wrapper to control layout based on route
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/admin");

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
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/new" element={<NewSection />} />

          {/* Protected Admin Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
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
