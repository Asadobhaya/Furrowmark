"use client";

import { useState } from "react";

interface QuantityStepperProps {
  initialValue?: number;
  min?: number;
  max?: number;
  name?: string;
  onChange?: (val: number) => void;
}

export function QuantityStepper({
  initialValue = 1,
  min = 1,
  max = 99,
  name = "quantity",
  onChange,
}: QuantityStepperProps) {
  const [qty, setQty] = useState(initialValue);

  const update = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal));
    setQty(clamped);
    if (onChange) onChange(clamped);
  };

  return (
    <div className="inline-flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => update(qty - 1)}
        disabled={qty <= min}
        className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-emerald-900 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none transition select-none text-base font-bold"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <input
        type="number"
        name={name}
        id={name}
        value={qty}
        min={min}
        max={max}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          update(isNaN(parsed) ? min : parsed);
        }}
        className="w-12 text-center text-sm font-bold text-gray-900 border-x border-gray-200 py-2.5 focus:outline-none"
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={() => update(qty + 1)}
        disabled={qty >= max}
        className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-emerald-900 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:pointer-events-none transition select-none text-base font-bold"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
