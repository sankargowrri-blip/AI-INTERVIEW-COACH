import axios from 'axios';
import type { InterviewConfig, InterviewResult, InterviewHistoryItem, Question } from '../types';
import { authService } from './authService';
import { getMockQuestions } from '../data/mockQuestions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
  const token = authService.getToken();
  return { Authorization: `Bearer ${token}` };
};

export const interviewService = {
  async createInterview(config: InterviewConfig): Promise<{ id: string }> {
    try {
      const response = await axios.post(
        `${API_URL}/interviews/`,
        {
          resume_id: config.resume?.id ? parseInt(config.resume.id) : null,
          title: `${config.role} - ${config.interviewType}`,
          job_description: config.customRole || config.role,
          role: config.role,
          experience_level: config.experienceLevel?.toUpperCase(),
          difficulty: config.difficulty?.toUpperCase(),
          interview_type: config.interviewType,
          company: config.companyTarget,
          question_count: config.numberOfQuestions,
        },
        { headers: getHeaders() }
      );
      return { id: response.data.id.toString() };
    } catch (error) {
      console.warn('Backend unavailable — using mock interview id:', error);
      // Return a mock id so the flow continues with local mock questions
      return { id: 'mock-' + Date.now() };
    }
  },

  async getHistoryItemResult(interviewId: string): Promise<InterviewResult> {
    return this.getResult(interviewId);
  },

  async getQuestions(interviewId: string, config?: InterviewConfig): Promise<Question[]> {
    // If this is a mock id (backend unavailable) skip the network call entirely
    if (interviewId.startsWith('mock-')) {
      return getMockQuestions(config);
    }
    try {
      const response = await axios.post(
        `${API_URL}/interviews/${interviewId}/start`,
        {},
        { headers: getHeaders() }
      );
      const questions: Question[] = response.data;
      // If backend returned empty or invalid, fall back to mock
      if (!Array.isArray(questions) || questions.length === 0) {
        return getMockQuestions(config);
      }
      return questions;
    } catch (error) {
      console.warn('Failed to get questions from backend — using mock questions:', error);
      return getMockQuestions(config);
    }
  },

  async submitAnswer(interviewId: string, questionId: string, transcript: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/interviews/${interviewId}/answers`,
        {
          question_id: questionId,
          text: transcript,
          duration: 0, // Should be calculated
        },
        { headers: getHeaders() }
      );
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  },

  async finishInterview(interviewId: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/interviews/${interviewId}/finish`,
        {},
        { headers: getHeaders() }
      );
    } catch (error) {
      console.error('Failed to finish interview:', error);
    }
  },

  async getResult(interviewId: string): Promise<InterviewResult> {
    try {
      const response = await axios.get(
        `${API_URL}/interviews/${interviewId}/result`,
        { headers: getHeaders() }
      );
      // Map backend schema to frontend InterviewResult
      const data = response.data;
      return {
        id: data.id.toString(),
        interviewId: data.interview_id.toString(),
        totalScore: data.overall_score,
        classification: this.classifyScore(data.overall_score) as any,
        readinessPrediction: data.overall_score >= 70 ? 'High' : data.overall_score >= 50 ? 'Medium' : 'Needs Improvement',
        scoreBreakdown: {
          answerQuality: data.overall_score,
          communication: data.overall_score,
          performance: data.overall_score,
          roleKnowledge: data.overall_score,
        },
        communicationAnalysis: {
          clarity: 80, fluency: 80, grammar: 80, vocabulary: 80, speakingPace: 80, fillerWords: 5
        },
        performanceAnalysis: {
          professionalism: 80, answerStructure: 80, relevance: 80, engagement: 80, confidence: 80
        },
        strengths: data.strengths || [],
        improvements: data.weaknesses || [],
        improvementAreas: [],
        keyPoints: [],
        practicePlan: [],
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get result:', error);
      throw error;
    }
  },

  async getHistory(): Promise<InterviewHistoryItem[]> {
    try {
      const response = await axios.get(`${API_URL}/interviews/history`, {
        headers: getHeaders(),
      });
      return response.data.map((item: any) => ({
        id: item.id.toString(),
        role: item.title,
        experienceLevel: 'experienced',
        difficulty: 'medium',
        interviewType: 'general',
        date: item.created_at,
        score: 0,
        classification: 'GOOD',
        duration: 0,
      }));
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  },

  getClassificationColor(classification: string): string {
    switch (classification) {
      case 'EXCELLENT': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'MARVELOUS': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'GOOD': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'NOT BAD': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'BAD': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'WORST': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-surface-600 bg-surface-50 border-surface-200';
    }
  },

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-teal-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  },

  classifyScore(score: number): string {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'MARVELOUS';
    if (score >= 70) return 'GOOD';
    if (score >= 60) return 'NOT BAD';
    if (score >= 40) return 'BAD';
    return 'WORST';
  },

  formatInterviewType(type: string): string {
    const map: Record<string, string> = {
      general: 'General Interview',
      hr: 'HR Interview',
      'role-specific': 'Role-Specific',
      technical: 'Technical',
      mixed: 'Mixed Interview',
      'company-specific': 'Company Practice',
    };
    return map[type] || type;
  },

  formatDifficulty(difficulty: string): string {
    if (!difficulty) return 'Not set';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  },

  formatExperienceLevel(level: string): string {
    if (!level) return 'Not set';
    const lowLevel = level.toLowerCase();
    return lowLevel === 'fresher' ? 'Fresher' : 'Experienced';
  },
};
