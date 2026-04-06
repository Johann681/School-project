import React from 'react';
import storyImage from '../assets/Story.jpg';
import approvalsImage from '../assets/approvals.jpg';
import missionImage from '../assets/mission.jpg';
import proprietorImage from '../assets/prop2.jpg';
import { CheckCircle, Award, Star } from 'react-feather';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-white mt-15 pt-12">
      {/* Page Header */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Our Heritage and Vision
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            Discover the origins, milestones, and core vision that shape the excellence of Greater Access Private Schools.
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-8 rounded-full" />
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2 relative group">
          <div className="absolute inset-0 bg-blue-100 rounded-3xl translate-x-3 translate-y-3 -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />
          <img
            src={storyImage}
            alt="The foundation story of Greater Access Private Schools"
            className="w-full rounded-3xl shadow-lg object-cover aspect-[4/3] relative z-10"
          />
        </div>
        <div className="md:w-1/2 space-y-6">
          <div className="inline-block text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">Establishment</div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Our Story
          </h2>
          <hr className="w-16 border-t-4 border-blue-600 rounded-full" />
          <p className="text-slate-700 leading-relaxed text-lg">
            Greater Access Private Schools was founded on the fundamental belief that every
            child deserves a nurturing environment in which to thrive. Since our inception,
            we have maintained low student-to-teacher ratios, ensuring personalized
            attention and holistic development.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Our community of dedicated educators fosters confidence, creativity,
            and leadership, guiding students toward becoming tomorrow’s visionaries and responsible global citizens.
          </p>
        </div>
      </section>

      {/* Approvals & Vision */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                 <CheckCircle className="w-6 h-6" />
               </div>
               <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                 WAEC, NECO & Government Approved
               </h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-lg italic border-l-4 border-blue-200 pl-6">
              Established in 2006 under the motto <span className="font-bold text-blue-700">“Never Say Fail,”</span> our curriculum
              meets all national standards, empowering students to excel in every external examination.
            </p>
            <div className="pt-4">
              <h3 className="text-xl font-bold text-blue-800 uppercase tracking-widest text-xs mb-3">Our Core Vision</h3>
              <p className="text-slate-700 leading-relaxed text-xl font-medium">
                "To remain the leading educational institution recognized for excellence, integrity, and innovation in learning."
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={approvalsImage}
              alt="Official Approvals and Academic Accreditations"
              className="w-full rounded-3xl shadow-xl object-cover aspect-[16/10]"
            />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row gap-16 items-center">
        <div className="md:w-1/2 order-2 md:order-1">
          <img
            src={missionImage}
            alt="Our academic mission for students"
            className="w-full rounded-3xl shadow-lg object-cover aspect-[4/3]"
          />
        </div>
        <div className="md:w-1/2 space-y-6 order-1 md:order-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
               <Star className="w-6 h-6" />
             </div>
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
               Our Mission
             </h2>
          </div>
          <hr className="w-16 border-t-4 border-blue-600 rounded-full" />
          <p className="text-slate-700 leading-relaxed text-lg">
            To deliver high-quality education grounded in competence, devotion,
            and integrity. We prepare our students for absolute success in a dynamic, tech-driven, and ever-evolving global landscape.
          </p>
          <Link 
            to="/enroll"
            className="mt-4 inline-flex items-center justify-center bg-blue-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Join Our Community
          </Link>
        </div>
      </section>

      {/* Proprietor Message */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/3 flex justify-center">
            <img
              src={proprietorImage}
              alt="Mr. Samson Obalua, Proprietor of Greater Access Private Schools"
              className="w-full max-w-sm rounded-[2rem] shadow-2xl border-4 border-slate-800 object-cover aspect-[3/4]"
            />
          </div>
          <div className="md:w-2/3 space-y-8">
            <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">
              Leadership Note
            </div>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              A Word from the Proprietor
            </h2>
            <div className="w-20 h-1.5 bg-blue-500 rounded-full" />
            <p className="text-slate-300 leading-relaxed text-xl font-light italic">
              "At Greater Access, we believe in the unique potential within every child. 
              Our institution thrives on a culture of shared excellence, compassion, and the pursuit of greatness in all facets of human endeavor."
            </p>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xl font-bold">Mr. Samson Obalua</p>
              <p className="text-blue-400 font-semibold tracking-widest text-xs uppercase">Founder & Proprietor</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
