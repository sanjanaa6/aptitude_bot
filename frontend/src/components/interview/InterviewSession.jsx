import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewSession = ({ interviewData, onComplete, onBack, isLoading }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock interview questions (in real app, these would come from the API)
  const mockQuestions = [
    {
      id: 1,
      question: "Explain the difference between a list and a tuple in Python. When would you use each?",
      type: "text",
      topic: "Data Structures",
      difficulty: "Intermediate"
    },
    {
      id: 2,
      question: "What is the difference between '==' and 'is' in Python? Provide examples.",
      type: "text",
      topic: "Variables & Data Types",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      question: "Explain the concept of decorators in Python. How do they work and what are they used for?",
      type: "text",
      topic: "Functions",
      difficulty: "Advanced"
    },
    {
      id: 4,
      question: "What is the difference between a shallow copy and a deep copy? When would you use each?",
      type: "text",
      topic: "Data Structures",
      difficulty: "Advanced"
    },
    {
      id: 5,
      question: "Explain the concept of context managers in Python. How do you create and use them?",
      type: "text",
      topic: "File Handling",
      difficulty: "Advanced"
    }
  ];

  const questions = interviewData?.questions || mockQuestions;

  useEffect(() => {
    if (currentQuestionIndex < questions.length) {
      setTimeLeft(300);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextQuestion();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      const newAnswer = {
        questionId: questions[currentQuestionIndex].id,
        question: questions[currentQuestionIndex].question,
        answer: currentAnswer.trim(),
        topic: questions[currentQuestionIndex].topic,
        difficulty: questions[currentQuestionIndex].difficulty,
        timeSpent: 300 - timeLeft
      };
      
      setAnswers(prev => [...prev, newAnswer]);
      setCurrentAnswer('');
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Interview completed
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    if (currentAnswer.trim()) {
      const finalAnswer = {
        questionId: questions[currentQuestionIndex].id,
        question: questions[currentQuestionIndex].question,
        answer: currentAnswer.trim(),
        topic: questions[currentQuestionIndex].topic,
        difficulty: questions[currentQuestionIndex].difficulty,
        timeSpent: 300 - timeLeft
      };
      
      const allAnswers = [...answers, finalAnswer];
      setIsSubmitting(true);
      
      try {
        await onComplete(allAnswers);
      } catch (error) {
        console.error('Failed to complete interview:', error);
        setIsSubmitting(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-screen bg-[#0a0a1a] relative overflow-hidden">
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

      <div className="relative z-10 h-screen flex flex-col justify-center p-6">
        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={onBack}
              className="px-4 py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg hover:bg-[#8b5cf6]/30 transition-all duration-300 font-medium text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back to Topics
            </motion.button>
            
            <div className="text-right">
              <div className="text-xl font-bold text-[#00d4ff] mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-slate-400 text-xs">Time Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="text-[#00d4ff] font-medium text-sm">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-[#0a0a1a] rounded-full h-2 border border-[#00d4ff]/30">
              <motion.div
                className="bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] h-2 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/30 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">💬</span>
                  <h2 className="text-lg font-bold text-white">Question {currentQuestionIndex + 1}</h2>
                </div>
                <p className="text-slate-300 text-base leading-relaxed mb-3">
                  {currentQuestion.question}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  currentQuestion.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  currentQuestion.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {currentQuestion.difficulty}
                </div>
                <div className="text-slate-400 text-xs">
                  Topic: {currentQuestion.topic}
                </div>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2 text-sm">
                Your Answer:
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here... Be detailed and provide examples when possible."
                className="w-full bg-[#0a0a1a] border border-[#00d4ff]/30 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:border-transparent resize-none text-sm"
                rows="4"
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="text-slate-400 text-xs">
                {currentAnswer.length} characters
              </div>
              
              <div className="flex space-x-3">
                {currentQuestionIndex < questions.length - 1 ? (
                  <motion.button
                    onClick={handleNextQuestion}
                    disabled={!currentAnswer.trim() || isSubmitting}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                      currentAnswer.trim() && !isSubmitting
                        ? 'bg-[#00d4ff] hover:bg-[#00b8e6] text-white hover:scale-105'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                    whileHover={currentAnswer.trim() && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={currentAnswer.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    Next Question
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleCompleteInterview}
                    disabled={!currentAnswer.trim() || isSubmitting}
                    className={`px-6 py-2 rounded-lg font-semibold text-base transition-all duration-300 ${
                      currentAnswer.trim() && !isSubmitting
                        ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white hover:scale-105 shadow-lg hover:shadow-[#8b5cf6]/25'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                    whileHover={currentAnswer.trim() && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={currentAnswer.trim() && !isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm">Submitting...</span>
                      </div>
                    ) : (
                      'Complete Interview'
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tips - Compact */}
          <div className="bg-[#0a0a1a]/60 backdrop-blur-sm rounded-lg p-4 border border-[#00d4ff]/20">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Interview Tips
            </h3>
            <ul className="text-slate-300 space-y-1 text-xs">
              <li>• Be specific and provide concrete examples</li>
              <li>• Explain your reasoning and thought process</li>
              <li>• If you're unsure, explain what you do know</li>
              <li>• Use proper terminology and syntax</li>
              <li>• Take your time to think before answering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
