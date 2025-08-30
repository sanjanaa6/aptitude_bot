import React, { useState, useEffect } from 'react';
import ProblemSolver from './ProblemSolver';
import './PracticeInterface.css';
import { startSession, setLanguage, generateChallenge, savePracticeProgress, savePracticeSession, getPracticeStats, getSolvedProblems, clearPracticeProgress } from '../../services/api';
import { motion } from 'framer-motion';

const PracticeInterface = ({ onBackToDashboard, userEmail }) => {
  const [sessionId, setSessionId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProblems, setShowProblems] = useState(false);
  const [problems, setProblems] = useState([]); // Add state for problems
  const [userProgress, setUserProgress] = useState({
    problemsSolved: 0,
    totalAttempted: 0,
    totalSubmissions: 0,
    solvedProblems: new Set()
  });
  const [languageStats, setLanguageStats] = useState({});

  // Start session on mount
  useEffect(() => {
    initSession();
  }, []);

  // Load user progress when session is ready or user changes
  useEffect(() => {
    if (sessionId && userEmail) {
      // Load from localStorage first for immediate UI update
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      const savedProgress = localStorage.getItem(`practiceProgress:${email}`);
      console.log('Loading from localStorage:', savedProgress);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        console.log('Parsed progress:', progress);
        setUserProgress({
          problemsSolved: progress.problemsSolved || 0,
          totalAttempted: progress.totalAttempted || 0,
          totalSubmissions: progress.totalSubmissions || 0,
          solvedProblems: new Set(progress.solvedProblems || [])
        });
      }
    }
  }, [sessionId, userEmail]);

  // Load per-language stats when language changes and update problems list
  useEffect(() => {
    if (!selectedLanguage) return;
    (async () => {
      try {
        await loadUserProgressForLanguage(selectedLanguage);
        
        // Also update language stats
        const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
        const stats = await getPracticeStats(email, selectedLanguage);
        if (stats?.language_summary) {
          setLanguageStats(stats.language_summary);
        }
      } catch (e) {
        console.error('Failed to load language-specific data:', e);
      }
    })();
  }, [selectedLanguage]);

  // Update problems list when userProgress changes to reflect solved status
  useEffect(() => {
    if (problems.length > 0) {
      setProblems(prevProblems => 
        prevProblems.map(problem => ({
          ...problem,
          solved: userProgress.solvedProblems.has(problem.id)
        }))
      );
    }
  }, [userProgress.solvedProblems]);

  const initSession = async () => {
    try {
      setLoading(true);
      const session = await startSession();
      setSessionId(session.session_id);
    } catch (err) {
      setError('Failed to initialize session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle language selection
  const handleLanguageSelect = async (language) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      await setLanguage(sessionId, language);
      setSelectedLanguage(language);
      
      // Load user progress for this specific language, then fetch problems
      await loadUserProgressForLanguage(language);
      await fetchProblems();
      setShowProblems(true);
    } catch (err) {
      setError('Failed to set language: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to load user progress for a specific language
  const loadUserProgressForLanguage = async (language) => {
    try {
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      
      // Try to get solved problems from backend first
      try {
        const solvedData = await getSolvedProblems(email, language);
        const solvedProblemIds = solvedData.solved_problems || [];
        const uniqueSolvedCount = Array.isArray(solvedProblemIds) ? new Set(solvedProblemIds).size : 0;
        
        // Also get stats from backend
        const statsData = await getPracticeStats(email, language);
        const stats = statsData.stats || {};
        
        console.log('Backend stats data:', statsData);
        console.log('Backend stats:', stats);
        console.log('Solved problems:', solvedProblemIds);
        console.log('Unique solved count:', uniqueSolvedCount);
        
        const newProgress = {
          problemsSolved: (stats.unique_solved ?? stats.problems_solved ?? uniqueSolvedCount ?? 0),
          totalAttempted: stats.total_attempted || 0,
          totalSubmissions: stats.total_sessions || 0,
          solvedProblems: new Set(solvedProblemIds)
        };
        
        console.log('New progress:', newProgress);
        console.log('Setting userProgress with solvedProblems:', Array.from(newProgress.solvedProblems));
        
        setUserProgress(newProgress);
        
        // Update localStorage with backend data
        localStorage.setItem(`practiceProgress:${email}`, JSON.stringify({
          problemsSolved: newProgress.problemsSolved,
          totalAttempted: newProgress.totalAttempted,
          totalSubmissions: newProgress.totalSubmissions,
          solvedProblems: solvedProblemIds
        }));
        
        return;
      } catch (backendError) {
        console.error('Failed to load from backend, using localStorage:', backendError);
      }
      
      // Fallback to localStorage
      const savedProgress = localStorage.getItem(`practiceProgress:${email}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserProgress({
          problemsSolved: progress.problemsSolved || 0,
          totalAttempted: progress.totalAttempted || 0,
          totalSubmissions: progress.totalSubmissions || 0,
          solvedProblems: new Set(progress.solvedProblems || [])
        });
      }
    } catch (err) {
      console.error('Failed to load user progress:', err);
    }
  };

  // Function to fetch problems from backend
  const fetchProblems = async () => {
    try {
      // For now, we'll use the first 10 problems from the backend
      // In a real implementation, you'd have a separate API endpoint to get all problems
      const problemIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const fetchedProblems = [];
      
      // Define proper titles for each problem
      const problemTitles = {
        1: "Palindrome Array Check",
        2: "Even-Odd Array Segregation", 
        3: "Remove Duplicate IDs",
        4: "Print Array Elements",
        5: "Find Odd Occurrence Number",
        6: "Find Numbers with Digit",
        7: "String Separator",
        8: "Replace Zeros with Fives",
        9: "Array Sum Calculator",
        10: "Reverse Array Elements"
      };
      
      for (const id of problemIds) {
        try {
          const challenge = await generateChallenge(sessionId, id);
          if (challenge.problem) {
            // Use predefined titles for better display
            const title = problemTitles[id] || `Problem ${id}`;
            
            // Create a short description from the problem content
            const problemText = challenge.problem.replace(/\*\*/g, '').replace(/\n/g, ' ');
            const shortDescription = problemText.length > 80 
              ? problemText.substring(0, 80) + '...' 
              : problemText;
            
            fetchedProblems.push({
              id: id,
              title: title,
              difficulty: challenge.difficulty || 'Easy',
              description: shortDescription,
              fullProblem: challenge.problem,
              solved: userProgress.solvedProblems.has(id)
            });
          }
        } catch (err) {
          console.error(`Failed to fetch problem ${id}:`, err);
        }
      }
      
      setProblems(fetchedProblems);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
      // Fallback to mock problems if backend fails
      setProblems(mockProblems);
    }
  };

  // Function to load user progress from database
  const loadUserProgress = async () => {
    try {
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      
      // Try to get solved problems from backend first
      try {
        const solvedData = await getSolvedProblems(email, selectedLanguage);
        const solvedProblemIds = solvedData.solved_problems || [];
        const uniqueSolvedCount = Array.isArray(solvedProblemIds) ? new Set(solvedProblemIds).size : 0;
        
        // Also get stats from backend
        const statsData = await getPracticeStats(email, selectedLanguage);
        const stats = statsData.stats || {};
        
        const newProgress = {
          problemsSolved: (stats.unique_solved ?? stats.problems_solved ?? uniqueSolvedCount ?? 0),
          totalAttempted: stats.total_attempted || 0,
          totalSubmissions: stats.total_sessions || 0,
          solvedProblems: new Set(solvedProblemIds)
        };
        
        setUserProgress(newProgress);
        
        // Update localStorage with backend data
        localStorage.setItem(`practiceProgress:${email}`, JSON.stringify({
          problemsSolved: newProgress.problemsSolved,
          totalAttempted: newProgress.totalAttempted,
          totalSubmissions: newProgress.totalSubmissions,
          solvedProblems: solvedProblemIds
        }));
        
        return;
      } catch (backendError) {
        console.error('Failed to load from backend, using localStorage:', backendError);
      }
      
      // Fallback to localStorage
      const savedProgress = localStorage.getItem(`practiceProgress:${email}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setUserProgress({
          problemsSolved: progress.problemsSolved || 0,
          totalAttempted: progress.totalAttempted || 0,
          totalSubmissions: progress.totalSubmissions || 0,
          solvedProblems: new Set(progress.solvedProblems || [])
        });
      }
    } catch (err) {
      console.error('Failed to load user progress:', err);
    }
  };

  // Function to save user progress to database
  const saveUserProgress = async (problemId, solved = false) => {
    try {
      const newProgress = {
        ...userProgress,
        totalAttempted: userProgress.totalAttempted + 1,
        totalSubmissions: userProgress.totalSubmissions + 1
      };

      if (solved) {
        const alreadySolved = userProgress.solvedProblems.has(problemId);
        if (!alreadySolved) {
          newProgress.problemsSolved = userProgress.problemsSolved + 1;
          newProgress.solvedProblems.add(problemId);
        }
      }

      setUserProgress(newProgress);

      // Save to localStorage for immediate UI update
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      const progressData = {
        problemsSolved: newProgress.problemsSolved,
        totalAttempted: newProgress.totalAttempted,
        totalSubmissions: newProgress.totalSubmissions,
        solvedProblems: Array.from(newProgress.solvedProblems)
      };
      
      localStorage.setItem(`practiceProgress:${email}`, JSON.stringify(progressData));
      console.log('Saved to localStorage:', progressData);

      // Save to backend for persistence
      try {
        const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
        await savePracticeProgress(
          email,
          newProgress.problemsSolved,
          newProgress.totalAttempted,
          newProgress.totalSubmissions,
          Array.from(newProgress.solvedProblems)
        );
        console.log('Saved to backend successfully');
      } catch (backendError) {
        console.error('Failed to save progress to backend:', backendError);
        // Continue with localStorage fallback
      }

      // Update problems list to reflect solved status
      setProblems(prevProblems => 
        prevProblems.map(problem => 
          problem.id === problemId 
            ? { ...problem, solved: true }
            : problem
        )
      );
    } catch (err) {
      console.error('Failed to save user progress:', err);
    }
  };

  // Function to handle problem solved
  const handleProblemSolved = async (problemId) => {
    const startTime = Date.now();
    const timeTaken = Math.floor((startTime - (window.problemStartTime || startTime)) / 1000); // in seconds
    
    console.log('Problem solved:', problemId, 'User email:', userEmail, 'Language:', selectedLanguage);
    
    // Save individual practice session
    try {
      const selectedProblem = problems.find(p => p.id === problemId);
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      console.log('Saving practice session for email:', email);
      
      await savePracticeSession(
        email,
        problemId,
        selectedProblem?.title || `Problem ${problemId}`,
        true, // solved
        timeTaken,
        selectedLanguage || 'Unknown'
      );
      console.log('Practice session saved successfully');
    } catch (err) {
      console.error('Failed to save practice session:', err);
    }
    
    saveUserProgress(problemId, true);
    setCurrentProblem(null);
  };

  // Handle problem selection
  const handleProblemClick = async (problemId) => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    console.log('Clicking problem:', problemId, 'Session:', sessionId);
    
    // Track when problem is started for timing
    window.problemStartTime = Date.now();
    
    // Find the problem from our fetched problems
    const selectedProblem = problems.find(p => p.id === problemId);
    
    // Show loading tips while fetching
    setCurrentProblem({
      id: problemId,
      title: selectedProblem?.title || `Problem ${problemId}`,
      difficulty: selectedProblem?.difficulty || 'Easy',
      description: selectedProblem?.description || '',
      loading: true,
      tips: getProblemTips(problemId)
    });
    
    try {
      // Fetch specific problem details with problemId
      const challenge = await generateChallenge(sessionId, problemId);
      console.log('Challenge response:', challenge);
      
      // The backend returns the problem as a string, so we need to set it as the 'text' property
      const problemData = {
        id: problemId,
        title: selectedProblem?.title || `Problem ${problemId}`,
        difficulty: selectedProblem?.difficulty || 'Easy',
        description: selectedProblem?.description || '',
        loading: false,
        text: challenge.problem || challenge, // Set the problem text from backend response
        test_cases: challenge.test_cases || [],
        starter_code: challenge.starter_code || ''
      };
      
      console.log('Setting problem data:', problemData);
      setCurrentProblem(problemData);
    } catch (err) {
      console.error('Error fetching problem:', err);
      // Show error in the UI instead of clearing currentProblem
      setCurrentProblem(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch problem details: ${err.message || err}`
      }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get tips for each problem
  const getProblemTips = (problemId) => {
    const tips = {
      1: [
        "💡 Check if each number reads the same forwards and backwards",
        "🔢 Convert number to string to check palindrome",
        "📝 Return true only if ALL elements are palindromes"
      ],
      2: [
        "💡 Separate even and odd numbers first",
        "🔢 Sort even numbers and odd numbers separately",
        "⚠️ Modify the array in-place, don't return a new array"
      ],
      3: [
        "💡 Use a set or hash map to track seen IDs",
        "🔢 Only keep the first occurrence of each ID",
        "📝 Maintain the order of first appearances"
      ],
      4: [
        "💡 Simply print array elements with spaces between them",
        "🔢 Use a loop to iterate through the array",
        "📝 Don't add extra spaces or newlines"
      ],
      5: [
        "💡 Use XOR operation or count occurrences",
        "🔢 XOR all numbers - result will be the odd one",
        "📝 Only one number appears odd number of times"
      ],
      6: [
        "💡 Check each number from 0 to n",
        "🔢 Convert numbers to string to check for digit",
        "📝 Print all numbers containing the digit"
      ]
    };
    return tips[problemId] || ["💡 Read the problem carefully", "🔢 Break it down into smaller steps", "📝 Test your solution with examples"];
  };

  // Handle going back to language selector
  const handleBackToLanguageSelector = () => {
    setSelectedLanguage(null);
    setCurrentProblem(null);
    setShowProblems(false);
  };

  // Handle going back to problems list
  const handleBackToProblems = () => {
    setCurrentProblem(null);
  };

  // Mock problems list (you can replace this with backend API call)
  const mockProblems = [
    { id: 1, title: "Palindrome Array Check", difficulty: "Easy", description: "Check if all array elements are palindrome numbers" },
    { id: 2, title: "Even-Odd Array Segregation", difficulty: "Medium", description: "Separate even and odd numbers in sorted order" },
    { id: 3, title: "Remove Duplicate IDs", difficulty: "Easy", description: "Remove duplicate employee IDs from array" },
    { id: 4, title: "Print Array Elements", difficulty: "Easy", description: "Print array elements space-separated" },
    { id: 5, title: "Find Odd Occurrence Number", difficulty: "Easy", description: "Find number that occurs odd times in array" },
    { id: 6, title: "Find Numbers with Digit", difficulty: "Easy", description: "Find numbers containing specific digit" }
  ];

  // Languages for the new language selection screen
  const languages = [
    {
      name: 'Python',
      icon: '/python-icon.svg',
      description: 'Perfect for beginners with clear, readable syntax and extensive libraries',
      features: ['Easy to learn', 'Readable code', 'Great for algorithms']
    },
    {
      name: 'JavaScript',
      icon: '/javascript-icon.svg',
      description: 'Versatile language for web development with dynamic typing and rich ecosystem',
      features: ['Web focused', 'Dynamic typing', 'Rich ecosystem']
    },
    {
      name: 'Java',
      icon: '/java-icon.svg',
      description: 'Object-oriented programming language with strong typing and platform independence',
      features: ['Platform independent', 'Strong typing', 'Enterprise ready']
    },
    {
      name: 'C++',
      icon: '/cpp-icon.svg',
      description: 'High-performance systems programming with memory control and efficiency',
      features: ['High performance', 'Memory control', 'System programming']
    }
  ];

  // Helper to clear progress
  const handleResetProgress = async () => {
    try {
      setLoading(true);
      const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';
      
      // If no language selected, clear all progress. If language selected, clear only that language
      await clearPracticeProgress(email, selectedLanguage);

      // Reset local state
      setUserProgress({
        problemsSolved: 0,
        totalAttempted: 0,
        totalSubmissions: 0,
        solvedProblems: new Set()
      });

      // Clear localStorage for this user
      localStorage.setItem(`practiceProgress:${email}`, JSON.stringify({
        problemsSolved: 0,
        totalAttempted: 0,
        totalSubmissions: 0,
        solvedProblems: []
      }));

      // Refresh problems to clear solved marks if we're on the problems list
      if (problems.length > 0) {
        setProblems(prev => prev.map(p => ({ ...p, solved: false })));
      }
      
      // Show success message
      console.log('Progress cleared successfully');
    } catch (e) {
      console.error('Failed to clear practice progress:', e);
      setError('Failed to clear progress');
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (loading) return <div className="practice-container"><div>Loading...</div></div>;
  if (error) return <div className="practice-container"><div>{error}</div></div>;

  if (!sessionId) return <div className="practice-container"><div>Initializing session...</div></div>;

  // Language selection screen
  if (!selectedLanguage) {
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

        <div className="relative z-10 h-screen flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-3">
                Choose Your Language
              </h1>
              <p className="text-lg text-slate-300">
                Select a programming language to start practicing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {languages.map((language) => (
                <motion.div
                  key={language.name}
                  className="bg-slate-800/90 backdrop-blur-xl rounded-xl p-6 border border-slate-600 cursor-pointer hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageSelect(language.name)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/80 rounded-xl flex items-center justify-center group-hover:bg-slate-600/80 transition-colors border border-slate-600">
                      <img 
                        src={language.icon} 
                        alt={language.name}
                        className="w-10 h-10 filter drop-shadow-lg"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-slate-200 transition-colors">
                      {language.name}
                    </h3>
                    <p className="text-slate-300 mb-3 leading-relaxed text-sm">
                      {language.description}
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {language.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-slate-700/80 text-slate-300 rounded-full text-xs font-medium border border-slate-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 flex items-center justify-center gap-4">
              <motion.button
                onClick={onBackToDashboard}
                className="px-6 py-2 bg-slate-800/80 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/80 hover:border-slate-500 hover:text-white transition-all duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Dashboard
              </motion.button>
              <motion.button
                onClick={handleResetProgress}
                className="px-6 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-300 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset All Progress
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show problems list
  if (showProblems && !currentProblem) {
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

        <div className="relative z-10 h-screen p-8 overflow-y-auto">
          {/* Header */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={handleBackToLanguageSelector}
                  className="px-6 py-3 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg hover:bg-[#8b5cf6]/30 transition-all duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back to Languages
                </motion.button>
                <motion.button
                  onClick={handleResetProgress}
                  className="px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Progress
                </motion.button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center">
                    <span className="text-[#00d4ff] font-bold text-sm">
                      {selectedLanguage.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white font-medium">{selectedLanguage}</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{userProgress.problemsSolved}</div>
                    <div className="text-slate-400 text-sm">Problems Solved</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-[#00d4ff]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{userProgress.totalAttempted}</div>
                    <div className="text-slate-400 text-sm">Total Attempted</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#8b5cf6]/20 rounded-lg flex items-center justify-center">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-[#8b5cf6]">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{userProgress.totalSubmissions}</div>
                    <div className="text-slate-400 text-sm">Total Submissions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Problems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {problems.map((problem) => (
                <motion.div
                  key={problem.id} 
                  className="bg-[#0a0a1a]/80 backdrop-blur-sm rounded-xl p-6 border border-[#00d4ff]/20 cursor-pointer hover:border-[#00d4ff]/40 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => handleProblemClick(problem.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                        {problem.title}
                      </h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {problem.description}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {problem.difficulty}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {userProgress.solvedProblems.has(problem.id) ? (
                        <div className="flex items-center space-x-2 text-green-400">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm font-medium">Solved</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-slate-400">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm">Not attempted</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[#00d4ff] group-hover:scale-110 transition-transform">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show problem solver
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

      <div className="relative z-10 h-screen overflow-y-auto">
      <ProblemSolver
        sessionId={sessionId}
        problem={currentProblem}
        onBack={handleBackToProblems}
        onProblemSolved={handleProblemSolved}
        selectedLanguage={selectedLanguage}
        userEmail={userEmail}
      />
      </div>
    </div>
    );
};

// Helper function for difficulty colors
const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'hard': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export default PracticeInterface; 

