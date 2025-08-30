import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import TopicSelector from './TopicSelector';
import InterviewSession from './InterviewSession';
import InterviewResults from './InterviewResults';
import { startInterview, submitInterviewAnswers } from '../../services/api';

const InterviewInterface = ({ onBackToDashboard }) => {
  const [currentStep, setCurrentStep] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [interviewResults, setInterviewResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setCurrentStep('topic');
  };

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setCurrentStep('interview');
    await startRealInterviewSession(topic);
  };

  const startRealInterviewSession = async (topic) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found. The backend may reject unauthenticated requests.');
      }
      const topicsArray = Array.isArray(topic) ? topic : [topic];
      const data = await startInterview(selectedLanguage, topicsArray);
      // Normalize expected structure
      const questions = (data?.questions || data)?.map((q, idx) => ({
        id: q.id ?? idx + 1,
        question: q.question ?? q.text ?? q.prompt ?? `Question ${idx + 1}`,
        type: q.type ?? 'text',
        topic: q.topic ?? topicsArray[0],
        difficulty: q.difficulty ?? 'Intermediate'
      }));
      setInterviewData({ id: data?.interview_id || data?.id || `interview_${Date.now()}`, language: selectedLanguage, topic: topicsArray, questions });
    } catch (error) {
      console.error('Failed to start interview:', error);
      // Fallback: minimal mock to keep UX flowing
      const fallbackQuestions = Array.from({ length: 5 }).map((_, i) => ({
        id: i + 1,
        question: `Q${i + 1}: Explain ${topic} concept ${i + 1} in ${selectedLanguage}`,
        type: 'text',
        topic,
        difficulty: i < 2 ? 'Basic' : i < 4 ? 'Intermediate' : 'Advanced'
      }));
      setInterviewData({ id: `interview_${Date.now()}`, language: selectedLanguage, topic, questions: fallbackQuestions });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewComplete = async (answers) => {
    try {
      setIsLoading(true);
      const resp = await submitInterviewAnswers(
        interviewData?.id,
        answers.map((a) => ({
          question_id: a.questionId ?? a.id,
          question: a.question,
          answer: a.answer,
          topic: a.topic,
          difficulty: a.difficulty,
          time_spent: a.timeSpent
        }))
      );
      // Normalize backend response into the shape InterviewResults expects
      const normalized = {
        overallScore: resp?.overall_score ?? resp?.score ?? 0,
        totalQuestions: resp?.total_questions ?? answers.length,
        correctAnswers: resp?.correct_answers ?? resp?.correct ?? 0,
        timeSpent: resp?.time_spent ?? answers.reduce((s, a) => s + (a.timeSpent || 0), 0),
        feedback: {
          strengths: resp?.feedback?.strengths ?? resp?.strengths ?? [],
          weaknesses: resp?.feedback?.weaknesses ?? resp?.weaknesses ?? [],
          recommendations: resp?.feedback?.recommendations ?? resp?.recommendations ?? []
        },
        questionAnalysis: (resp?.question_analysis ?? resp?.detailedAnalysis ?? resp?.questions ?? []).map((q, idx) => ({
          question: q.question ?? interviewData?.questions?.[idx]?.question ?? `Question ${idx + 1}`,
          score: q.score ?? q.rating ?? 0,
          feedback: q.feedback ?? q.comment ?? '—',
          topic: q.topic ?? (Array.isArray(selectedTopic) ? selectedTopic[0] : selectedTopic),
          difficulty: q.difficulty ?? 'Intermediate'
        }))
      };
      setInterviewResults(normalized);
      setCurrentStep('results');
    } catch (error) {
      console.error('Failed to submit interview answers:', error);
      // Do not fabricate results; keep user on session screen and let them retry
      alert('Submission failed. Please try again. If this persists, confirm the backend endpoint for submitting interview answers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartInterview = () => {
    setCurrentStep('language');
    setSelectedLanguage(null);
    setSelectedTopic(null);
    setInterviewData(null);
    setInterviewResults(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'language':
        return (
          <LanguageSelector
            onSelect={handleLanguageSelect}
            onBackToDashboard={onBackToDashboard}
          />
        );
      case 'topic':
        return (
          <TopicSelector
            language={selectedLanguage}
            onSelect={handleTopicSelect}
            onBack={() => setCurrentStep('language')}
          />
        );
      case 'interview':
        return (
          <InterviewSession
            interviewData={interviewData}
            onComplete={handleInterviewComplete}
            onBack={() => setCurrentStep('topic')}
            isLoading={isLoading}
          />
        );
      case 'results':
        return (
          <InterviewResults
            results={interviewResults}
            onRestart={handleRestartInterview}
            onBackToDashboard={onBackToDashboard}
          />
        );
      default:
        return null;
    }
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

      <div className="relative z-10 min-h-screen">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default InterviewInterface;
