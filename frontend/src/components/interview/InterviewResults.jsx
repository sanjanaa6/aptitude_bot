import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const InterviewResults = ({ results, onRestart, onBackToDashboard }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mock results data (in real app, this would come from the API)
  const mockResults = {
    overallScore: 78,
    totalQuestions: 5,
    correctAnswers: 4,
    timeSpent: 1250, // seconds
    feedback: {
      strengths: [
        "Strong understanding of basic concepts",
        "Good use of examples in explanations",
        "Clear communication of ideas"
      ],
      weaknesses: [
        "Could improve on advanced topics",
        "Some technical terminology could be more precise",
        "Consider providing more code examples"
      ],
      recommendations: [
        "Practice more advanced concepts",
        "Review documentation for technical terms",
        "Include code snippets in explanations"
      ]
    },
    questionAnalysis: [
      {
        question: "Explain the difference between a list and a tuple in Python. When would you use each?",
        score: 85,
        feedback: "Excellent explanation with good examples. You clearly understand the key differences and use cases.",
        topic: "Data Structures",
        difficulty: "Intermediate"
      },
      {
        question: "What is the difference between '==' and 'is' in Python? Provide examples.",
        score: 90,
        feedback: "Perfect answer! You clearly explained both operators with relevant examples.",
        topic: "Variables & Data Types",
        difficulty: "Intermediate"
      },
      {
        question: "Explain the concept of decorators in Python. How do they work and what are they used for?",
        score: 65,
        feedback: "Good basic understanding, but could benefit from more technical depth and code examples.",
        topic: "Functions",
        difficulty: "Advanced"
      },
      {
        question: "What is the difference between a shallow copy and a deep copy? When would you use each?",
        score: 70,
        feedback: "Correct concept explanation, but examples would make this answer stronger.",
        topic: "Data Structures",
        difficulty: "Advanced"
      },
      {
        question: "Explain the concept of context managers in Python. How do you create and use them?",
        score: 80,
        feedback: "Solid understanding with practical examples. Good explanation of the 'with' statement.",
        topic: "File Handling",
        difficulty: "Advanced"
      }
    ]
  };

  const safe = (val, fallback) => (val === undefined || val === null ? fallback : val);
  const normalized = results
    ? {
        overallScore: safe(results.overallScore ?? results.score, 0),
        totalQuestions: safe(results.totalQuestions, 0),
        correctAnswers: safe(results.correctAnswers ?? results.correct, 0),
        timeSpent: safe(results.timeSpent, 0),
        feedback: {
          strengths: safe(results.feedback?.strengths ?? results.strengths, []),
          weaknesses: safe(results.feedback?.weaknesses ?? results.weaknesses, []),
          recommendations: safe(results.feedback?.recommendations ?? results.recommendations, []),
        },
        questionAnalysis: safe(results.questionAnalysis ?? results.detailedAnalysis ?? results.questions, []).map((q) => ({
          question: safe(q.question ?? q.prompt ?? q.text, 'Question'),
          score: safe(q.score ?? q.rating, 0),
          feedback: safe(q.feedback ?? q.comment, ''),
          topic: safe(q.topic, 'General'),
          difficulty: safe(q.difficulty, 'Intermediate'),
        })),
      }
    : null;

  const resultsData = normalized || mockResults;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Grid Pattern Background - Exact match from dashboard */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Glowing orbs */}
      <motion.div 
        className="absolute top-10 left-10 w-40 h-40 bg-[#00d4ff]/15 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-60 h-60 bg-[#8b5cf6]/15 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-[#00d4ff] mb-4">
                Interview Results
              </h1>
              <p className="text-xl text-slate-300">
                Your AI-powered interview feedback and analysis
              </p>
            </motion.div>
          </div>

          {/* Overall Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-3xl p-8 border border-[#00d4ff]/30 mb-8 text-center"
          >
            <div className="text-8xl font-bold mb-4" style={{ color: getScoreColor(resultsData.overallScore) }}>
              {resultsData.overallScore}%
            </div>
            <div className="text-2xl text-white mb-6">Overall Score</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0a0a1a]/60 rounded-xl p-4 border border-[#00d4ff]/20">
                <div className="text-3xl font-bold text-[#00d4ff] mb-2">{resultsData.totalQuestions}</div>
                <div className="text-slate-300">Total Questions</div>
              </div>
              <div className="bg-[#0a0a1a]/60 rounded-xl p-4 border border-[#00d4ff]/20">
                <div className="text-3xl font-bold text-green-400 mb-2">{resultsData.correctAnswers}</div>
                <div className="text-slate-300">Correct Answers</div>
              </div>
              <div className="bg-[#0a0a1a]/60 rounded-xl p-4 border border-[#00d4ff]/20">
                <div className="text-3xl font-bold text-[#8b5cf6] mb-2">{formatTime(resultsData.timeSpent)}</div>
                <div className="text-slate-300">Total Time</div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#0a0a1a]/60 backdrop-blur-sm rounded-xl p-2 border border-[#00d4ff]/20">
              {['overview', 'detailed', 'feedback'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-[#00d4ff] text-white shadow-lg shadow-[#00d4ff]/25'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a0a1a]/40'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Strengths */}
                <div className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#00d4ff]/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2 text-green-400">✅</span>
                    Your Strengths
                  </h3>
                  <ul className="space-y-3">
                    {resultsData.feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#00d4ff]/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2 text-yellow-400">⚠️</span>
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {resultsData.feedback.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-slate-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'detailed' && (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {resultsData.questionAnalysis.map((question, index) => (
                  <div key={index} className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#00d4ff]/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-slate-400 text-sm">Topic: {question.topic}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getScoreBadge(question.score)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(question.score)}`}>
                          {question.score}%
                        </div>
                        <div className="text-slate-400 text-sm">Score</div>
                      </div>
                    </div>
                    <div className="bg-[#0a0a1a]/60 rounded-xl p-4 border border-[#00d4ff]/20">
                      <h4 className="text-white font-medium mb-2">AI Feedback:</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{question.feedback}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#00d4ff]/30"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3 text-[#00d4ff]">🎯</span>
                  Recommendations for Improvement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resultsData.feedback.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-[#0a0a1a]/60 rounded-xl p-4 border border-[#00d4ff]/20">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-[#00d4ff]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[#00d4ff] text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6 mt-12">
            <motion.button
              onClick={onRestart}
              className="px-8 py-4 bg-[#00d4ff] hover:bg-[#00b8e6] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#00d4ff]/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Take Another Interview
            </motion.button>
            <motion.button
              onClick={onBackToDashboard}
              className="px-8 py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#8b5cf6]/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🏠 Back to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
