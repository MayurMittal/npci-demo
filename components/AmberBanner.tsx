"use client";

import { useState } from "react";
import { Scenario, EvaluateResponse } from "@/lib/types";
import PinKeypad from "./PinKeypad";

interface AmberBannerProps {
  scenario: Scenario;
  result: EvaluateResponse;
  onBack: () => void;
  onDrillDown: () => void;
}

export default function AmberBanner({
  scenario,
  result,
  onBack,
  onDrillDown,
}: AmberBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div
        className="px-5 pt-10 pb-5 text-white"
        style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d52a0 100%)" }}
      >
        <button onClick={onBack} className="flex items-center gap-1 text-white/70 mb-4 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold">Confirm Payment</h1>
        <p className="text-sm text-white/60 mt-0.5">Enter UPI PIN to proceed</p>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-auto">
        {/* Transaction details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scenario.beneficiaryName}
              </p>
              <p className="text-xs text-gray-400">{scenario.beneficiaryVpa}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xs text-gray-400 mb-0.5">You&apos;re paying</p>
            <p className="text-2xl font-bold text-gray-900">
              {scenario.amountFormatted}
            </p>
          </div>
        </div>

        {/* AMBER Pause banner */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "#F59E0B", background: "#FFFBEB" }}
        >
          <div className="px-4 py-3">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
                style={{ background: "#F59E0B" }}
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-white text-xs font-bold tracking-wider">
                  PAUSE
                </span>
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: "#B45309" }}
              >
                Heads up
              </span>
            </div>

            {/* Headline */}
            <p
              className="text-sm font-semibold leading-snug mb-1.5"
              style={{ color: "#92400E" }}
            >
              {result.headline}
            </p>

            {/* Primary reason */}
            <p className="text-xs leading-relaxed" style={{ color: "#B45309" }}>
              {result.primary_reason}
            </p>

            {/* Expandable content */}
            {expanded && (
              <div className="mt-2.5 pt-2.5 border-t border-amber-200">
                {result.supporting_signals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span className="text-amber-400 mt-0.5 text-xs">•</span>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {signal}
                    </p>
                  </div>
                ))}
                <button
                  onClick={onDrillDown}
                  className="mt-2 text-xs font-semibold underline"
                  style={{ color: "#D97706" }}
                >
                  See full analysis →
                </button>
              </div>
            )}

            {/* Tell me more */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-semibold flex items-center gap-1"
              style={{ color: "#D97706" }}
            >
              {expanded ? "Show less" : "Tell me more"}
              <svg
                className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Keypad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-center text-gray-400 mb-3">
            You can still proceed — enter your UPI PIN
          </p>
          <PinKeypad />
        </div>
      </div>
    </div>
  );
}
