import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, CalendarCheck, Award, MessageSquare, TrendingUp } from "lucide-react";

// Asset Imports
import Image1 from "../assets/image1.jpeg";
import Image2 from "../assets/image2.jpeg";
import Image3 from "../assets/image3.jpeg";
import Image4 from "../assets/image4.jpeg";
import Image5 from "../assets/image5.jpeg";
import Image6 from "../assets/image6.jpeg";
import Image7 from "../assets/image7.jpeg";
import Image8 from "../assets/image8.jpeg"; 

const NewSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  const staggerContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  const Divider = () => (
    <div className="flex items-center gap-3 my-10">
      <div className="h-[2px] w-20 bg-blue-700" />
      <div className="h-[1px] w-12 bg-blue-200" />
      <div className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse outline outline-4 outline-blue-50" />
    </div>
  );

  const ceremonySections = [
    { 
      img: Image1, 
      title: "The Grand Procession", 
      desc: "Our graduates entering the grand hall with pride and dignity, symbolizing their transition to the next phase of life.",
      badge: "Graduation 2025"
    },
    { 
      img: Image2, 
      title: "Academic Recognition", 
      desc: "The formal certification process, where students are officially recognized for their discipline and achievement.",
      badge: "Certification"
    },
    { 
      img: Image3, 
      title: "Merit Awards", 
      desc: "Honoring students who excelled in various fields including math, sciences, arts, and exemplary leadership.",
      badge: "Excellence"
    },
    { 
      img: Image4, 
      title: "The Valedictory Address", 
      desc: "An inspiring closing message delivered by the head of the graduating class, looking forward to a bright future.",
      badge: "Speeches"
    }
  ];

  return (
    <div className="bg-white text-slate-900 font-sans antialiased overflow-hidden">

      {/* Hero Header Section */}
      <section className="relative pt-40 pb-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">

          {/* Badge */}
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-blue-700 font-bold uppercase tracking-[0.25em] text-[10px] mb-8 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-full shadow-sm">
              <CalendarCheck className="w-3.5 h-3.5" />
              Academic Session 2025 / 2026
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-8 tracking-tight max-w-4xl"
          >
            Celebrating Excellence: A New Chapter of <span className="text-blue-700 italic">Achievement</span>
          </motion.h1>

          <Divider />

          <motion.p
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
            className="text-base sm:text-xl text-slate-600 max-w-3xl leading-relaxed font-light"
          >
            The Graduation and Certification Ceremony at Greater Access
            Private Schools remains a significant milestone, representing a decade of discipline, 
            intellectual growth, and character development. Explore the highlights of our latest celebration.
          </motion.p>
        </div>

        {/* Ambient background accents */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-50/60 rounded-full blur-[10rem] -z-10 -translate-y-1/2 translate-x-1/4" />
      </section>

      {/* HIGHLIGHT FEED SECTION */}
      <section className="pb-32 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {ceremonySections.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="group cursor-default">
                <div className="relative overflow-hidden rounded-[2rem] shadow-xl bg-slate-100 aspect-[4/5] mb-6">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-700 shadow-lg">
                       {item.badge}
                     </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors flex items-center justify-between">
                  {item.title}
                  <ChevronRight className="w-4 h-4 text-blue-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED STORY SECTION */}
      <section className="py-32 bg-slate-50 px-6 sm:px-10 lg:px-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* TEXT CONTENT */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8"
          >
            <span className="inline-flex items-center gap-2 text-blue-700 font-black uppercase tracking-[0.25em] text-[10px] mb-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">
              <Award className="w-3.5 h-3.5" />
              Our Environment
            </span>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              A Journey <span className="text-blue-700">Documented</span>
            </h2>

            <Divider />

            <p className="text-slate-600 leading-relaxed text-lg italic pr-4">
              "Greater Access provides a unique ecosystem where academic rigor is balanced 
              with spiritual guidance and character development."
            </p>

            {/* Feature List */}
            <div className="space-y-6">
              {[
                { title: "Structured Discipline", desc: "A regulated learning environment promoting consistent student growth.", Icon: TrendingUp },
                { title: "Advanced STEM Integration", desc: "Comprehensive labs supporting science, technology, and engineering.", Icon: MessageSquare },
                { title: "Mentorship Culture", desc: "Dedicated faculty committed to both academic and moral advancement.", Icon: Award },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5 items-start group">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-blue-700 shadow-sm group-hover:bg-blue-700 group-hover:text-white transition-all duration-300">
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* GALLERY GRID */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-2 gap-6 relative">
              <motion.div variants={fadeInUp} className="space-y-6">
                <img src={Image5} className="rounded-3xl shadow-xl h-80 w-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
                <img src={Image6} className="rounded-3xl shadow-xl h-60 w-full object-cover" />
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-12 space-y-6">
                <img src={Image7} className="rounded-3xl shadow-xl h-full w-full object-cover" />
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-32 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 text-white relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* IMAGE SIDE */}
              <div className="h-[400px] lg:h-full overflow-hidden relative group">
                <img
                  src={Image8}
                  alt="Greater Access Principal/Proprietor"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all duration-500" />
              </div>

              {/* CONTENT SIDE */}
              <div className="p-12 sm:p-20 flex flex-col justify-center relative overflow-hidden">
                <span className="inline-block text-blue-400 font-black tracking-[0.3em] text-[10px] uppercase mb-6 bg-blue-900/50 border border-blue-800 px-4 py-2 rounded-full w-fit">
                  Proprietor's Mandate
                </span>

                <h2 className="text-4xl sm:text-5xl font-black mb-8 leading-tight tracking-tight">Empowering the Next Generation of <span className="text-blue-400">Leaders</span></h2>

                <Divider />

                <blockquote className="text-xl sm:text-2xl font-light italic text-slate-300 leading-relaxed mb-10 pl-8 border-l-4 border-blue-500">
                  "At Greater Access, we operate with a singular purpose: to raise visionaries who will navigate and positively impact the complex global landscape."
                </blockquote>

                <div>
                   <p className="text-lg font-bold tracking-widest uppercase">The Office of the Proprietor</p>
                   <p className="text-blue-400 font-black text-xs mt-1 uppercase tracking-widest">Greater Access Private Schools</p>
                </div>
                
                {/* Visual decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-1" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-40 text-center px-6 sm:px-10">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="w-20 h-1 bg-blue-700 mx-auto mb-10 rounded-full" />
          <h3 className="text-4xl sm:text-6xl font-black text-slate-900 mb-8 tracking-tighter">Your Future Begins <span className="text-blue-700 italic">Here</span></h3>

          <p className="text-slate-600 text-lg mb-14 max-w-2xl mx-auto font-light">
            Admission is strictly by merit. Secure a place for your child in an institution 
            dedicated to moral integrity and academic rigor.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/enroll"
              className="bg-blue-700 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:bg-blue-800 hover:-translate-y-1 transition-all active:scale-95"
            >
              Start Admission Process
            </Link>

            <Link
              to="/about"
              className="border-2 border-slate-200 text-slate-700 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-blue-700 hover:text-blue-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              Explore Our Story
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default NewSection;
