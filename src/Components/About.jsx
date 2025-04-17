import React from 'react';
import storyImage from '../assets/Story.jpg';
import approvalsImage from '../assets/approvals.jpg';
import missionImage from '../assets/mission.jpg';
import proprietorImage from '../assets/prop2.jpg';
import { CheckCircle, Award, Star } from 'react-feather';

const About = () => {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Story
          </h1>
          <p className="text-gray-700 text-base sm:text-lg">
            Discover the origins, milestones, and vision that shape Greater Access Private Schools.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2">
          <img
            src={storyImage}
            alt="Our School Story"
            className="w-full rounded-lg shadow-md object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Our Story
          </h2>
          <hr className="w-16 border-t-2 border-green-600" />
          <p className="text-gray-700 leading-relaxed">
            Greater Access Private Schools was founded on the belief that every
            child deserves a nurturing environment to thrive. Since our inception,
            we have maintained low student-to-teacher ratios, ensuring personalized
            attention and holistic development.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our community of dedicated educators fosters confidence, creativity,
            and leadership, guiding students toward becoming tomorrow’s visionaries.
          </p>
        </div>
      </section>

      {/* Approvals & Vision */}
      <section className="container mx-auto px-4 py-12 bg-gray-50 flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-600 w-6 h-6" />
            WAEC, NECO & Government Approved
          </h2>
          <hr className="w-16 border-t-2 border-green-600" />
          <p className="text-gray-700 leading-relaxed">
            Established in 2006 under the motto “Never Say Fail,” our curriculum
            meets all national standards, empowering students to excel in every exam.
          </p>
          <h3 className="text-xl font-semibold text-green-700">Our Vision</h3>
          <p className="text-gray-700 leading-relaxed">
            To be the leading educational institution recognized for excellence,
            integrity, and innovation in learning.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src={approvalsImage}
            alt="Approvals and Accreditations"
            className="w-full rounded-lg shadow-md object-cover"
          />
        </div>
      </section>

      {/* Our Mission */}
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2">
          <img
            src={missionImage}
            alt="Our Mission"
            className="w-full rounded-lg shadow-md object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <Star className="text-green-600 w-6 h-6" />
            Our Mission
          </h2>
          <hr className="w-16 border-t-2 border-green-600" />
          <p className="text-gray-700 leading-relaxed">
            To deliver high-quality education grounded in competence, devotion,
            and integrity. We prepare students for success in a dynamic, tech-driven world.
          </p>
          <button className="mt-2 inline-block bg-green-700 text-white px-6 py-2 rounded-full font-medium hover:bg-green-800 transition">
            Join Us Today
          </button>
        </div>
      </section>

      {/* Proprietor */}
      <section className="container mx-auto px-4 py-12 bg-gray-50 flex flex-col md:flex-row gap-8 items-center">
        <div className="md:w-1/2 flex justify-center">
          <img
            src={proprietorImage}
            alt="Proprietor"
            className="w-full max-w-sm rounded-lg shadow-md object-cover"
          />
        </div>
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-2">
            <Award className="text-green-600 w-6 h-6" />
            Meet Our Proprietor
          </h2>
          <hr className="w-16 border-t-2 border-green-600" />
          <p className="text-gray-700 leading-relaxed">
            At Greater Access, we believe in the unique potential of every child.
            Under the leadership of Mr. Samson Obalua, our institution thrives on
            a culture of excellence and compassion.
          </p>
          <p className="text-gray-700 font-medium">— Mr. Samson Obalua, Proprietor</p>
        </div>
      </section>
    </div>
  );
};

export default About;
