import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { type KycSessionState } from '../types/kyc';

interface VerificationAuditProps {
  session: KycSessionState;
  onReset: () => void;
}

/**
 * Displays the simulated "Sherlock Agent" compliance output, biometric liveness score,
 * AML watchlist screening, and 3G payload bandwidth reduction telemetry.
 */
export const VerificationAudit: React.FC<VerificationAuditProps> = ({
  session,
  onReset,
}) => {
  // Calculate percentage of bytes saved across ID front capture
  const bandwidthSavedPct = session.idFront
    ? Math.round(
        (1 -
          session.idFront.compressedSizeBytes /
            Math.max(1, session.idFront.originalSizeBytes)) *
          100
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Decision Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-bold text-emerald-950">
            Verification Approved
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Case ID:{' '}
            <span className="font-mono">
              APR-{Date.now().toString().slice(-6)}
            </span>{' '}
            • Risk Score: <strong>Low (12/100)</strong>
          </p>
        </div>
      </div>

      {/* Sherlock Agent Fraud & Compliance Breakdown */}
      <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
        <div className="p-3 bg-slate-50/70 flex items-center gap-1.5 font-semibold text-slate-700 rounded-t-2xl">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          Sherlock Agent & Biometric Telemetry
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">Document Type</span>
          <span className="font-semibold text-slate-800">
            {session.documentType.replace('_', ' ')}
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">Document Tamper Check</span>
          <span className="font-semibold text-emerald-600">
            PASSED (Authentic)
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">Passive Liveness & Deepfake</span>
          <span className="font-semibold text-emerald-600">
            99.4% Confidence
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">Face-to-ID Biometric Match</span>
          <span className="font-semibold text-emerald-600">
            MATCHED (98.7%)
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">OFAC / PEP / Sanctions</span>
          <span className="font-semibold text-slate-800">
            0 Hits across 3,000+ lists
          </span>
        </div>

        <div className="p-3 flex justify-between">
          <span className="text-slate-500">3G Payload Savings</span>
          <span className="font-semibold text-indigo-600">
            {bandwidthSavedPct > 0
              ? `${bandwidthSavedPct}% bandwidth reduced`
              : 'Canvas Optimized'}
          </span>
        </div>
      </div>

      {/* Capture Source Audit Note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Capture Mode:{' '}
          <strong>
            {session.idFront?.captureMethod === 'NATIVE_FALLBACK'
              ? 'Native Camera Fallback'
              : 'WebRTC Live Stream'}
          </strong>{' '}
          ({session.isLowBandwidth ? '3G Profile' : 'Standard HD Profile'})
        </span>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50"
      >
        Reset Demo Flow
      </button>
    </div>
  );
};