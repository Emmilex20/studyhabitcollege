// src/pages/NewsArchivePage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence, easeOut } from 'framer-motion'; // <--- IMPORT easeOut HERE!
import NewsCard from '../components/NewsCard';

// Placeholder for a generic news archive hero image or pattern
import archiveHero from '../assets/archive-hero.jpg';

// Full Sample News Data (expanded from your previous 'currentNews')
const allNews = [
  // ... (your allNews data remains the same)
  {
    id: 1,
    title: "Inter-House Sports Fiesta Lights Up Studyhabit!",
    date: "July 12, 2025",
    excerpt: "Our annual inter-house sports competition concluded with unparalleled enthusiasm and spectacular displays of athleticism. Students from all four houses competed fiercely in various disciplines...",
    imageUrl: "https://images.pexels.com/photos/17260537/pexels-photo-17260537/free-photo-of-man-in-white-t-shirt-and-black-shorts-running-on-track.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/inter-house-sports-2025"
  },
  {
    id: 2,
    title: "Cambridge IGCSE Mock Results: A Testament to Excellence",
    date: "July 08, 2025",
    excerpt: "Studyhabit College celebrates the exceptional performance of our Year 10 students in the recent Cambridge IGCSE mock examinations. These results underscore our commitment to academic rigour and student success...",
    imageUrl: "https://images.pexels.com/photos/4145353/pexels-photo-4145353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/igcse-mock-results-2025"
  },
  {
    id: 3,
    title: "Career Day 2025: Guiding Our Future Innovators",
    date: "June 30, 2025",
    excerpt: "Our annual Career Day brought together leading professionals from diverse industries to inspire and mentor students. Interactive sessions provided invaluable insights into various career paths and future opportunities...",
    imageUrl: "https://images.pexels.com/photos/3769726/pexels-photo-3769726.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/career-day-2025"
  },
  {
    id: 4,
    title: "Debate Club Clinches State Championship Title!",
    date: "June 20, 2025",
    excerpt: "Our formidable Debate Club has once again showcased their eloquence and critical thinking, securing the coveted State Championship title in a thrilling final round against top schools in the state...",
    imageUrl: "https://images.pexels.com/photos/8199580/pexels-photo-8199580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/debate-championship-2025"
  },
  {
    id: 5,
    title: "Annual Literary Week Celebrates African Authors",
    date: "June 15, 2025",
    excerpt: "Studyhabit College celebrated its Annual Literary Week with a vibrant focus on African literature. Students engaged in spirited book readings, captivating poetry slams, and enriching creative writing workshops...",
    imageUrl: "https://images.pexels.com/photos/3380183/pexels-photo-3380183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/literary-week-2025"
  },
  {
    id: 6,
    title: "Excursion to National Museum: A Journey Through History",
    date: "June 10, 2025",
    excerpt: "Our Year 8 students embarked on an enlightening excursion to the National Museum, gaining valuable insights into Nigerian history, art, and cultural heritage. This educational trip complemented their history curriculum...",
    imageUrl: "https://images.pexels.com/photos/2034969/pexels-photo-2034969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/museum-excursion-2025"
  },
  {
    id: 7,
    title: "STEM Fair Showcases Student Innovation",
    date: "May 28, 2025",
    excerpt: "The annual STEM Fair at Studyhabit College was a resounding success, featuring groundbreaking projects and innovative solutions from students across all grades. Judges were impressed by the creativity and scientific rigor...",
    imageUrl: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/stem-fair-2025"
  },
  {
    id: 8,
    title: "Community Outreach Program: Lending a Helping Hand",
    date: "May 10, 2025",
    excerpt: "Our students and staff participated in a heartwarming community outreach program, assisting local charities and engaging in environmental clean-up initiatives. It was a testament to our commitment to social responsibility...",
    imageUrl: "https://images.pexels.com/photos/6646700/pexels-photo-6646700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/community-outreach-2025"
  },
  {
    id: 9,
    title: "School Play 'The Lion King' Receives Standing Ovation",
    date: "April 25, 2025",
    excerpt: "Studyhabit College's drama club captivated audiences with their spectacular rendition of 'The Lion King'. The vibrant costumes, powerful vocals, and compelling performances earned them a well-deserved standing ovation...",
    imageUrl: "https://images.pexels.com/photos/3385038/pexels-photo-3385038.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/school-play-2025"
  },
  {
    id: 10,
    title: "Parents' Day & Open House Welcomes Families",
    date: "April 15, 2025",
    excerpt: "We opened our doors to parents and prospective families for our annual Parents' Day and Open House. Visitors enjoyed guided tours, met teachers, and witnessed the vibrant learning environment at Studyhabit College...",
    imageUrl: "https://images.pexels.com/photos/5965997/pexels-photo-5965997.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    link: "/news/parents-day-2025"
  }
];

const NEWS_PER_PAGE = 6; // Number of news articles to display per load

const NewsArchivePage: React.FC = () => {
  const [visibleNewsCount, setVisibleNewsCount] = useState(NEWS_PER_PAGE);

  const loadMoreNews = () => {
    setVisibleNewsCount(prevCount => prevCount + NEWS_PER_PAGE);
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut, // <--- CHANGED FROM 'easeOut' TO easeOut IMPORTED FROM framer-motion
      },
    },
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen pb-20">
      {/* Background pattern (optional, customize as needed) */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${archiveHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Our News Archive 📚
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Explore a rich history of Studyhabit College's achievements, milestones, and memorable moments.
            </p>
          </div>
        </motion.div>

        {/* News Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-500 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-10 text-center relative">
            All Articles & Announcements 📰
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants} // Apply container variants for staggered children
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {allNews.slice(0, visibleNewsCount).map((newsItem, index) => (
                <motion.div key={newsItem.id} variants={itemVariants}>
                  <NewsCard news={newsItem} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visibleNewsCount < allNews.length && (
            <div className="text-center mt-12">
              <motion.button
                onClick={loadMoreNews}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-full hover:bg-blue-900 transition-colors duration-300 shadow-lg flex items-center justify-center mx-auto"
              >
                Load More News <i className="fas fa-redo ml-2"></i>
              </motion.button>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default NewsArchivePage;