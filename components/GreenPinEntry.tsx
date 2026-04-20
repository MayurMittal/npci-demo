"use client";

import { Scenario } from "@/lib/types";
import PinKeypad from "./PinKeypad";

interface GreenPinEntryProps {
  scenario: Scenario;
  onBack: () => void;
}

export default function GreenPinEntry({ scenario, onBack }: GreenPinEntryProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header — identical to any standard UPI PIN screen */}
      <div
        className="px-5 pt-10 pb-5 text-white"
        style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d52a0 100%)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/70 mb-4 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold">Confirm Payment</h1>
        <p className="text-sm text-white/60 mt-0.5">Enter UPI PIN to proceed</p>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col gap-4 overflow-auto">
        {/* Transaction details — no Pause branding anywhere */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scenario.beneficiaryName}
              </p>
              <p className="text-xs text-gray-400">{scenario.beneficiaryVpa}</p>
              {!scenario.isFirstTimeBeneficiary && (
                <p className="text-xs text-green-600 font-medium mt-0.5">
                  ✓ {scenario.previousTransactionCount} previous transactions
                </p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">You&apos;re paying</p>
            <p className="text-3xl font-bold text-gray-900">
              {scenario.amountFormatted}
            </p>
            {scenario.description && (
              <p className="text-xs text-gray-400 mt-1 italic">
                &ldquo;{scenario.description}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Keypad — no Pause mention */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <PinKeypad />
        </div>
      </div>
    </div>
  );
}
