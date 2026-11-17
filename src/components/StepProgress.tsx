import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { type KycStep } from '../types/kyc';

interface StepProgressProps {
  currentStep: KycStep;
  lowBandwidthMode: boolean;
  simulate3G: boolean;
  effectiveType: string;
  onToggle3G: () => void;
}

// Ordered verification stages used to calculate linear progress bar percentage
const ORDERED_STEPS: KycStep[] = [
  'CONSENT',
  'DOC_SELECT',
  'ID_FRONT',
  'ID_BACK',
  'SELFIE_LIVENESS',
  'PROCESSING',
  'RESULT',
];

/**
 * Top SDK navigation bar displaying brand identity, interactive 3G throttle simulator,
 * and a dynamic step completion progress bar.
 */
export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  lowBandwidthMode,
  simulate3G,
  effectiveType,
  onToggle3G,
}) => {
  const currentIndex = ORDERED_STEPS.indexOf(currentStep);
  const progressPct = Math.round(
    ((currentIndex + 1) / ORDERED_STEPS.length) * 100
  );

  return (
    <header className="bg-white border-b border-slate-100">
      <div className="px-5 py-4 flex items-center justify-between">
        {/* SDK Brand Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight">
            AiPrise Verify{' '}
            <span className="text-xs font-normal text-slate-400">SDK</span>
          </span>
        </div>

        {/* Interactive 3G Network Mode Toggle */}
        <button
          type="button"
          onClick={onToggle3G}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
            lowBandwidthMode
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
          title="Toggle simulated 3G compression mode"
        >
          {lowBandwidthMode ? (
            <>
              <WifiOff className="w-3 h-3" /> 3G Mode (
              {simulate3G ? 'Simulated' : effectiveType})
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3" /> {effectiveType.toUpperCase()} Optimal
            </>
          )}
        </button>
      </div>

      {/* Slim Step Progress Bar */}
      <div className="w-full h-1 bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </header>
  );
};