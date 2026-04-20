"use client";

import { useState } from "react";
import { Scenario, EvaluateResponse, Severity } from "@/lib/types";

interface ReasoningDrillDownProps {
  scenario: Scenario;
  result: EvaluateResponse;
  onBack: () => void;
}

const CATEGORY_META: {
  key: keyof EvaluateResponse["category_scores"];
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "transaction",
    label: "Transaction",
    icon: "💸",
    description: "Amount, velocity, patterns",
  },
  {
    key: "beneficiary",
    label: "Beneficiary",
    icon: "👤",
    description: "VPA history, account patterns",
  },
  {
    key: "device",
    label: "Device",
    icon: "📱",
    description: "Screen sharing, accessibility",
  },
  {
    key: "behavioral",
    label: "Behavioral",
    icon: "🔍",
    description: "Referral, searches, session",
  },
  {
    key: "content_intent",
    label: "Content & Intent",
    icon: "📝",
    description: "Description, mismatch signals",
  },
];

function scoreColor(score: number): string {
  if (score <= 30) return "#10B981";
  if (score <= 70) return "#F59E0B";
  return "#DC2626";
}

function scoreLabel(score: number): string {
  if (score <= 30) return "Low";
  if (score <= 70) return "Medium";
  return "High";
}

function severityBadge(severity: Severity) {
  const map = {
    GREEN: { bg: "bg-green-100", text: "text-green-700", label: "GREEN — Safe" },
    AMBER: { bg: "bg-amber-100", text: "text-amber-700", label: "AMBER — Caution" },
    RED: { bg: "bg-red-100", text: "text-red-700", label: "RED — High Risk" },
  };
  const m = map[severity];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

export default function ReasoningDrillDown({
  scenario,
  result,
  onBack,
}: ReasoningDrillDownProps) {
  const [showRaw, setShowRaw] = useState(false);

  const weights: Record<keyof EvaluateResponse["category_scores"], number> = {
    transaction: 0.25,
    beneficiary: 0.25,
    device: 0.15,
    behavioral: 0.15,
    content_intent: 0.20,
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div
        className="px-5 pt-10 pb-5 text-white"
        style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d52a0 100%)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/70 mb-4 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-5 h-5 text-white/80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h1 className="text-lg font-bold">PAUSE Analysis</h1>
        </div>
        <p className="text-sm text-white/60">
          Full fraud signal breakdown for this request
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Overall Risk Score</p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-black"
                  style={{ color: scoreColor(result.risk_score) }}
                >
                  {result.risk_score}
                </span>
                <span className="text-lg text-gray-300 font-light">/100</span>
              </div>
            </div>
            <div className="text-right">
              {severityBadge(result.severity)}
              <p className="text-xs text-gray-400 mt-2">
                {scenario.amountFormatted} to {scenario.beneficiaryName}
              </p>
            </div>
          </div>

          {/* Master score bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${result.risk_score}%`,
                background: scoreColor(result.risk_score),
              }}
            />
          </div>
        </div>

        {/* 5-category breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-4">
            Signal Category Scores
          </h2>
          <div className="space-y-4">
            {CATEGORY_META.map(({ key, label, icon, description }) => {
              const score = result.category_scores[key];
              const color = scoreColor(score);
              const weight = weights[key];

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 leading-none">
                          {label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {description} · {(weight * 100).toFixed(0)}% weight
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="text-lg font-black"
                        style={{ color }}
                      >
                        {score}
                      </span>
                      <p className="text-xs" style={{ color }}>
                        {scoreLabel(score)}
                      </p>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        background: color,
                      }}
                    />
                  </div>
                  {/* Driving factor */}
                  {result.category_labels?.[key] && (
                    <p className="text-xs text-gray-500 mt-1 ml-6 italic">
                      {result.category_labels[key]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Amplification rule */}
        {result.amplification_rule && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">⚡</span>
              <div>
                <p className="text-sm font-bold text-orange-800 mb-1">
                  Amplification Rule Triggered
                </p>
                <p className="text-xs text-orange-700 leading-relaxed">
                  {result.amplification_rule}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supporting signals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">
            All Supporting Signals
          </h2>
          <div className="space-y-2">
            {result.supporting_signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: scoreColor(result.risk_score) }}
                />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {signal}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Raw API toggle — developer view */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-100/80"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-700">Developer View — Internal Only</p>
                <p className="text-xs text-gray-400">Live Risk API · not visible to end users</p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${showRaw ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRaw && (
            <div className="px-4 pb-4 pt-3 bg-gray-50">
              {/* Disclaimer banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-3">
                <p className="text-xs font-semibold text-blue-700 mb-0.5">This API detail would not be visible to end users in production.</p>
                <p className="text-xs text-blue-600">Shown here to demonstrate the live Risk API integration with claude-sonnet-4-20250514.</p>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Request sent to Claude</p>
                <pre className="text-xs bg-gray-900 text-green-400 rounded-xl p-3 overflow-auto max-h-36 whitespace-pre-wrap font-mono">
                  {result.raw_request}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Claude&apos;s raw response</p>
                <pre className="text-xs bg-gray-900 text-blue-300 rounded-xl p-3 overflow-auto max-h-36 whitespace-pre-wrap font-mono">
                  {result.raw_response}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Padding at bottom */}
        <div className="h-4" />
      </div>
    </div>
  );
}
