import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Footer from './Components/Footer';
import Navbar from './Components/Navbar'; 
import Login from './Components/Login';
import Admin from './Components/Admin'; // ✅ Import the Admin dashboard
import NewSection from './Components/New';

// Wrapper to control layout based on route
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
          <Route path="/New" element={<NewSection />} />

          {/* Admin Route */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
};

export default App;
