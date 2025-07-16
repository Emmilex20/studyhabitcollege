// src/pages/Faculty.tsx
import React from 'react';
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import type { FacultyMember } from '../types'; // Adjust path if you put types elsewhere

// Dummy Data for Faculty Members
// In a real application, you would fetch this from an API
const dummyFaculty: FacultyMember[] = [
  {
    id: '1',
    name: 'Dr. Aisha Rahman',
    title: 'Head of Department, Computer Science',
    department: 'Computer Science',
    bio: 'Dr. Rahman is a leading expert in artificial intelligence and machine learning, with over 15 years of experience in academia and industry. Her research focuses on ethical AI development and data privacy.',
    imageUrl: 'https://images.unsplash.com/photo-1579612089304-4c60c2b291d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHw0fHxlbGRlcmx5JTIwd29tYW4lMjBwcm9mZXNzb3J8ZW58MHx8fHwxNzIwOTM4NDY3fDA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'aisha.rahman@studyhabit.edu',
  },
  {
    id: '2',
    name: 'Prof. Biodun Okoro',
    title: 'Professor of Economics',
    department: 'Economics',
    bio: 'Prof. Okoro specializes in macroeconomics and development economics, with a particular interest in sustainable growth models for emerging economies. His work has influenced policy across West Africa.',
    imageUrl: 'https://images.unsplash.com/photo-1542178229-239634d98a0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwyMHx8ZWxkeSUyMG1hbiUyMHByb2Zlc3NvcnxlbnwwfHx8fDE3MjA5Mzg2MTd8MA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'biodun.okoro@studyhabit.edu',
  },
  {
    id: '3',
    name: 'Mrs. Chioma Eke',
    title: 'Senior Lecturer, Mass Communication',
    department: 'Mass Communication',
    bio: 'Mrs. Eke brings extensive experience in broadcast journalism and digital media. She trains students in multimedia storytelling and media ethics, preparing them for the modern media landscape.',
    imageUrl: 'https://images.unsplash.com/photo-1552599727-f27357c91c0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwxNXx8YWZyaWNhbiUyMHdvbWFuJTIwdGVhY2hlcnxlbnwwfHx8fDE3MjA5Mzg2NTZ8MA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'chioma.eke@studyhabit.edu',
  },
  {
    id: '4',
    name: 'Engr. David Obi',
    title: 'Lecturer, Civil Engineering',
    department: 'Civil Engineering',
    bio: 'Engr. Obi\'s expertise lies in structural analysis and sustainable infrastructure development. He is passionate about practical applications of engineering principles and real-world problem-solving.',
    imageUrl: 'https://images.unsplash.com/photo-1590650141671-897ea4f7c10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwxMXx8YWZyaWNhbiUyMG1hbiUyMHRlYWNoZXJ8ZW58MHx8fHwxNzIwOTM4NzA4fDA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'david.obi@studyhabit.edu',
  },
  {
    id: '5',
    name: 'Dr. Fatima Umar',
    title: 'Associate Professor, Biochemistry',
    department: 'Biochemistry',
    bio: 'Dr. Umar conducts cutting-edge research in molecular biology and disease mechanisms, contributing significantly to advancements in medical sciences and biotechnological innovations.',
    imageUrl: 'https://images.unsplash.com/photo-1595152772835-21967781d4e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwxM3x8YWZyaWNhbiUyMHdvbWFuJTIwcHJvZmVzc29yfGVufDB8fHx8MTcyMDkzODc2OHww&ixlib=rb-4.0.3&q=80&w=400',
    email: 'fatima.umar@studyhabit.edu',
  },
  {
    id: '6',
    name: 'Mr. Nnamdi Eze',
    title: 'Lecturer, Software Engineering',
    department: 'Computer Science',
    bio: 'Mr. Eze focuses on full-stack development and cybersecurity. He mentors students in building scalable and secure software solutions, bridging academic theory with industry practice.',
    imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwyMHx8YWZyaWNhbiUyMG1hbiUyMGxhcHRvcHxlbnwwfHx8fDE3MjA5Mzk1MjZ8MA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'nnamdi.eze@studyhabit.edu',
  },
  {
    id: '7',
    name: 'Dr. Sarah Adekunle',
    title: 'Senior Lecturer, Law',
    department: 'Law',
    bio: 'Dr. Adekunle specializes in human rights law and international jurisprudence. Her courses emphasize critical thinking and ethical legal practice.',
    imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwyfHxlbGRlcmx5JTIwd29tYW4lMjBzbWFydHxlbnwwfHx8fDE3MjA5Mzk1Nzl8MA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'sarah.adekunle@studyhabit.edu',
  },
  {
    id: '8',
    name: 'Prof. Adebola Jideofor',
    title: 'Professor of Political Science',
    department: 'Political Science',
    bio: 'Prof. Jideofor is a renowned scholar in West African politics and governance. His research often contributes to policy discussions on democracy and development.',
    imageUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4MTN8MHwxfHNlYXJjaHwxMHx8YWZyaWNhbiUyMG1hbiUyMHByb2Zlc3NvcnxlbnwwfHx8fDE3MjA5Mzk2NzB8MA&ixlib=rb-4.0.3&q=80&w=400',
    email: 'adebola.jideofor@studyhabit.edu',
  },
];

const Faculty: React.FC = () => {
  // Animation variants for faculty cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }, // Fixed: Use easeOut variable
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title and Introduction */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }} // Fixed: Use easeOut variable
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-blue-900 sm:text-5xl lg:text-6xl mb-4 leading-tight">
            Meet Our <span className="text-indigo-600">Distinguished Faculty</span> 👨‍🏫👩‍🏫
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">
            At **Studyhabit College**, our strength lies in our extraordinary academic staff.
            Comprising highly qualified and passionate educators, cutting-edge researchers,
            and seasoned industry experts, they are deeply committed to nurturing the next generation of leaders.
            They embody our dedication to **academic excellence**, **innovative teaching**, and **personal mentorship**.
          </p>
        </motion.div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {dummyFaculty.map((member, index) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.08 }} // Slightly faster stagger
              className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group"
            >
              {/* Top Gradient Section of Card */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-t-xl z-0"></div>

              {/* Image Container */}
              <div className="relative z-10 pt-10 flex justify-center mb-4">
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover:border-yellow-300 transition-colors duration-300"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-1">
                  {member.name}
                </h2>
                <p className="text-indigo-700 text-lg font-semibold mb-2">
                  {member.title}
                </p>
                <p className="text-gray-600 text-md mb-4 italic">
                  {member.department}
                </p>
                <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-4"> {/* line-clamp for consistent bio height */}
                  {member.bio}
                </p>
                <div className="flex justify-center space-x-4 mt-auto border-t pt-4 border-gray-200">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-envelope mr-2"></i> Email
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                    >
                      <i className="fas fa-phone mr-2"></i> Call
                    </a>
                  )}
                  {/* Add more icons/links as needed, e.g., LinkedIn, ResearchGate */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faculty;