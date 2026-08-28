// ─── User & Auth ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  experienceLevel?: ExperienceLevel;
  preferredRole?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Experience & Difficulty ────────────────────────────────────────────────────

export type ExperienceLevel = 'fresher' | 'experienced';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type InterviewType =
  | 'general'
  | 'hr'
  | 'role-specific'
  | 'technical'
  | 'mixed'
  | 'company-specific';

// ─── Resume ────────────────────────────────────────────────────────────────────

export type ResumeStatus = 'idle' | 'selecting' | 'processing' | 'valid' | 'invalid' | 'error';

export interface ResumeData {
  fileName: string;
  fileSize: number;
  status: ResumeStatus;
  extractedInfo?: ExtractedResumeInfo;
}

export interface ExtractedResumeInfo {
  name: string;
  education: string[];
  skills: string[];
  projects: string[];
  experience: string[];
  internships: string[];
  certifications: string[];
  technologies: string[];
}

// ─── Interview Setup ───────────────────────────────────────────────────────────

export interface InterviewConfig {
  experienceLevel: ExperienceLevel | null;
  resume: ResumeData | null;
  role: string;
  customRole?: string;
  difficulty: Difficulty | null;
  interviewType: InterviewType | null;
  companyTarget?: string;
  numberOfQuestions: number;
  duration: number; // minutes
}

export type InterviewSetupStep =
  | 'experience'
  | 'resume'
  | 'role'
  | 'difficulty'
  | 'type'
  | 'settings'
  | 'ready';

// ─── Questions ────────────────────────────────────────────────────────────────

export type QuestionCategory =
  | 'introduction'
  | 'hr'
  | 'resume'
  | 'behavioral'
  | 'situational'
  | 'role-specific'
  | 'technical'
  | 'followup';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  followUps?: string[];
}

// ─── Interview Session ─────────────────────────────────────────────────────────

export type InterviewStatus =
  | 'idle'
  | 'preparing'
  | 'camera-check'
  | 'active'
  | 'completed'
  | 'error';

export type AnswerStatus =
  | 'ai-speaking'
  | 'question-displayed'
  | 'listening'
  | 'candidate-speaking'
  | 'answer-completed'
  | 'analyzing'
  | 'next-question';

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  status: InterviewStatus;
  answerStatus: AnswerStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  transcript: string;
  duration: number; // seconds
}

// ─── Results ──────────────────────────────────────────────────────────────────

export type ResultClassification =
  | 'EXCELLENT'
  | 'MARVELOUS'
  | 'GOOD'
  | 'NOT BAD'
  | 'BAD'
  | 'WORST';

export interface ScoreBreakdown {
  answerQuality: number;
  communication: number;
  performance: number;
  roleKnowledge: number;
}

export interface CommunicationAnalysis {
  clarity: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  speakingPace: number;
  fillerWords: number;
}

export interface PerformanceAnalysis {
  professionalism: number;
  answerStructure: number;
  relevance: number;
  engagement: number;
  confidence: number;
}

export interface ImprovementArea {
  topic: string;
  problem: string;
  whyItMatters: string;
  howToImprove: string;
}

export interface PracticePlanDay {
  day: number;
  title: string;
  tasks: string[];
}

export interface InterviewResult {
  id: string;
  interviewId: string;
  totalScore: number;
  classification: ResultClassification;
  scoreBreakdown: ScoreBreakdown;
  communicationAnalysis: CommunicationAnalysis;
  performanceAnalysis: PerformanceAnalysis;
  strengths: string[];
  improvements: string[];
  improvementAreas: ImprovementArea[];
  keyPoints: string[];
  practicePlan: PracticePlanDay[];
  createdAt: string;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface InterviewHistoryItem {
  id: string;
  role: string;
  experienceLevel: ExperienceLevel;
  difficulty: Difficulty;
  interviewType: InterviewType;
  date: string;
  score: number;
  classification: ResultClassification;
  duration: number;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressDataPoint {
  interview: string;
  score: number;
  answerQuality: number;
  communication: number;
  performance: number;
  roleKnowledge: number;
  date: string;
}

export interface ProgressStats {
  currentScore: number;
  previousScore: number;
  bestScore: number;
  averageScore: number;
  improvementPercentage: number;
  totalInterviews: number;
  readinessScore: number;
  readinessLabel: string;
}

// ─── Role Selection ────────────────────────────────────────────────────────────

export interface RoleCategory {
  id: string;
  name: string;
  icon: string;
  roles: string[];
}

// ─── Resume Improvement ───────────────────────────────────────────────────────

export interface ResumeImprovementData {
  atsScore: number;
  qualityScore: number;
  suggestions: ResumeSuggestion[];
}

export interface ResumeSuggestion {
  category: string;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── Company Preparation ──────────────────────────────────────────────────────

export interface CompanyData {
  id: string;
  name: string;
  logo?: string;
  description: string;
  commonRoles: string[];
  interviewStyle: string;
  tipsList: string[];
}

// ─── Practice ────────────────────────────────────────────────────────────────

export interface PracticeQuestion {
  id: string;
  category: QuestionCategory;
  text: string;
  difficulty: Difficulty;
  sampleAnswer?: string;
  tips?: string[];
  followUps?: string[];
}
