import React, { useRef, useEffect } from 'react';
import { motion, useInView, easeOut } from 'framer-motion'; // Import easeOut
// import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
    acceptanceOfTerms: useRef<HTMLDivElement>(null),
    eligibility: useRef<HTMLDivElement>(null),
    userAccounts: useRef<HTMLDivElement>(null),
    userResponsibilities: useRef<HTMLDivElement>(null),
    acceptableUse: useRef<HTMLDivElement>(null),
    intellectualProperty: useRef<HTMLDivElement>(null),
    termination: useRef<HTMLDivElement>(null),
    disclaimerOfWarranties: useRef<HTMLDivElement>(null),
    limitationOfLiability: useRef<HTMLDivElement>(null),
    indemnification: useRef<HTMLDivElement>(null),
    governingLaw: useRef<HTMLDivElement>(null),
    disputeResolution: useRef<HTMLDivElement>(null),
    changesToTerms: useRef<HTMLDivElement>(null),
    contactUs: useRef<HTMLDivElement>(null),
  };

  // Helper to scroll to section
  const scrollToSection = (id: keyof typeof sectionRefs) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Hook to highlight active section in TOC
  const introInView = useInView(sectionRefs.introduction, { margin: "-50% 0px -50% 0px" });
  const acceptanceInView = useInView(sectionRefs.acceptanceOfTerms, { margin: "-50% 0px -50% 0px" });
  const eligibilityInView = useInView(sectionRefs.eligibility, { margin: "-50% 0px -50% 0px" });
  const accountsInView = useInView(sectionRefs.userAccounts, { margin: "-50% 0px -50% 0px" });
  const responsibilitiesInView = useInView(sectionRefs.userResponsibilities, { margin: "-50% 0px -50% 0px" });
  const acceptableUseInView = useInView(sectionRefs.acceptableUse, { margin: "-50% 0px -50% 0px" });
  const ipInView = useInView(sectionRefs.intellectualProperty, { margin: "-50% 0px -50% 0px" });
  const terminationInView = useInView(sectionRefs.termination, { margin: "-50% 0px -50% 0px" });
  const disclaimerInView = useInView(sectionRefs.disclaimerOfWarranties, { margin: "-50% 0px -50% 0px" });
  const limitationInView = useInView(sectionRefs.limitationOfLiability, { margin: "-50% 0px -50% 0px" });
  const indemnificationInView = useInView(sectionRefs.indemnification, { margin: "-50% 0px -50% 0px" });
  const governingLawInView = useInView(sectionRefs.governingLaw, { margin: "-50% 0px -50% 0px" });
  const disputeResolutionInView = useInView(sectionRefs.disputeResolution, { margin: "-50% 0px -50% 0px" });
  const changesInView = useInView(sectionRefs.changesToTerms, { margin: "-50% 0px -50% 0px" });
  const contactInView = useInView(sectionRefs.contactUs, { margin: "-50% 0px -50% 0px" });

  const getActiveSectionClass = (inView: boolean) => (inView ? 'font-bold text-yellow-500' : 'text-blue-200 hover:text-yellow-400');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && sectionRefs[hash as keyof typeof sectionRefs]?.current) {
      setTimeout(() => {
        scrollToSection(hash as keyof typeof sectionRefs);
      }, 100);
    }
  });

  return (
    <motion.div
      className="min-h-screen bg-gray-50 text-gray-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-700 to-teal-800 text-white py-20 md:py-28 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: "url('/pattern-dark.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            Terms of Service
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
          >
            By accessing or using Studyhabit College's services, you agree to comply with and be bound by these Terms.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-10">
        {/* Table of Contents (Sticky on Desktop) */}
        <motion.nav
          className="lg:w-1/4 lg:sticky lg:top-8 h-fit bg-green-800 text-white p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Contents</h2>
          <ul className="space-y-3 text-sm">
            <li><button onClick={() => scrollToSection('introduction')} className={`block transition-colors ${getActiveSectionClass(introInView)}`}>1. Introduction</button></li>
            <li><button onClick={() => scrollToSection('acceptanceOfTerms')} className={`block transition-colors ${getActiveSectionClass(acceptanceInView)}`}>2. Acceptance of Terms</button></li>
            <li><button onClick={() => scrollToSection('eligibility')} className={`block transition-colors ${getActiveSectionClass(eligibilityInView)}`}>3. Eligibility</button></li>
            <li><button onClick={() => scrollToSection('userAccounts')} className={`block transition-colors ${getActiveSectionClass(accountsInView)}`}>4. User Accounts</button></li>
            <li><button onClick={() => scrollToSection('userResponsibilities')} className={`block transition-colors ${getActiveSectionClass(responsibilitiesInView)}`}>5. User Responsibilities</button></li>
            <li><button onClick={() => scrollToSection('acceptableUse')} className={`block transition-colors ${getActiveSectionClass(acceptableUseInView)}`}>6. Acceptable Use Policy</button></li>
            <li><button onClick={() => scrollToSection('intellectualProperty')} className={`block transition-colors ${getActiveSectionClass(ipInView)}`}>7. Intellectual Property</button></li>
            <li><button onClick={() => scrollToSection('termination')} className={`block transition-colors ${getActiveSectionClass(terminationInView)}`}>8. Termination</button></li>
            <li><button onClick={() => scrollToSection('disclaimerOfWarranties')} className={`block transition-colors ${getActiveSectionClass(disclaimerInView)}`}>9. Disclaimer of Warranties</button></li>
            <li><button onClick={() => scrollToSection('limitationOfLiability')} className={`block transition-colors ${getActiveSectionClass(limitationInView)}`}>10. Limitation of Liability</button></li>
            <li><button onClick={() => scrollToSection('indemnification')} className={`block transition-colors ${getActiveSectionClass(indemnificationInView)}`}>11. Indemnification</button></li>
            <li><button onClick={() => scrollToSection('governingLaw')} className={`block transition-colors ${getActiveSectionClass(governingLawInView)}`}>12. Governing Law</button></li>
            <li><button onClick={() => scrollToSection('disputeResolution')} className={`block transition-colors ${getActiveSectionClass(disputeResolutionInView)}`}>13. Dispute Resolution</button></li>
            <li><button onClick={() => scrollToSection('changesToTerms')} className={`block transition-colors ${getActiveSectionClass(changesInView)}`}>14. Changes to Terms</button></li>
            <li><button onClick={() => scrollToSection('contactUs')} className={`block transition-colors ${getActiveSectionClass(contactInView)}`}>15. Contact Us</button></li>
          </ul>
        </motion.nav>

        {/* Terms of Service Content */}
        <div className="lg:w-3/4 bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <motion.section ref={sectionRefs.introduction} id="introduction" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">1. Introduction</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Welcome to Studyhabit College. These Terms of Service ("Terms") govern your access to and use of all services provided by Studyhabit College ("the College," "we," "us," or "our"), including our website, online learning platforms, student management systems, applications, and any other related services (collectively, "the Services").
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              By accessing or using any part of our Services, you agree to be bound by these Terms. If you are a student, parent/guardian, staff member, or visitor, these Terms apply to your engagement with the College. Please read them carefully. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
            </motion.p>
            <motion.p variants={paragraphVariants} className="text-sm italic text-gray-600">
              Last Updated: July 16, 2025
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.acceptanceOfTerms} id="acceptanceOfTerms" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">2. Acceptance of Terms</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Your use of the Services is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Services. By accessing or using the Services, you signify your unreserved agreement to be legally bound by these Terms. If you are using the Services on behalf of an organization (such as a school, employer, or another entity), you are agreeing to these Terms on behalf of that organization, and you represent and warrant that you have the authority to do so.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.eligibility} id="eligibility" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">3. Eligibility</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              The Services are intended for use by individuals who are enrolled students, parents/guardians of enrolled students, or authorized staff members of Studyhabit College. By using the Services, you represent and warrant that:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}>You are at least 18 years of age, or if you are under 18, you have obtained verifiable consent from your parent or legal guardian to use the Services.</motion.li>
              <motion.li variants={listVariants}>You are legally capable of entering into binding contracts.</motion.li>
              <motion.li variants={listVariants}>You are not barred from receiving services under the laws of Nigeria or other applicable jurisdictions.</motion.li>
              <motion.li variants={listVariants}>All registration information you submit is truthful and accurate, and you agree to maintain the accuracy of such information.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.userAccounts} id="userAccounts" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">4. User Accounts</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Certain features of the Services may require you to register for an account. When you create an account with us, you must provide information that is accurate, complete, and current at all times.
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Account Security:</span> You are responsible for safeguarding the password that you use to access the Services and for any activities or actions under your password, whether your password is with our Service or a third-party service. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Account Restrictions:</span> You may not use as a username the name of another person or entity, or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.userResponsibilities} id="userResponsibilities" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">5. User Responsibilities</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              As a user of Studyhabit College Services, you agree to:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}>Comply with all applicable local, state, national, and international laws and regulations.</motion.li>
              <motion.li variants={listVariants}>Maintain the confidentiality of your account information and be solely responsible for all activities that occur under your account.</motion.li>
              <motion.li variants={listVariants}>Use the Services only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of the Services by any third party.</motion.li>
              <motion.li variants={listVariants}>Report any unauthorized use of your account or any other breach of security to Studyhabit College immediately.</motion.li>
              <motion.li variants={listVariants}>Provide accurate, truthful, and complete information when prompted by the Services, including during registration.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.acceptableUse} id="acceptableUse" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">6. Acceptable Use Policy</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              You agree not to engage in any of the following prohibited activities:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">Violate Laws:</span> Engaging in any activity that violates any applicable local, national, or international law or regulation.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Harmful Conduct:</span> Uploading or distributing any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Impersonation:</span> Impersonating any person or entity, or falsely stating or otherwise misrepresenting your affiliation with a person or entity.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Unauthorized Access:</span> Attempting to gain unauthorized access to any part of the Services, other accounts, computer systems, or networks connected to the Services, through hacking, password mining, or any other means.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Interference:</span> Interfering with or disrupting the integrity or performance of the Services or data contained therein.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Spamming:</span> Transmitting any unsolicited or unauthorized advertising, promotional materials, "junk mail," "spam," "chain letters," "pyramid schemes," or any other form of solicitation.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Malware:</span> Uploading or transmitting viruses, worms, Trojan horses, or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services or of any related website, other websites, or the Internet.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.intellectualProperty} id="intellectualProperty" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">7. Intellectual Property</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              The Services and all contents, including but not limited to text, graphics, images, logos, software, and the compilation thereof, are the exclusive property of Studyhabit College and its licensors and are protected by copyright, trademark, and other intellectual property laws.
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}><span className="font-semibold">License to Use:</span> You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Services strictly in accordance with these Terms for educational and administrative purposes.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">Restrictions:</span> You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Services, use of the Services, or access to the Services without express written permission from us.</motion.li>
              <motion.li variants={listVariants}><span className="font-semibold">User Content:</span> By posting or uploading content to the Services, you grant Studyhabit College a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and distribute such content solely for the purpose of operating and improving the Services.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.termination} id="termination" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">8. Termination</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              If you wish to terminate your account, you may simply discontinue using the Services. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.disclaimerOfWarranties} id="disclaimerOfWarranties" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">9. Disclaimer of Warranties</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Your use of the Services is at your sole risk. The Services are provided on an "AS IS" and "AS AVAILABLE" basis. The Services are provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Studyhabit College does not warrant that a) the Services will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Services are free of viruses or other harmful components; or d) the results of using the Services will meet your requirements.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.limitationOfLiability} id="limitationOfLiability" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">10. Limitation of Liability</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              In no event shall Studyhabit College, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}>Your access to or use of or inability to access or use the Services;</motion.li>
              <motion.li variants={listVariants}>Any conduct or content of any third party on the Services;</motion.li>
              <motion.li variants={listVariants}>Any content obtained from the Services; and</motion.li>
              <motion.li variants={listVariants}>Unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.indemnification} id="indemnification" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">11. Indemnification</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              You agree to defend, indemnify, and hold harmless Studyhabit College and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these Terms, or c) Content posted on the Service.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.governingLaw} id="governingLaw" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">12. Governing Law</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              These Terms shall be governed and construed in accordance with the laws of <strong>Nigeria</strong>, without regard to its conflict of law provisions.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have had between us regarding the Service.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.disputeResolution} id="disputeResolution" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">13. Dispute Resolution</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by <strong>arbitration</strong> in accordance with the provisions of the Arbitration and Conciliation Act Cap A18, Laws of the Federation of Nigeria, 2004.
            </motion.p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <motion.li variants={listVariants}>The place of arbitration shall be <strong>Lagos, Nigeria</strong>.</motion.li>
              <motion.li variants={listVariants}>The language to be used in the arbitral proceedings shall be English.</motion.li>
              <motion.li variants={listVariants}>The arbitral award shall be final and binding on both parties.</motion.li>
            </ul>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.changesToTerms} id="changesToTerms" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">14. Changes to These Terms</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </motion.p>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Services.
            </motion.p>
          </motion.section>

          <div className="h-px bg-gray-200 my-8"></div>

          <motion.section ref={sectionRefs.contactUs} id="contactUs" variants={sectionVariants}>
            <h2 className="text-3xl font-bold text-green-800 mb-4 pb-2 border-b-2 border-green-200">15. Contact Us</h2>
            <motion.p variants={paragraphVariants} className="mb-4 leading-relaxed text-gray-700">
              If you have any questions about these Terms, please contact us:
            </motion.p>
            <ul className="list-none space-y-3 text-gray-700">
              <motion.li variants={listVariants} className="flex items-center"><i className="fas fa-envelope mr-3 text-green-600"></i>Email: <a href="mailto:info@studyhabit.com.ng" className="text-green-600 hover:underline ml-1">info@studyhabit.com.ng</a></motion.li>
              <motion.li variants={listVariants} className="flex items-center"><i className="fas fa-phone mr-3 text-green-600"></i>Phone: +234 810 546 9515, +234 802 317 2178</motion.li>
              <motion.li variants={listVariants} className="flex items-start"><i className="fas fa-map-marker-alt mr-3 text-green-600 mt-1"></i>Address: Plot 217, Chief Owolabi Street, Agungi-Lekki, Lagos, Nigeria.</motion.li>
            </ul>
            <motion.p variants={paragraphVariants} className="mt-4 leading-relaxed text-gray-700">
              We are committed to providing clarity and support regarding your use of our Services.
            </motion.p>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfService;