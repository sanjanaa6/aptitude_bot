import React, { useState, useEffect } from 'react';
import './ProblemSolver.css';
import CodeEditor from '../learn/CodeEditor';
import { testCodeAgainstCases, getHint } from '../../services/api';
import HintCard from '../learn/HintCard';
import AnimatedHintCard from '../learn/AnimatedHintCard';
import LoadingSpinner from '../learn/LoadingSpinner';

const ProblemSolver = ({ problem, sessionId, selectedLanguage, onBack, onProblemSolved, userEmail }) => {
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testSummary, setTestSummary] = useState(null);
  const [showHintCard, setShowHintCard] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [activeHints, setActiveHints] = useState([]);
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  // Defensive guards for missing problem
  const safeProblem = problem || {};
  const testCases = safeProblem.test_cases || safeProblem.testCases || [];
  const language = selectedLanguage;
  const email = userEmail || JSON.parse(localStorage.getItem('me') || '{}').email || 'anonymous';

  // Function to clean problem text by removing special symbols and emojis
  const cleanProblemText = (text) => {
    if (!text) return '';
    
    return text
      .replace(/[💻📥📤💡🔢📝🧪]/g, '') // Remove emojis
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/Test Case \d+:/g, 'Test Case:') // Clean test case headers
      .replace(/Input:/g, 'Input:')
      .replace(/Expected Output:/g, 'Expected Output:')
      .replace(/Explanation:/g, 'Explanation:')
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim();
  };

  // Check if we should show loading state
  const shouldShowLoading = safeProblem.loading || (!safeProblem.text && !safeProblem.description && !safeProblem.problemStatement && !safeProblem.examples && testCases.length === 0 && !safeProblem.error);
  
  // Debug logging
  console.log('Problem object:', problem);
  console.log('shouldShowLoading:', shouldShowLoading);
  console.log('problem.text:', safeProblem.text);
  console.log('problem.description:', safeProblem.description);
  console.log('testCases.length:', testCases.length);

  useEffect(() => {
    // Set default code template if provided by backend
    if (safeProblem.starter_code) {
      setCode(safeProblem.starter_code);
    } else {
      setCode('');
    }
  }, [safeProblem.starter_code]);

  // Reset hints when switching problems
  useEffect(() => {
    setShowHintCard(false);
    setCurrentHint('');
    setActiveHints([]);
  }, [safeProblem.id]);

  const handleGetHint = async () => {
    if (!sessionId) return;
    if (!safeProblem || !safeProblem.text) return;
    try {
      setShowLoadingSpinner(true);
      const response = await getHint(sessionId, email);
      const hintContent = response.hint || response.message || response.content || 'No hint available';
      setCurrentHint(hintContent);
      setShowHintCard(true);
    } catch (e) {
      setOutput(`Failed to get hint: ${e.message || e}`);
    } finally {
      setShowLoadingSpinner(false);
    }
  };

  const handleRunCode = async (code) => {
    if (!code.trim()) {
      setOutput('Please enter your code before running.');
      setTestResults(null);
      setTestSummary(null);
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setTestSummary(null);
    setOutput('');

    try {
      // Test code against all test cases using Judge0 API
      const response = await testCodeAgainstCases(sessionId, code, language);
      
      if (response.status === 'success') {
        setTestResults(response.test_results);
        setTestSummary(response.summary);
        if (response.summary && response.summary.passed === response.summary.total) {
          setOutput('All test cases passed! Your code is working correctly.');
        } else {
          setOutput('Some test cases failed. Check the test results below.');
        }
      } else {
        setOutput(response.error || 'Error: Code execution failed.');
        setTestResults(response.test_results || []);
        setTestSummary(response.summary || null);
      }
    } catch (error) {
      setOutput(`Run error: ${error.message || error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async (code) => {
    if (!code.trim()) {
      setOutput('Please enter your code before submitting.');
      setTestResults(null);
      setTestSummary(null);
      return;
    }
    
    setIsSubmitting(true);
    setTestResults(null);
    setTestSummary(null);
    setOutput('');
    
    try {
      const response = await testCodeAgainstCases(sessionId, code, language);
      
      if (response.status === 'success') {
        setTestResults(response.test_results);
        setTestSummary(response.summary);
        if (response.summary && response.summary.passed === response.summary.total) {
          setOutput('Congratulations! All test cases passed! Your solution is correct!');
          // Call onProblemSolved with the problem ID
          onProblemSolved && onProblemSolved(problem.id);
          // Return back to problems list when all tests pass
          setTimeout(() => {
            onBack();
          }, 2000);
        } else {
          setOutput('Some test cases failed. Please check your solution.');
        }
      } else {
        setOutput(response.error || 'Error: Code execution failed.');
        setTestResults(response.test_results || []);
        setTestSummary(response.summary || null);
      }
    } catch (error) {
      setOutput(`Submission error: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // If no problem provided at all, show a minimal fallback
  if (!problem) {
    return (
      <div className="problem-solver h-screen flex items-center justify-center text-white bg-gray-900/50">
        <div className="text-center space-y-4">
          <div className="text-slate-300">No problem selected.</div>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg">Back to problems</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="problem-solver h-screen flex">
      {/* Left Panel - Problem Description (Scrollable) */}
      <div className="w-1/2 flex flex-col p-6 overflow-y-auto bg-gray-900/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Practice Problems {safeProblem.title && `- ${safeProblem.title}`}
          </h1>
          
          <div className="mt-6">
            {/* Actions */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleGetHint}
                className="px-4 py-2 rounded-lg border border-white/15 text-white hover:bg-white/10 transition"
                disabled={isRunning || isSubmitting || shouldShowLoading}
              >
                💡 Get Hint
              </button>
            </div>
            {safeProblem.error ? (
              <div className="bg-red-900/40 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h2 className="text-lg font-bold text-white mb-3">Failed to load problem</h2>
                <p className="text-red-300 mb-4">{String(safeProblem.error)}</p>
                {onBack && (
                  <button onClick={onBack} className="px-4 py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg">Back to problems</button>
                )}
              </div>
            ) : shouldShowLoading ? (
              // Show loading tips while fetching problem details
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h2 className="text-lg font-bold text-white mb-4">Loading Problem...</h2>
                <p className="text-gray-300 mb-4">{safeProblem.description}</p>
                <h3 className="text-lg font-semibold text-white mb-3">Tips while we prepare your challenge:</h3>
                <div className="space-y-3">
                  {(safeProblem.tips || [
                    "Read the problem statement carefully",
                    "Break down the problem into smaller steps", 
                    "Think about the input and output format",
                    "Test your solution with examples"
                  ]).map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-300">{tip}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <div className="animate-spin h-8 w-8 border-b-2 border-red-500 rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-2">Fetching problem details...</p>
                </div>
              </div>
            ) : (
              // Show actual problem content once loaded
              <div className="space-y-6">
                {/* Problem Statement Section */}
                {safeProblem.text && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-white mb-3">Problem Statement</h3>
                    <div className="text-gray-300 leading-relaxed text-justify">
                      <div dangerouslySetInnerHTML={{ __html: cleanProblemText(safeProblem.text) }} />
                    </div>
                  </div>
                )}

                {/* Description Section */}
                {safeProblem.description && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                    <div className="text-gray-300 leading-relaxed text-justify">
                      {safeProblem.description}
                    </div>
                  </div>
                )}

                {/* Examples Section */}
                {safeProblem.examples && safeProblem.examples.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-white mb-3">Examples</h3>
                    <div className="space-y-4">
                      {safeProblem.examples.map((example, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-white mb-2">Example {index + 1}</h4>
                          <div className="space-y-2">
                            <div><span className="text-gray-400">Input:</span></div>
                            <pre className="bg-gray-800 p-3 rounded text-green-400 text-sm overflow-x-auto">{example.input}</pre>
                            <div><span className="text-gray-400">Output:</span></div>
                            <pre className="bg-gray-800 p-3 rounded text-blue-400 text-sm overflow-x-auto">{example.output}</pre>
                            {example.explanation && (
                              <>
                                <div><span className="text-gray-400">Explanation:</span></div>
                                <div className="text-gray-300 text-sm">{example.explanation}</div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints Section */}
                {safeProblem.constraints && safeProblem.constraints.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-white mb-3">Constraints</h3>
                    <ul className="text-gray-300 space-y-2">
                      {safeProblem.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Test Cases Section */}
                {testCases.length > 0 && (
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-white mb-3">Sample Test Cases</h3>
                    <div className="space-y-4">
                      {testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-white mb-2">
                            {testCase.description || `Test Case ${index + 1}`}
                          </h4>
                          <div className="space-y-2">
                            <div><span className="text-gray-400">Input:</span></div>
                            <pre className="bg-gray-800 p-3 rounded text-green-400 text-sm overflow-x-auto">{testCase.input}</pre>
                            <div><span className="text-gray-400">Expected Output:</span></div>
                            <pre className="bg-gray-800 p-3 rounded text-blue-400 text-sm overflow-x-auto">{testCase.expected || testCase.output}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Hints */}
                {activeHints.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-3">💡 Hints</h3>
                    <div className="space-y-3">
                      {activeHints.map((hint) => (
                        <HintCard
                          key={hint.id}
                          hint={hint.content}
                          onClose={() => {
                            setActiveHints(prev => prev.filter(h => h.id !== hint.id));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Code Editor (Fixed Height) */}
      <div className="w-1/2 border-l border-gray-200 flex flex-col h-full bg-white">
        {/* Header - Fixed at top */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">Code Editor</h3>
        </div>
        {/* Code Editor - Takes remaining space */}
        <div className="flex-1 h-full min-h-0">
          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={handleRunCode}
            onSubmit={handleSubmit}
            testCases={testCases}
            language={language}
            isLoading={isRunning || isSubmitting}
            testResults={testResults}
            testSummary={testSummary}
            error={output}
          />
        </div>
      </div>
    </div>
    {showLoadingSpinner && (
      <LoadingSpinner language={language} />
    )}
    {/* Animated Hint Card */}
    <AnimatedHintCard
      hint={currentHint}
      isVisible={showHintCard}
      onClose={() => {
        setShowHintCard(false);
        if (currentHint) {
          setActiveHints(prev => [...prev, { id: Date.now(), content: currentHint }]);
          setCurrentHint('');
        }
      }}
    />
    </>
  );
};

export default ProblemSolver; 
