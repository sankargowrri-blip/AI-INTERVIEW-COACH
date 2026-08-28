import type { Question, Difficulty, ExperienceLevel, InterviewType } from '../types';

// ─── Introduction Questions ───────────────────────────────────────────────────
const introQuestions: Question[] = [
  {
    id: 'intro-1',
    text: 'Tell me about yourself.',
    category: 'introduction',
    difficulty: 'easy',
    followUps: [
      'What are your key strengths?',
      'What makes you stand out from other candidates?',
    ],
  },
  {
    id: 'intro-2',
    text: 'Can you briefly introduce yourself and walk me through your background?',
    category: 'introduction',
    difficulty: 'easy',
    followUps: ['What experiences have shaped you the most?'],
  },
  {
    id: 'intro-3',
    text: 'Give me a short professional summary of who you are and what you bring to this role.',
    category: 'introduction',
    difficulty: 'medium',
    followUps: ['How does your background align with this position?'],
  },
];

// ─── HR Questions ─────────────────────────────────────────────────────────────
const hrQuestions: Question[] = [
  {
    id: 'hr-1',
    text: 'Why should we hire you?',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['What specific value will you add in the first 90 days?'],
  },
  {
    id: 'hr-2',
    text: 'What are your greatest strengths?',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['Can you give me a specific example of that strength in action?'],
  },
  {
    id: 'hr-3',
    text: 'What are your weaknesses?',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['What are you actively doing to improve in that area?'],
  },
  {
    id: 'hr-4',
    text: 'What are your salary expectations?',
    category: 'hr',
    difficulty: 'medium',
    followUps: ['Are you open to negotiation based on the total compensation package?'],
  },
  {
    id: 'hr-5',
    text: 'Why do you want this role?',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['What specifically excites you about this position?'],
  },
  {
    id: 'hr-6',
    text: 'Where do you see yourself in five years?',
    category: 'hr',
    difficulty: 'medium',
    followUps: ['How does this role help you reach those goals?'],
  },
  {
    id: 'hr-7',
    text: 'Why are you looking to leave your current company?',
    category: 'hr',
    difficulty: 'medium',
    followUps: ['What kind of environment are you hoping to move into?'],
  },
  {
    id: 'hr-8',
    text: 'What motivates you professionally?',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['How do you maintain motivation when work gets challenging?'],
  },
  {
    id: 'hr-9',
    text: 'How do you handle stress and pressure at work?',
    category: 'hr',
    difficulty: 'medium',
    followUps: ['Can you give an example of a high-pressure situation you navigated successfully?'],
  },
  {
    id: 'hr-10',
    text: 'Describe your ideal work environment.',
    category: 'hr',
    difficulty: 'easy',
    followUps: ['How do you adapt when the environment differs from your ideal?'],
  },
];

// ─── Resume / Project Questions ───────────────────────────────────────────────
const resumeQuestions: Question[] = [
  {
    id: 'res-1',
    text: 'Tell me about one of your key projects.',
    category: 'resume',
    difficulty: 'easy',
    followUps: [
      'What technologies did you use?',
      'What was your personal contribution?',
      'What was the biggest challenge you faced?',
      'What would you do differently if you rebuilt it today?',
    ],
  },
  {
    id: 'res-2',
    text: 'Walk me through your most significant professional experience.',
    category: 'resume',
    difficulty: 'medium',
    followUps: [
      'What were your key responsibilities?',
      'What achievements are you most proud of from that role?',
    ],
  },
  {
    id: 'res-3',
    text: 'Tell me about your internship experience.',
    category: 'resume',
    difficulty: 'easy',
    followUps: [
      'What tasks were you responsible for?',
      'What did you learn from that experience?',
    ],
  },
  {
    id: 'res-4',
    text: 'You listed Python and Machine Learning as skills. How have you applied those in practice?',
    category: 'resume',
    difficulty: 'medium',
    followUps: ['What projects best demonstrate those skills?'],
  },
  {
    id: 'res-5',
    text: 'What certifications have you completed, and how have they helped you?',
    category: 'resume',
    difficulty: 'easy',
    followUps: ['Are you planning to pursue any further certifications?'],
  },
];

