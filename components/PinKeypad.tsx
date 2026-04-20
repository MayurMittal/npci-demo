"use client";

import { useState } from "react";

interface PinKeypadProps {
  onSuccess?: () => void;
}

export default function PinKeypad({ onSuccess }: PinKeypadProps) {
  const [pin, setPin] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleKey = (key: string) => {
    if (pin.length < 6) {
      const newPin = [...pin, key];
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => {
          setSubmitted(true);
          onSuccess?.();
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-800">Payment Sent!</p>
        <p className="text-sm text-gray-500">Transaction successful</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* PIN dots */}
      <div className="flex justify-center gap-3 mb-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-150 ${
              i < pin.length ? "bg-gray-800 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map(
          (key, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (key === "⌫") handleDelete();
                else if (key !== "") handleKey(key);
              }}
              disabled={key === ""}
              className={`h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 ${
                key === ""
                  ? "cursor-default"
                  : key === "⌫"
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              {key}
            </button>
          )
        )}
      </div>
    </div>
  );
}
