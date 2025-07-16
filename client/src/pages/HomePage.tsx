// Enhanced HomePage.tsx with more sections and improved styling
import React from 'react';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // Import easeOut
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Import local assets
import StudyhabitBanner from '../assets/studyhabit.jpeg';
import AnotherBanner from '../assets/another-banner.jpeg';
import CampusLife1 from '../assets/campus-life.jpg';
import FacultyImage from '../assets/faculty.jpg';
import TestimonialImg from '../assets/testimonial.jpg';
import StudentLifeImg from '../assets/student-life.jpg';
import LabImg from '../assets/lab.jpg';
import LibraryImg from '../assets/library.jpg';
import SportsImg from '../assets/sports.avif';
import GraduationImg from '../assets/graduation.jpg';
import ClassroomImg from '../assets/classroom.jpeg';


const HomePage: React.FC = () => {
  const heroSlides = [
    {
      id: 1,
      image: StudyhabitBanner,
      title: "Studyhabit College, Lagos",
      subtitle: "In Pursuit of Excellence and Innovation",
      buttonText: "Discover Our Story",
      buttonLink: "/about"
    },
    {
      id: 2,
      image: AnotherBanner,
      title: "Unlock Your Full Potential",
      subtitle: "Rigorous Academics, Holistic Development, Global Impact",
      buttonText: "Explore Programs",
      buttonLink: "/academics"
    },
    {
      id: 3,
      image: CampusLife1,
      title: "Vibrant Campus Life",
      subtitle: "Engage, Connect, and Grow Beyond the Classroom",
      buttonText: "See Campus Life",
      buttonLink: "/campus-life"
    },
  ];

  const campusLifeImages = [
    { id: 1, src: StudentLifeImg, alt: 'Students collaborating on a project', category: 'Academics' },
    { id: 2, src: SportsImg, alt: 'Students playing basketball', category: 'Sports & Wellness' },
    { id: 3, src: LibraryImg, alt: 'Modern college library interior', category: 'Learning Spaces' },
    { id: 4, src: ClassroomImg, alt: 'Interactive classroom session', category: 'Academics' },
    { id: 5, src: LabImg, alt: 'Science lab experiment', category: 'Science & Innovation' },
    { id: 6, src: GraduationImg, alt: 'Graduation ceremony celebration', category: 'Achievements' },
  ];

  // Reusable animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: easeOut, delayChildren: 0.2, staggerChildren: 0.1 } // Use easeOut
  };

  const slideInFromLeft = {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: easeOut }, // Use easeOut
    viewport: { once: true, amount: 0.4 }
  };

  const slideInFromRight = {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: easeOut }, // Use easeOut
    viewport: { once: true, amount: 0.4 }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-blue-50 text-gray-800 font-sans antialiased">
      {/* Hero Section */}
      <section className="relative h-screen md:h-[90vh] overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          // Removed navigation prop
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          <AnimatePresence>
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div
                  className="w-full h-full bg-cover bg-center flex items-center justify-center relative p-4 sm:p-6 md:p-8"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 1.0, ease: easeOut }}
                    className="relative z-10 text-center text-white max-w-xl lg:max-w-4xl mx-auto p-4 md:p-8 rounded-lg"
                  >
                    <motion.h1
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-lg leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: easeOut }}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 font-light italic"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8, ease: easeOut }}
                    >
                      {slide.subtitle}
                    </motion.p>
                    <Link to={slide.buttonLink}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 sm:px-8 sm:py-4 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-2xl hover:bg-yellow-600 transition-all duration-300 transform hover:-translate-y-1 text-base sm:text-lg"
                      >
                        {slide.buttonText} 🚀
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </AnimatePresence>
        </Swiper>
      </section>


      {/*---*/}

      {/* Welcome & Mission Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white relative">
        <div className="absolute inset-0 bg-blue-50 transform skew-y-2 origin-top-left -z-10"></div>
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <motion.div
            {...slideInFromLeft}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
              Welcome to Studyhabit College
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              At **Studyhabit College**, we are dedicated to fostering a vibrant learning environment
              where academic rigor meets innovative thinking. Our commitment is to nurture the next
              generation of leaders, innovators, and global citizens through a holistic educational approach.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 italic">
              "Educating the mind without educating the heart is no education at all." - Aristotle
            </p>
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-900 text-white font-semibold rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 text-base sm:text-lg"
              >
                Our Philosophy <span aria-hidden="true">&rarr;</span>
              </motion.button>
            </Link>
          </motion.div>
          <motion.img
            src={StudentLifeImg}
            alt="Students engaging in group study"
            className="rounded-3xl shadow-2xl w-full h-64 sm:h-80 md:h-96 object-cover transform rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto lg:mx-0"
            {...slideInFromRight}
          />
        </div>
      </section>

      {/*---*/}

      {/* Core Values Section */}
      <section className="py-16 md:py-20 bg-blue-100 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900 mb-10 md:mb-12 relative"
            initial="initial"
            whileInView="animate"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.4 }}
          >
            Our Guiding Principles
            <span className="block w-20 sm:w-24 h-1.5 sm:h-2 bg-yellow-500 mx-auto mt-3 rounded-full"></span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: 'Excellence', icon: '✨', description: 'Striving for the highest standards in academics, character, and all endeavors.' },
              { title: 'Integrity', icon: '🤝', description: 'Upholding honesty, respect, and strong moral principles in every interaction.' },
              { title: 'Innovation', icon: '💡', description: 'Fostering creativity, critical thinking, and a forward-looking approach to learning.' },
              { title: 'Global Citizenship', icon: '🌍', description: 'Preparing students to be responsible, empathetic, and impactful members of the global community.' },
              { title: 'Community', icon: '🏡', description: 'Building a supportive and inclusive environment where every individual feels valued.' },
              { title: 'Resilience', icon: '💪', description: 'Developing strength and adaptability to overcome challenges and embrace growth.' },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: easeOut }}
                viewport={{ once: true, amount: 0.4 }}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-8 border-yellow-500 transform hover:-translate-y-2 group cursor-pointer"
              >
                <div className="text-5xl sm:text-6xl mb-4 group-hover:animate-bounce-once">{value.icon}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 group-hover:text-yellow-600 transition-colors">{value.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/*---*/}

      {/* Academic Excellence Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.img
            src={LabImg}
            alt="Cutting-edge science laboratory"
            className="rounded-3xl shadow-2xl w-full h-64 sm:h-80 md:h-96 object-cover transform -rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto lg:mx-0"
            {...slideInFromLeft}
          />
          <motion.div
            {...slideInFromRight}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
              Dedicated to Academic Excellence
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              Our curriculum is designed to challenge students intellectually and foster a deep understanding
              of core subjects. With state-of-the-art **science laboratories** for Physics, Chemistry,
              and Biology, and modern **computer suites**, students gain hands-on experience and develop
              critical analytical skills essential for future success.
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base mb-8 space-y-2 text-left mx-auto lg:mx-0">
              <li>Experienced and passionate faculty members.</li>
              <li>Personalized learning pathways for every student.</li>
              <li>Strong emphasis on STEM and humanities.</li>
              <li>Rigorous preparation for national and international examinations.</li>
            </ul>
            <Link to="/academics">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-yellow-500 text-blue-900 font-semibold rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-300 text-base sm:text-lg"
              >
                Explore Our Programs 📚
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/*---*/}

      {/* Campus Life Carousel Section */}
      <section className="bg-blue-50 py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900 mb-10 md:mb-12 relative"
            initial="initial"
            whileInView="animate"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.4 }}
          >
            Experience Our Vibrant Campus Life
            <span className="block w-20 sm:w-24 h-1.5 sm:h-2 bg-yellow-500 mx-auto mt-3 rounded-full"></span>
          </motion.h2>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop
            className="mySwiper p-4 pb-12"
          >
            {campusLifeImages.map((img) => (
              <SwiperSlide key={img.id}>
                <motion.div
                  className="bg-white rounded-2xl shadow-xl overflow-hidden group cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="p-4 sm:p-6">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full mb-2 inline-block">{img.category}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2 group-hover:text-yellow-600 transition-colors">{img.alt}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Engage in diverse clubs, sports, and activities that enrich your college journey.
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
          <Link to="/campus-life">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 md:mt-12 px-8 py-4 bg-blue-900 text-white font-semibold rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 text-base sm:text-lg"
            >
              Discover More Campus Life 🌟
            </motion.button>
          </Link>
        </div>
      </section>

      {/*---*/}

      {/* Faculty Spotlight Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            {...slideInFromLeft}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6 leading-tight">
              Meet Our Exceptional Faculty
            </h2>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              Our dedicated **faculty members** are not just educators; they are mentors, innovators,
              and leaders in their respective fields. They bring a wealth of experience and a passion
              for teaching, inspiring students to achieve their academic and personal best.
            </p>
            <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base mb-8 space-y-2 text-left mx-auto lg:mx-0">
              <li>Highly qualified and experienced professionals.</li>
              <li>Committed to student success and mentorship.</li>
              <li>Engaged in ongoing research and professional development.</li>
              <li>Foster a collaborative and supportive learning environment.</li>
            </ul>
            <Link to="/faculty">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-yellow-500 text-blue-900 font-semibold rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-300 text-base sm:text-lg"
              >
                Learn About Our Faculty 🧑‍🏫
              </motion.button>
            </Link>
          </motion.div>
          <motion.img
            src={FacultyImage}
            alt="Dedicated Faculty Member"
            className="rounded-3xl shadow-2xl w-full h-64 sm:h-80 md:h-96 object-cover transform rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto lg:mx-0"
            {...slideInFromRight}
          />
        </div>
      </section>

      {/*---*/}

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pattern-dots -z-10"></div>
        <div className="max-w-xl md:max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-10 md:mb-12 drop-shadow-md"
            initial="initial"
            whileInView="animate"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.4 }}
          >
            What Our Community Says
          </motion.h2>
          <motion.div
            className="bg-white p-6 sm:p-10 rounded-3xl shadow-3xl transform skew-y-1 hover:skew-y-0 transition-transform duration-500"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
            viewport={{ once: true, amount: 0.4 }}
          >
            <img src={TestimonialImg} alt="Testimonial photo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 sm:mb-6 border-4 border-yellow-500 shadow-lg" />
            <p className="italic text-gray-800 text-base sm:text-xl leading-relaxed mb-4 sm:mb-6">
              “Studyhabit College provided me with an unparalleled educational foundation. The support from
              faculty, the challenging curriculum, and the vibrant campus life truly shaped me into the
              person I am today. It's more than a school; it's a launchpad for future success.”
            </p>
            <span className="mt-2 block font-extrabold text-blue-900 text-base sm:text-lg">— Jessica T., Class of 2020 Alumni, Software Engineer</span>
            <span className="block text-gray-500 text-xs sm:text-sm">Now pursuing her Masters at MIT</span>
          </motion.div>
        </div>
      </section>

      {/*---*/}

      {/* News & Events Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-900 mb-10 md:mb-12 text-center relative"
            initial="initial"
            whileInView="animate"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.4 }}
          >
            Latest News & Upcoming Events
            <span className="block w-20 sm:w-24 h-1.5 sm:h-2 bg-yellow-500 mx-auto mt-3 rounded-full"></span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                title: 'Annual Science Fair Showcases Innovation',
                date: 'July 10, 2025',
                image: ClassroomImg,
                description: 'Our students presented groundbreaking projects at the annual science fair, demonstrating remarkable creativity and scientific inquiry.'
              },
              {
                title: 'Inter-House Sports Competition Concludes',
                date: 'July 5, 2025',
                image: SportsImg,
                description: 'The hotly contested inter-house sports competition wrapped up with thrilling performances and great sportsmanship.'
              },
              {
                title: 'Admissions Open for New Academic Year',
                date: 'June 28, 2025',
                image: GraduationImg,
                description: 'Applications are now open! Join Studyhabit College and embark on a journey of academic excellence and personal growth.'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: easeOut }}
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 group"
              >
                <img src={item.image} alt={item.title} className="w-full h-48 sm:h-52 object-cover" />
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2 group-hover:text-yellow-600 transition-colors">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">{item.date}</p>
                  <p className="text-gray-700 text-sm sm:text-base mb-4">{item.description}</p>
                  <Link to="/news-events" className="text-blue-700 font-semibold hover:text-yellow-600 transition-colors flex items-center text-sm sm:text-base">
                    Read More <span aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12 md:mt-16">
            <Link to="/news-events">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 sm:px-10 sm:py-4 bg-blue-900 text-white font-bold rounded-full shadow-lg hover:bg-blue-800 transition-all duration-300 text-base sm:text-lg"
              >
                View All Updates 📰
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/*---*/}

      {/* Call to Action - Admissions */}
      <section className="bg-blue-900 text-white py-16 md:py-24 text-center px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500 opacity-5 transform skew-y-2 origin-bottom-right -z-10"></div>
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 drop-shadow-lg leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          viewport={{ once: true, amount: 0.4 }}
        >
          Ready to Start Your Journey?
        </motion.h2>
        <motion.p
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 font-light"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
          viewport={{ once: true, amount: 0.4 }}
        >
          Embark on a transformative educational experience at Studyhabit College.
          Our admissions team is ready to guide you through the process.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <Link
            to="/admissions"
            className="inline-block px-8 py-3 sm:px-10 sm:py-4 bg-yellow-500 text-blue-900 font-bold text-base sm:text-lg rounded-full hover:bg-yellow-600 shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Apply Now <span aria-hidden="true">&rarr;</span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;