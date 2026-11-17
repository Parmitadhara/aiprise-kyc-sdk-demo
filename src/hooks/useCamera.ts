// src/hooks/useCamera.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraPermissionState =
  | 'IDLE'
  | 'REQUESTING'
  | 'GRANTED'
  | 'DENIED'
  | 'UNAVAILABLE';

interface UseCameraOptions {
  facingMode: 'user' | 'environment';
  lowBandwidth: boolean;
}

/**
 * Manages WebRTC MediaStream lifecycle, adaptive resolution constraints,
 * and explicit browser permission error states.
 */
export function useCamera({ facingMode, lowBandwidth }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] =
    useState<CameraPermissionState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stop all active hardware tracks to release the camera LED immediately
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request camera access with bandwidth-appropriate constraints
  const startCamera = useCallback(async () => {
    stopCamera();
    setPermissionState('REQUESTING');
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('UNAVAILABLE');
      setErrorMessage('Camera API unavailable in this browser context.');
      return;
    }

    try {
      // Downgrade frame rate and ideal width on 3G to save CPU/memory
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: lowBandwidth ? 854 : 1280 },
          height: { ideal: lowBandwidth ? 480 : 720 },
          frameRate: { ideal: lowBandwidth ? 15 : 30 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPermissionState('GRANTED');
    } catch (err) {
      const error = err as DOMException;
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setPermissionState('DENIED');
        setErrorMessage(
          'Camera access was blocked. Enable permissions in your browser bar or use file upload below.'
        );
      } else {
        setPermissionState('UNAVAILABLE');
        setErrorMessage(
          'No compatible camera detected. You can still upload a photo directly.'
        );
      }
    }
  }, [facingMode, lowBandwidth, stopCamera]);

  // Capture current video frame as a raw JPEG DataURL
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror selfie captures horizontally so text/orientation feels natural
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [facingMode]);

  // Clean up hardware streams on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    permissionState,
    errorMessage,
    startCamera,
    stopCamera,
    captureFrame,
  };
}