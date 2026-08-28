import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

type DeviceStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export default function CameraCheckPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<DeviceStatus>('idle');
  const [micStatus, setMicStatus] = useState<DeviceStatus>('idle');
  const [micLevel, setMicLevel] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const enableCamera = async () => {
    setCameraStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus('granted');
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraStatus('unavailable');
      } else {
        setCameraStatus('denied');
      }
    }
  };

  const enableMicrophone = async () => {
    setMicStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMicStatus('granted');

      // Visualize mic level
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
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

      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotFoundError') setMicStatus('unavailable');
      else setMicStatus('denied');
    }
  };

  const bothReady = cameraStatus === 'granted' && micStatus === 'granted';

  const StatusIcon = ({ status }: { status: DeviceStatus }) => {
    if (status === 'requesting') return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" aria-hidden="true" />;
    if (status === 'granted') return <CheckCircle className="w-5 h-5 text-emerald-500" aria-hidden="true" />;
    if (status === 'denied') return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
    if (status === 'unavailable') return <AlertCircle className="w-5 h-5 text-amber-500" aria-hidden="true" />;
    return <div className="w-5 h-5 rounded-full border-2 border-surface-300" aria-hidden="true" />;
  };

  const statusText = (status: DeviceStatus) => {
    if (status === 'idle') return 'Not connected';
    if (status === 'requesting') return 'Requesting permission...';
    if (status === 'granted') return 'Ready';
    if (status === 'denied') return 'Permission denied — please allow access in your browser settings.';
    if (status === 'unavailable') return 'Device not found — check your hardware connections.';
    return '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-surface-500 hover:text-surface-700 mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-surface-900 mb-2">Camera & Microphone Check</h1>
      <p className="text-surface-500 text-sm mb-8">
        Allow access to your camera and microphone before starting the interview.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {/* Camera card */}
        <div className="bg-white border border-surface-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-5 h-5 text-surface-600" aria-hidden="true" />
            <span className="font-semibold text-surface-900">Camera</span>
            <StatusIcon status={cameraStatus} />
          </div>

          {/* Preview */}
          <div className={clsx(
            'w-full aspect-video rounded-lg overflow-hidden mb-4',
            cameraStatus === 'granted' ? 'bg-surface-900' : 'bg-surface-100 flex items-center justify-center'
          )}>
            {cameraStatus === 'granted' ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" aria-label="Camera preview" />
            ) : (
              <div className="text-center p-4">
                <Camera className="w-8 h-8 text-surface-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xs text-surface-400">Camera preview will appear here</p>
              </div>
            )}
          </div>

          <p className={clsx(
            'text-xs mb-3',
            cameraStatus === 'granted' ? 'text-emerald-600' : cameraStatus === 'denied' || cameraStatus === 'unavailable' ? 'text-red-600' : 'text-surface-500'
          )}>
            {statusText(cameraStatus)}
          </p>

          {cameraStatus !== 'granted' && (
            <Button
              size="sm"
              className="w-full"
              onClick={enableCamera}
              isLoading={cameraStatus === 'requesting'}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Enable Camera
            </Button>
          )}
        </div>

        {/* Microphone card */}
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
                <div className="flex items-end gap-1 h-10" aria-label={`Microphone level: ${Math.round(micLevel)}%`}>
                  {[...Array(9)].map((_, i) => {
                    const barIndex = i <= 4 ? i : 8 - i;
                    const threshold = (barIndex / 4) * 100;
                    const active = micLevel > threshold;
                    return (
                      <div
                        key={i}
                        className={clsx(
                          'wave-bar transition-colors',
                          active ? 'text-primary-500' : 'text-surface-200'
                        )}
                        style={{ height: `${[12, 18, 24, 32, 40, 32, 24, 18, 12][i]}px` }}
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
            micStatus === 'granted' ? 'text-emerald-600' : micStatus === 'denied' || micStatus === 'unavailable' ? 'text-red-600' : 'text-surface-500'
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
              Enable Microphone
            </Button>
          )}
        </div>
      </div>

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
            Enable both camera and microphone to proceed. If you skip this step, you can still start but the experience requires both devices.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        <Button
          className="flex-1"
          onClick={() => {
            stopStream();
            navigate('/interview/live');
          }}
        >
          {bothReady ? 'Start Interview' : 'Skip Check & Start Anyway'}
        </Button>
      </div>
    </div>
  );
}
