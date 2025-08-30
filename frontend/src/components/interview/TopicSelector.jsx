import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TopicSelector = ({ language, onSelect, onBack }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Shared topics across all languages to ensure consistent interview areas
  const sharedTopics = [
    { 
      id: 'variables', 
      name: 'Variables & Data Types', 
      description: 'Data types, variables, and type conversion', 
      difficulty: 'Beginner',
      icon: '🔤',
      estimatedTime: '15-20 min'
    },
    { 
      id: 'control_flow', 
      name: 'Control Flow', 
      description: 'Conditionals, loops, and general control structures', 
      difficulty: 'Beginner',
      icon: '🔄',
      estimatedTime: '20-25 min'
    },
    { 
      id: 'functions', 
      name: 'Functions', 
      description: 'Definition, parameters, return values, scope, closures', 
      difficulty: 'Intermediate',
      icon: '⚙️',
      estimatedTime: '25-30 min'
    },
    { 
      id: 'oop', 
      name: 'Object-Oriented Programming', 
      description: 'Classes, objects, inheritance, polymorphism', 
      difficulty: 'Intermediate',
      icon: '🏗️',
      estimatedTime: '30-35 min'
    },
    { 
      id: 'data_structures', 
      name: 'Data Structures', 
      description: 'Arrays/lists, sets, maps/dicts, queues, stacks', 
      difficulty: 'Intermediate',
      icon: '📊',
      estimatedTime: '25-30 min'
    },
    { 
      id: 'file_handling', 
      name: 'File Handling', 
      description: 'Reading and writing files, buffering/streaming', 
      difficulty: 'Intermediate',
      icon: '📁',
      estimatedTime: '20-25 min'
    },
    { 
      id: 'error_handling', 
      name: 'Error Handling', 
      description: 'Try/catch, exceptions, error models', 
      difficulty: 'Intermediate',
      icon: '⚠️',
      estimatedTime: '15-20 min'
    },
    { 
      id: 'modules', 
      name: 'Modules & Packages', 
      description: 'Modules, imports, and package structure', 
      difficulty: 'Advanced',
      icon: '📦',
      estimatedTime: '20-25 min'
    }
  ];

  const topics = sharedTopics;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTopicToggle = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStartInterview = () => {
    if (selectedTopics.length > 0) {
      const selectedTopicNames = selectedTopics.map(id => 
        topics.find(t => t.id === id)?.name
      ).filter(Boolean);
      onSelect(selectedTopicNames);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-slate-700/80 text-slate-300 border-slate-600';
      case 'Intermediate': return 'bg-slate-700/80 text-slate-300 border-slate-600';
      case 'Advanced': return 'bg-slate-700/80 text-slate-300 border-slate-600';
      default: return 'bg-slate-700/80 text-slate-300 border-slate-600';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '🟢';
      case 'Intermediate': return '🟡';
      case 'Advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Subtle background accents */}
      <motion.div 
        className="absolute top-10 left-10 w-40 h-40 bg-slate-700/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-60 h-60 bg-slate-600/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 h-screen flex flex-col justify-center p-6">
        {/* Compact Header */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/60 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/80 hover:border-slate-500 hover:text-white transition-all duration-300 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </motion.button>
              <div className="flex items-center space-x-3 bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-600/50">
                <div className="w-8 h-8 bg-slate-700/80 rounded-lg flex items-center justify-center border border-slate-600">
                  <span className="text-slate-300 font-bold text-sm">
                    {language.charAt(0)}
                  </span>
                </div>
                <div>
                  <span className="text-white font-semibold text-base">{language}</span>
                  <p className="text-slate-400 text-xs">Language</p>
                </div>
              </div>
            </div>
            
            {/* Selection Summary */}
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-300">{selectedTopics.length}</div>
              <div className="text-slate-400 text-xs">Topics Selected</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
              Select Interview Topics
            </h1>
            <p className="text-base text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-4">
              Choose the topics you want to be interviewed on
            </p>
            
            {/* Difficulty Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span>Beginner</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span>Intermediate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <span>Advanced</span>
              </div>
            </div>
          </div>

          {/* Compact Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group cursor-pointer transition-all duration-300 ${
                  selectedTopics.includes(topic.id)
                    ? 'ring-2 ring-slate-400 ring-opacity-50'
                    : ''
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <div className={`bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 transition-all duration-300 group-hover:border-slate-500 group-hover:bg-slate-700/60 ${
                  selectedTopics.includes(topic.id)
                    ? 'bg-slate-700/60 border-slate-400/50'
                    : ''
                }`}>
                  {/* Topic Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{topic.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-slate-200 transition-colors leading-tight">
                          {topic.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-slate-700/80 text-slate-300 border border-slate-600`}>
                      {topic.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">
                      {topic.estimatedTime}
                    </span>
                  </div>
                  
                  {/* Topic Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {topic.description}
                  </p>
                  
                  {/* Selection Status */}
                  <div className="flex items-center justify-between">
                    {selectedTopics.includes(topic.id) ? (
                      <div className="flex items-center space-x-2 text-slate-300">
                        <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium">Selected</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-slate-400">
                        <div className="w-5 h-5 bg-slate-700/80 rounded-full flex items-center justify-center border border-slate-600">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <span className="text-xs">Click to select</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Start Interview Button */}
          <div className="text-center">
            <motion.button
              onClick={handleStartInterview}
              disabled={selectedTopics.length === 0}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform ${
                selectedTopics.length > 0
                  ? 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-105 shadow-lg hover:shadow-slate-900/25'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              whileHover={selectedTopics.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedTopics.length > 0 ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center justify-center space-x-2">
                {selectedTopics.length > 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Start Interview ({selectedTopics.length} topics)</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Select at least one topic</span>
                  </>
                )}
              </div>
            </motion.button>
            
            {selectedTopics.length > 0 && (
              <p className="text-slate-400 text-xs mt-3 font-medium">
                Estimated time: {Math.ceil(selectedTopics.length * 25)} minutes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;
