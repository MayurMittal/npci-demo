"use client";

import { RECENT_TRANSACTIONS } from "@/lib/scenarios";
import { Scenario } from "@/lib/types";

interface UpiHomeProps {
  selectedScenario: Scenario;
  onOpenRequest: () => void;
}

export default function UpiHome({ selectedScenario, onOpenRequest }: UpiHomeProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header — no balance shown (privacy, per PSP conventions) */}
      <div
        className="px-5 pt-10 pb-5 text-white"
        style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d52a0 100%)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              R
            </div>
            <div>
              <p className="text-xs text-white/60">Good morning</p>
              <p className="text-base font-semibold">Rahul Verma</p>
              <p className="text-xs text-white/50">rahul.v@oksbi</p>
            </div>
          </div>
          {/* Notification bell */}
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center relative">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Quick actions — 3 only (Request/P2P collect removed per NPCI Oct 2025) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Scan & Pay */}
          <button className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl py-3.5 hover:bg-white/20 transition-colors">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              {/* QR code scan icon — square with corner markers */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="5" height="5" rx="0.5" />
                <rect x="16" y="3" width="5" height="5" rx="0.5" />
                <rect x="3" y="16" width="5" height="5" rx="0.5" />
                <line x1="10" y1="4" x2="10" y2="4" />
                <path d="M10 4h1M4 10v1M9 10h1v1M14 3v2M14 8h2v2M11 11h2M16 11v2M11 14h1v1M14 14h1M16 16v2M19 14v1M10 16v1M10 19h1M13 19h1v1M16 19h3" />
                <path d="M4 4h1v1H4zM17 4h1v1h-1zM4 17h1v1H4z" fill="currentColor" stroke="none" />
                <line x1="10" y1="10" x2="14" y2="10" strokeWidth={1.5} />
                <line x1="10" y1="14" x2="10" y2="18" strokeWidth={1.5} />
                <line x1="14" y1="14" x2="18" y2="14" strokeWidth={1.5} />
                <line x1="18" y1="10" x2="18" y2="14" strokeWidth={1.5} />
              </svg>
            </div>
            <span className="text-xs text-white/85 font-medium">Scan & Pay</span>
          </button>

          {/* Pay Contact */}
          <button className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl py-3.5 hover:bg-white/20 transition-colors">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-white/85 font-medium">Pay Contact</span>
          </button>

          {/* Check Balance */}
          <button className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl py-3.5 hover:bg-white/20 transition-colors">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-white/85 font-medium">Check Balance</span>
          </button>
        </div>
      </div>

      {/* Pending Collect Request banner */}
      <div className="mx-4 -mt-3 z-10">
        <button
          onClick={onOpenRequest}
          className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center justify-between hover:shadow-xl transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Pending Collect Request</p>
              <p className="text-xs text-gray-500">
                {selectedScenario.beneficiaryName} ·{" "}
                <span className="font-semibold text-gray-700">{selectedScenario.amountFormatted}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              Review
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="flex-1 px-4 mt-5 overflow-auto">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
          Recent
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {RECENT_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center px-4 py-3 gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                {tx.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.name}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <p className={`text-sm font-semibold shrink-0 ${tx.amount > 0 ? "text-green-600" : "text-gray-800"}`}>
                {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-100 bg-white px-2 py-1.5 flex justify-around">
        {[
          { icon: "🏠", label: "Home", active: true },
          { icon: "📊", label: "History", active: false },
          { icon: "💳", label: "Cards", active: false },
          { icon: "👤", label: "Profile", active: false },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl ${item.active ? "text-blue-600" : "text-gray-400"}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
