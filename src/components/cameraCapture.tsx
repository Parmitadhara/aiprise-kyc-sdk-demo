import React, { useEffect, useState } from 'react';
import { Camera, RefreshCw, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { compressImageFor3G } from '../utils/imageProcessor';
import {type  CapturedArtifact } from '../types/kyc';

interface CameraCaptureProps {
  title: string;
  subtitle: string;
  overlayType: 'ID_CARD' | 'FACE_OVAL';
  facingMode: 'user' | 'environment';
  lowBandwidth: boolean;
  onConfirm: (artifact: CapturedArtifact) => void;
}

/**
 * Mobile-first viewfinder component with SVG alignment guides, permission error recovery,
 * and automatic 3G image compression before advancing.
 */
export const CameraCapture: React.FC<CameraCaptureProps> = ({
  title,
  subtitle,
  overlayType,
  facingMode,
  lowBandwidth,
  onConfirm,
}) => {
  const {
    videoRef,
    permissionState,
    errorMessage,
    startCamera,
    stopCamera,
    captureFrame,
  } = useCamera({ facingMode, lowBandwidth });

  const [preview, setPreview] = useState<CapturedArtifact | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Start camera stream automatically when entering the step
  useEffect(() => {
    if (!preview) {
      startCamera();
    }
    return () => stopCamera();
  }, [preview, startCamera, stopCamera]);

  // Handle live WebRTC snapshot capture
  const handleSnap = async () => {
    const rawDataUrl = captureFrame();
    if (!rawDataUrl) return;

    setIsCompressing(true);
    stopCamera();

    const { dataUrl, originalSize, compressedSize } = await compressImageFor3G(
      rawDataUrl,
      lowBandwidth ? 1024 : 1280,
      lowBandwidth ? 0.72 : 0.8
    );

    setPreview({
      dataUrl,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      captureMethod: 'WEBRTC_STREAM',
      timestamp: Date.now(),
    });
    setIsCompressing(false);
  };

  // Handle native camera app / file input fallback (crucial for denied permissions or low-RAM phones)
  const handleFileFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    stopCamera();

    const { dataUrl, originalSize, compressedSize } = await compressImageFor3G(
      file,
      lowBandwidth ? 1024 : 1280,
      lowBandwidth ? 0.72 : 0.8
    );

    setPreview({
      dataUrl,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      captureMethod: 'NATIVE_FALLBACK',
      timestamp: Date.now(),
    });
    setIsCompressing(false);
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Viewfinder or Captured Preview Container */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        {preview ? (
          <img
            src={preview.dataUrl}
            alt="Captured verification preview"
            className="w-full h-full object-cover"
          />
        ) : permissionState === 'DENIED' || permissionState === 'UNAVAILABLE' ? (
          <div className="p-6 text-center text-white space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="text-sm text-slate-200">{errorMessage}</p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* Precision Alignment Guides */}
            {overlayType === 'ID_CARD' ? (
              <div className="absolute inset-6 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-end justify-center pb-2">
                <span className="text-[11px] bg-black/60 text-white px-2.5 py-0.5 rounded-full">
                  Align document edges inside frame
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-56 border-2 border-emerald-400/90 rounded-[999px] shadow-[0_0_0_9999px_rgba(2,6,23,0.55)]" />
              </div>
            )}
          </>
        )}

        {/* Payload Compression Telemetry Badge */}
        {preview && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-2 rounded-xl flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> 3G Optimized
            </span>
            <span className="text-slate-300">
              {(preview.originalSizeBytes / 1024).toFixed(0)} KB →{' '}
              <strong className="text-white">
                {(preview.compressedSizeBytes / 1024).toFixed(0)} KB
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="space-y-2.5 pt-2">
        {preview ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => onConfirm(preview)}
              className="py-3 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-sm"
            >
              Use Photo
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={permissionState !== 'GRANTED' || isCompressing}
              onClick={handleSnap}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 disabled:bg-slate-300 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition"
            >
              <Camera className="w-4 h-4" />
              {isCompressing ? 'Optimizing for upload...' : 'Capture Photo'}
            </button>

            {/* Native Camera / File Upload Fallback */}
            <label className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50">
              <Upload className="w-3.5 h-3.5" />
              Use Native Camera or Upload File
              <input
                type="file"
                accept="image/*"
                capture={facingMode === 'environment' ? 'environment' : 'user'}
                onChange={handleFileFallback}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};