// ─── Behavioral Questions ─────────────────────────────────────────────────────
const behavioralQuestions: Question[] = [
  {
    id: 'beh-1',
    text: 'Tell me about a time when you solved a difficult problem.',
    category: 'behavioral',
    difficulty: 'medium',
    followUps: [
      'What made that problem particularly challenging?',
      'How did you arrive at your solution?',
    ],
  },
  {
    id: 'beh-2',
    text: 'Describe a time when you had to meet a tight deadline. How did you handle it?',
    category: 'behavioral',
    difficulty: 'medium',
    followUps: ['What would you do differently with more time?'],
  },
  {
    id: 'beh-3',
    text: 'Tell me about a time you failed. What did you learn from it?',
    category: 'behavioral',
    difficulty: 'hard',
    followUps: ['How did you apply that learning going forward?'],
  },
  {
    id: 'beh-4',
    text: 'Give me an example of when you demonstrated leadership.',
    category: 'behavioral',
    difficulty: 'medium',
    followUps: ['How did the team respond to your leadership?'],
  },
  {
    id: 'beh-5',
    text: 'Describe a time when you had to learn something quickly.',
    category: 'behavioral',
    difficulty: 'easy',
    followUps: ['What learning strategies do you rely on?'],
  },
  {
    id: 'beh-6',
    text: 'Tell me about a time you worked successfully in a team.',
    category: 'behavioral',
    difficulty: 'easy',
    followUps: ['What role do you typically take in team settings?'],
  },
];

// ─── Situational Questions ────────────────────────────────────────────────────
const situationalQuestions: Question[] = [
  {
    id: 'sit-1',
    text: 'What would you do if you disagreed with a team member on an important decision?',
    category: 'situational',
    difficulty: 'medium',
    followUps: ['How would you handle it if the disagreement escalated?'],
  },
  {
    id: 'sit-2',
    text: 'How would you handle a situation where your manager gave you unclear instructions?',
    category: 'situational',
    difficulty: 'easy',
    followUps: ['What steps would you take to clarify expectations?'],
  },
  {
    id: 'sit-3',
    text: 'If you were assigned multiple urgent tasks simultaneously, how would you prioritize them?',
    category: 'situational',
    difficulty: 'medium',
    followUps: ['How would you communicate your priorities to stakeholders?'],
  },
  {
    id: 'sit-4',
    text: 'What would you do if you discovered an error in your work after submitting it?',
    category: 'situational',
    difficulty: 'easy',
    followUps: ['How would you prevent similar errors in the future?'],
  },
  {
    id: 'sit-5',
    text: 'If a client or stakeholder was unhappy with your output, how would you respond?',
    category: 'situational',
    difficulty: 'hard',
    followUps: ['How would you rebuild trust after such a situation?'],
  },
];

// ─── Role-Specific Questions by Category ─────────────────────────────────────
const roleSpecificQuestions: Record<string, Question[]> = {
  technology: [
    {
      id: 'tech-1',
      text: 'Explain the difference between REST and GraphQL APIs.',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['When would you choose one over the other?'],
    },
    {
      id: 'tech-2',
      text: 'How do you approach debugging a complex software issue?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What debugging tools do you prefer?'],
    },
    {
      id: 'tech-3',
      text: 'Explain the concept of object-oriented programming and its core principles.',
      category: 'role-specific',
      difficulty: 'easy',
      followUps: ['Can you give a real-world example of polymorphism?'],
    },
    {
      id: 'tech-4',
      text: 'What is the time complexity of a binary search, and how does it work?',
      category: 'role-specific',
      difficulty: 'hard',
      followUps: ['When would a binary search not be appropriate?'],
    },
    {
      id: 'tech-5',
      text: 'What is CI/CD and why is it important in modern software development?',
      category: 'role-specific',
      difficulty: 'medium',
    },
  ],
  data: [
    {
      id: 'data-1',
      text: 'How do you handle missing values in a dataset?',
      category: 'role-specific',
      difficulty: 'easy',
      followUps: ['Which strategy do you prefer and why?'],
    },
    {
      id: 'data-2',
      text: 'Explain the difference between supervised and unsupervised learning.',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['Can you give an example use case for each?'],
    },
    {
      id: 'data-3',
      text: 'How would you explain a complex data insight to a non-technical stakeholder?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What visualization tools do you prefer for communication?'],
    },
  ],
  business: [
    {
      id: 'biz-1',
      text: 'How would you analyze a new market opportunity for a company?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What frameworks would you use?'],
    },
    {
      id: 'biz-2',
      text: 'Explain the concept of NPV and when it is used.',
      category: 'role-specific',
      difficulty: 'hard',
      followUps: ['How does it compare to IRR as a decision metric?'],
    },
  ],
  finance: [
    {
      id: 'fin-1',
      text: 'What is the difference between fundamental and technical analysis?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['Which do you personally find more useful and why?'],
    },
    {
      id: 'fin-2',
      text: 'How do interest rate changes impact bond prices?',
      category: 'role-specific',
      difficulty: 'hard',
      followUps: ['How does this affect portfolio allocation decisions?'],
    },
  ],
  hr: [
    {
      id: 'hr-r1',
      text: 'How do you measure the success of a recruitment campaign?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What metrics matter most to you?'],
    },
    {
      id: 'hr-r2',
      text: 'How do you approach conflict resolution between two employees?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What if the conflict involves a manager and a subordinate?'],
    },
  ],
  marketing: [
    {
      id: 'mkt-1',
      text: 'How would you design a digital marketing campaign for a product launch?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['How would you allocate budget across channels?'],
    },
    {
      id: 'mkt-2',
      text: 'What metrics would you track to evaluate a content marketing strategy?',
      category: 'role-specific',
      difficulty: 'easy',
      followUps: ['How do you differentiate between vanity metrics and actionable metrics?'],
    },
  ],
  sales: [
    {
      id: 'sales-1',
      text: 'How do you handle a prospect who says "I need to think about it"?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['What is your follow-up strategy?'],
    },
    {
      id: 'sales-2',
      text: 'Walk me through your sales process from first contact to close.',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['Which stage do you find most challenging?'],
    },
  ],
  default: [
    {
      id: 'def-1',
      text: 'What do you consider the most important skill for success in this role?',
      category: 'role-specific',
      difficulty: 'easy',
      followUps: ['How have you developed that skill?'],
    },
    {
      id: 'def-2',
      text: 'What recent trends in your field are you most excited about?',
      category: 'role-specific',
      difficulty: 'medium',
      followUps: ['How are you preparing yourself for those changes?'],
    },
    {
      id: 'def-3',
      text: 'How do you stay current with developments in your industry?',
      category: 'role-specific',
      difficulty: 'easy',
    },
  ],
};

