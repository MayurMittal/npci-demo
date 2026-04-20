"use client";

import { useState, useCallback } from "react";
import { SCENARIOS } from "@/lib/scenarios";
import { Scenario, EvaluateResponse, AppScreen } from "@/lib/types";
import UpiHome from "@/components/UpiHome";
import LoadingScreen from "@/components/LoadingScreen";
import GreenPinEntry from "@/components/GreenPinEntry";
import GreenInterstitial from "@/components/GreenInterstitial";
import AmberBanner from "@/components/AmberBanner";
import RedOverlay from "@/components/RedOverlay";
import ReasoningDrillDown from "@/components/ReasoningDrillDown";
import ScenarioSelector from "@/components/ScenarioSelector";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [screen, setScreen] = useState<AppScreen>("home");
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interceptionType, setInterceptionType] = useState<"green" | "amber" | "red" | null>(null);

  const handleSelectScenario = useCallback((s: Scenario) => {
    setSelectedScenario(s);
    setScreen("home");
    setResult(null);
    setError(null);
    setInterceptionType(null);
  }, []);

  const handleOpenRequest = useCallback(async () => {
    setScreen("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: selectedScenario }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Classification failed");
      }

      const data: EvaluateResponse = await res.json();
      setResult(data);

      if (data.severity === "GREEN") {
        setInterceptionType("green");
        setScreen("green-note"); // show demo interstitial before PIN
      } else if (data.severity === "AMBER") {
        setInterceptionType("amber");
        setScreen("interception");
      } else {
        setInterceptionType("red");
        setScreen("interception");
      }
    } catch (err) {
      setError(String(err));
      setScreen("home");
    }
  }, [selectedScenario]);

  const handleGreenNoteDismiss = useCallback(() => {
    setScreen("interception");
  }, []);

  const handleBack = useCallback(() => {
    setScreen("home");
    setInterceptionType(null);
  }, []);

  const handleDrillDown = useCallback(() => {
    setScreen("drilldown");
  }, []);

  const handleBackFromDrillDown = useCallback(() => {
    setScreen("interception");
  }, []);

  const handleProceedAnyway = useCallback(() => {
    setInterceptionType("green");
  }, []);

  const handleReportFraud = useCallback(() => {
    setTimeout(() => {
      setScreen("home");
      setInterceptionType(null);
    }, 2000);
  }, []);

  const statusBarColor =
    screen === "interception" && interceptionType === "red" ? "#fff" : "#1a1a1a";

  // Determine transition direction for each screen
  const screenClass = (name: AppScreen | "green-note") => {
    if (screen === name) return "opacity-100 translate-x-0";
    // screens to the left of current slide out left
    const order: (AppScreen | "green-note")[] = ["home", "loading", "green-note", "interception", "drilldown"];
    const cur = order.indexOf(screen);
    const tgt = order.indexOf(name);
    return tgt < cur
      ? "opacity-0 -translate-x-10 pointer-events-none"
      : "opacity-0 translate-x-10 pointer-events-none";
  };

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Phone frame */}
      <div
        className="relative w-full bg-white overflow-hidden"
        style={{
          maxWidth: "390px",
          height: "844px",
          borderRadius: "44px",
          boxShadow: "0 0 0 10px #1a1a1a, 0 0 0 12px #333, 0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-0 text-xs font-semibold absolute top-0 left-0 right-0 z-50 transition-colors duration-300"
          style={{ color: statusBarColor }}
        >
          <span>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-5 rounded-full" style={{ background: "#1a1a1a" }} />
          <div className="flex items-center gap-1.5 text-xs">
            <span>5G</span>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
            </svg>
            <svg className="w-4 h-2.5" fill="currentColor" viewBox="0 0 24 12">
              <rect x="0" y="0" width="20" height="12" rx="2" fill="currentColor" opacity="0.3" />
              <rect x="0" y="0" width="14" height="12" rx="2" fill="currentColor" />
              <rect x="21" y="3" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* All screens */}
        <div className="absolute inset-0 pt-9 overflow-hidden">

          {/* Screen: Home */}
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${screenClass("home")}`}>
            <UpiHome
              selectedScenario={selectedScenario}
              onOpenRequest={handleOpenRequest}
            />
            {error && (
              <div className="absolute bottom-24 left-4 right-4 bg-red-100 border border-red-300 text-red-700 text-xs rounded-2xl px-4 py-3 z-50 shadow-lg">
                <p className="font-bold mb-0.5">API Error</p>
                <p>{error}</p>
                <p className="mt-1 text-red-500">Check that ANTHROPIC_API_KEY is set in .env.local</p>
              </div>
            )}
          </div>

          {/* Screen: Loading */}
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${screenClass("loading")}`}>
            <LoadingScreen scenario={selectedScenario} />
          </div>

          {/* Screen: Green demo interstitial */}
          <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${screenClass("green-note")}`}>
            {screen === "green-note" && (
              <GreenInterstitial onDismiss={handleGreenNoteDismiss} />
            )}
          </div>

          {/* Screen: Interception (green/amber/red) */}
          {result && (
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${screenClass("interception")}`}>
              {interceptionType === "green" && (
                <GreenPinEntry scenario={selectedScenario} onBack={handleBack} />
              )}
              {interceptionType === "amber" && (
                <AmberBanner
                  scenario={selectedScenario}
                  result={result}
                  onBack={handleBack}
                  onDrillDown={handleDrillDown}
                />
              )}
              {interceptionType === "red" && (
                <RedOverlay
                  scenario={selectedScenario}
                  result={result}
                  onBack={handleBack}
                  onDrillDown={handleDrillDown}
                  onProceedAnyway={handleProceedAnyway}
                  onReportFraud={handleReportFraud}
                />
              )}
            </div>
          )}

          {/* Screen: Drill-down */}
          {result && (
            <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${screenClass("drilldown")}`}>
              <ReasoningDrillDown
                scenario={selectedScenario}
                result={result}
                onBack={handleBackFromDrillDown}
              />
            </div>
          )}
        </div>

        {/* Floating Demo selector — always on top, visible on all screens */}
        <ScenarioSelector
          selectedId={selectedScenario.id}
          onSelect={handleSelectScenario}
        />
      </div>
    </main>
  );
}
