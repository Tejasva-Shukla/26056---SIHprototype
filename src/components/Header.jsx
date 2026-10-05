import React from "react";
import { useFilter } from "../context/FilterContext";

export default function Header() {
  const { seatClass, leadTime } = useFilter();
  const seatLabel = seatClass.charAt(0).toUpperCase() + seatClass.slice(1);

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
            APIx Prototype — SIH 2026, PS 26056
          </h1>
          <span className="text-xs text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-none font-mono">
            Base 2024 = 100
          </span>
          <span className="text-xs text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-none font-mono">
            {seatLabel} · {leadTime}
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          Airfare Price Index Prototype · Ministry of Statistics &amp; Programme Implementation (MoSPI)
        </p>
      </div>
      <div className="flex items-center gap-2 self-start md:self-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Ingestion Simulation
        </span>
      </div>
    </header>
  );
}
