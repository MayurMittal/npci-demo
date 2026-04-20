"use client";

import { Scenario } from "@/lib/types";

interface LoadingScreenProps {
  scenario: Scenario;
}

export default function LoadingScreen({ scenario }: LoadingScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
      {/* Pause shield animation */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
          <svg
            className="w-10 h-10 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Analyzing request...
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Pause is checking this payment for fraud signals
        </p>

        {/* Transaction preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-base">👤</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scenario.beneficiaryName}
              </p>
              <p className="text-xs text-gray-400">{scenario.beneficiaryVpa}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Amount requested</p>
            <p className="text-2xl font-bold text-gray-800">
              {scenario.amountFormatted}
            </p>
          </div>
          {scenario.description && (
            <p className="text-xs text-gray-400 mt-3 text-center italic">
              &ldquo;{scenario.description}&rdquo;
            </p>
          )}
        </div>

        {/* Dots loader */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Running 5-category fraud analysis
        </p>
      </div>
    </div>
  );
}
