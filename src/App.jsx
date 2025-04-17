import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Footer from './Components/Footer';
import Navbar from './Components/Navbar'; 
import Login from './Components/Login';// Import the Navbar component

const App = () => {
  return (
    <Router>
      <div>
        {/* Navbar Component */}
        <Navbar />

        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
