import React, { useState } from "react";
import {
  FESTIVAL_MODERATE_THRESHOLD,
  FESTIVAL_HIGH_THRESHOLD,
  DEMO_FESTIVAL_SHARE_BY_WINDOW,
  LEAD_TIME_WINDOWS,
} from "../../data/mockData";
import { Info } from "lucide-react";

const formatRs = (num) => "₹" + Math.round(num).toLocaleString("en-IN");

export default function KpiCards({ windowIndex, directional, activeWindow, routeCode }) {
  const [showFestivalInfo, setShowFestivalInfo] = useState(false);

  const diffPct = windowIndex.diffFromBasePct;
  const isPositiveDiff = diffPct >= 0;
  const cv = windowIndex.cv;

  // Competition label
  let compLabel = "Healthy competition";
  let cvColor = "border-t-green-600";
  if (cv === 0) {
    compLabel = "Monopoly route";
    cvColor = "border-t-red-600";
  } else if (cv < 2) {
    compLabel = "Shadow pricing";
    cvColor = "border-t-amber-500";
  } else if (cv >= 2 && cv <= 5) {
    compLabel = "Moderate competition";
    cvColor = "border-t-teal-600";
  } else if (cv > 5 && cv <= 15) {
    compLabel = "Healthy competition";
    cvColor = "border-t-green-600";
  } else if (cv > 15) {
    compLabel = "Active price war";
    cvColor = "border-t-purple-600";
  }

  // Festival KPI calculations
  const fsi = windowIndex.festivalSharePct;
  let festivalNumberColor = "text-slate-500"; // 0%
  if (fsi > 0) {
    if (fsi >= FESTIVAL_HIGH_THRESHOLD) {
      festivalNumberColor = "text-red-600";
    } else if (fsi >= FESTIVAL_MODERATE_THRESHOLD) {
      festivalNumberColor = "text-amber-500";
    } else {
      festivalNumberColor = "text-amber-500"; // Just use amber or green if low, wait, instructions say: grey at 0%, amber for moderate, red for high. What if < moderate? The instruction says: "grey at 0%, amber for moderate, red for high (thresholds as constants)". Let's use amber for >0 and < moderate, or maybe just slate-500 for 0, amber-500 for < high, red-600 for >= high. The old code used emerald for low. Let's just follow amber/red.
    }
  }

  const festivalBarPct = Math.min(100, Math.max(0, fsi));
  const normalBarPct = Math.max(0, 100 - festivalBarPct);

  const outboundFare = directional.outboundFares[activeWindow];
  const inboundFare = directional.inboundFares[activeWindow];
  const asymmetrySpread = (directional.asymmetryIndexPct / 100).toFixed(2);

  const demoShares = DEMO_FESTIVAL_SHARE_BY_WINDOW[routeCode] || DEMO_FESTIVAL_SHARE_BY_WINDOW["default"];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      {/* 1. APIx Price Index Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm border-t-4 border-t-blue-600">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>APIx price index ({activeWindow})</span>
          <span className="font-mono text-slate-400 text-xs">Base 2024 = 100</span>
        </div>
        <div className="my-3 flex items-baseline gap-3">
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {windowIndex.capacityWeightedJevons.toFixed(1)}
          </div>
          <div
            className={`text-xs font-semibold font-mono ${
              isPositiveDiff ? "text-red-600" : "text-green-600"
            }`}
          >
            {isPositiveDiff ? "▲ +" : "▼ "}
            {diffPct}%
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
          Unweighted: {windowIndex.unweightedJevons.toFixed(1)} pts · Base: {formatRs(windowIndex.baseFareP0)}
        </div>
      </div>

      {/* 2. Market Health & Competition Card */}
      <div className={`bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm border-t-4 ${cvColor}`}>
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Market health &amp; competition</span>
          <span className="font-mono text-slate-400 text-xs">Dispersion</span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            CV {cv}%
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span className="font-medium text-slate-700">{compLabel}</span>
          <span className="font-mono text-slate-600">
            Lowest: {formatRs(windowIndex.cheapestFare)}
          </span>
        </div>
      </div>

      {/* 3. Festival Demand Share Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm border-t-4 border-t-amber-500 relative">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Festival demand share</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-xs font-mono">T+60 ref</span>
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowFestivalInfo(true)}
                onMouseLeave={() => setShowFestivalInfo(false)}
                onClick={() => setShowFestivalInfo(!showFestivalInfo)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showFestivalInfo && (
                <div className="absolute right-0 bottom-6 z-50 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded shadow-lg leading-relaxed">
                  Measured against a ghost booking window starting at T+60 that is free of festivals (from festival.json), using weekly-updated decay ratios.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="my-3">
          <div className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${festivalNumberColor}`}>
            {fsi > 0 ? `${fsi.toFixed(1)}%` : "0.0%"}
          </div>
          <div className="w-full h-1 bg-slate-100 overflow-hidden flex mt-2">
            {fsi === 0 ? (
              <div className="w-full h-full bg-slate-200"></div>
            ) : (
              <>
                <div className="h-full bg-amber-500" style={{ width: `${festivalBarPct}%` }}></div>
                <div className="h-full bg-blue-600/30" style={{ width: `${normalBarPct}%` }}></div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-3">
          {LEAD_TIME_WINDOWS.map((win) => {
            const val = demoShares[win] || 0;
            const isZero = val === 0;
            const bgClass = isZero ? "bg-slate-100 text-slate-500" : (val >= FESTIVAL_HIGH_THRESHOLD ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700");
            const activeClass = win === activeWindow ? "ring-1 ring-slate-900 ring-offset-1" : "";
            return (
              <div key={win} className={`flex-1 text-center py-1 rounded-sm text-[10px] font-mono font-medium ${bgClass} ${activeClass}`}>
                {val}%
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
          {fsi > 0 ? (
            <span className="text-slate-700 leading-tight block">
              This fare is {fsi.toFixed(1)}% higher than the normal market expectations due to festival.
            </span>
          ) : (
            <span className="leading-tight block">No festival overlap for this travel date.</span>
          )}
        </div>
      </div>

      {/* 4. Directional Asymmetry Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm border-t-4 border-t-orange-600">
        <div className="flex items-center justify-between text-slate-500 text-xs">
          <span>Directional asymmetry</span>
          <span className="font-mono text-slate-400 text-xs">Outbound vs inbound</span>
        </div>
        <div className="my-3 flex items-baseline gap-2">
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {directional.asymmetryIndexPct.toFixed(1)}%
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span className="font-medium text-slate-700 font-mono">
            {asymmetrySpread}x spread
          </span>
          <span className="font-mono text-slate-600">
            Out: {formatRs(outboundFare)} · Ret: {formatRs(inboundFare)}
          </span>
        </div>
      </div>
    </div>
  );
}
