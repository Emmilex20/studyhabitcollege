// src/pages/StudentLifePage.tsx
import React from 'react';
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import { Link } from 'react-router-dom';

// Placeholder for a student life image
import studentLifeHero from '../assets/student-life-hero.jpeg'; // e.g., students laughing, playing sports, or in a club meeting

const StudentLifePage: React.FC = () => {
  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" }
    },
  };

  // Variants for individual cards/items
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: easeOut }
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen pb-20">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f5a7d0\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-purple-800 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${studentLifeHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Experience Vibrant Student Life at Studyhabit College 🎉
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Beyond academics, Studyhabit College offers a dynamic and enriching student life designed to foster personal growth, build lasting friendships, and create unforgettable memories. Dive into a world of creativity, athleticism, and community!
            </p>
            <Link
              to="/admissions"
              className="inline-block px-8 py-3 bg-yellow-400 text-purple-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
            >
              Join Our Community Today!
            </Link>
          </div>
        </motion.div>

        {/* --- */}

        {/* Introduction to Student Life */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-6 relative">
            More Than Just Books: A Holistic Experience
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Studyhabit College, we believe that a well-rounded education extends beyond the classroom. Our vibrant student life provides numerous opportunities for students to explore their interests, develop new skills, and connect with peers and mentors. From exciting clubs to thrilling sports, every student finds their niche here.
          </p>
        </motion.section>

        {/* --- */}

        {/* Clubs and Societies */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-600"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-10 text-center relative">
            Discover Your Passion: Clubs & Societies 🎭
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-600 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'fas fa-flask', title: 'Science & Innovation Club', description: 'Explore the wonders of science through experiments, projects, and competitions. Foster curiosity and problem-solving skills.' },
              { icon: 'fas fa-palette', title: 'Arts & Crafts Society', description: 'Unleash your creativity with painting, drawing, sculpture, and various craft forms. Express yourself through diverse mediums.' },
              { icon: 'fas fa-microphone', title: 'Debate & Public Speaking', description: 'Develop strong argumentation, critical thinking, and confidence in public speaking. Participate in inter-school debates.' },
              { icon: 'fas fa-feather-alt', title: 'Literary & Creative Writing', description: 'Dive into literature, pen poems, stories, and scripts. Enhance your narrative abilities and love for words.' },
              { icon: 'fas fa-music', title: 'Music & Choral Group', description: 'Join fellow music enthusiasts to play instruments, sing, and perform. From classical to contemporary, all genres are welcome.' },
              { icon: 'fas fa-globe-americas', title: 'Current Affairs & UN Club', description: 'Stay informed about global events, discuss geopolitics, and participate in Model United Nations (MUN) simulations.' },
            ].map((club, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center h-full"
              >
                <div className="text-5xl text-blue-700 mb-4">
                  <i className={club.icon}></i>
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">{club.title}</h3>
                <p className="text-gray-700 text-sm flex-grow">{club.description}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-600 italic mt-8">
            And many more! Students are also encouraged to propose new clubs based on their interests.
          </p>
        </motion.section>

        {/* --- */}

        {/* Sports and Athletics */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-gradient-to-r from-green-50 to-teal-50 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-green-600"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-10 text-center relative">
            Unleash Your Potential: Sports & Athletics 🏅
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-green-600 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="flex items-start bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mr-4 text-green-700">⚽</span>
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-1">Team Sports</h3>
                <p>Engage in popular team sports like Football, Basketball, Volleyball, and Handball. Develop teamwork, discipline, and competitive spirit.</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }} className="flex items-start bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mr-4 text-green-700">🏃‍♀️</span>
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-1">Individual Sports</h3>
                <p>Participate in Athletics (track & field), Table Tennis, Badminton, and Chess. Focus on personal bests and strategic thinking.</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }} className="flex items-start bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mr-4 text-green-700">🏋️</span>
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-1">Fitness & Wellness</h3>
                <p>Access our well-equipped facilities and join fitness programs designed to promote health and well-being among all students.</p>
              </div>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.3 }} className="flex items-start bg-white p-6 rounded-lg shadow-md">
              <span className="text-4xl mr-4 text-green-700">🏆</span>
              <div>
                <h3 className="text-xl font-bold text-purple-800 mb-1">Inter-House Competitions</h3>
                <p>Annual inter-house sports festivals foster healthy competition, camaraderie, and school spirit across all levels.</p>
              </div>
            </motion.div>
          </div>
          <p className="text-center text-gray-600 italic mt-8">
            Our state-of-the-art sports facilities provide the perfect environment for athletic development.
          </p>
        </motion.section>

        {/* --- */}

        {/* Events and Traditions */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-yellow-50 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-yellow-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-10 text-center relative">
            Memorable Moments: Events & Traditions 🌟
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'fas fa-microphone-alt', title: 'Annual Cultural Day', description: 'A vibrant celebration of diverse cultures through music, dance, drama, and culinary experiences.' },
              { icon: 'fas fa-award', title: 'Prize Giving & Valedictory', description: 'Honoring academic excellence and celebrating our graduating students with a grand ceremony.' },
              { icon: 'fas fa-campground', title: 'Excursions & Field Trips', description: 'Educational and recreational trips to expose students to real-world applications and new environments.' },
              { icon: 'fas fa-users-cog', title: 'Leadership Summits', description: 'Workshops and conferences designed to equip student leaders with essential skills for effective governance and community impact.' },
              { icon: 'fas fa-chart-line', title: 'Career Day', description: 'Connecting students with professionals from various fields to inspire and guide their future career paths.' },
              { icon: 'fas fa-hand-holding-heart', title: 'Community Service Day', description: 'Engaging students in initiatives that give back to the local community, fostering empathy and social responsibility.' },
            ].map((event, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center h-full"
              >
                <div className="text-5xl text-yellow-700 mb-4">
                  <i className={event.icon}></i>
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">{event.title}</h3>
                <p className="text-gray-700 text-sm flex-grow">{event.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* --- */}

        {/* Student Support Services */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-6 relative">
            Your Well-being is Our Priority: Student Support 🤝
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-pink-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Studyhabit College is committed to providing a safe, supportive, and nurturing environment where every student can thrive. Our comprehensive support services ensure that academic, emotional, and social needs are met.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-pink-50 p-6 rounded-lg shadow-md">
              <i className="fas fa-handshake text-4xl text-pink-700 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Pastoral Care</h3>
              <p className="text-gray-700 text-sm">Dedicated house parents and counselors provide guidance and support.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }} className="bg-pink-50 p-6 rounded-lg shadow-md">
              <i className="fas fa-medkit text-4xl text-pink-700 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Health Services</h3>
              <p className="text-gray-700 text-sm">On-site medical bay with qualified staff to attend to student health needs.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }} className="bg-pink-50 p-6 rounded-lg shadow-md">
              <i className="fas fa-users text-4xl text-pink-700 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Counseling & Guidance</h3>
              <p className="text-gray-700 text-sm">Professional counselors offer academic, career, and personal guidance.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* --- */}

        {/* Boarding Life (Optional section, include if applicable) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-blue-100 p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-400"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-8 text-center relative">
            Home Away From Home: Boarding Life 🏠
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-400 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-8">
            For students seeking a fully immersive educational experience, Studyhabit College offers a vibrant and secure boarding program. Our boarding houses provide a nurturing 'home away from home' environment, fostering independence, camaraderie, and a strong sense of community.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-white p-6 rounded-lg shadow-md">
              <i className="fas fa-bed text-4xl text-blue-600 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Comfortable Accommodations</h3>
              <p className="text-gray-700 text-sm">Well-maintained dormitories with essential amenities and comfortable living spaces.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-lg shadow-md">
              <i className="fas fa-utensils text-4xl text-blue-600 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Nutritious Meals</h3>
              <p className="text-gray-700 text-sm">Balanced and delicious meals prepared daily, catering to diverse dietary needs.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-lg shadow-md">
              <i className="fas fa-user-shield text-4xl text-blue-600 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Supervised Environment</h3>
              <p className="text-gray-700 text-sm">24/7 supervision by experienced house parents ensuring safety and welfare.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-lg shadow-md">
              <i className="fas fa-users text-4xl text-blue-600 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Structured Routine & Activities</h3>
              <p className="text-gray-700 text-sm">A balanced schedule of study, recreation, and social activities to enrich boarding life.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* --- */}

        {/* Leadership & Personal Development */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-6 relative">
            Cultivating Leaders: Personal Development 🌱
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-teal-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Beyond academic and extracurricular activities, Studyhabit College is dedicated to nurturing the leadership qualities and personal character of every student. We provide numerous avenues for students to develop essential life skills, responsibility, and empathy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="bg-teal-50 p-6 rounded-lg shadow-md">
              <i className="fas fa-hands-helping text-4xl text-teal-700 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Mentorship Programs</h3>
              <p className="text-gray-700 text-sm">Connect with faculty and senior students for guidance and personal growth.</p>
            </motion.div>
            <motion.div variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.1 }} className="bg-teal-50 p-6 rounded-lg shadow-md">
              <i className="fas fa-lightbulb text-4xl text-teal-700 mb-3"></i>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Life Skills Workshops</h3>
              <p className="text-gray-700 text-sm">Sessions on financial literacy, emotional intelligence, digital citizenship, and more.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* --- */}

        {/* Call to Action */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-purple-800 text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to Dive into Studyhabit Life?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover a place where you'll grow, learn, and create memories that last a lifetime.
          </p>
          <Link
            to="/contact"
            className="inline-block px-10 py-4 bg-yellow-400 text-purple-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
          >
            Connect With Us! 💬
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default StudentLifePage;