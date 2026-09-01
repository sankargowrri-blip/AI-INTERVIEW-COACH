import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, MicOff, Camera, CameraOff, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { useInterview } from '../../context/InterviewContext';
import { interviewService } from '../../services/interviewService';
import type { Question } from '../../types';
import { clsx } from 'clsx';
import Button from '../../components/common/Button';

// ─────────────────────────────────────────────────────────────────────────────
// Browser speech API types
// ─────────────────────────────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
declare const SpeechRecognition: new () => SpeechRecognitionInstance;
declare const webkitSpeechRecognition: new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionInstance | null {
  try {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return null;
    return new Ctor() as SpeechRecognitionInstance;
  } catch {
    return null;
  }
}

function speakText(text: string): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 1;
  utt.volume = 1;
  window.speechSynthesis.speak(utt);
}

function cancelSpeech(): void {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function VoiceWave({ active, color = 'text-primary-500' }: { active: boolean; color?: string }) {
  return (
    <div className={clsx('flex items-end gap-0.5 h-6', active ? color : 'text-surface-600')} aria-hidden="true">
      {[6, 10, 14, 18, 22, 18, 14, 10, 6].map((h, i) => (
        <div
          key={i}
          className={clsx('w-1 rounded-full bg-current transition-all', active && 'animate-pulse')}
          style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function InterviewTimer({ startTime, duration }: { startTime: number; duration: number }) {
  const [elapsed, setElapsed] = useState(0);
  const limit = duration * 60;

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const remaining = Math.max(0, limit - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isWarning = remaining < 120;

  return (
    <div
      className={clsx('flex items-center gap-1.5 text-sm font-mono font-semibold', isWarning ? 'text-amber-400' : 'text-surface-300')}
      aria-label={`${mins} minutes ${secs} seconds remaining`}
    >
      <Clock className="w-4 h-4" aria-hidden="true" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}

type LiveStatus = 'ai-speaking' | 'listening' | 'speaking' | 'recorded' | 'next';

const STATUS_LABEL: Record<LiveStatus, string> = {
  'ai-speaking': 'AI Speaking…',
  'listening':   '🎙 Listening…',
  'speaking':    '🔴 You are speaking…',
  'recorded':    '✓ Answer recorded',
  'next':        'Preparing next question…',
};
const STATUS_COLOR: Record<LiveStatus, string> = {
  'ai-speaking': 'text-primary-400 bg-primary-950 border-primary-800',
  'listening':   'text-emerald-400 bg-emerald-950 border-emerald-800',
  'speaking':    'text-red-400 bg-red-950 border-red-800',
  'recorded':    'text-teal-400 bg-teal-950 border-teal-800',
  'next':        'text-surface-400 bg-surface-800 border-surface-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'ready' | 'error' | 'expired';

export default function LiveInterviewPage() {
  const { config, session, startSession, setInterviewStatus, nextQuestion, addAnswer } = useInterview();
  const navigate = useNavigate();

  // ── refs ──────────────────────────────────────────────────────────────────
  const videoRef      = useRef<HTMLVideoElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const recogRef      = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokenIdxRef  = useRef<number>(-1);         // track which question was spoken

  // ── state ─────────────────────────────────────────────────────────────────
  const [pageState,   setPageState]   = useState<PageState>('loading');
  const [loadMsg,     setLoadMsg]     = useState('Preparing your interview…');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [liveStatus,  setLiveStatus]  = useState<LiveStatus>('ai-speaking');
  const [transcript,  setTranscript]  = useState('');
  const [cameraOn,    setCameraOn]    = useState(false);
  const [micOn,       setMicOn]       = useState(false);
  const [micMuted,    setMicMuted]    = useState(false);
  const [startTime]                   = useState(Date.now());

  const currentQuestion: Question | undefined =
    session?.questions[session.currentQuestionIndex ?? 0];
  const totalQuestions = session?.questions.length ?? 0;
  const currentIdx     = session?.currentQuestionIndex ?? 0;

  // ── clear timer helper ────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // ── camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setCameraOn(false);
    }
  }, []);

  // ── speech recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (micMuted) return;
    const recog = getSpeechRecognition();
    if (!recog) {
      // No SR support — auto-advance after 6s
      setLiveStatus('speaking');
      setMicOn(true);
      timerRef.current = setTimeout(() => {
        setLiveStatus('recorded');
        setMicOn(false);
      }, 6000);
      return;
    }
    recog.continuous     = true;
    recog.interimResults = true;
    recog.lang           = 'en-US';

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let final   = '';
      for (let i = e.results.length - 1; i >= 0; i--) {
        if (e.results[i].isFinal) { final += e.results[i][0].transcript; break; }
        else interim += e.results[i][0].transcript;
      }
      setTranscript(prev => (final ? prev + ' ' + final : prev + interim).trim());
      setLiveStatus('speaking');
      setMicOn(true);
    };
    recog.onerror = () => { setMicOn(false); };
    recog.onend   = () => { setMicOn(false); };
    recog.start();
    recogRef.current = recog;
    setLiveStatus('listening');
    setMicOn(true);
  }, [micMuted]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    recogRef.current = null;
    setMicOn(false);
  }, []);

  // ── ask question (TTS + start listening) ──────────────────────────────────
  const askQuestion = useCallback((q: Question, idx: number) => {
    if (spokenIdxRef.current === idx) return;   // don't re-speak same question
    spokenIdxRef.current = idx;
    setLiveStatus('ai-speaking');
    setTranscript('');
    cancelSpeech();
    speakText(q.text);

    // After ~3s start listening
    timerRef.current = setTimeout(() => {
      setLiveStatus('listening');
      startListening();
    }, 3200);
  }, [startListening]);

  // ── next question / finish ─────────────────────────────────────────────────
  const handleNextQuestion = useCallback(() => {
    clearTimer();
    stopListening();
    cancelSpeech();

    // Only record the answer if the transcript is meaningful — never record silence
    const answerText = transcript.trim();
    const isMeaningful = answerText.length >= 3 &&
      !['(no answer recorded)', '[silence]', '[no speech detected]']
        .some(p => answerText.toLowerCase() === p.toLowerCase());

    if (isMeaningful) {
      addAnswer({
        questionId:   currentQuestion?.id       ?? String(currentIdx),
        questionText: currentQuestion?.text     ?? '',
        transcript:   answerText,
        duration:     0,
      });
    }
    // If not meaningful: addAnswer is NOT called — question stays unanswered

    setLiveStatus('next');
    setTranscript('');

    if (currentIdx + 1 >= totalQuestions) {
      setInterviewStatus('completed');
      timerRef.current = setTimeout(() => navigate('/interview/completion'), 800);
    } else {
      nextQuestion();
    }
  }, [clearTimer, stopListening, transcript, addAnswer, currentQuestion,
      currentIdx, totalQuestions, setInterviewStatus, nextQuestion, navigate]);

  const handleFinish = useCallback(() => {
    clearTimer();
    stopListening();
    cancelSpeech();
    // Record final answer only if meaningful speech was captured
    const finalText = transcript.trim();
    const isMeaningful = finalText.length >= 3 &&
      !['(no answer recorded)', '[silence]', '[no speech detected]']
        .some(p => finalText.toLowerCase() === p.toLowerCase());
    if (isMeaningful && currentQuestion) {
      addAnswer({
        questionId:   currentQuestion.id,
        questionText: currentQuestion.text ?? '',
        transcript:   finalText,
        duration:     0,
      });
    }
    setInterviewStatus('completed');
    navigate('/interview/completion');
  }, [clearTimer, stopListening, transcript, currentQuestion, addAnswer, setInterviewStatus, navigate]);

  // ── load interview ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setPageState('loading');
      setLoadMsg('Preparing your interview…');
      await startCamera();
      setLoadMsg('Loading questions…');
      try {
        const { id } = await interviewService.createInterview(config);
        const questions = await interviewService.getQuestions(id, config);
        if (cancelled) return;
        if (!questions || questions.length === 0) {
          setErrorMsg('Could not load questions. Please try again.');
          setPageState('error');
          return;
        }
        startSession(questions);
        setPageState('ready');
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Failed to start interview. Please try again.');
          setPageState('error');
        }
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimer();
      stopListening();
      cancelSpeech();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── speak new question whenever currentQuestion changes ───────────────────
  useEffect(() => {
    if (pageState !== 'ready' || !currentQuestion) return;
    askQuestion(currentQuestion, currentIdx);
    return () => { clearTimer(); stopListening(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState, currentIdx]);

  // ── cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimer();
      stopListening();
      cancelSpeech();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — loading
  // ─────────────────────────────────────────────────────────────────────────
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center" role="status">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto mb-6" />
          <p className="text-white font-medium text-lg">{loadMsg}</p>
          <p className="text-surface-400 text-sm mt-2">Please wait…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — expired (page refreshed, session lost)
  // ─────────────────────────────────────────────────────────────────────────
  if (pageState === 'expired' || (pageState === 'ready' && !session)) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white mb-3">Session Expired</h1>
          <p className="text-surface-400 mb-6">
            Your interview session has expired. This usually happens when the page is refreshed.
            Please start a new interview.
          </p>
          <Button onClick={() => navigate('/interview/setup')}>Back to Interview Setup</Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — error
  // ─────────────────────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-surface-400 mb-6">{errorMsg || 'Failed to load interview. Please try again.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER — ready (safe: session & currentQuestion guaranteed here)
  // ─────────────────────────────────────────────────────────────────────────
  if (!session || !currentQuestion) {
    // Edge case: session cleared unexpectedly
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white mb-3">Session Expired</h1>
          <p className="text-surface-400 mb-6">Please start a new interview.</p>
          <Button onClick={() => navigate('/interview/setup')}>Back to Interview Setup</Button>
        </div>
      </div>
    );
  }

  const progress   = ((currentIdx) / totalQuestions) * 100;
  const isAI       = liveStatus === 'ai-speaking';
  const isSpeaking = liveStatus === 'speaking';
  const isListening= liveStatus === 'listening';
  const isRecorded = liveStatus === 'recorded';
  const showNext   = isRecorded || isSpeaking;

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col" role="main" aria-label="Live interview">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-900 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-white text-sm font-semibold truncate">Live Interview</span>
          {config.role && (
            <>
              <span className="text-surface-600 hidden sm:block">·</span>
              <span className="text-surface-400 text-xs hidden sm:block truncate">{config.role}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-surface-400 text-xs">Q {currentIdx + 1} / {totalQuestions}</span>
          <InterviewTimer startTime={startTime} duration={config.duration || 30} />
          <button
            onClick={handleFinish}
            className="hidden sm:block text-xs text-surface-400 hover:text-white border border-surface-700 hover:border-surface-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-800 shrink-0" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemin={1} aria-valuemax={totalQuestions}>
        <div className="h-full bg-primary-500 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ── AI Panel ──────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">

          {/* Avatar */}
          <div className={clsx(
            'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
            isAI ? 'bg-primary-600 shadow-[0_0_40px_rgba(37,99,235,0.45)]' : 'bg-surface-700',
          )} aria-hidden="true">
            <Bot className="w-12 h-12 text-white" />
          </div>

          <div className="text-center">
            <p className="text-surface-400 text-xs font-semibold uppercase tracking-wider mb-2">AI Interviewer</p>
            <VoiceWave active={isAI} color="text-primary-400" />
          </div>

          {/* Status badge */}
          <span className={clsx('px-4 py-1.5 rounded-full text-xs font-semibold border', STATUS_COLOR[liveStatus])} role="status" aria-live="polite">
            {STATUS_LABEL[liveStatus]}
          </span>

          {/* Question card */}
          <div className="w-full max-w-2xl bg-surface-800 border border-surface-700 rounded-2xl p-6" role="region" aria-label="Current interview question">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="text-xs bg-surface-700 text-surface-300 px-2 py-0.5 rounded-full capitalize">
                {(currentQuestion.category ?? 'general').replace('-', ' ')}
              </span>
            </div>
            <p className="text-white text-lg sm:text-xl leading-relaxed font-medium">
              "{currentQuestion.text}"
            </p>
          </div>

          {/* Answer transcript */}
          {(transcript || isSpeaking || isListening) && (
            <div
              className="w-full max-w-2xl bg-surface-900 border border-surface-700 rounded-xl p-4"
              aria-live="polite"
              aria-label="Your answer transcript"
            >
              <p className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide mb-2">Your Answer</p>
              <p className="text-surface-300 text-sm leading-relaxed min-h-[2rem]">
                {transcript || <span className="text-surface-600 italic">Listening for your response…</span>}
                {isSpeaking && <span className="animate-pulse ml-1">|</span>}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {/* Mute toggle */}
            <button
              onClick={() => {
                setMicMuted(m => {
                  if (!m) { stopListening(); setMicOn(false); }
                  return !m;
                });
              }}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
                micMuted
                  ? 'bg-red-900/40 border-red-700 text-red-400'
                  : 'bg-surface-800 border-surface-700 text-surface-300 hover:border-surface-500',
              )}
              aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {micMuted ? 'Unmute' : 'Mute'}
            </button>

            {/* Next / Finish */}
            {showNext && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-colors"
                aria-label={currentIdx + 1 >= totalQuestions ? 'Finish interview' : 'Next question'}
              >
                {currentIdx + 1 >= totalQuestions ? 'Finish Interview' : 'Next Question'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* End */}
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-surface-700 text-surface-400 hover:text-white hover:border-surface-500 transition-colors"
              aria-label="End interview"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* ── Candidate / Camera Panel ───────────────────────────────────────── */}
        <div className="lg:w-72 xl:w-80 shrink-0 bg-surface-900 border-t lg:border-t-0 lg:border-l border-surface-800 flex flex-col gap-4 p-4">

          {/* Camera preview */}
          <div className="relative bg-surface-800 rounded-xl overflow-hidden aspect-video lg:aspect-auto lg:flex-1">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              aria-label="Your camera preview"
            />
            {/* Overlay when camera off */}
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-800">
                <CameraOff className="w-8 h-8 text-surface-500" aria-hidden="true" />
                <p className="text-xs text-surface-500">Camera unavailable</p>
              </div>
            )}
            {/* Indicators */}
            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 bg-surface-900/80 backdrop-blur rounded-full px-2 py-0.5">
                {cameraOn
                  ? <Camera className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                  : <CameraOff className="w-3 h-3 text-surface-500" aria-hidden="true" />}
                <span className="text-[10px] text-surface-300">{cameraOn ? 'Camera on' : 'Camera off'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-900/80 backdrop-blur rounded-full px-2 py-0.5">
                {micMuted
                  ? <MicOff className="w-3 h-3 text-red-400" aria-hidden="true" />
                  : micOn
                    ? <Mic className="w-3 h-3 text-red-400" aria-hidden="true" />
                    : <Mic className="w-3 h-3 text-surface-400" aria-hidden="true" />}
                <span className="text-[10px] text-surface-300">
                  {micMuted ? 'Muted' : isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Mic ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Mic visualiser */}
          <div className="bg-surface-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Voice</span>
              <Mic className={clsx('w-4 h-4', isSpeaking ? 'text-red-400' : isListening ? 'text-emerald-400' : 'text-surface-600')} aria-hidden="true" />
            </div>
            <VoiceWave active={isSpeaking} color={isSpeaking ? 'text-red-400' : 'text-emerald-400'} />
            <p className="text-xs text-surface-500 mt-2">
              {micMuted ? 'Microphone muted' : isSpeaking ? 'Recording your answer…' : isListening ? 'Speak your answer now' : 'Waiting for AI…'}
            </p>
          </div>

          {/* Mobile end button */}
          <button
            onClick={handleFinish}
            className="lg:hidden w-full py-2 text-sm text-surface-400 border border-surface-700 rounded-xl hover:text-white hover:border-surface-500 transition-colors"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}
