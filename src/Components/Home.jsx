import React from "react";
import { Link } from "react-router-dom";
import classImage from "../assets/class.jpg";
import libraryImg from "../assets/libary.jpg";
import musicImg from "../assets/music (1).jpg";
import labImg from "../assets/lab.jpg";
import { BookOpen, Users, MapPin, ArrowRight, GraduationCap, Sparkles, ArrowUpRight } from "lucide-react";
import { FaBook, FaMusic, FaFlask, FaChalkboardTeacher } from "react-icons/fa";

const Home = () => {
  const services = [
    {
      img: libraryImg,
      label: 'Academic Library',
      desc: 'State-of-the-art libraries with an extensive collection of academic resources.',
      Icon: FaBook,
    },
    {
      img: classImage,
      label: 'Modern Classrooms',
      desc: 'Spacious and well-ventilated learning environments designed for focus.',
      Icon: FaChalkboardTeacher,
    },
    {
      img: musicImg,
      label: 'Creative Studios',
      desc: 'Equipped music and art studios to nurture artistic expression and talent.',
      Icon: FaMusic,
    },
    {
      img: labImg,
      label: 'Science Laboratories',
      desc: 'Advanced science labs with modern equipment for hands-on practical learning.',
      Icon: FaFlask,
    },
  ];

  const pathways = [
    { label: "Junior School", range: "JSS 1–3", desc: "A confident foundation in core subjects, practical learning, and character development.", color: "bg-[#e7f0ec]", Icon: BookOpen },
    { label: "Senior School", range: "SS 1–3", desc: "Focused preparation for external examinations with room to discover a clear direction.", color: "bg-[#f5eadb]", Icon: GraduationCap },
    { label: "Whole-child growth", range: "Beyond the classroom", desc: "A balanced community where leadership, creativity, discipline, and service matter.", color: "bg-[#e8edf6]", Icon: Sparkles },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Professional Announcement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 md:pt-28">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Enrollment Now Open for 2026/2027 Session
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 text-slate-900 leading-[1.1] tracking-tight">
              Welcome to <span className="text-blue-700">Greater Access</span> Private Schools
            </h1>
            <p className="mb-8 text-base sm:text-lg text-slate-600 max-w-prose leading-relaxed">
              Discover our rigorous academic programs, vibrant campus life, and the unique opportunities that will shape your future and empower leadership.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/enroll"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-700 text-white text-sm sm:text-base px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                Apply for Admission <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 text-sm sm:text-base px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>

            {/* Icons Section */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12 pt-12 border-t border-slate-100">
              {[
                { Icon: BookOpen, label: "Curriculum" },
                { Icon: Users, label: "Community" },
                { Icon: MapPin, label: "Campus" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-blue-600">
                     <Icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className="text-slate-800 font-bold text-sm uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Content */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-200 rounded-full -z-10 blur-xl" />
            <img
              src={classImage}
              alt="Classroom Excellence at Greater Access Private Schools"
              className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] relative z-10"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-slate-700/60 sm:grid-cols-2 lg:grid-cols-4">
          {["Since 2006", "JSS 1 – SS 3", "Focused class sizes", "A culture of excellence"].map((item, index) => (
            <div key={item} className="bg-slate-900 px-6 py-7 sm:px-8">
              <p className="text-2xl font-black tracking-tight text-white">{item}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{["Established", "School journey", "Personal attention", "Our standard"][index]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-700">A place to grow</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-900 sm:text-5xl">Every stage has its own <span className="text-blue-700">moment.</span></h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">From the first day of junior school to the confidence of senior school, our learning experience is designed to meet students where they are and help them move forward with purpose.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pathways.map(({ label, range, desc, color, Icon }) => (
            <article key={label} className={`${color} group relative overflow-hidden rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1`}>
              <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-slate-900"><Icon className="h-5 w-5" /></div><ArrowUpRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
              <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">{range}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Facilities Section */}
      <section id="services" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 bg-white rounded-t-[3rem] lg:rounded-t-[5rem] shadow-sm">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">Academic Excellence</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-2">
            World-Class Facilities
          </h2>
          <p className="mt-4 text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We are equipped with state-of-the-art resources and specialized labs to enhance the learning experience across all disciplines.
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-8 rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {services.map(({ img, label, desc, Icon }) => (
            <div
              key={label}
              className="bg-slate-50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center text-center group"
            >
              <div className="w-full overflow-hidden rounded-xl mb-6 aspect-video">
                <img
                  src={img}
                  alt={label}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {label}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <div className="h-12 lg:h-20"></div>
    </div>
  );
};

export default Home;
