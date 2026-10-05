import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useFilter } from "../context/FilterContext";

const NAV_ITEMS = [
  { name: "Overview", href: "/overview" },
  { name: "National / State Indices", href: "/national-state" },
  { name: "Real-time Route Analysis", href: "/route-analysis" },
];

const LEAD_TIMES = ["T+1", "T+7", "T+15", "T+30", "T+45"];

export default function Sidebar() {
  const location = useLocation();
  const { seatClass, setSeatClass, leadTime, setLeadTime } = useFilter();

  return (
    <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col shrink-0 min-h-screen text-zinc-900 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200">
        <div className="text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-600 inline-block"></span>
          Airfare Price Index
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">SIH 2026 Prototype · PS 26056</div>
      </div>

      {/* Global Filters Section */}
      <div className="p-4 border-b border-zinc-200 space-y-4">
        <div className="text-xs font-semibold text-zinc-700 uppercase tracking-wider text-[11px]">Filters</div>
        
        {/* Seat Class Filter */}
        <div>
          <div className="text-xs text-zinc-500 mb-1.5">Seat class</div>
          <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-0.5 border border-zinc-200">
            <button
              onClick={() => setSeatClass("economy")}
              className={`py-1 text-xs transition-colors font-medium ${
                seatClass === "economy"
                  ? "bg-white text-zinc-900 font-semibold shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Economy
            </button>
            <button
              onClick={() => setSeatClass("business")}
              className={`py-1 text-xs transition-colors font-medium ${
                seatClass === "business"
                  ? "bg-white text-zinc-900 font-semibold shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Business
            </button>
          </div>
        </div>

        {/* Lead Time Filter */}
        <div>
          <div className="text-xs text-zinc-500 mb-1.5">Lead time</div>
          <div className="grid grid-cols-5 gap-0.5 bg-zinc-100 p-0.5 border border-zinc-200">
            {LEAD_TIMES.map((lt) => {
              const isActive = leadTime === lt;
              return (
                <button
                  key={lt}
                  onClick={() => setLeadTime(lt)}
                  className={`py-1 text-xs font-mono transition-colors text-center ${
                    isActive
                      ? "bg-white text-blue-700 font-bold shadow-sm border border-zinc-200"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {lt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="text-xs font-semibold text-zinc-500 px-2 py-1 uppercase tracking-wider text-[11px]">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href === "/route-analysis" && location.pathname === "/");

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`block px-3 py-2 text-xs transition-colors border-l-2 ${
                isActive
                  ? "bg-blue-50/70 text-blue-800 font-semibold border-blue-700"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-transparent"
              }`}
            >
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info in Sidebar */}
      <div className="p-3 border-t border-zinc-200 text-[11px] text-zinc-400 font-mono">
        <div>Base 2024 = 100.0</div>
        <div>MoSPI CPI Augmentation</div>
      </div>
    </aside>
  );
}
