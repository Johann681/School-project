import React from "react";
import { Link } from "react-router-dom";
import classImage from "../assets/class.jpg";
import libraryImg from "../assets/libary.jpg";
import musicImg from "../assets/music (1).jpg";
import labImg from "../assets/lab.jpg";
import { BookOpen, Users, MapPin } from "react-feather";
import { FaBook, FaMusic, FaFlask, FaChalkboardTeacher } from "react-icons/fa";

const Home = () => {
  const services = [
    {
      img: libraryImg,
      label: 'Library',
      desc: 'Well-equipped libraries with the latest books',
      Icon: FaBook,
    },
    {
      img: classImage,
      label: 'Classrooms',
      desc: 'Spacious and ventilated classrooms',
      Icon: FaChalkboardTeacher,
    },
    {
      img: musicImg,
      label: 'Studios',
      desc: 'State-of-the-art music and art studios',
      Icon: FaMusic,
    },
    {
      img: labImg,
      label: 'Laboratories',
      desc: 'Modern science labs with advanced equipment',
      Icon: FaFlask,
    },
  ];

  return (
    <div className="bg-gray-100">
      {/* Professional Announcement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <div className="inline-block bg-white border border-gray-300 text-gray-800 text-sm sm:text-base px-3 py-1 sm:px-4 sm:py-2 rounded shadow-sm">
          Enrollment Now Open – Limited Slots
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 md:pt-16">
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start">
          {/* Text Content */}
          <div className="w-full lg:w-1/2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
              Welcome to Greater Access Private Schools
            </h1>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-gray-700 max-w-prose">
              Discover our rigorous programs, vibrant campus life, and the opportunities that will shape your future.
            </p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-shadow shadow-sm hover:shadow-md"
            >
              Apply Now
            </Link>

            {/* Icons Section */}
            <div className="flex flex-wrap gap-6 mt-6">
              {[
                { Icon: BookOpen, label: "Curriculum" },
                { Icon: Users, label: "Community" },
                { Icon: MapPin, label: "Campus" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Content */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0 flex justify-center">
            <img
              src={classImage}
              alt="Classroom at Greater Access"
              className="rounded-lg shadow-md w-full max-w-sm sm:max-w-md object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Our Facilities
          </h2>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            We are equipped with state-of-the-art resources to enhance learning.
          </p>
          <hr className="w-24 border-t-2 border-blue-600 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(({ img, label, desc, Icon }) => (
            <div
              key={label}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 flex flex-col items-center text-center"
            >
              <img
                src={img}
                alt={label}
                className="h-32 w-full object-cover rounded-md mb-4"
              />
              <Icon className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {label}
              </h3>
              <p className="text-gray-600 text-sm">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacer */}
      <div className="h-8 lg:h-12"></div>
    </div>
  );
};

export default Home;
