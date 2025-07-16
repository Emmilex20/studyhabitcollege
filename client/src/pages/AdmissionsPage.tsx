// src/pages/AdmissionsPage.tsx
import React, { useEffect } from 'react'; // Import useEffect
import { motion, easeOut } from 'framer-motion'; // Import easeOut
import { Link, useLocation } from 'react-router-dom'; // Import useLocation

// Placeholder for an admissions-related image
import admissionsHero from '../assets/admissions-hero.jpeg'; // e.g., a photo of students studying, or a welcoming campus shot

const AdmissionsPage: React.FC = () => {
  const location = useLocation(); // Get current location object

  // Variants for section animations
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut, when: "beforeChildren" } // Use imported easeOut
    },
  };

  // Variants for individual list items or cards
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } }, // Use imported easeOut
  };

  // Effect to scroll to the hash fragment on page load if one exists
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1)); // Remove '#'
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]); // Re-run when location changes (e.g., hash changes)

  // Function to handle smooth scroll for the button
  const handleScrollToSection = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    event.preventDefault(); // Prevent default link behavior
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
          transition={{ duration: 0.8, ease: easeOut }} // Use imported easeOut
          className="bg-blue-900 text-white rounded-3xl shadow-xl overflow-hidden mb-20 p-8 md:p-16 text-center relative"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${admissionsHero})`, opacity: 0.2 }}></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Admissions at Studyhabit College 👋
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
              Welcome to Studyhabit College! We're thrilled you're considering joining our vibrant academic community. This page provides all the essential information to guide you through our admission process, from application requirements to key dates.
            </p>
            {/* Changed Link to a standard <a> tag and added onClick handler */}
            <a
              href="#application-process" // Use standard href for ID
              onClick={(e) => handleScrollToSection(e, 'application-process')}
              className="inline-block px-8 py-3 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Begin Your Application Journey
            </a>
          </div>
        </motion.div>

        {/* --- */}

        {/* Our Admission Philosophy */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative">
            Our Approach to Admissions
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Studyhabit College, we believe in a holistic admission process that looks beyond just grades. We seek students who are not only academically promising but also demonstrate curiosity, resilience, a willingness to contribute positively to our community, and a passion for learning. We welcome applicants from diverse backgrounds and experiences.
          </p>
        </motion.section>

        {/* --- */}

        {/* Admission Process */}
        <motion.section
          id="application-process" 
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-blue-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center relative">
            Your Application Journey: Step-by-Step
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-blue-500 rounded-full"></span>
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0">
            {[
              { icon: '📝', title: 'Step 1: Online Application', description: 'Complete our comprehensive online application form. Ensure all sections are filled accurately and completely.' },
              { icon: '📄', title: 'Step 2: Submit Required Documents', description: 'Upload all necessary academic records, recommendations, and other supporting documents as specified for your desired entry level.' },
              { icon: '✍️', title: 'Step 3: Entrance Examination', description: 'Eligible candidates will be invited to sit for our entrance examination, assessing core academic skills.' },
              { icon: '🗣️', title: 'Step 4: Interview (Optional for some levels)', description: 'Shortlisted candidates, particularly for senior levels, may be invited for an interview to assess character and fit.' },
              { icon: '✅', title: 'Step 5: Admission Offer', description: 'Successful candidates will receive an official admission offer letter via email, detailing next steps for acceptance.' },
              { icon: '🏫', title: 'Step 6: Enrollment & Orientation', description: 'Complete your enrollment by paying required fees. Get ready to join us for our exciting orientation program!' },
            ].map((step, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-5xl mb-4 p-3 bg-blue-100 rounded-full">{step.icon}</div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.li>
            ))}
          </ol>
          <div className="text-center mt-10">
            <Link
              to="https://forms.gle/YOUR_GOOGLE_FORM_LINK_HERE" // Replace with your actual application form link
              target="_blank" // Opens in a new tab
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 bg-yellow-500 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 transform"
            >
              Start Your Online Application Now!
            </Link>
          </div>
        </motion.section>

        {/* --- */}

        {/* Admission Requirements */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-green-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center relative">
            Key Admission Requirements
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-green-500 rounded-full"></span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">📚</span> For Junior Secondary (JSS 1)
              </h3>
              <motion.ul variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="list-disc pl-5 space-y-3 text-gray-700">
                <motion.li variants={itemVariants} className="bg-green-50 p-3 rounded-lg shadow-sm">Completed online application form.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.1 }}>Last two terms' academic reports from previous school.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.2 }}>Birth certificate (photocopy).</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.3 }}>One passport-sized photograph of the applicant.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.4 }}>Attestation letter from the head of the previous school.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.5 }}>Successful performance in the Studyhabit College Entrance Examination.</motion.li>
              </motion.ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-3 text-3xl">🎓</span> For Senior Secondary (SS 1 - SS 2)
              </h3>
              <motion.ul variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} className="list-disc pl-5 space-y-3 text-gray-700">
                <motion.li variants={itemVariants} className="bg-green-50 p-3 rounded-lg shadow-sm">Completed online application form.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.1 }}>Academic transcripts/reports for the last three years.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.2 }}>Basic Education Certificate Examination (BECE) results (if applicable).</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.3 }}>Letter of recommendation from the previous school principal.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.4 }}>Birth certificate (photocopy).</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.5 }}>Two passport-sized photographs of the applicant.</motion.li>
                <motion.li variants={itemVariants} transition={{ delay: 0.6 }}>Successful performance in the Studyhabit College Entrance Examination and Interview.</motion.li>
              </motion.ul>
            </div>
          </div>
          <p className="text-center text-gray-600 italic mt-8">
            <span className="font-semibold">Note:</span> Specific requirements may vary. Please refer to the online application portal for the most current and detailed list.
          </p>
        </motion.section>

        {/* --- */}

        {/* Key Dates & Deadlines */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-8 border-purple-500"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8 text-center relative">
            Important Dates & Timelines
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-purple-500 rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="flex items-start p-4 bg-purple-50 rounded-lg shadow-sm">
              <span className="text-4xl mr-4">🗓️</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-1">Application Opens:</h3>
                <p className="text-gray-700">Annually on **October 1st** for the following academic year.</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} transition={{ delay: 0.1 }} className="flex items-start p-4 bg-purple-50 rounded-lg shadow-sm">
              <span className="text-4xl mr-4">⏰</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-1">Early Bird Application Deadline:</h3>
                <p className="text-gray-700">**January 31st** (Highly recommended for priority consideration).</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} transition={{ delay: 0.2 }} className="flex items-start p-4 bg-purple-50 rounded-lg shadow-sm">
              <span className="text-4xl mr-4">📅</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-1">Main Application Deadline:</h3>
                <p className="text-gray-700">**April 30th** (Subject to availability).</p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} transition={{ delay: 0.3 }} className="flex items-start p-4 bg-purple-50 rounded-lg shadow-sm">
              <span className="text-4xl mr-4">📝</span>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-1">Entrance Examinations:</h3>
                <p className="text-gray-700">Conducted between **February and May** each year. Specific dates will be communicated via email.</p>
              </div>
            </motion.div>
          </div>
          <p className="text-center text-gray-600 italic mt-8">
            <span className="font-semibold">Pro Tip:</span> Applying early increases your chances, especially for limited spaces!
          </p>
        </motion.section>

        {/* --- */}

        {/* Scholarships & Financial Aid */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative">
            Scholarships & Financial Aid
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-24 h-1 bg-yellow-500 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Studyhabit College is committed to making quality education accessible. We offer a limited number of **merit-based scholarships** and need-based financial aid to deserving students. Information on how to apply for these opportunities is available through our admissions office.
          </p>
          <Link
            to="/contact" // Link to a dedicated financial aid page or contact form
            className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all duration-300 transform"
          >
            Learn More About Financial Aid
          </Link>
        </motion.section>

        {/* --- */}

        {/* Contact Admissions */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-blue-800 text-white p-12 rounded-3xl shadow-2xl text-center"
        >
          <h2 className="text-4xl font-extrabold mb-6">
            Questions About Admissions? We're Here to Help!
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Our dedicated admissions team is ready to assist you. Don't hesitate to reach out if you have any questions or need further clarification on the application process.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:scale-105 transition-all duration-300 transform"
            >
              Contact Our Admissions Office 📧
            </Link>
            <a
              href="tel:+2348012345678" // Replace with actual phone number
              className="inline-block px-8 py-3 bg-white text-blue-900 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform"
            >
              Call Us: +234 801 234 5678 📞
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdmissionsPage;