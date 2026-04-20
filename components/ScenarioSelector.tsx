"use client";

import { useState } from "react";
import { SCENARIOS } from "@/lib/scenarios";
import { Scenario } from "@/lib/types";

interface ScenarioSelectorProps {
  selectedId: number;
  onSelect: (scenario: Scenario) => void;
}

const TIER: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "GREEN", color: "text-green-700", bg: "bg-green-100" },
  2: { label: "AMBER", color: "text-amber-700", bg: "bg-amber-100" },
  3: { label: "RED", color: "text-red-700", bg: "bg-red-100" },
  4: { label: "RED", color: "text-red-700", bg: "bg-red-100" },
  5: { label: "RED", color: "text-red-700", bg: "bg-red-100" },
};

export default function ScenarioSelector({ selectedId, onSelect }: ScenarioSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-20 right-4 z-50">
      {/* Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-10 right-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Demo Scenarios</p>
              <p className="text-xs text-gray-400 mt-0.5">Tap any scenario to load it</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-auto">
              {SCENARIOS.map((s) => {
                const tier = TIER[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => { onSelect(s); setOpen(false); }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${selectedId === s.id ? "bg-blue-50" : ""}`}
                  >
                    <span className={`mt-0.5 text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${tier.bg} ${tier.color}`}>
                      {tier.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{s.amountFormatted} · {s.beneficiaryVpa}</p>
                    </div>
                    {selectedId === s.id && (
                      <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">Live API · claude-sonnet-4-20250514</p>
            </div>
          </div>
        </>
      )}

      {/* Floating Demo pill */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-gray-800/75 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-700/80 transition-all active:scale-95"
      >
        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        Demo
      </button>
    </div>
  );
}