// ─── Question Builder ─────────────────────────────────────────────────────────

function getRoleSpecificQuestions(role: string): Question[] {
  const roleLower = role.toLowerCase();
  if (
    roleLower.includes('software') ||
    roleLower.includes('developer') ||
    roleLower.includes('engineer') ||
    roleLower.includes('ai') ||
    roleLower.includes('frontend') ||
    roleLower.includes('backend')
  ) {
    return roleSpecificQuestions.technology;
  }
  if (roleLower.includes('data')) return roleSpecificQuestions.data;
  if (roleLower.includes('finance') || roleLower.includes('financial') || roleLower.includes('investment') || roleLower.includes('stock')) {
    return roleSpecificQuestions.finance;
  }
  if (roleLower.includes('hr') || roleLower.includes('human resource') || roleLower.includes('recruiter')) {
    return roleSpecificQuestions.hr;
  }
  if (roleLower.includes('marketing')) return roleSpecificQuestions.marketing;
  if (roleLower.includes('sales')) return roleSpecificQuestions.sales;
  if (roleLower.includes('business') || roleLower.includes('mba') || roleLower.includes('bba')) {
    return roleSpecificQuestions.business;
  }
  return roleSpecificQuestions.default;
}

export function buildQuestionSet(
  experienceLevel: ExperienceLevel,
  role: string,
  difficulty: Difficulty,
  interviewType: InterviewType,
  count: number
): Question[] {
  const pool: Question[] = [];

  const difficultyFilter = (q: Question) => {
    if (difficulty === 'easy') return q.difficulty === 'easy';
    if (difficulty === 'medium') return q.difficulty !== 'hard';
    return true; // hard includes all
  };

  // Always include intro
  pool.push(...introQuestions.filter(difficultyFilter));

  if (interviewType === 'hr' || interviewType === 'general' || interviewType === 'mixed') {
    pool.push(...hrQuestions.filter(difficultyFilter));
  }

  if (interviewType === 'role-specific' || interviewType === 'technical' || interviewType === 'mixed' || interviewType === 'general') {
    pool.push(...getRoleSpecificQuestions(role).filter(difficultyFilter));
  }

  if (interviewType === 'general' || interviewType === 'mixed' || interviewType === 'hr') {
    pool.push(...behavioralQuestions.filter(difficultyFilter));
    pool.push(...situationalQuestions.filter(difficultyFilter));
  }

  // For fresher: include resume questions (projects, internships, education)
  if (experienceLevel === 'fresher' || interviewType !== 'technical') {
    pool.push(...resumeQuestions.filter(difficultyFilter));
  }

  // Remove experienced-only advanced technical for freshers
  const finalPool = experienceLevel === 'fresher'
    ? pool.filter(q => q.difficulty !== 'hard' || difficulty === 'hard')
    : pool;

  // Shuffle and limit
  const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export {
  introQuestions,
  hrQuestions,
  resumeQuestions,
  behavioralQuestions,
  situationalQuestions,
  roleSpecificQuestions,
};
