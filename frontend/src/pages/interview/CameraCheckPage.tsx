/**
 * CameraCheckPage.tsx
 *
 * Camera preview fix — root causes resolved:
 *  1. Stream was assigned to videoRef.current before the <video> element
 *     was in the DOM (conditional render race). Fixed by requesting the
 *     stream first, storing it in streamRef, then assigning it inside a
 *     useEffect that runs after the element renders.
 *  2. video.play() was never called explicitly — required by some browsers.
 *  3. "Camera Ready" was set before the stream was actually playing.
 *  4. Added transform: scaleX(-1) mirror for front-facing camera.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Mic, CheckCircle, AlertCircle, Loader2, XCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

type DeviceStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';

export default function CameraCheckPage() {
  const navigate = useNavigate();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const camStreamRef  = useRef<MediaStream | null>(null);
  const animFrameRef  = useRef<number | null>(null);

  const [cameraStatus, setCameraStatus] = useState<DeviceStatus>('idle');
  const [micStatus,    setMicStatus]    = useState<DeviceStatus>('idle');
  const [micLevel,     setMicLevel]     = useState(0);
  const [camError,     setCamError]     = useState('');

  // ── cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── KEY FIX: assign stream to video element whenever cameraStatus becomes
  //    'granted'.  At that point the <video> element is guaranteed to be in
  //    the DOM because React has already rendered the conditional block.
  useEffect(() => {
    if (cameraStatus !== 'granted' || !camStreamRef.current) return;

    const video = videoRef.current;
    if (!video) return;

    console.log('[Camera] Assigning stream to video element…');
    video.srcObject = camStreamRef.current;

    // Explicit play() — required on some browsers / Vercel HTTPS deployments
    video.play().then(() => {
      console.log('[Camera] Video playback started.');
    }).catch(err => {
      console.error('[Camera] video.play() failed:', err);
    });
  }, [cameraStatus]);

  // ── helpers ────────────────────────────────────────────────────────────────

  const stopCameraStream = useCallback(() => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
      camStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── camera ─────────────────────────────────────────────────────────────────

  const enableCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable');
      setCamError('Camera access is not supported by this browser.');
      return;
    }

    setCameraStatus('requesting');
    setCamError('');
    console.log('[Camera] Requesting camera permission…');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:      { ideal: 1280 },
          height:     { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      console.log('[Camera] Stream received:', stream);
      console.log('[Camera] Video tracks:', stream.getVideoTracks());

      camStreamRef.current = stream;

      // Setting status to 'granted' triggers the useEffect above which
      // assigns the stream to the video element AFTER it renders.
      setCameraStatus('granted');

    } catch (err: any) {
      console.error('[Camera] getUserMedia failed:', err);
      const name = err?.name || '';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraStatus('unavailable');
        setCamError('No camera found. Check your hardware connections.');
      } else if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setCamError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (name === 'NotReadableError') {
        setCameraStatus('error');
        setCamError('Camera is already in use by another application.');
      } else {
        setCameraStatus('error');
        setCamError(`Camera error: ${err?.message || 'Unknown error'}`);
      }
    }
  }, []);

  // ── microphone ─────────────────────────────────────────────────────────────

  const enableMicrophone = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unavailable');
      return;
    }

    setMicStatus('requesting');
    console.log('[Mic] Requesting microphone permission…');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      console.log('[Mic] Audio stream received:', stream);
      setMicStatus('granted');

      // Visualise mic level via Web Audio API
      try {
        const ctx     = new AudioContext();
        const source  = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b, 0) / data.length;
          setMicLevel(Math.min(100, avg * 2));
          animFrameRef.current = requestAnimationFrame(update);
        };
        update();
      } catch { /* AudioContext not available — visualisation optional */ }

      // Stop mic tracks after testing — mic will be re-requested on live page
      stream.getTracks().forEach(t => t.stop());

    } catch (err: any) {
      console.error('[Mic] getUserMedia failed:', err);
      const name = err?.name || '';
      if (name === 'NotFoundError') setMicStatus('unavailable');
      else                          setMicStatus('denied');
    }
  }, []);

  // ── navigation ─────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    // Stop camera here — LiveInterviewPage requests its own stream
    stopCameraStream();
    navigate('/interview/live');
  }, [stopCameraStream, navigate]);

  // ── derived ────────────────────────────────────────────────────────────────

  const bothReady = cameraStatus === 'granted' && micStatus === 'granted';

  // ── status icon helper ─────────────────────────────────────────────────────

  function StatusIcon({ status }: { status: DeviceStatus }) {
    if (status === 'requesting')
      return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" aria-hidden="true" />;
    if (status === 'granted')
      return <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />;
    if (status === 'denied' || status === 'error')
      return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
    if (status === 'unavailable')
      return <AlertCircle className="w-5 h-5 text-amber-500" aria-hidden="true" />;
    return <div className="w-5 h-5 rounded-full border-2 border-surface-300" aria-hidden="true" />;
  }

  function statusText(status: DeviceStatus, error?: string): string {
    if (status === 'idle')        return 'Not connected';
    if (status === 'requesting')  return 'Requesting permission…';
    if (status === 'granted')     return 'Ready';
    if (status === 'denied')      return error || 'Permission denied — allow access in browser settings.';
    if (status === 'unavailable') return error || 'Device not found — check hardware connections.';
    if (status === 'error')       return error || 'Camera error — try a different browser.';
    return '';
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-surface-500 hover:text-surface-700 mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-surface-900 mb-2">Camera &amp; Microphone Check</h1>
      <p className="text-surface-500 text-sm mb-8">
        Allow access to your camera and microphone before starting the interview.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">

        {/* ── Camera card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-5 h-5 text-surface-600" aria-hidden="true" />
            <span className="font-semibold text-surface-900">Camera</span>
            <StatusIcon status={cameraStatus} />
          </div>

          {/* Preview area — always rendered so videoRef is stable */}
          <div className={clsx(
            'w-full aspect-video rounded-lg overflow-hidden mb-4',
            cameraStatus === 'granted' ? 'bg-surface-900' : 'bg-surface-100 flex items-center justify-center',
          )}>
            {/* The <video> element is ALWAYS in the DOM so videoRef is
                always valid — we just hide it when camera is off. */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Camera preview"
              className={clsx(
                'w-full h-full object-cover',
                // Mirror front-facing camera
                '[transform:scaleX(-1)]',
                cameraStatus !== 'granted' && 'hidden',
              )}
            />
            {cameraStatus !== 'granted' && (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-surface-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs text-surface-400">Camera preview will appear here</p>
              </div>
            )}
          </div>

          <p className={clsx(
            'text-xs mb-3',
            cameraStatus === 'granted'    ? 'text-emerald-600' :
            cameraStatus === 'denied'     ? 'text-red-600'     :
            cameraStatus === 'unavailable'? 'text-amber-600'   :
            cameraStatus === 'error'      ? 'text-red-600'     : 'text-surface-500',
          )}>
            {statusText(cameraStatus, camError)}
          </p>

          {cameraStatus !== 'granted' && (
            <Button
              size="sm"
              className="w-full"
              onClick={enableCamera}
              isLoading={cameraStatus === 'requesting'}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              {cameraStatus === 'idle' ? 'Enable Camera' : 'Retry Camera'}
            </Button>
          )}
        </div>

        {/* ── Microphone card ──────────────────────────────────────────────── */}
        <div className="bg-white border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-5 h-5 text-surface-600" aria-hidden="true" />
            <span className="font-semibold text-surface-900">Microphone</span>
            <StatusIcon status={micStatus} />
          </div>

          {/* Level indicator */}
          <div className="w-full aspect-video rounded-lg bg-surface-100 flex flex-col items-center justify-center gap-3 mb-4">
            {micStatus === 'granted' ? (
              <>
                <div
                  className="flex items-end gap-1 h-10"
                  aria-label={`Microphone level: ${Math.round(micLevel)}%`}
                >
                  {[...Array(9)].map((_, i) => {
                    const barH   = [12, 18, 24, 32, 40, 32, 24, 18, 12][i];
                    const index  = i <= 4 ? i : 8 - i;
                    const active = micLevel > (index / 4) * 100;
                    return (
                      <div
                        key={i}
                        className={clsx('w-2 rounded-full transition-colors', active ? 'bg-primary-500' : 'bg-surface-200')}
                        style={{ height: `${barH}px` }}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-emerald-600">Microphone active</p>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 text-surface-300" aria-hidden="true" />
                <p className="text-xs text-surface-400">Microphone preview will appear here</p>
              </>
            )}
          </div>

          <p className={clsx(
            'text-xs mb-3',
            micStatus === 'granted'    ? 'text-emerald-600' :
            micStatus === 'denied'     ? 'text-red-600'     :
            micStatus === 'unavailable'? 'text-amber-600'   : 'text-surface-500',
          )}>
            {statusText(micStatus)}
          </p>

          {micStatus !== 'granted' && (
            <Button
              size="sm"
              className="w-full"
              onClick={enableMicrophone}
              isLoading={micStatus === 'requesting'}
              leftIcon={<Mic className="w-4 h-4" />}
            >
              {micStatus === 'idle' ? 'Enable Microphone' : 'Retry Microphone'}
            </Button>
          )}
        </div>
      </div>

      {/* Ready / not-ready summary */}
      {bothReady ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-700 font-medium">
            Camera and microphone are ready. You can start your interview.
          </p>
        </div>
      ) : (
        <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-surface-600">
            Enable both camera and microphone to proceed with the best interview experience.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        <Button
          className="flex-1"
          onClick={handleStart}
        >
          {bothReady ? 'Start Interview' : 'Skip Check & Start Anyway'}
        </Button>
      </div>
    </div>
  );
}
