/**
 * buildResult.ts
 *
 * Computes an InterviewResult from completed session data (questions + answers).
 * Used when the backend is offline. Once the FastAPI backend is live, it replaces
 * this with real AI evaluation from /api/interviews/{id}/finish.
 *
 * CRITICAL RULE: Empty / unanswered interviews MUST score 0, not a fake average.
 */

import type {
  InterviewSession,
  InterviewResult,
  ResultClassification,
  ImprovementArea,
  PracticePlanDay,
} from '../types';

// ── constants ─────────────────────────────────────────────────────────────────

/** Transcripts matching any of these patterns are considered "no answer". */
const EMPTY_PATTERNS: RegExp[] = [
  /^\s*$/,                          // blank / whitespace only
  /^\(no answer recorded\)$/i,
  /^\[silence\]$/i,
  /^\[no speech detected\]$/i,
  /^no answer$/i,
  /^null$/i,
  /^undefined$/i,
  /^n\/a$/i,
];

/** Minimum real word count to consider a transcript a meaningful answer. */
const MIN_WORD_COUNT = 3;

// ── helpers ───────────────────────────────────────────────────────────────────

export function isMeaningfulAnswer(transcript: unknown): boolean {
  if (!transcript || typeof transcript !== 'string') return false;
  const t = transcript.trim();
  if (EMPTY_PATTERNS.some(p => p.test(t))) return false;
  const words = t.split(/\s+/).filter(w => w.length > 0);
  return words.length >= MIN_WORD_COUNT;
}

function classify(score: number): ResultClassification {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'MARVELOUS';
  if (score >= 70) return 'GOOD';
  if (score >= 60) return 'NOT BAD';
  if (score >= 40) return 'BAD';
  return 'WORST';
}

function readiness(score: number): 'High' | 'Medium' | 'Needs Improvement' {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Needs Improvement';
}

/**
 * Score a single transcript.
 * Returns 0 for any empty/meaningless answer — NOT a default 30 or 50.
 */
function scoreAnswer(transcript: string): number {
  if (!isMeaningfulAnswer(transcript)) return 0;

  const t     = transcript.trim();
  const words = t.split(/\s+/).length;
  const lower = t.toLowerCase();

  let score = 40; // base for a real answer

  // Word count rewards
  if (words >= 10)  score += 10;
  if (words >= 30)  score += 10;
  if (words >= 60)  score += 8;
  if (words >= 100) score += 5;

  // Structure rewards (STAR method signals)
  if (/situation|task|action|result/i.test(lower))     score += 6;
  if (/because|therefore|so that|in order to/i.test(lower)) score += 4;
  if (/example|instance|specifically|for instance/i.test(lower)) score += 4;

  // Penalise very short but present answers
  if (words < 6) score -= 15;

  return Math.min(100, Math.max(5, score));
}

/**
 * Deterministic spread around a base — NO Math.random().
 * Uses the label string as a stable seed so scores are consistent on re-render.
 */
function spread(base: number, label: string, offset: number): number {
  // stable hash from label chars
  const hash = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const delta = ((hash % 9) - 4) + offset; // range roughly -4..+8+offset
  return Math.min(100, Math.max(0, base + delta));
}

// ── NOT ATTEMPTED result ──────────────────────────────────────────────────────

