import React from "react";
import { motion } from "framer-motion";

// Asset Imports
import Image1 from "../assets/image1.jpeg";
import Image2 from "../assets/image2.jpeg";
import Image3 from "../assets/image3.jpeg";
import Image4 from "../assets/image4.jpeg";
import Image5 from "../assets/image5.jpeg";
import Image6 from "../assets/image6.jpeg";
import Image7 from "../assets/image7.jpeg";
import Image8 from "../assets/image8.jpeg"; // Proprietor

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

  // Blue divider
  const Divider = () => (
    <div className="flex items-center gap-3 my-8">
      <div className="h-[2px] w-16 bg-[#0055FF]" />
      <div className="h-[1px] w-10 bg-blue-200" />
      <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
    </div>
  );

  const ceremonySections = [
    { img: Image1, title: "The Grand Entrance", desc: "Graduates stepping into the hall with pride, marking the beginning of a memorable ceremony." },
    { img: Image2, title: "Certification Moment", desc: "Official presentation of awards and certificates to outstanding achievers." },
    { img: Image3, title: "Excellence Awards", desc: "Recognizing excellence in academics, leadership, arts, and innovation." },
    { img: Image4, title: "Valedictory Address", desc: "A powerful message delivered by the head of the graduating class." }
  ];

  return (
    <div className="bg-white text-slate-900 font-sans antialiased">

      {/* HEADER SECTION */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Badge */}
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-[#0055FF] font-semibold tracking-widest text-[10px] uppercase mb-6 bg-blue-50 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#0055FF] animate-pulse" />
              Academic Year 2025 / 2026
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] mb-6"
          >
            Celebrating a New Chapter of{" "}
            <span className="text-[#0055FF]">Student Success</span>
          </motion.h1>

          <Divider />

          <motion.p
            initial="hidden"
            whileInView="show"
            variants={fadeInUp}
            viewport={{ once: true }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed"
          >
            The Graduation and Certification Ceremony at Greater Access
            Private Schools stands as a testament to discipline, dedication,
            and excellence. Here are the highlights of this year’s celebration.
          </motion.p>
        </div>

        {/* Blue background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />
      </section>

      {/* CEREMONY HIGHLIGHT GRID */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {ceremonySections.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="group">
                <div className="overflow-hidden rounded-2xl shadow-md bg-slate-100 aspect-[4/5] mb-4">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0055FF] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* JOURNEY SECTION */}
      <section className="py-24 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* TEXT */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-5"
          >
            <span className="inline-block text-[#0055FF] font-semibold uppercase tracking-widest text-[10px] mb-4 bg-blue-50 px-3 py-1.5 rounded-full">
              Our Environment
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              A Journey Documented
            </h2>

            <Divider />

            <p className="text-slate-700 leading-relaxed mb-6">
              Our academic environment is intentionally structured to develop
              character, strengthen intellect, and inspire leadership.
            </p>

            {/* Bullet List */}
            <div className="space-y-4">
              {[
                "A well-structured learning atmosphere promoting discipline and growth",
                "Modern facilities supporting STEM, arts, and digital learning",
                "Faculty committed to academic excellence and moral development",
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 border border-blue-300 text-[#0055FF] font-bold text-xs">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* IMAGE GALLERY */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="grid grid-cols-2 gap-5">
              <motion.div variants={fadeInUp} className="space-y-5">
                <img src={Image5} className="rounded-2xl shadow-lg h-72 w-full object-cover" />
                <img src={Image6} className="rounded-2xl shadow-lg h-56 w-full object-cover" />
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-8">
                <img src={Image7} className="rounded-2xl shadow-lg h-full w-full object-cover" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROPRIETOR SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-xl bg-white border border-slate-200"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* IMAGE */}
              <div className="h-[350px] lg:h-full overflow-hidden group">
                <img
                  src={Image8}
                  alt="Proprietor"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* CONTENT */}
              <div className="p-10 sm:p-14 flex flex-col justify-center bg-white">
                <span className="inline-block text-[#0055FF] font-semibold tracking-widest text-[10px] uppercase mb-4 bg-blue-50 px-3 py-1 rounded-full">
                  A Word From Our Proprietor
                </span>

                <h2 className="text-3xl font-bold mb-6">Empowering the Next Generation</h2>

                <Divider />

                <blockquote className="italic text-slate-700 leading-relaxed mb-8 border-l-4 border-blue-200 pl-6">
                  "At Greater Access, we believe in raising leaders who will
                  positively shape society. Each graduating class leaves behind
                  a legacy of excellence, discipline, and innovation."
                </blockquote>

                <p className="text-xl font-bold text-slate-900">The Proprietor</p>
                <p className="text-[#0055FF] font-semibold text-sm">Greater Access Private Schools</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-white">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-3xl font-bold mb-4">Shape Your Child's Future with Us</h3>

          <p className="text-slate-600 mb-10 max-w-xl mx-auto">
            Enrollment is open for the next academic session. Secure a place in a school dedicated to excellence.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="bg-[#0055FF] text-white px-10 py-4 rounded-full font-bold shadow-md hover:bg-blue-700 transition">
              Inquire Now
            </button>

            <button className="border border-blue-300 text-[#0055FF] px-10 py-4 rounded-full font-bold hover:bg-blue-50 transition">
              View Curriculum
            </button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default NewSection;
