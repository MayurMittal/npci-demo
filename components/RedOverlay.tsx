"use client";

import { useState, useEffect } from "react";
import { Scenario, EvaluateResponse } from "@/lib/types";

interface RedOverlayProps {
  scenario: Scenario;
  result: EvaluateResponse;
  onBack: () => void;
  onDrillDown: () => void;
  onProceedAnyway: () => void;
  onReportFraud: () => void;
}

export default function RedOverlay({
  scenario,
  result,
  onBack,
  onDrillDown,
  onProceedAnyway,
  onReportFraud,
}: RedOverlayProps) {
  const [countdown, setCountdown] = useState(3);
  const [canProceed, setCanProceed] = useState(false);
  const [reported, setReported] = useState(false);
  const [proceeding, setProceeding] = useState(false);

  useEffect(() => {
    if (countdown <= 0) { setCanProceed(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (reported) {
    return (
      <div className="flex flex-col h-full bg-red-50 items-center justify-center px-6">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Report Submitted</h2>
        <p className="text-sm text-gray-500 text-center">Flagged for NPCI review.</p>
      </div>
    );
  }

  // Truncate signals to 2 lines max for viewport fit
  const signals = result.supporting_signals.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Red header — compact */}
      <div className="bg-red-600 px-5 pt-8 pb-4 text-white shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-bold tracking-widest">PAUSE</span>
          </div>
          <span className="text-xs bg-red-700/80 px-2 py-0.5 rounded-full font-medium">
            HIGH RISK · {result.risk_score}/100
          </span>
        </div>
        <h1 className="text-lg font-bold leading-snug">{result.headline}</h1>
      </div>

      {/* Amount card — compact, overlaps header */}
      <div className="mx-4 -mt-2 shrink-0">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">WILL LEAVE YOUR ACCOUNT</p>
            <p className="text-3xl font-black text-red-700 leading-none mt-0.5">{scenario.amountFormatted}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-700 leading-snug">{scenario.beneficiaryName}</p>
            <p className="text-xs text-gray-400">{scenario.beneficiaryVpa}</p>
          </div>
        </div>
      </div>

      {/* Signals — max 3, clipped single lines */}
      <div className="px-4 pt-3 shrink-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Why Pause flagged this</p>
        <div className="space-y-1.5">
          {signals.map((signal, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
              <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-xs text-red-800 leading-snug line-clamp-2">{signal}</p>
            </div>
          ))}
        </div>

        {result.amplification_rule && (
          <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
            <span className="text-sm shrink-0">⚡</span>
            <p className="text-xs text-orange-700 leading-snug">{result.amplification_rule}</p>
          </div>
        )}

        <button onClick={onDrillDown} className="mt-2 text-xs text-gray-400 underline">
          Full analysis →
        </button>
      </div>

      {/* Spacer pushes buttons to bottom */}
      <div className="flex-1" />

      {/* Action buttons — always visible, no scroll needed */}
      <div className="px-4 pb-6 pt-2 space-y-2 shrink-0">
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 active:scale-98 transition-all shadow-md shadow-red-200"
        >
          ← Go back — don&apos;t send
        </button>

        <button
          onClick={() => { if (canProceed) { setProceeding(true); setTimeout(onProceedAnyway, 300); } }}
          disabled={!canProceed}
          className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all relative overflow-hidden ${
            canProceed ? "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-98" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {!canProceed && (
            <div className="absolute inset-0 bg-gray-200 countdown-fill" style={{ transformOrigin: "left" }} />
          )}
          <span className="relative z-10">
            {canProceed
              ? proceeding ? "Opening PIN entry…" : "Proceed anyway (I understand the risk)"
              : `Proceed anyway — wait ${countdown}s`}
          </span>
        </button>

        <button
          onClick={() => { setReported(true); setTimeout(onReportFraud, 1500); }}
          className="w-full text-center text-xs text-red-500 font-medium py-1.5 hover:text-red-700 transition-colors"
        >
          🚨 Report this as fraud
        </button>
      </div>
    </div>
  );
}
