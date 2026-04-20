"use client";

import { useEffect } from "react";

interface GreenInterstitialProps {
  onDismiss: () => void;
}

export default function GreenInterstitial({ onDismiss }: GreenInterstitialProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
      {/* Invisible Pause icon */}
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div
        className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm max-w-xs text-center cursor-pointer"
        onClick={onDismiss}
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Demo Note</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          In production, Pause would <strong>skip this API call</strong> entirely — Raju Kirana Store is a known beneficiary with a normal amount.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          The API is called here so you can see the full flow. The PIN screen ahead has zero Pause elements.
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-ping" />
          <p className="text-xs text-gray-400">Auto-continuing in 3s · tap to skip</p>
        </div>
      </div>
    </div>
  );
}
