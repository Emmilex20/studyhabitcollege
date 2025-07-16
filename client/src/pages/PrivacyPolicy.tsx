import React, { useRef, useEffect } from 'react';
import { motion, useInView, easeOut } from 'framer-motion'; // Import easeOut
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  // Framer Motion Variants for smooth animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: easeOut, // Corrected: Use imported easeOut
        when: "beforeChildren",
        staggerChildren: 0.1
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: easeOut, // Corrected: Use imported easeOut
        staggerChildren: 0.05,
      },
    },
  };

  const paragraphVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const listVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  // Refs for Table of Contents scrolling
  const sectionRefs = {
    introduction: useRef<HTMLDivElement>(null),
    informationCollection: useRef<HTMLDivElement>(null),
    howWeUseInformation: useRef<HTMLDivElement>(null),
    dataSharing: useRef<HTMLDivElement>(null),
    dataSecurity: useRef<HTMLDivElement>(null),
    yourRights: useRef<HTMLDivElement>(null),
    cookies: useRef<HTMLDivElement>(null),
    thirdPartyLinks: useRef<HTMLDivElement>(null),
    childrensPrivacy: useRef<HTMLDivElement>(null),
    changesToPolicy: useRef<HTMLDivElement>(null),
    contactUs: useRef<HTMLDivElement>(null),
  };

  // Helper to scroll to section
  const scrollToSection = (id: keyof typeof sectionRefs) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Hook to highlight active section in TOC (optional but good for UX)
  const introInView = useInView(sectionRefs.introduction, { margin: "-50% 0px -50% 0px" });
  const infoCollectionInView = useInView(sectionRefs.informationCollection, { margin: "-50% 0px -50% 0px" });
  const howWeUseInView = useInView(sectionRefs.howWeUseInformation, { margin: "-50% 0px -50% 0px" });
  const dataSharingInView = useInView(sectionRefs.dataSharing, { margin: "-50% 0px -50% 0px" });
  const dataSecurityInView = useInView(sectionRefs.dataSecurity, { margin: "-50% 0px -50% 0px" });
  const yourRightsInView = useInView(sectionRefs.yourRights, { margin: "-50% 0px -50% 0px" });
  const cookiesInView = useInView(sectionRefs.cookies, { margin: "-50% 0px -50% 0px" });
  const thirdPartyInView = useInView(sectionRefs.thirdPartyLinks, { margin: "-50% 0px -50% 0px" });
  const childrenPrivacyInView = useInView(sectionRefs.childrensPrivacy, { margin: "-50% 0px -50% 0px" });
  const changesInView = useInView(sectionRefs.changesToPolicy, { margin: "-50% 0px -50% 0px" });
  const contactInView = useInView(sectionRefs.contactUs, { margin: "-50% 0px -50% 0px" });

  const getActiveSectionClass = (inView: boolean) => (inView ? 'font-bold text-yellow-500' : 'text-blue-200 hover:text-yellow-400');


  useEffect(() => {
    // If you want to scroll to a specific section on load, use URL hash:
    const hash = window.location.hash.substring(1);
    if (hash && sectionRefs[hash as keyof typeof sectionRefs]?.current) {
      setTimeout(() => { // Small delay to ensure content is rendered
        scrollToSection(hash as keyof typeof sectionRefs);
      }, 100);
    }
  }); // Run once on mount


  return (
    <motion.div
      className="min-h-screen bg-gray-50 text-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-20 md:py-28 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: "url('/pattern-light.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }} // Corrected
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }} // Corrected
          >
            Your privacy is paramount to Studyhabit College. This policy outlines how we collect, use, and protect your personal information.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        {/* Table of Contents (Sticky on Desktop) */}
        <motion.nav
          className="lg:w-1/4 lg:sticky lg:top-8 h-fit bg-blue-800 text-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeOut }} // Corrected
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Contents</h2>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => scrollToSection('introduction')} className={`block transition-colors ${getActiveSectionClass(introInView)}`}>1. Introduction</button></li>
            <li><button onClick={() => scrollToSection('informationCollection')} className={`block transition-colors ${getActiveSectionClass(infoCollectionInView)}`}>2. Information We Collect</button></li>
            <li><button onClick={() => scrollToSection('howWeUseInformation')} className={`block transition-colors ${getActiveSectionClass(howWeUseInView)}`}>3. How We Use Your Information</button></li>
            <li><button onClick={() => scrollToSection('dataSharing')} className={`block transition-colors ${getActiveSectionClass(dataSharingInView)}`}>4. Sharing Your Information</button></li>
            <li><button onClick={() => scrollToSection('dataSecurity')} className={`block transition-colors ${getActiveSectionClass(dataSecurityInView)}`}>5. Data Security</button></li>
            <li><button onClick={() => scrollToSection('yourRights')} className={`block transition-colors ${getActiveSectionClass(yourRightsInView)}`}>6. Your Rights & Choices</button></li>
            <li><button onClick={() => scrollToSection('cookies')} className={`block transition-colors ${getActiveSectionClass(cookiesInView)}`}>7. Cookies & Tracking</button></li>
            <li><button onClick={() => scrollToSection('thirdPartyLinks')} className={`block transition-colors ${getActiveSectionClass(thirdPartyInView)}`}>8. Third-Party Links</button></li>
            <li><button onClick={() => scrollToSection('childrensPrivacy')} className={`block transition-colors ${getActiveSectionClass(childrenPrivacyInView)}`}>9. Children's Privacy</button></li>
            <li><button onClick={() => scrollToSection('changesToPolicy')} className={`block transition-colors ${getActiveSectionClass(changesInView)}`}>10. Changes to This Policy</button></li>
            <li><button onClick={() => scrollToSection('contactUs')} className={`block transition-colors ${getActiveSectionClass(contactInView)}`}>11. Contact Us</button></li>
          </ul>
        </motion.nav>

        {/* Policy Content */}
        <div className="lg:w-3/4 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <motion.section ref={sectionRefs.introduction} id="introduction" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">1. Introduction</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Welcome to Studyhabit College. We are committed to protecting your privacy and handling your personal data in a transparent and secure manner. This Privacy Policy details how Studyhabit College ("the College," "we," "us," or "our") collects, uses, processes, and shares information when you interact with our website, online platforms, services, or when you otherwise engage with us as a prospective student, current student, parent/guardian, staff member, or visitor.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              By accessing or using our services, you agree to the terms of this Privacy Policy. Please read it carefully. If you do not agree with the terms, please do not access or use our services. This policy is designed to comply with applicable data protection laws in Nigeria and international best practices.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div> {/* Separator */}

          <motion.section ref={sectionRefs.informationCollection} id="informationCollection" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">2. Information We Collect</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              We collect various types of information to provide and improve our educational services. The exact information we collect depends on your interaction with the College.
            </motion.p>
            <motion.h3 variants={paragraphVariants} className="text-2xl font-semibold text-blue-700 mt-6 mb-3">2.1. Personal Information You Provide to Us:</motion.h3>
            <motion.p variants={paragraphVariants} className="mb-3 leading-relaxed text-gray-700">
              This includes information you voluntarily submit to us through forms, registrations, applications, or direct communication. This may include:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Contact Information:</span> Name, address, email address, phone number, emergency contact details.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Demographic Information:</span> Date of birth, gender, nationality, religion.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Academic Information:</span> Previous school records, grades, transcripts, standardized test scores, course selections, attendance records, disciplinary records.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Financial Information:</span> Payment details for tuition and fees (though typically processed securely by third-party payment gateways, we may store payment history).</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Health Information:</span> Medical conditions, allergies, emergency medical contacts, immunization records (where necessary for student safety and well-being).</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Identification Information:</span> Government-issued IDs (e.g., passport, national ID), student ID numbers.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Family Information:</span> Parent/guardian names, contact details, relationship to the student.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Employment Information:</span> For staff members, employment history, qualifications, bank details, tax information.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">User Content:</span> Information you provide when participating in forums, surveys, or sending communications through our platforms.</motion.li>
            </ul>
            <motion.h3 variants={paragraphVariants} className="text-2xl font-semibold text-blue-700 mt-6 mb-3">2.2. Information We Collect Automatically:</motion.h3>
            <motion.p variants={paragraphVariants} className="mb-3 leading-relaxed text-gray-700">
              When you visit our website or use our online platforms, we may automatically collect certain information about your device and usage patterns, including:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Log Data:</span> IP address, browser type, operating system, referring/exit pages, access dates and times.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Usage Data:</span> Pages viewed, links clicked, time spent on pages, search queries, and other interactions with our services.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Device Information:</span> Device type, unique device identifiers, mobile network information.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Cookies and Tracking Technologies:</span> As detailed in Section 7, we use cookies and similar technologies to enhance your experience and analyze usage.</motion.li>
            </ul>
            <motion.h3 variants={paragraphVariants} className="text-2xl font-semibold text-blue-700 mt-6 mb-3">2.3. Information from Other Sources:</motion.h3>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              We may receive information about you from other sources, such as previous educational institutions, government agencies (for visa or scholarship purposes), or publicly available databases, where permitted by law.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.howWeUseInformation} id="howWeUseInformation" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">3. How We Use Your Information</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Studyhabit College uses the collected information for various purposes essential to our educational mission and operations, including but not limited to:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Educational Provision:</span> Administering admissions, enrollment, academic programs, assessments, and issuing academic records.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Communication:</span> Sending important notices, updates, newsletters, announcements, and responding to inquiries.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Operational Management:</span> Managing student and staff records, attendance, disciplinary actions, and financial transactions (tuition, fees).</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Campus Safety & Security:</span> Ensuring the safety and well-being of our community, managing access to facilities, and responding to emergencies.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Personalization:</span> Customizing your experience on our platforms, e.g., tailoring content or services based on your role (student, teacher, parent).</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Improvement of Services:</span> Analyzing usage trends to improve our website, online platforms, curriculum, and educational offerings.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Legal & Compliance:</span> Fulfilling legal obligations, complying with regulatory requirements, and protecting our rights and property.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Research & Analytics:</span> Conducting internal research (anonymized where possible) to understand educational outcomes and improve pedagogical methods.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.dataSharing} id="dataSharing" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">4. Sharing Your Information</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Studyhabit College does not sell, rent, or trade your personal information to third parties. We may share your information only in specific circumstances:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">With Service Providers:</span> We may engage third-party companies and individuals to facilitate our services (e.g., IT support, payment processing, analytics, cloud hosting). These providers have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">With Parents/Guardians:</span> For students, relevant academic and behavioral information is shared with their registered parents or guardians as necessary for their education and well-being.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">For Legal Reasons:</span> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or government agency).</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">In Case of Business Transfer:</span> If the College undergoes a merger, acquisition, or asset sale, your personal information may be transferred as a business asset. We will provide notice before your personal information is transferred and becomes subject to a different Privacy Policy.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">With Consent:</span> We may share your information with your explicit consent for specific purposes not otherwise covered by this policy.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.dataSecurity} id="dataSecurity" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">5. Data Security</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              The security of your data is paramount to us. We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Encryption:</span> Data is encrypted both in transit (using SSL/TLS) and at rest where feasible.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Access Control:</span> Strict access controls are in place, limiting access to personal data to authorized personnel only on a "need-to-know" basis.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Regular Audits:</span> We regularly review our information collection, storage, and processing practices, including physical security measures, to guard against unauthorized access to systems.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Employee Training:</span> Our staff are trained on data protection and privacy best practices.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Incident Response:</span> We have procedures in place to respond to potential data breaches promptly and effectively.</motion.li>
            </ul>
            <motion.p variants={paragraphVariants} className="mt-4 leading-relaxed text-gray-700">
              While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure. Therefore, we cannot guarantee its absolute security.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.yourRights} id="yourRights" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">6. Your Rights & Choices</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Depending on your jurisdiction and the nature of your interaction with Studyhabit College, you may have certain rights regarding your personal data:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Right to Access:</span> You have the right to request copies of your personal data we hold.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Right to Rectification:</span> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Right to Erasure (Right to Be Forgotten):</span> You have the right to request that we erase your personal data under certain conditions.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Right to Restrict Processing:</span> You have the right to request that we restrict the processing of your personal data under certain conditions.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Right to Object to Processing:</span> You have the right to object to our processing of your personal data under certain conditions.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Right to Data Portability:</span> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</motion.li>
            </ul>
            <motion.p variants={paragraphVariants} className="mt-4 leading-relaxed text-gray-700">
              To exercise any of these rights, please contact us using the details provided in Section 11. We will respond to your request within a reasonable timeframe and in accordance with applicable laws.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.cookies} id="cookies" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">7. Cookies & Tracking Technologies</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Our website uses "cookies" and similar tracking technologies (like web beacons and pixels) to enhance your Browse experience, analyze site usage, and improve our services.
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">What are Cookies?</span> Cookies are small text files placed on your device by websites that you visit. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">How We Use Cookies:</span> We use both session cookies (which are deleted when you close your browser) and persistent cookies (which remain on your device until they expire or you delete them) for purposes such as:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <motion.li variants={listVariants}>Authenticating users and maintaining login sessions.</motion.li>
                  <motion.li variants={listVariants}>Remembering user preferences and settings.</motion.li>
                  <motion.li variants={listVariants}>Analyzing website traffic and usage patterns (e.g., Google Analytics).</motion.li>
                  <motion.li variants={listVariants}>Providing personalized content and advertisements (if applicable).</motion.li>
                </ul>
              </motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Your Cookie Choices:</span> Most web browsers are set to accept cookies by default. You can usually modify your browser setting to decline cookies if you prefer. However, disabling cookies may prevent you from taking full advantage of the website or certain features may not function correctly.</motion.li>
            </ul>
            <motion.p variants={paragraphVariants} className="mt-4 leading-relaxed text-gray-700">
              For more detailed information on how we use cookies and your choices regarding them, please refer to our dedicated <Link to="/cookie-policy" className="text-blue-600 hover:underline font-semibold">Cookie Policy</Link> (if you plan to create one).
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.thirdPartyLinks} id="thirdPartyLinks" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">8. Third-Party Links</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We strongly advise you to review the Privacy Policy of every site you visit.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.childrensPrivacy} id="childrensPrivacy" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">9. Children's Privacy</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Protecting the privacy of children is especially important to us. Studyhabit College's services are primarily directed to individuals seeking educational services. For students under the age of 18, we require consent from a parent or legal guardian for the collection and processing of their personal information, in accordance with applicable laws.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              If we become aware that we have collected personal information from a child without verifiable parental consent, we will take steps to remove that information from our servers. If you believe that we may have collected personal information from a child without proper consent, please contact us immediately.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.changesToPolicy} id="changesToPolicy" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">10. Changes to This Privacy Policy</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </motion.p>
            <motion.p variants={paragraphVariants} className="text-sm italic text-gray-600">
              Last Updated: July 16, 2025
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.contactUs} id="contactUs" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-blue-800 mb-4 pb-2 border-b-2 border-blue-200">11. Contact Us</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              If you have any questions about this Privacy Policy, our data practices, or if you wish to exercise your rights, please contact us:
            </motion.p>
            <ul className="list-none space-y-3 text-gray-700">
              <motion.li variants={listVariants} className="flex items-center"><i className="fas fa-envelope mr-3 text-blue-600"></i>Email: <a href="mailto:info@studyhabit.com.ng" className="text-blue-600 hover:underline ml-1">info@studyhabit.com.ng</a></motion.li>
              <motion.li variants={listVariants} className="flex items-center"><i className="fas fa-phone mr-3 text-blue-600"></i>Phone: +234 810 546 9515, +234 802 317 2178</motion.li>
              <motion.li variants={listVariants} className="flex items-start"><i className="fas fa-map-marker-alt mr-3 text-blue-600 mt-1"></i>Address: Plot 217, Chief Owolabi Street, Agungi-Lekki, Lagos, Nigeria.</motion.li>
            </ul>
            <motion.p variants={paragraphVariants} className="mt-4 leading-relaxed text-gray-700">
              We are dedicated to addressing your concerns promptly and professionally.
            </motion.p>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;