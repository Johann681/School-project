import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <h1 className="text-6xl font-bold text-blue-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-sans">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved. 
        Please check the URL or head back to the home page.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
