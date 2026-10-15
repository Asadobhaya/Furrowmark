"use client";

import { useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  textToCopy,
  label = "Copy",
  className = "text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label={`Copy ${label}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
