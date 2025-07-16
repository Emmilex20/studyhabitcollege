import React from 'react';
import { motion, easeOut } from 'framer-motion';
import { Link } from 'react-router-dom';

// Define the type for a news item
interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  link?: string; // Optional link for a full news article
}

interface NewsCardProps {
  news: NewsItem;
  index: number; // Used for staggered animation delay
}

const NewsCard: React.FC<NewsCardProps> = ({ news, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeOut,
        delay: index * 0.1, // Staggered animation
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full"
    >
      <img
        src={news.imageUrl}
        alt={news.title}
        className="w-full h-48 object-cover object-center"
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-blue-900 mb-2 leading-tight">
          {news.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          <i className="far fa-calendar-alt mr-2"></i>{news.date}
        </p>
        <p className="text-gray-700 text-base flex-grow mb-4">
          {news.excerpt}
        </p>
        <div className="mt-auto"> {/* Pushes button to the bottom */}
          {news.link ? (
            <Link
              to={news.link}
              className="inline-block text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
              Read More <i className="fas fa-arrow-right ml-1 text-sm"></i>
            </Link>
          ) : (
            <span className="text-gray-500 text-sm italic">
              Full story coming soon!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;