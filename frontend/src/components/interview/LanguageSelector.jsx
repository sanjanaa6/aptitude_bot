import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LanguageSelector = ({ onSelect, onBackToDashboard }) => {
  const [hoveredLang, setHoveredLang] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const languages = [
    {
      id: 'Python',
      name: 'Python',
      description: 'General-purpose programming language',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      topics: ['Variables & Data Types', 'Control Flow', 'Functions', 'Object-Oriented Programming', 'Data Structures', 'File Handling', 'Error Handling', 'Modules & Packages'],
      popularity: 'Most Popular',
      level: 'Beginner Friendly'
    },
    {
      id: 'JavaScript',
      name: 'JavaScript',
      description: 'Web development & Node.js',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      topics: ['Variables & Hoisting', 'Functions & Closures', 'Objects & Prototypes', 'DOM Manipulation', 'Async Programming', 'ES6+ Features', 'Error Handling', 'Modules'],
      popularity: 'High Demand',
      level: 'Versatile'
    },
    {
      id: 'Java',
      name: 'Java',
      description: 'Enterprise & Android development',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      topics: ['Classes & Objects', 'Inheritance & Polymorphism', 'Interfaces & Abstract Classes', 'Exception Handling', 'Collections Framework', 'Generics', 'Multithreading', 'File I/O'],
      popularity: 'Enterprise',
      level: 'Structured'
    },
    {
      id: 'C++',
      name: 'C++',
      description: 'Systems & game development',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
      topics: ['Pointers & References', 'Classes & Objects', 'Templates', 'STL Containers', 'Memory Management', 'Operator Overloading', 'Inheritance', 'Exception Handling'],
      popularity: 'Performance',
      level: 'Advanced'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Grid Pattern Background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Enhanced Glowing Orbs */}
      <div className="absolute top-20 left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />

      {/* Professional Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={onBackToDashboard}
              className="flex items-center space-x-3 px-4 py-2 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-lg transition-all duration-300 font-medium hover:bg-slate-700/80 hover:border-slate-500 hover:text-white hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-lg">Interview Prep</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-screen flex flex-col justify-center">
        <div className={`text-center mb-8 transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 mb-4 backdrop-blur-sm">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </motion.div> */}
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 leading-tight">
            Technical Interview Preparation
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            Master your programming language of choice with our comprehensive interview preparation system
          </p>
          
          {/* Feature Pills */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">Real-time feedback</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-xs font-medium">Adaptive questions</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-400 text-xs font-medium">Performance analytics</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Language Cards Grid - Compact for Screen Fit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <motion.button
                onClick={() => onSelect(lang.name)}
                onMouseEnter={() => setHoveredLang(lang.id)}
                onMouseLeave={() => setHoveredLang(null)}
                className={`relative w-full h-32 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-xl 
                         border border-slate-600/50 rounded-xl transition-all duration-500 group overflow-hidden
                         hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20
                         hover:scale-[1.02] hover:-translate-y-1
                         ${hoveredLang === lang.id ? 'ring-2 ring-blue-500/30' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 group-hover:animate-pulse" />
                </div>
                
                <div className="relative z-10 h-full flex items-center p-6">
                  {/* Language Logo with Enhanced Styling */}
                  <div className="mr-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-700/80 to-slate-600/80 rounded-xl flex items-center justify-center border border-slate-500/50 group-hover:border-blue-500/50 transition-all duration-500 shadow-lg">
                        <img
                          src={lang.logo}
                          alt={`${lang.name} logo`}
                          className="w-10 h-10 transition-all duration-500 group-hover:scale-110 filter drop-shadow-lg"
                        />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Language Information */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                        {lang.name}
                      </h3>
                      <div className="flex space-x-1">
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full border border-green-500/30">
                          {lang.popularity}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 rounded-full border border-blue-500/30">
                          {lang.level}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 group-hover:text-slate-200 font-medium mb-3 leading-relaxed">
                      {lang.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {lang.topics.length} topics available
                        </span>
                      </div>
                      
                      {/* Enhanced Status Indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-semibold">Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Arrow Indicator */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30 shadow-lg">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Professional Footer - Compact */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/60 border border-slate-600/50 rounded-full backdrop-blur-sm">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-400 text-xs font-medium">
              Comprehensive topics from fundamental to advanced concepts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
