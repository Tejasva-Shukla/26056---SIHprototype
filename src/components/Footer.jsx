import React from "react";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-zinc-200 bg-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-zinc-500">
      <div>
        Prototype demonstrating the index methodology on synthetic data for a limited route set. Full-scale coverage and additional analysis layers are the next phase.
      </div>
      <div className="text-xs text-zinc-400 shrink-0 font-mono">
        SIH 2026 · PS 26056
      </div>
    </footer>
  );
}
