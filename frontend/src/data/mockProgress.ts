import type { ProgressDataPoint, ProgressStats } from '../types';

export const mockProgressData: ProgressDataPoint[] = [
  {
    interview: 'Interview 1',
    score: 62,
    answerQuality: 60,
    communication: 58,
    performance: 65,
    roleKnowledge: 62,
    date: '2026-08-10',
  },
  {
    interview: 'Interview 2',
    score: 68,
    answerQuality: 70,
    communication: 65,
    performance: 68,
    roleKnowledge: 70,
    date: '2026-08-12',
  },
  {
    interview: 'Interview 3',
    score: 74,
    answerQuality: 76,
    communication: 72,
    performance: 74,
    roleKnowledge: 78,
    date: '2026-08-14',
  },
  {
    interview: 'Interview 4',
    score: 79,
    answerQuality: 82,
    communication: 78,
    performance: 80,
    roleKnowledge: 84,
    date: '2026-08-17',
  },
  {
    interview: 'Interview 5',
    score: 84,
    answerQuality: 88,
    communication: 82,
    performance: 85,
    roleKnowledge: 90,
    date: '2026-08-20',
  },
];

export const mockProgressStats: ProgressStats = {
  currentScore: 84,
  previousScore: 79,
  bestScore: 91,
  averageScore: 78,
  improvementPercentage: 22,
  totalInterviews: 12,
  readinessScore: 84,
  readinessLabel: 'Strong Preparation',
};

export const mockStrongAreas = [
  { label: 'Role Knowledge', score: 90 },
  { label: 'Project Explanation', score: 88 },
  { label: 'Answer Relevance', score: 87 },
];

export const mockWeakAreas = [
  { label: 'Speaking Pace', score: 74 },
  { label: 'Filler Words', score: 72 },
  { label: 'Answer Structure', score: 75 },
];
