// src/pages/AboutPage.tsx
import React from 'react';
import { motion, useScroll, useTransform, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';

// IMPORTANT: These are placeholders for YOUR image files.
// Ensure you have these images in your 'src/assets' folder (or adjust the paths).
import campusImage from '../assets/campus-view.jpeg'; // e.g., an aerial shot or wide view of the campus
import valuesIllustration from '../assets/values-illustration.jpg'; // e.g., an abstract or symbolic illustration of core values
import founderPortrait from '../assets/founder-portrait.png'; // e.g., a dignified portrait of the college founder(s)
import earlyDaysPhoto from '../assets/early-days-photo.jpeg'; // e.g., a sepia-toned photo of early students or buildings

const AboutPage: React.FC = () => {
  // Scroll-based animation for the main title and hero section
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.8]);

  // Animation variants for sections to ensure consistency
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Animation variants for individual cards/items within sections
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
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Background pattern/overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a7e5f5\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section: A Grand Introduction */}
        <motion.section
          style={{ scale, opacity }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${campusImage})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"
            >
              The Story of Studyhabit College 🎓
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: easeOut }}
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Nestled in the serene landscapes of Lekki, Lagos, <strong>Studyhabit College</strong> stands as a beacon of academic excellence and holistic development. Our journey began with a bold vision, cultivated through dedication, and continues to thrive as a vibrant community shaping the leaders of tomorrow. Here, every student's potential is nurtured to blossom into a future of purpose and profound impact.
            </motion.p>
            <Link
              to="/admissions"
              className="inline-block px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Begin Your Chapter Here
            </Link>
          </div>
        </motion.section>

        {/* --- */}

        {/* Founding Principles: The Genesis of Studyhabit */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-20 text-center relative grid grid-cols-1 md:grid-cols-3 gap-12 items-center"
        >
          <div className="md:col-span-2 text-left">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-6 relative">
              Our Genesis: A Legacy of Vision
              <span className="absolute left-0 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Studyhabit College wasn't just built; it was envisioned. Founded in <strong>[Year of Foundation, e.g., 1998]</strong> by the esteemed <strong>[Founder's Name/Names, e.g., Dr. Alani Adebayo and Mrs. Ngozi Okoro]</strong>, our institution sprang from a profound understanding that true education transcends textbooks. It was a time when the educational landscape in Nigeria craved a fresh approach – one that integrated rigorous academics with character building, creativity, and global awareness.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              From its humble beginnings with just <strong>[Number, e.g., 50]</strong> students and a dedicated faculty of <strong>[Number, e.g., 10]</strong> teachers, Studyhabit College set out to challenge conventional norms. The founders believed in creating a nurturing environment where every child felt seen, heard, and empowered to explore their unique talents. Their unwavering commitment to <strong>holistic development</strong> and <strong>academic integrity</strong> laid the bedrock for what the college would become.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              This foundational philosophy, meticulously woven into the fabric of daily life at Studyhabit, continues to guide our growth, ensuring that we remain true to the aspirations of our visionary founders.
            </p>
          </div>
          <motion.div
            variants={cardVariants}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 flex justify-center items-center"
          >
            <img
              src={founderPortrait} // Your founder's portrait here
              alt="Portrait of Studyhabit College Founder"
              className="rounded-full w-64 h-64 object-cover shadow-2xl border-4 border-yellow-500"
            />
          </motion.div>
        </motion.section>

        {/* --- */}

        {/* Evolution and Growth: Milestones of Progress */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-20 text-center relative grid grid-cols-1 md:grid-cols-3 gap-12 items-center"
        >
          <motion.div
            variants={cardVariants}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 flex justify-center items-center order-2 md:order-1"
          >
            <img
              src={earlyDaysPhoto} // Your photo of early days/development here
              alt="Studyhabit College Early Days"
              className="rounded-xl w-full h-auto object-cover shadow-2xl border-4 border-blue-500"
            />
          </motion.div>
          <div className="md:col-span-2 text-left order-1 md:order-2">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-6 relative">
              Milestones of Progress: Our Journey Through Time
              <span className="absolute right-0 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              From its inception, Studyhabit College has embarked on a remarkable journey of <strong>continuous growth and adaptation</strong>. The early years were characterized by pioneering efforts to establish a unique curriculum, focusing on active learning and critical engagement. By <strong>[Year, e.g., 2005]</strong>, we proudly unveiled our first purpose-built science laboratories, a testament to our commitment to hands-on learning and scientific inquiry.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Significant expansions followed, including the addition of our modern library in <strong>[Year, e.g., 2010]</strong>, which quickly became the intellectual heart of the campus. This period also saw the introduction of our acclaimed <strong>[Specific Program/Initiative, e.g., Leadership Development Program]</strong>, designed to mold students into confident and ethical leaders. In <strong>[Recent Year, e.g., 2020]</strong>, we embraced digital transformation, integrating cutting-edge e-learning platforms and smart classrooms to prepare our students for a future-driven world.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Each milestone reflects our unwavering dedication to providing an unparalleled educational experience, evolving with the times while holding fast to our core values. We are proud of our history, as it illuminates the path for our future innovations.
            </p>
          </div>
        </motion.section>

        {/* --- */}

        {/* Our Vision & Mission (Re-contextualized with depth) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl font-extrabold text-blue-900 mb-10 relative">
            Guiding Stars: Our Enduring Vision & Mission
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              variants={cardVariants}
              className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-yellow-500 transform hover:scale-105 transition-transform duration-300 group"
            >
              <div className="text-5xl mb-4 text-yellow-500 group-hover:text-blue-600 transition-colors duration-300">💡</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                Born from the foresight of our founders, our vision remains steadfast: <strong>To be a leading educational institution fostering holistic development and academic excellence, empowering students to become responsible global citizens.</strong> We envision a future where our graduates are not just successful professionals, but compassionate leaders and innovators who contribute positively to society.
              </p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.2 }}
              className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-blue-500 transform hover:scale-105 transition-transform duration-300 group"
            >
              <div className="text-5xl mb-4 text-blue-500 group-hover:text-yellow-600 transition-colors duration-300">🎯</div>
              <h3 className="text-3xl font-bold text-blue-900 mb-4">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                Our mission is the dynamic blueprint for achieving this vision: <strong>To provide a nurturing and stimulating learning environment that encourages critical thinking, creativity, and a passion for lifelong learning, guided by dedicated educators and modern resources.</strong> This commitment translates into dynamic curricula, state-of-the-art facilities, and a culture that celebrates intellectual curiosity and personal growth every single day.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* --- */}

        {/* Our Values (More descriptive context) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-20 text-center relative"
        >
          <h2 className="text-4xl font-extrabold text-blue-900 mb-10 relative">
            The Pillars of Our Identity: Studyhabit's Core Values
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-green-500 rounded-full"></span>
          </h2>
          <div className="text-lg text-gray-700 max-w-4xl mx-auto mb-12">
            Our values are not merely words; they are the living principles that govern every interaction, decision, and aspiration within the Studyhabit College community. They are instilled in our students, faculty, and staff, ensuring a consistent ethos of learning and growth.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {['Excellence', 'Integrity', 'Innovation', 'Community', 'Respect', 'Resilience'].map((value, index) => (
              <motion.div
                key={value}
                variants={cardVariants}
                transition={{ duration: 0.6, ease: easeOut, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg border-b-4 border-green-500 flex flex-col items-center justify-center text-center transform hover:translate-y-[-8px] hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-3 text-green-600">
                  {value === 'Excellence' && '🌟'}
                  {value === 'Integrity' && '🤝'}
                  {value === 'Innovation' && '🚀'}
                  {value === 'Community' && '🫂'}
                  {value === 'Respect' && '🙏'}
                  {value === 'Resilience' && '💪'}
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{value}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value === 'Excellence' && 'We relentlessly strive for the highest standards in academics, character, and leadership, pushing boundaries to achieve outstanding results.'}
                  {value === 'Integrity' && 'We uphold unwavering honesty, strong moral principles, and transparency in every action, fostering trust and accountability.'}
                  {value === 'Innovation' && 'We passionately embrace new ideas, foster creative thinking, and adapt to emerging challenges, preparing students for a dynamic future.'}
                  {value === 'Community' && 'We cultivate a supportive, inclusive, and collaborative environment where every individual feels valued and belongs.'}
                  {value === 'Respect' && 'We honor diversity in thought, culture, and background, treating all members of our community with dignity and empathy.'}
                  {value === 'Resilience' && 'We empower students to develop grit, adaptability, and the courage to overcome obstacles, transforming challenges into opportunities for growth.'}
                </p>
              </motion.div>
            ))}
          </div>
          {/* IMPORTANT: This is a placeholder for YOUR illustration. */}
          <div className="mt-16 max-w-4xl mx-auto">
            <motion.img
              src={valuesIllustration}
              alt="Studyhabit College Values Illustration"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: easeOut }}
              className="w-full h-auto rounded-xl shadow-2xl"
            />
          </div>
        </motion.section>

        {/* --- */}

        {/* Our Facilities (More detailed description) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-extrabold text-blue-900 mb-10 relative">
            Our Thriving Campus: A Hub of Learning and Innovation
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-purple-500 rounded-full"></span>
          </h2>
          <motion.p
            variants={cardVariants}
            className="text-xl text-gray-700 max-w-4xl mx-auto mb-10 leading-relaxed"
          >
            Studyhabit College is more than just a place of learning; it's a dynamic ecosystem designed to inspire. Our sprawling campus provides an ideal setting for academic pursuit, personal development, and recreational activities. We are continuously investing in and enhancing our infrastructure to meet the evolving demands of modern education.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-10">
            <motion.div variants={cardVariants} className="text-left bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-2xl font-semibold text-blue-900 mb-3">Academic Excellence Hubs</h3>
              <p className="text-gray-700">
                Our <strong>modern classrooms</strong> are equipped with interactive whiteboards and multimedia tools, fostering engaging lessons. The <strong>well-equipped science labs</strong> (Physics, Chemistry, Biology) allow for hands-on experimentation, nurturing future scientists and innovators. Our <strong>comprehensive library</strong> offers a vast collection of resources, quiet study zones, and digital archives, serving as the intellectual heart of the college.
              </p>
            </motion.div>
            <motion.div variants={cardVariants} transition={{ delay: 0.2 }} className="text-left bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-2xl font-semibold text-blue-900 mb-3">Holistic Development Zones</h3>
              <p className="text-gray-700">
                Beyond academics, our campus features extensive <strong>sports grounds</strong> for football, basketball, and athletics, promoting physical well-being. Dedicated <strong>arts and music studios</strong> encourage creative expression. For our boarding students, comfortable and secure <strong>boarding houses</strong> provide a home-away-from-home environment, supervised by experienced house parents who ensure their well-being and academic progress.
              </p>
            </motion.div>
          </div>
          <motion.div
            variants={cardVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Link to="/gallery" className="inline-block px-10 py-4 bg-purple-700 text-white font-bold rounded-full shadow-lg hover:bg-purple-800 hover:scale-105 transition-all duration-300 transform">
              Take a Virtual Campus Tour 📸
            </Link>
          </motion.div>
        </motion.section>

        {/* --- */}

        {/* The Future: Our Unfolding Chapter */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center bg-green-700 text-white p-12 rounded-3xl shadow-2xl mb-20"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            The Future: Writing Our Next Chapter Together
          </h2>
          <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
            As we reflect on our rich history and the significant milestones we've achieved, we are even more excited about the future. Studyhabit College is committed to continuous innovation, adapting our methods and expanding our horizons to prepare students for the complexities of a globalized world. We envision a future where our impact resonates far beyond our campus walls, through the achievements and contributions of every Studyhabit alumnus. Join us as we continue to build a legacy of educational excellence.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
          >
            Connect With Us & Be Part of Our Story! 📞
          </Link>
        </motion.section>

      </div>
    </div>
  );
};

export default AboutPage;