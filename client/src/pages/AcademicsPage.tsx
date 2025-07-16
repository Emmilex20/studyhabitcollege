// src/pages/AcademicsPage.tsx
import React from 'react';
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import { Link } from 'react-router-dom';

// Placeholder for an academic-related image
import academicsHero from '../assets/academics-hero.jpg'; // e.g., students in a classroom, or library

const AcademicsPage: React.FC = () => {
  const programs = [
    {
      title: "Cambridge Checkpoint",
      description: "Designed for students aged 11 to 14 (Junior Secondary Years 1-3), Cambridge Checkpoint helps teachers assess learning at the end of the Cambridge Primary and Cambridge Lower Secondary programmes. At Studyhabit College, this program forms a crucial bridge, solidifying foundational knowledge and preparing students for the intellectual demands of IGCSE.",
      details: ["Core subjects: English, Mathematics, Science", "External feedback on student performance ensures global benchmarking", "Focus on conceptual understanding and skill development"],
      icon: "fas fa-book-reader"
    },
    {
      title: "Cambridge IGCSE",
      description: "The International General Certificate of Secondary Education is the world’s most popular international qualification for 14- to 16-year-olds. Our IGCSE program at Studyhabit College is meticulously structured to not just impart knowledge but to cultivate critical thinking, analytical skills, and real-world application, making our graduates globally competitive.",
      details: ["Wide range of subjects including Sciences, Arts, and Commercials", "Internationally recognized qualification for university entry worldwide", "Develops research, problem-solving, and communication skills"],
      icon: "fas fa-graduation-cap"
    },
    {
      title: "SAT Preparation",
      description: "The Scholastic Assessment Test (SAT) is a crucial standardized test for college admissions in the United States and other international universities. Our dedicated SAT preparatory classes go beyond rote learning, focusing on strategic approaches to Mathematics, Reading, and Writing sections, ensuring students achieve their highest possible scores for competitive university placements.",
      details: ["Intensive coaching for all SAT sections", "Personalized study plans and mock tests", "Effective time management and test-taking strategies"],
      icon: "fas fa-calculator"
    },
    {
      title: "IELTS Preparation",
      description: "The International English Language Testing System (IELTS) is indispensable for non-native English speakers aspiring to study or migrate abroad. Studyhabit College provides comprehensive training across all four modules – Listening, Reading, Writing, and Speaking – equipping students with the confidence and linguistic proficiency to excel.",
      details: ["Expert-led sessions for all four modules", "Targeted strategies for band score improvement", "Access to official practice materials and simulated tests"],
      icon: "fas fa-comments"
    },
    {
      title: "WASSCE Preparation",
      description: "The West African Senior School Certificate Examination (WASSCE) is the gateway to tertiary education within Nigeria and other West African countries. Our WASSCE preparation program is deeply rooted in the Nigerian curriculum, delivered by experienced tutors who employ proven techniques and extensive past question practice to guarantee student success.",
      details: ["Rigorous coverage of the entire WASSCE syllabus", "Experienced and passionate WASSCE subject teachers", "Regular mock examinations and performance analysis"],
      icon: "fas fa-school"
    },
    {
      title: "JAMB UTME Preparation",
      description: "The Joint Admissions and Matriculation Board (JAMB) Unified Tertiary Matriculation Examination (UTME) is a mandatory examination for university admission in Nigeria. Studyhabit College's JAMB preparatory classes are specifically designed for CBT (Computer Based Test) readiness, focusing on speed, accuracy, and in-depth subject knowledge to secure admission into desired institutions.",
      details: ["Comprehensive CBT training and realistic simulations", "Subject-specific coaching by JAMB specialists", "Up-to-date information on JAMB policies and registration guidelines"],
      icon: "fas fa-laptop"
    }
  ];

  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Variants for individual cards/items within sections
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut }
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a7e5f5\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${academicsHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Empowering Minds: Our Academic Journey 🧠
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              At **Studyhabit College**, our academic programs are meticulously crafted to provide a robust and dynamic learning experience. We foster intellectual curiosity, critical thinking, and a lifelong passion for knowledge, preparing students to excel in a rapidly evolving world, both locally and internationally.
            </p>
            <Link
              to="/admissions"
              className="inline-block px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Explore Our Admissions Process
            </Link>
          </div>
        </motion.div>

        {/* --- */}

        {/* Academic Philosophy */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative">
            Our Academic Philosophy: Nurturing Future Leaders
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Studyhabit College is committed to an **inclusive and progressive educational philosophy**. We believe that true learning extends beyond memorization, emphasizing understanding, application, and innovation. Our curriculum integrates a blend of national and international standards, ensuring a well-rounded education that empowers students to be adaptable, resourceful, and globally aware citizens. We focus on fostering a stimulating environment where intellectual curiosity is celebrated, and every student is challenged to achieve their personal best.
          </p>
        </motion.section>

        {/* --- */}

        {/* Core Academic Programs */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-10 text-center relative">
            Our Diverse Academic Programs 🎓
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-t-4 border-yellow-600 flex flex-col h-full"
              >
                <div className="text-center mb-4">
                  {/* Using a placeholder for font-awesome icons, ensure Font Awesome is linked in your project */}
                  <i className={`${program.icon} text-5xl text-yellow-500`}></i>
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-3 text-center">
                  {program.title}
                </h3>
                <p className="text-gray-700 text-base mb-4 flex-grow">
                  {program.description}
                </p>
                <div className="mt-auto"> {/* Pushes details to the bottom */}
                  <h4 className="font-semibold text-blue-800 mb-2">Key Highlights:</h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {program.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- */}

        {/* Beyond the Classroom: Academic Enrichment */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-purple-50 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-purple-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center relative">
            Beyond the Classroom: Academic Enrichment 💡
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-purple-500 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-700">
            <div>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">🔬</span> Science & Innovation Clubs
              </h3>
              <p className="mb-4 leading-relaxed">
                Our Science, Technology, Engineering, and Mathematics (STEM) clubs provide hands-on experience in areas like robotics, coding, and environmental science. Students participate in national competitions, conduct experiments, and engage in problem-solving challenges that foster a spirit of inquiry and innovation.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">📚</span> Literary & Debate Societies
              </h3>
              <p className="mb-4 leading-relaxed">
                The Literary and Debate societies at Studyhabit College sharpen students' communication, critical thinking, and public speaking skills. Through book clubs, creative writing workshops, and inter-school debates, students learn to articulate ideas persuasively and engage in constructive discourse.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">🌐</span> Global Perspectives & Leadership Programs
              </h3>
              <p className="mb-4 leading-relaxed">
                We prepare students for a globalized world through programs that encourage international awareness and leadership development. This includes Model United Nations (MUN), cultural exchange initiatives, and student leadership conferences that broaden their worldview and instill a sense of global responsibility.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">🎨</span> Arts & Creativity Workshops
              </h3>
              <p className="mb-4 leading-relaxed">
                Recognizing the importance of creativity, we offer workshops in various art forms, music, and drama. These activities not only provide an outlet for self-expression but also enhance cognitive abilities, discipline, and collaborative skills, contributing to holistic development.
              </p>
            </div>
          </div>
        </motion.section>

        {/* --- */}

        {/* Faculty Excellence */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative">
            Our Distinguished Faculty: Mentors of Tomorrow ✨
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-green-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The heart of Studyhabit College's academic success lies in our exceptional faculty. Our educators are not just teachers; they are **mentors, innovators, and subject matter experts** who bring passion and dedication to the classroom every day. They are committed to fostering an engaging learning environment, employing modern pedagogical approaches, and providing personalized support to ensure every student thrives.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-gray-700 list-disc list-inside">
            <motion.li variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.1 }} className="bg-green-50 p-4 rounded-lg shadow-sm">
              **Highly Qualified:** Many hold advanced degrees and international certifications.
            </motion.li>
            <motion.li variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.2 }} className="bg-green-50 p-4 rounded-lg shadow-sm">
              **Experienced:** Years of experience in their respective fields and in preparing students for various examinations.
            </motion.li>
            <motion.li variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.3 }} className="bg-green-50 p-4 rounded-lg shadow-sm">
              **Student-Centric:** Dedicated to understanding individual learning styles and providing tailored support.
            </motion.li>
            <motion.li variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.4 }} className="bg-green-50 p-4 rounded-lg shadow-sm">
              **Continuous Professional Development:** Regularly updated on the latest educational trends and methodologies.
            </motion.li>
          </ul>
        </motion.section>

        {/* --- */}

        {/* Call to Action */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-blue-800 text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to Embark on Your Academic Journey?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover how Studyhabit College can unlock your full academic potential and set you on the path to success.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
          >
            Contact Our Admissions Team Today! 📞
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default AcademicsPage;