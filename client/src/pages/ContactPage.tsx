// src/pages/ContactPage.tsx
import React, { useState } from 'react';
// Import 'motion' and 'easeOut' (or other necessary easing functions)
import { motion, easeOut } from 'framer-motion';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import local images for the carousel (create these files in src/assets)
import contactCarousel1 from '../assets/contact-carousel-1.jpg';
import contactCarousel2 from '../assets/contact-carousel-2.jpg';
import contactCarousel3 from '../assets/contact-carousel-3.jpg';

// Define the carousel images
const carouselImages = [
  contactCarousel1,
  contactCarousel2,
  contactCarousel3,
];

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real application, you'd send data to your backend here.
    // Example using fetch API:
    /*
    try {
      const response = await fetch('/api/contact', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
    */

    console.log('Form data submitted:', formData);
    alert('Thank you for your message! We will get back to you soon. (This is a demo submission)');
    setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
  };

  // Framer Motion variants for section animation
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } }, // <-- CORRECTED HERE!
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }, // No 'ease' needed here, default is fine
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut }} // <-- And here for consistency, though string might work
        className="relative py-20 bg-blue-900 text-white text-center shadow-lg"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')` }}></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Connect With Us 🤝
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto px-4 leading-relaxed">
            We're here to answer your questions and provide assistance. Reach out to Studyhabit College today!
          </p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Content Grid: Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Information Section */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-yellow-500"
          >
            <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center lg:text-left">Get in Touch</h2>
            <motion.div variants={itemVariants} className="space-y-7">
              <motion.div variants={itemVariants} className="flex items-start">
                <i className="fas fa-map-marker-alt text-yellow-500 text-3xl mr-5 mt-1 animate-bounce"></i>
                <div>
                  <h3 className="font-semibold text-xl text-blue-900">Our Location</h3>
                  <p className="text-gray-700 leading-relaxed">Plot 217, Chief Owolabi Street, Agungi-Lekki, Lagos, Nigeria.</p>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start">
                <i className="fas fa-phone-alt text-yellow-500 text-3xl mr-5 mt-1 animate-pulse"></i>
                <div>
                  <h3 className="font-semibold text-xl text-blue-900">Call Us</h3>
                  <p className="text-gray-700">+234 810 546 9515</p>
                  <p className="text-gray-700">+234 802 317 2178</p>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start">
                <i className="fas fa-envelope text-yellow-500 text-3xl mr-5 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-xl text-blue-900">Email Us</h3>
                  <p className="text-gray-700">info@studyhabit.com.ng</p>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-start">
                <i className="fas fa-clock text-yellow-500 text-3xl mr-5 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-xl text-blue-900">Office Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 8:00 AM - 5:00 PM</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-xl border-t-8 border-blue-500"
          >
            <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center lg:text-left">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="John Doe"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="john.doe@example.com"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Inquiry about admissions"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Type your message here..."
                  required
                ></textarea>
              </motion.div>
              <motion.div variants={itemVariants} className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 shadow-md transform hover:scale-105"
                >
                  Send Message <i className="fas fa-paper-plane ml-2"></i>
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Why Contact Us Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-white p-8 md:p-12 rounded-xl shadow-xl border-t-8 border-green-500 mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Why Contact Studyhabit College?</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Whether you're a prospective student, a parent, an alumnus, or a community partner, we value your interest and are ready to assist.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="p-6 bg-green-50 rounded-lg shadow-sm">
              <i className="fas fa-graduation-cap text-green-600 text-4xl mb-4"></i>
              <h3 className="font-semibold text-xl text-blue-900 mb-2">Admissions & Enrollment</h3>
              <p className="text-gray-600">Got questions about our admission process, scholarships, or curriculum? We're here to guide you.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="p-6 bg-green-50 rounded-lg shadow-sm">
              <i className="fas fa-hands-helping text-green-600 text-4xl mb-4"></i>
              <h3 className="font-semibold text-xl text-blue-900 mb-2">Support & Assistance</h3>
              <p className="text-gray-600">Need help with student services, academic support, or general inquiries? Our team is ready.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="p-6 bg-green-50 rounded-lg shadow-sm">
              <i className="fas fa-handshake text-green-600 text-4xl mb-4"></i>
              <h3 className="font-semibold text-xl text-blue-900 mb-2">Partnerships & Collaborations</h3>
              <p className="text-gray-600">Interested in partnering with us? Let's explore opportunities for mutual growth and community impact.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Image Carousel Section */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 bg-white p-6 rounded-xl shadow-xl border-t-8 border-purple-500"
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Our Campus in Pictures 📸</h2>
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            className="rounded-lg shadow-lg"
            style={{ '--swiper-navigation-color': '#4c51bf', '--swiper-pagination-color': '#4c51bf' } as React.CSSProperties}
          >
            {carouselImages.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt={`Studyhabit College Campus ${index + 1}`}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Google Map Section */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-16 bg-white p-8 rounded-xl shadow-xl border-t-8 border-red-500"
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-8 text-center">Find Us on the Map 🗺️</h2>
          <div className="aspect-w-16 aspect-h-9 w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
            {/* Correct Google Maps Embed URL for Lekki, Lagos */}
            {/* NOTE: You'll likely need to replace this with an actual Google Maps embed URL generated from Google Maps itself for your specific location, as generic URLs like 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.712165971439!2d3.552945774577881!3d6.427845324905959!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf7511c7694f7%3A0x6a059c3a3b59f3f9!2sChief%20Owolabi%20St%2C%20Lekki%20Penninsula%20II%20106104%2C%20Lekki%2C%20Lagos!5e0!3m2!1sen!2sng!4v1719266938950!5m2!1sen!2sng' might not render a map. */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.3312952520844!2d3.5557766!3d6.4719001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf478816c873d%3A0xc3f5b7a7f4c0a5a!2sAgungi-Lekki!5e0!3m2!1sen!2sng!4v1721087400000!5m2!1sen!2sng"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
              title="Studyhabit College Location"
            ></iframe>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-white p-8 md:p-12 rounded-xl shadow-xl border-t-8 border-orange-500 mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Connect on Social Media 📱</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Follow us on our social channels for daily updates, events, and a glimpse into campus life!
          </p>
          <div className="flex justify-center space-x-6 text-4xl">
            <motion.a
              href="https://facebook.com/your-school-page" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, color: '#1877F2' }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </motion.a>
            <motion.a
              href="https://twitter.com/your-school-page" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, color: '#1DA1F2' }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-blue-400 transition-colors duration-200"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter"></i>
            </motion.a>
            <motion.a
              href="https://instagram.com/your-school-page" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, color: '#E4405F' }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </motion.a>
            <motion.a
              href="https://linkedin.com/company/your-school-page" // Replace with actual links
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2, color: '#0A66C2' }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-blue-700 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </motion.a>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default ContactPage;