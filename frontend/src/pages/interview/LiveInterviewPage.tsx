import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, Camera, Clock, ChevronRight } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { interviewService } from '../../services/interviewService';
import type { Question, AnswerStatus } from '../../types';
import { clsx } from 'clsx';
import LoadingState from '../../components/common/LoadingState';
import Button from '../../components/common/Button';

// ── Voice Waveform ─────────────────────────────────────────────────────────────
function VoiceWave({ active, color = 'text-primary-500' }: { active: boolean; color?: string }) {
  return (
    <div className={clsx('flex items-end gap-0.5 h-6', active ? color : 'text-surface-200')} aria-hidden="true">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={clsx(
            'wave-bar',
            active ? 'animate-[wave_1.2s_ease-in-out_infinite]' : ''
          )}
          style={{
            height: `${[6, 10, 14, 18, 22, 18, 14, 10, 6][i]}px`,
            animationDelay: `${[0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1, 0][i]}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Timer ──────────────────────────────────────────────────────────────────────
function InterviewTimer({ startTime, duration }: { startTime: number; duration: number }) {
  const [elapsed, setElapsed] = useState(0);
  const limit = duration * 60;

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const remaining = Math.max(0, limit - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isWarning = remaining < 120;

  return (
    <div className={clsx(
      'flex items-center gap-1.5 text-sm font-mono font-semibold',
      isWarning ? 'text-amber-600' : 'text-surface-700'
    )} aria-live="off" aria-label={`Time remaining: ${mins} minutes ${secs} seconds`}>
      <Clock className="w-4 h-4" aria-hidden="true" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}

// ── Status Label ───────────────────────────────────────────────────────────────
function AnswerStatusBadge({ status }: { status: AnswerStatus }) {
  const map: Record<AnswerStatus, { text: string; color: string }> = {
    'ai-speaking': { text: 'AI Speaking...', color: 'text-primary-600 bg-primary-50 border-primary-200' },
    'question-displayed': { text: 'Question Ready', color: 'text-surface-600 bg-surface-50 border-surface-200' },
    'listening': { text: '🎙 Listening...', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    'candidate-speaking': { text: '🔴 You are speaking...', color: 'text-red-700 bg-red-50 border-red-200' },
    'answer-completed': { text: '✓ Answer Recorded', color: 'text-teal-700 bg-teal-50 border-teal-200' },
    'analyzing': { text: 'Analysing response...', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    'next-question': { text: 'Preparing next question...', color: 'text-surface-600 bg-surface-50 border-surface-200' },
  };
  const { text, color } = map[status];
  return (
    <span className={clsx('px-3 py-1 rounded-full text-xs font-medium border', color)} role="status" aria-live="polite">
      {text}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LiveInterviewPage() {
  const { config, session, startSession, setAnswerStatus, setInterviewStatus, nextQuestion, addAnswer } = useInterview();
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('Preparing your interview...');
  const [startTime] = useState(Date.now());
  const [mockTranscript, setMockTranscript] = useState('');

  // ── Camera Setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => { /* camera optional */ });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Load Questions ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadingMsg('Preparing your interview...');
      await new Promise(r => setTimeout(r, 800));
      setLoadingMsg('Loading questions...');
      try {
        const { id } = await interviewService.createInterview(config);
        const questions = await interviewService.getQuestions(id);
        startSession(questions);
      } catch {
        setInterviewStatus('error');
      }
      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-advance through question states ──────────────────────────────────────
  const currentQuestion: Question | undefined = session?.questions[session.currentQuestionIndex];

  const advanceToListening = useCallback(() => {
    if (!session) return;
    setAnswerStatus('question-displayed');
    autoAdvanceRef.current = setTimeout(() => {
      setAnswerStatus('listening');
      // Simulate mic detection after 2s
      autoAdvanceRef.current = setTimeout(() => {
        setAnswerStatus('candidate-speaking');
        // Simulate answer for 4s
        const transcript = getMockTranscript(currentQuestion);
        setMockTranscript('');
        let i = 0;
        const typeInterval = setInterval(() => {
          i++;
          setMockTranscript(transcript.slice(0, i * 4));
          if (i * 4 >= transcript.length) clearInterval(typeInterval);
        }, 60);

        autoAdvanceRef.current = setTimeout(() => {
          setAnswerStatus('answer-completed');
          setMockTranscript(transcript);
          clearInterval(typeInterval);
          // Analysing
          autoAdvanceRef.current = setTimeout(() => {
            setAnswerStatus('analyzing');
            addAnswer({ questionId: currentQuestion?.id || '', questionText: currentQuestion?.text || '', transcript, duration: 45 });
            autoAdvanceRef.current = setTimeout(() => {
              if (session.currentQuestionIndex + 1 >= session.questions.length) {
                handleFinish();
              } else {
                nextQuestion();
                setMockTranscript('');
              }
            }, 1500);
          }, 2000);
        }, 5000);
      }, 2000);
    }, 1500);
  }, [session, currentQuestion, setAnswerStatus, nextQuestion, addAnswer]);

  useEffect(() => {
    if (!session || isLoading) return;
    if (session.answerStatus === 'ai-speaking') {
      autoAdvanceRef.current = setTimeout(advanceToListening, 3000);
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.answerStatus, session?.currentQuestionIndex, isLoading]);

  const handleFinish = async () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setInterviewStatus('completed');
    navigate('/interview/completion');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingState message={loadingMsg} size="lg" className="text-white [&_p]:text-surface-300" />
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) return null;

  const progress = ((session.currentQuestionIndex) / session.questions.length) * 100;
  const isAiSpeaking = session.answerStatus === 'ai-speaking';
  const isCandidateSpeaking = session.answerStatus === 'candidate-speaking';
  const isListening = session.answerStatus === 'listening';

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col" role="main" aria-label="Live interview in progress">
      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-900 border-b border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
          <span className="text-white text-sm font-medium">Live Interview</span>
          <span className="text-surface-400 text-xs">·</span>
          <span className="text-surface-300 text-xs">{config.role}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-surface-300 text-sm">
            Q {session.currentQuestionIndex + 1} / {session.questions.length}
          </span>
          <InterviewTimer startTime={startTime} duration={config.duration} />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFinish}
            className="hidden sm:inline-flex text-xs !px-3 !py-1.5"
          >
            End Interview
          </Button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-800">
        <div
          className="h-full bg-primary-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={session.currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={session.questions.length}
          aria-label="Interview progress"
        />
      </div>

      {/* ── DESKTOP layout ─────────────────────────────────────────────────────── */}
      <div className="flex-1 hidden lg:flex gap-0 overflow-hidden">
        {/* AI Interviewer Panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          {/* Avatar */}
          <div className={clsx(
            'w-28 h-28 rounded-full flex items-center justify-center mb-6 transition-all duration-300',
            isAiSpeaking
              ? 'bg-primary-600 shadow-[0_0_40px_rgba(37,99,235,0.5)]'
              : 'bg-surface-700'
          )} aria-hidden="true">
            <Bot className="w-14 h-14 text-white" />
          </div>

          <p className="text-surface-400 text-sm font-medium mb-2">AI Interviewer</p>

          {/* Waveform */}
          <div className="mb-6 h-8 flex items-end">
            <VoiceWave active={isAiSpeaking} color="text-primary-400" />
          </div>

          {/* Status */}
          <div className="mb-8">
            <AnswerStatusBadge status={session.answerStatus} />
          </div>

          {/* Question card */}
          <div className="w-full max-w-xl bg-surface-800 border border-surface-700 rounded-2xl p-6" role="region" aria-label="Current question">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">
                Question {session.currentQuestionIndex + 1}
              </span>
              <span className="badge bg-surface-700 text-surface-300 text-xs capitalize">
                {currentQuestion.category.replace('-', ' ')}
              </span>
            </div>
            <p className="text-white text-lg leading-relaxed font-medium">
              "{currentQuestion.text}"
            </p>
            {currentQuestion.followUps && currentQuestion.followUps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-surface-700">
                <p className="text-xs text-surface-500 mb-1">Possible follow-up questions:</p>
                <p className="text-xs text-surface-400">{currentQuestion.followUps[0]}</p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Panel */}
        <div className="w-80 bg-surface-900 border-l border-surface-800 flex flex-col p-4 gap-4">
          {/* Camera */}
          <div className="flex-1 bg-surface-800 rounded-xl overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label="Your camera preview"
            />
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              {!streamRef.current && (
                <Camera className="w-10 h-10 text-surface-500" />
              )}
            </div>
            <div className="absolute bottom-3 left-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 bg-surface-900/80 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="text-[10px] text-emerald-300">Camera Active</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-900/80 rounded-full px-2 py-0.5">
                <div className={clsx('w-1.5 h-1.5 rounded-full', isCandidateSpeaking ? 'bg-red-400 animate-pulse' : isListening ? 'bg-emerald-400' : 'bg-surface-500')} aria-hidden="true" />
                <span className="text-[10px] text-surface-300">
                  {isCandidateSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Microphone'}
                </span>
              </div>
            </div>
          </div>

          {/* Mic status */}
          <div className="bg-surface-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-surface-300">Voice</span>
              <Mic className={clsx('w-4 h-4', isCandidateSpeaking ? 'text-red-400' : isListening ? 'text-emerald-400' : 'text-surface-500')} aria-hidden="true" />
            </div>
            <VoiceWave
              active={isCandidateSpeaking}
              color={isCandidateSpeaking ? 'text-red-400' : 'text-emerald-400'}
            />
            <p className="text-xs text-surface-400 mt-2">
              {isCandidateSpeaking ? 'Answer in progress...' : isListening ? 'Listening for your response...' : 'Waiting...'}
            </p>
          </div>

          {/* Transcript preview */}
          {mockTranscript && (
            <div className="bg-surface-800 rounded-xl p-3 text-xs text-surface-300 leading-relaxed max-h-28 overflow-y-auto" aria-label="Live transcript preview" aria-live="polite">
              <p className="text-[10px] text-surface-500 mb-1 font-medium">TRANSCRIPT (read-only)</p>
              {mockTranscript}
              {isCandidateSpeaking && <span className="animate-pulse ml-0.5">|</span>}
            </div>
          )}

          {/* End interview button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFinish}
            className="!text-surface-300 !border-surface-700 hover:!bg-surface-800"
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* ── MOBILE layout ──────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:hidden flex flex-col overflow-y-auto">
        {/* AI Question */}
        <div className="bg-surface-900 px-4 py-5">
          <div className="flex items-start gap-3">
            <div className={clsx(
              'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all',
              isAiSpeaking ? 'bg-primary-600' : 'bg-surface-700'
            )} aria-hidden="true">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-surface-400 font-medium">AI Interviewer</span>
                <VoiceWave active={isAiSpeaking} color="text-primary-400" />
              </div>
              <p className="text-white text-base leading-relaxed">"{currentQuestion.text}"</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="px-4 py-3 flex items-center gap-3 bg-surface-950 border-t border-surface-800">
          <AnswerStatusBadge status={session.answerStatus} />
        </div>

        {/* Camera & Mic */}
        <div className="flex gap-3 p-4">
          <div className="flex-1 aspect-video bg-surface-900 rounded-xl overflow-hidden relative">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-surface-900/80 rounded-full px-2 py-0.5">
              <div className={clsx('w-1.5 h-1.5 rounded-full', isCandidateSpeaking ? 'bg-red-400 animate-pulse' : 'bg-emerald-400')} aria-hidden="true" />
              <span className="text-[10px] text-white">
                {isCandidateSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </div>
          </div>
          <div className="w-16 flex flex-col items-center justify-center bg-surface-900 rounded-xl gap-2">
            <Mic className={clsx('w-6 h-6', isCandidateSpeaking ? 'text-red-400' : isListening ? 'text-emerald-400' : 'text-surface-500')} aria-hidden="true" />
            <VoiceWave active={isCandidateSpeaking} color="text-red-400" />
          </div>
        </div>

        {/* Transcript */}
        {mockTranscript && (
          <div className="mx-4 mb-4 bg-surface-900 rounded-xl p-3 text-xs text-surface-300" aria-live="polite">
            <p className="text-[10px] text-surface-500 mb-1">TRANSCRIPT (read-only)</p>
            {mockTranscript}
          </div>
        )}

        {/* End button */}
        <div className="p-4 mt-auto">
          <Button
            variant="secondary"
            className="w-full !text-surface-300 !border-surface-700"
            leftIcon={<ChevronRight className="w-4 h-4" />}
            onClick={handleFinish}
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Mock transcript helper ─────────────────────────────────────────────────────
function getMockTranscript(question?: Question): string {
  if (!question) return 'I have strong experience with the topics covered...';
  const category = question.category;
  const transcripts: Record<string, string[]> = {
    introduction: [
      "Hi, I'm Alex Johnson, a final year Computer Science student specializing in AI and Data Science. I've completed an internship at TechCorp where I worked on machine learning pipelines, and I've built several projects including NoteMind AI. I'm passionate about using data to drive meaningful decisions.",
    ],
    hr: [
      "I believe you should hire me because I bring a strong combination of technical skills and a genuine passion for this role. I've consistently delivered results in my projects and internship. I'm a quick learner who takes ownership of my work and communicates clearly with team members.",
    ],
    resume: [
      "My most significant project was NoteMind AI, an AI-powered note-taking application. I used Python and TensorFlow to build the summarization model, and integrated it with a React frontend. My personal contribution was designing the NLP pipeline and optimising inference speed by 40%. The biggest challenge was handling edge cases in text preprocessing.",
    ],
    behavioral: [
      "During my internship, we faced a critical bug two days before the product launch. I took ownership of debugging the issue, working late to trace the root cause in the data pipeline. I documented the fix clearly and added tests to prevent recurrence. The launch happened on time and the team appreciated the proactive approach.",
    ],
    situational: [
      "If I disagreed with a team member, I would first make sure I fully understand their perspective before sharing mine. I'd approach it as a collaborative discussion rather than a debate, focusing on what's best for the project outcome. If we couldn't reach agreement, I'd suggest involving a senior team member for guidance.",
    ],
    'role-specific': [
      "For handling missing values in a dataset, I evaluate the extent and pattern of missingness first. For random missing data in continuous variables, I use mean or median imputation. For structured missingness or categorical data, I use mode or model-based imputation. In cases where over 30% of a column is missing, I consider dropping it entirely depending on its feature importance.",
    ],
    technical: [
      "The time complexity of binary search is O(log n) because with each comparison we eliminate half of the remaining search space. It requires the array to be sorted. The process works by comparing the target value with the middle element, then recursively searching either the left or right half depending on whether the target is smaller or larger.",
    ],
    followup: [
      "For that specific scenario, I would apply the STAR method. The situation was during my project deadline. The task was to deliver the feature on time. My action was to break it into smaller sub-tasks and prioritise them by impact. The result was successful delivery with all core features working.",
    ],
  };
  const options = transcripts[category] || transcripts.hr;
  return options[0];
}
