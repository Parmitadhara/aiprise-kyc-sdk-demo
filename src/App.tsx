import { useState } from 'react';
import { ShieldCheck, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  type KycStep,
  type DocumentType,
  type KycSessionState,
  type CapturedArtifact,
} from './types/kyc';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { StepProgress } from './components/StepProgress';
import { CameraCapture } from './components/cameraCapture';
import { VerificationAudit } from './components/verificationAudit';
import { uploadWithRetry } from './utils/imageProcessor';

export default function App() {
  const { isSlowNetwork, effectiveType } = useNetworkQuality();
  const [step, setStep] = useState<KycStep>('CONSENT');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Interactive 3G simulator toggle for testing low-bandwidth behavior
  const [simulate3G, setSimulate3G] = useState<boolean>(false);
  const lowBandwidthMode = isSlowNetwork || simulate3G;

  const [session, setSession] = useState<KycSessionState>({
    country: 'India',
    documentType: 'NATIONAL_ID',
    idFront: null,
    idBack: null,
    selfie: null,
    isLowBandwidth: false,
  });

  // Handles final selfie capture and simulates chunked 3G upload
  const handleFinalSubmit = async (selfieArtifact: CapturedArtifact) => {
    setSession((prev) => ({
      ...prev,
      selfie: selfieArtifact,
      isLowBandwidth: lowBandwidthMode,
    }));
    setUploadProgress(0);
    setStep('PROCESSING');

    await uploadWithRetry(selfieArtifact, (pct) => setUploadProgress(pct));
    setStep('RESULT');
  };

  // Resets all session captures to start a fresh demo run
  const handleReset = () => {
    setSession({
      country: 'India',
      documentType: 'NATIONAL_ID',
      idFront: null,
      idBack: null,
      selfie: null,
      isLowBandwidth: false,
    });
    setStep('CONSENT');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-4 font-sans">
      {/* Mobile-First SDK Container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[680px] bg-white sm:rounded-3xl shadow-xl border border-slate-200/80 flex flex-col justify-between overflow-hidden">
        
        {/* Modular Step & Network Header */}
        <StepProgress
          currentStep={step}
          lowBandwidthMode={lowBandwidthMode}
          simulate3G={simulate3G}
          effectiveType={effectiveType}
          onToggle3G={() => setSimulate3G((prev) => !prev)}
        />

        {/* Active Step Viewport */}
        <main className="flex-1 p-5 flex flex-col justify-between">
          {step === 'CONSENT' && (
            <div className="flex flex-col h-full justify-between space-y-6">
              <div className="space-y-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity & AML Verification
                </span>
                <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                  Verify your identity in under 30 seconds
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We will capture your government ID and a quick selfie to confirm your identity and screen against global compliance lists.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">What you will need:</p>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Valid Government ID (Passport, National ID, or Driver’s License)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Camera access (automatically compressed for low-bandwidth networks)</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('DOC_SELECT')}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-indigo-700 shadow-sm"
              >
                Agree & Start Verification <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'DOC_SELECT' && (
            <div className="flex flex-col h-full justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Select Document Type</h2>
                  <p className="text-sm text-slate-500">Choose an unexpired government-issued ID</p>
                </div>

                <div className="space-y-2.5">
                  {(
                    [
                      { id: 'NATIONAL_ID', label: 'National ID / Aadhaar', desc: 'Front & back capture' },
                      { id: 'DRIVERS_LICENSE', label: 'Driver’s License', desc: 'Front & back capture' },
                      { id: 'PASSPORT', label: 'Passport', desc: 'Photo bio-page only' },
                    ] as { id: DocumentType; label: string; desc: string }[]
                  ).map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSession({ ...session, documentType: doc.id })}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between ${
                        session.documentType === doc.id
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{doc.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('ID_FRONT')}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'ID_FRONT' && (
            <CameraCapture
              title="Capture Front of ID"
              subtitle="Ensure all four corners are visible with no glare"
              overlayType="ID_CARD"
              facingMode="environment"
              lowBandwidth={lowBandwidthMode}
              onConfirm={(artifact) => {
                setSession((prev) => ({ ...prev, idFront: artifact }));
                setStep(session.documentType === 'PASSPORT' ? 'SELFIE_LIVENESS' : 'ID_BACK');
              }}
            />
          )}

          {step === 'ID_BACK' && (
            <CameraCapture
              title="Capture Back of ID"
              subtitle="Capture the barcode / MRZ zone clearly"
              overlayType="ID_CARD"
              facingMode="environment"
              lowBandwidth={lowBandwidthMode}
              onConfirm={(artifact) => {
                setSession((prev) => ({ ...prev, idBack: artifact }));
                setStep('SELFIE_LIVENESS');
              }}
            />
          )}

          {step === 'SELFIE_LIVENESS' && (
            <CameraCapture
              title="Passive Liveness Selfie"
              subtitle="Center your face inside the oval in even lighting"
              overlayType="FACE_OVAL"
              facingMode="user"
              lowBandwidth={lowBandwidthMode}
              onConfirm={handleFinalSubmit}
            />
          )}

          {step === 'PROCESSING' && (
            <div className="my-auto text-center space-y-4 py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Running Sherlock Agent Checks...
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  OCR extraction, tamper detection & 1:1 biometric face match
                </p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-indigo-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">Encrypted upload: {uploadProgress}%</p>
            </div>
          )}

          {step === 'RESULT' && (
            <VerificationAudit session={session} onReset={handleReset} />
          )}
        </main>

        {/* Footer Compliance Attribution */}
        <footer className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Powered by AiPrise-inspired Modular KYC Engine • TLS 1.3 Encrypted
        </footer>
      </div>
    </div>
  );
}