function buildNotAttemptedResult(
  sessionId: string,
  totalQuestions: number,
): InterviewResult {
  const practicePlan: PracticePlanDay[] = [
    {
      day: 1,
      title: 'Attempt Every Question',
      tasks: [
        'Start the interview and attempt to answer every question.',
        'Even short answers are better than silence.',
        'Use your resume experience as the basis for every answer.',
      ],
    },
    {
      day: 2,
      title: 'Self Introduction',
      tasks: [
        'Practise a 60-second introduction about yourself.',
        'Cover: name, education, skills, projects, and goals.',
      ],
    },
    {
      day: 3,
      title: 'Speak Clearly',
      tasks: [
        'Record yourself answering 3 common HR questions.',
        'Play back and assess clarity and confidence.',
      ],
    },
  ];

  return {
    id:                  `result-${sessionId}`,
    interviewId:         sessionId,
    totalScore:          0,
    classification:      'WORST',
    readinessPrediction: 'Needs Improvement',
    scoreBreakdown: {
      answerQuality: 0,
      communication: 0,
      performance:   0,
      roleKnowledge: 0,
    },
    communicationAnalysis: {
      clarity:      0,
      fluency:      0,
      grammar:      0,
      vocabulary:   0,
      speakingPace: 0,
      fillerWords:  0,
    },
    performanceAnalysis: {
      professionalism: 0,
      answerStructure: 0,
      relevance:       0,
      engagement:      0,
      confidence:      0,
    },
    strengths:    [],
    improvements: [
      'Attempt each interview question — even a short answer is better than silence.',
      'Speak clearly into your microphone and check that it is enabled.',
      'Use examples from your education, projects, skills, or work experience.',
    ],
    improvementAreas: [
      {
        topic: 'Interview Participation',
        problem: 'No meaningful answers were provided during this session.',
        whyItMatters: 'Interview scores can only be generated from actual responses.',
        howToImprove: 'Start a new interview and attempt every question. Speak naturally — you do not need a perfect answer.',
      },
    ],
    keyPoints: [
      'Always attempt every question, even if you are unsure.',
      'A short, honest answer scores higher than silence.',
      'Check your microphone is working before starting the interview.',
    ],
    practicePlan,
    // Extended fields
    // @ts-ignore
    interviewStatus:  'NOT_ATTEMPTED',
    // @ts-ignore
    answeredQuestions: 0,
    // @ts-ignore
    unansweredQuestions: totalQuestions,
    // @ts-ignore
    questionAnalysis: [],
    createdAt: new Date().toISOString(),
  };
}

// ── main builder ──────────────────────────────────────────────────────────────

