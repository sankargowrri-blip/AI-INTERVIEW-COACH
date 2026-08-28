import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  InterviewConfig,
  InterviewSession,
  InterviewSetupStep,
  ExperienceLevel,
  Difficulty,
  InterviewType,
  ResumeData,
  Question,
  AnswerRecord,
  AnswerStatus,
  InterviewStatus,
} from '../types';

const DEFAULT_CONFIG: InterviewConfig = {
  experienceLevel: null,
  resume: null,
  role: '',
  difficulty: null,
  interviewType: null,
  numberOfQuestions: 10,
  duration: 15,
};

interface InterviewContextValue {
  config: InterviewConfig;
  currentStep: InterviewSetupStep;
  session: InterviewSession | null;

  // Setup actions
  setExperienceLevel: (level: ExperienceLevel) => void;
  setResume: (resume: ResumeData | null) => void;
  setRole: (role: string) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setInterviewType: (type: InterviewType) => void;
  setCompanyTarget: (company: string) => void;
  setNumberOfQuestions: (n: number) => void;
  setDuration: (minutes: number) => void;
  setCurrentStep: (step: InterviewSetupStep) => void;
  resetSetup: () => void;

  // Session actions
  startSession: (questions: Question[]) => void;
  setAnswerStatus: (status: AnswerStatus) => void;
  setInterviewStatus: (status: InterviewStatus) => void;
  nextQuestion: () => void;
  addAnswer: (answer: AnswerRecord) => void;
  endSession: () => void;
  resetSession: () => void;
}

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<InterviewSetupStep>('experience');
  const [session, setSession] = useState<InterviewSession | null>(null);

  const setExperienceLevel = useCallback((level: ExperienceLevel) => {
    setConfig(c => ({ ...c, experienceLevel: level }));
  }, []);

  const setResume = useCallback((resume: ResumeData | null) => {
    setConfig(c => ({ ...c, resume }));
  }, []);

  const setRole = useCallback((role: string) => {
    setConfig(c => ({ ...c, role }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setConfig(c => ({ ...c, difficulty }));
  }, []);

  const setInterviewType = useCallback((type: InterviewType) => {
    setConfig(c => ({ ...c, interviewType: type }));
  }, []);

  const setCompanyTarget = useCallback((company: string) => {
    setConfig(c => ({ ...c, companyTarget: company }));
  }, []);

  const setNumberOfQuestions = useCallback((n: number) => {
    setConfig(c => ({ ...c, numberOfQuestions: n }));
  }, []);

  const setDuration = useCallback((minutes: number) => {
    setConfig(c => ({ ...c, duration: minutes }));
  }, []);

  const resetSetup = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setCurrentStep('experience');
    setSession(null);
  }, []);

  const startSession = useCallback((questions: Question[]) => {
    setSession({
      id: `session-${Date.now()}`,
      config,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      status: 'active',
      answerStatus: 'ai-speaking',
      startedAt: new Date().toISOString(),
      completedAt: null,
    });
  }, [config]);

  const setAnswerStatus = useCallback((status: AnswerStatus) => {
    setSession(s => s ? { ...s, answerStatus: status } : s);
  }, []);

  const setInterviewStatus = useCallback((status: InterviewStatus) => {
    setSession(s => s ? { ...s, status } : s);
  }, []);

  const nextQuestion = useCallback(() => {
    setSession(s => {
      if (!s) return s;
      const next = s.currentQuestionIndex + 1;
      if (next >= s.questions.length) {
        return { ...s, status: 'completed', completedAt: new Date().toISOString(), answerStatus: 'ai-speaking' };
      }
      return { ...s, currentQuestionIndex: next, answerStatus: 'ai-speaking' };
    });
  }, []);

  const addAnswer = useCallback((answer: AnswerRecord) => {
    setSession(s => s ? { ...s, answers: [...s.answers, answer] } : s);
  }, []);

  const endSession = useCallback(() => {
    setSession(s => s ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s);
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  return (
    <InterviewContext.Provider value={{
      config,
      currentStep,
      session,
      setExperienceLevel,
      setResume,
      setRole,
      setDifficulty,
      setInterviewType,
      setCompanyTarget,
      setNumberOfQuestions,
      setDuration,
      setCurrentStep,
      resetSetup,
      startSession,
      setAnswerStatus,
      setInterviewStatus,
      nextQuestion,
      addAnswer,
      endSession,
      resetSession,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within InterviewProvider');
  return ctx;
}
