import React from 'react';
import { motion } from 'framer-motion';
import Image2 from '../../assets/Image2.jpg';

const Banner = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // List items with icons for better visual hierarchy
  const listItems = [
    "Always give without remembering and always receive without forgetting.",
    "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
    "The only way to do great work is to love what you do."
  ];

  return (
    <section className="bg-slate-100 dark:bg-slate-800 dark:text-white py-16">
      <motion.div 
        className="container mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 md:gap-12">
          
        {/* Image container with enhanced styling */}
        <motion.div 
            className="relative overflow-hidden rounded-3xl shadow-lg"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-emerald-100/20 rounded-3xl z-10"></div>
            <img
              src={Image2}
              alt="Children empowerment"
              className="w-full h-[300px] md:h-[450px] object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/50 to-transparent p-6 z-20">
              <span className="text-white text-sm md:text-base font-medium tracking-wide">
                Empowering the future generation
              </span>
            </div>
          </motion.div>
          {/* Text container with enhanced styling and animations */}
          <motion.div 
            className="px-4 sm:px-6 lg:max-w-[520px]"
            variants={itemVariants}
          >
            <div className="mb-2">
              <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-sm font-bold">Our Mission</span>
            </div>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl mb-6 leading-tight">
              Empower <span className="text-emerald-600 dark:text-emerald-400">young children</span>
            </h2>
            
            <div className="h-1 w-20 bg-emerald-600 dark:bg-emerald-400 mb-6"></div>
            
            <ul className="space-y-4 md:space-y-6">
              {listItems.map((item, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-3"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">
                    {item}
                  </p>
                </motion.li>
              ))}
            </ul>
            
            <motion.div 
              className="mt-8"
              variants={itemVariants}
            >
              <a 
                href="#" 
                className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors duration-300"
              >
                Learn More
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </motion.div>
          </motion.div>
          
        </div>
      </motion.div>
    </section>
  );
};

export default Banner;