export function buildResultFromSession(
  session: InterviewSession,
  sessionId: string,
): InterviewResult {
  const answers   = session.answers   ?? [];
  const questions = session.questions ?? [];
  const totalQ    = questions.length;

  // ── Step 1: identify meaningful answers ──────────────────────────────────
  const meaningfulAnswers = answers.filter(a => isMeaningfulAnswer(a.transcript));

  // ── Step 2: NOT_ATTEMPTED — zero meaningful answers ───────────────────────
  if (meaningfulAnswers.length === 0) {
    console.log('[buildResult] No meaningful answers — returning NOT_ATTEMPTED result (0/100)');
    return buildNotAttemptedResult(sessionId, totalQ);
  }

  // ── Step 3: score only the meaningful answers ─────────────────────────────
  const meaningfulScores = meaningfulAnswers.map(a => scoreAnswer(a.transcript));
  const meaningfulAvg    = Math.round(
    meaningfulScores.reduce((s, n) => s + n, 0) / meaningfulScores.length,
  );

  // Weight by participation: if only 3/10 answered, cap the score proportionally
  const participationRatio  = meaningfulAnswers.length / Math.max(totalQ, 1);
  // Answered questions score is reduced by unanswered questions
  // e.g. 3/10 answered with avg 80 → total = 80 * 0.3 = 24
  const weightedTotal = Math.round(meaningfulAvg * participationRatio);
  const total         = Math.min(100, Math.max(0, weightedTotal));

  console.log(`[buildResult] ${meaningfulAnswers.length}/${totalQ} answered, avg=${meaningfulAvg}, weighted=${total}`);

  // ── Step 4: score breakdown (stable, no random) ───────────────────────────
  const answerQuality = spread(total, 'answerQuality', 2);
  const communication = spread(total, 'communication', -2);
  const performance   = spread(total, 'performance',   3);
  const roleKnowledge = spread(total, 'roleKnowledge', 5);

  // Communication analysis
  const clarity      = spread(total, 'clarity',      1);
  const fluency      = spread(total, 'fluency',      -4);
  const grammar      = spread(total, 'grammar',       5);
  const vocabulary   = spread(total, 'vocabulary',   -2);
  const speakingPace = spread(total, 'speakingPace', -6);
  const fillerWords  = spread(total, 'fillerWords',  -8);

  // Performance analysis
  const professionalism = spread(total, 'professionalism', 2);
  const answerStructure = spread(total, 'answerStructure', -4);
  const relevance       = spread(total, 'relevance',        4);
  const engagement      = spread(total, 'engagement',      -2);
  const confidence      = spread(total, 'confidence',       0);

  // ── Step 5: dynamic feedback based on actual scores ───────────────────────
  const strengths:    string[] = [];
  const improvements: string[] = [];

  if (meaningfulAnswers.length < totalQ) {
    improvements.push(`Only ${meaningfulAnswers.length} of ${totalQ} questions were answered. Attempt every question next time.`);
  }
  if (grammar      >= 65) strengths.push('Responses were grammatically clear.');
  if (answerQuality >= 60) strengths.push('Answers demonstrated understanding of the topics.');
  if (roleKnowledge >= 60) strengths.push('Role-specific knowledge came through in responses.');
  if (communication >= 60) strengths.push('Communication was easy to follow.');
  if (strengths.length === 0 && meaningfulAnswers.length > 0) {
    strengths.push('Made an effort to participate in the interview.');
  }

  if (speakingPace  < 65) improvements.push('Work on maintaining a steady speaking pace.');
  if (fillerWords   < 60) improvements.push('Reduce filler words such as "um" and "like".');
  if (answerStructure < 60) improvements.push('Structure answers using the STAR method (Situation, Task, Action, Result).');
  if (vocabulary    < 60) improvements.push('Incorporate more domain-specific vocabulary.');
  if (fluency       < 60) improvements.push('Practise speaking fluently without long pauses.');
  if (improvements.length === 0) improvements.push('Continue practising to improve answer depth and specificity.');

  const improvementAreas: ImprovementArea[] = [
    {
      topic: 'Answer Structure',
      problem: 'Answers could be better organised with a clear structure.',
      whyItMatters: 'Structured answers are easier for interviewers to follow.',
      howToImprove: 'Use STAR: Situation → Task → Action → Result for every behavioural question.',
    },
    {
      topic: 'Specificity',
      problem: 'Answers could include more concrete, quantified examples.',
      whyItMatters: 'Specific examples with outcomes are far more persuasive.',
      howToImprove: 'Identify at least one measurable result for each project or experience.',
    },
    {
      topic: 'Speaking Fluency',
      problem: 'Some responses contained pauses or filler words.',
      whyItMatters: 'Fluent delivery signals confidence and preparation.',
      howToImprove: 'Pause silently instead of saying "um". Record yourself and review.',
    },
  ];

  const keyPoints: string[] = [
    'Use STAR format (Situation → Task → Action → Result) for behavioural questions.',
    'Reduce filler words by pausing silently.',
    'Add quantified outcomes to project descriptions.',
    'Aim for answers between 60–120 seconds.',
    'Attempt every question — partial answers still score.',
  ];

  // ── Step 6: per-question analysis ─────────────────────────────────────────
  const questionAnalysis = questions.map((q, i) => {
    const answer     = answers.find(a => a.questionId === q.id) ?? answers[i];
    const transcript = answer?.transcript ?? '';
    const meaningful = isMeaningfulAnswer(transcript);
    const score      = meaningful ? scoreAnswer(transcript) : 0;
    return {
      question:  q.text       ?? `Question ${i + 1}`,
      answer:    meaningful   ? transcript : 'No answer provided.',
      score,
      category:  q.category   ?? 'general',
      status:    meaningful   ? 'answered' : 'not_answered',
    };
  });

  const practicePlan: PracticePlanDay[] = [
    {
      day: 1, title: 'Self Introduction',
      tasks: ['Record a 90-second introduction.', 'Review and remove filler words.', 'Practice three versions.'],
    },
    {
      day: 2, title: 'Project & Experience',
      tasks: ['Prepare a 2-minute explanation for each project.', 'Add one measurable result per project.'],
    },
    {
      day: 3, title: 'Behavioural Questions',
      tasks: ['Practice: "Tell me about a challenge you faced."', 'Use the STAR format for every answer.'],
    },
    {
      day: 4, title: 'Role-Specific Questions',
      tasks: ['Review 10 common questions for your target role.', 'Answer 5 using the STAR format.'],
    },
    {
      day: 5, title: 'Full Mock Interview',
      tasks: ['Complete a full AI mock interview.', 'Self-review for filler words and structure.'],
    },
  ];

  return {
    id:                  `result-${sessionId}`,
    interviewId:         sessionId,
    totalScore:          total,
    classification:      classify(total),
    readinessPrediction: readiness(total),
    scoreBreakdown:      { answerQuality, communication, performance, roleKnowledge },
    communicationAnalysis: { clarity, fluency, grammar, vocabulary, speakingPace, fillerWords },
    performanceAnalysis: { professionalism, answerStructure, relevance, engagement, confidence },
    strengths,
    improvements,
    improvementAreas,
    keyPoints,
    practicePlan,
    // @ts-ignore — extended fields read by ResultPage
    interviewStatus:      'COMPLETED',
    // @ts-ignore
    answeredQuestions:    meaningfulAnswers.length,
    // @ts-ignore
    unansweredQuestions:  totalQ - meaningfulAnswers.length,
    // @ts-ignore
    questionAnalysis,
    createdAt: new Date().toISOString(),
  };
}
