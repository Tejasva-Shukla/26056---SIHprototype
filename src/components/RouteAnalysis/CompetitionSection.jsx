import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

const formatRs = (num) => "₹" + Math.round(num).toLocaleString("en-IN");

function getCvDetails(cv) {
  if (cv === 0) {
    return {
      label: "Monopoly",
      sentence: "Only one airline flies this route. High risk of price exploitation.",
      color: "text-red-600",
      bgCol: "bg-red-600",
      lightBg: "bg-red-100",
      pill: "bg-red-100 text-red-700 border-red-200",
    };
  }
  if (cv < 2) {
    return {
      label: "Shadow pricing",
      sentence: "Several airlines fly this route but their prices are almost identical. Comparing is unlikely to save much.",
      color: "text-amber-500",
      bgCol: "bg-amber-500",
      lightBg: "bg-amber-100",
      pill: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }
  if (cv >= 2 && cv <= 5) {
    return {
      label: "Moderate competition", // TODO: confirm 2-5% band label
      sentence: "Prices are fairly close across airlines.",
      color: "text-teal-600",
      bgCol: "bg-teal-600",
      lightBg: "bg-teal-100",
      pill: "bg-teal-100 text-teal-700 border-teal-200",
    };
  }
  if (cv > 5 && cv <= 15) {
    return {
      label: "Healthy competition",
      sentence: "Standard market spread. Airlines are offering different tiers of value.",
      color: "text-green-600",
      bgCol: "bg-green-600",
      lightBg: "bg-green-100",
      pill: "bg-green-100 text-green-700 border-green-200",
    };
  }
  return {
    label: "Active price war",
    sentence: "One airline is aggressively undercutting the market. Prices differ a lot, so comparing flights is worthwhile.",
    color: "text-purple-600",
    bgCol: "bg-purple-600",
    lightBg: "bg-purple-100",
    pill: "bg-purple-100 text-purple-700 border-purple-200",
  };
}

export default function CompetitionSection({ windowIndex, route }) {
  const [showModal, setShowModal] = useState(false);

  const cv = windowIndex.cv;
  const cvDetails = getCvDetails(cv);

  // SVG Gauge Calculations
  const gaugeMax = 20;
  const r = 90;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * r;
  const halfCirc = Math.PI * r; // 282.74

  // Segments (lengths on half circle)
  // shadow: 0-2 (10%) = 28.27
  // moderate: 2-5 (15%) = 42.41
  // healthy: 5-15 (50%) = 141.37
  // price war: 15-20 (25%) = 70.69
  const lenShadow = 28.27;
  const lenMod = 42.41;
  const lenHealthy = 141.37;
  const lenWar = 70.69;

  // Angles for transform rotation
  const rotShadow = 180;
  const rotMod = rotShadow + 18;
  const rotHealthy = rotMod + 27;
  const rotWar = rotHealthy + 90;

  const needleRatio = Math.min(1, Math.max(0, cv / gaugeMax));
  const needleRotation = -90 + (needleRatio * 180);

  const airlines = windowIndex.airlineBreakdown;
  const minFare = Math.min(...airlines.map((a) => a.lowestFare));
  const audit = windowIndex.outlierAudit;

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Route competition analysis
              <div className="text-xs text-slate-500 font-normal mt-0.5">Coefficient of variation across carrier fare distributions</div>
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 px-3 py-1.5 text-xs font-medium transition-colors shadow-sm rounded-md whitespace-nowrap"
            >
              Analyse flights
            </button>
          </div>

          {/* 4a CV HERO BLOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* LEFT: Gauge */}
            <div className="flex flex-col items-center justify-center relative">
              <svg width="220" height="125" viewBox="0 0 220 125" className="overflow-visible">
                {/* Background Arc */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E3E8EF" strokeWidth="16" strokeDasharray={`${halfCirc} 1000`} transform="rotate(180 110 110)" />
                
                {/* Color Bands */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray={`${lenShadow} 1000`} transform={`rotate(${rotShadow} 110 110)`} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0891B2" strokeWidth="16" strokeDasharray={`${lenMod} 1000`} transform={`rotate(${rotMod} 110 110)`} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16A34A" strokeWidth="16" strokeDasharray={`${lenHealthy} 1000`} transform={`rotate(${rotHealthy} 110 110)`} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7C3AED" strokeWidth="16" strokeDasharray={`${lenWar} 1000`} transform={`rotate(${rotWar} 110 110)`} />
                
                {/* Needle */}
                <polygon points={`${cx-5},${cy} ${cx+5},${cy} ${cx},${cy-r-8}`} fill="#0F172A" transform={`rotate(${needleRotation} 110 110)`} />
                <circle cx={cx} cy={cy} r="7" fill="#0F172A" />
                
                {/* CV Hero Value inside gauge */}
                <text x={cx} y={cy - 20} textAnchor="middle" fontSize="48" fontWeight="bold" className={`font-mono ${cvDetails.color}`}>
                  {cv}%
                </text>
                <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#64748B" className="font-sans">
                  CV (coefficient of variation)
                </text>
              </svg>
              
              {/* Legend Dots */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 flex-wrap justify-center font-mono w-full">
                <span className={`flex items-center gap-1 ${cv === 0 ? "font-bold text-slate-900" : ""}`}><span className="w-2 h-2 rounded-full bg-red-600"></span>0%</span>
                <span className={`flex items-center gap-1 ${cv > 0 && cv < 2 ? "font-bold text-slate-900" : ""}`}><span className="w-2 h-2 rounded-full bg-amber-500"></span>&lt;2%</span>
                <span className={`flex items-center gap-1 ${cv >= 2 && cv <= 5 ? "font-bold text-slate-900" : ""}`}><span className="w-2 h-2 rounded-full bg-teal-600"></span>2-5%</span>
                <span className={`flex items-center gap-1 ${cv > 5 && cv <= 15 ? "font-bold text-slate-900" : ""}`}><span className="w-2 h-2 rounded-full bg-green-600"></span>5-15%</span>
                <span className={`flex items-center gap-1 ${cv > 15 ? "font-bold text-slate-900" : ""}`}><span className="w-2 h-2 rounded-full bg-purple-600"></span>&gt;15%</span>
              </div>
            </div>

            {/* RIGHT: Status Text */}
            <div className="flex flex-col justify-center">
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${cvDetails.pill}`}>
                  {cvDetails.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                <strong className="text-slate-900">What this index represents:</strong> CV measures how widely airline fares differ on this route (spread of fares relative to their average). Low CV = airlines price alike, high CV = large price differences between airlines.
              </p>
              <p className="text-sm font-medium text-slate-900 mb-4 border-l-2 pl-3 border-slate-300">
                {cvDetails.sentence}
              </p>
              <div className="flex gap-2">
                <span className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded-sm font-mono">Lowest: {formatRs(windowIndex.cheapestFare)}</span>
                <span className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded-sm font-mono">Flights observed: {audit.totalObserved}</span>
              </div>
            </div>
          </div>

          {/* 4b CHEAPEST FLIGHTS STRIP */}
          <div className="mb-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-3">Cheapest flight by airline:</div>
            <div className="flex flex-wrap gap-2">
              {airlines.map((airline) => {
                const isCheapestOverall = airline.lowestFare === minFare;
                return (
                  <div
                    key={airline.code}
                    className={`p-2 rounded-md border text-xs flex-1 min-w-[120px] transition-colors ${
                      isCheapestOverall
                        ? "bg-green-100/50 border-green-300 shadow-xs"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 truncate">
                        {airline.name}
                      </span>
                      {isCheapestOverall && (
                        <span className="text-[9px] font-bold uppercase bg-green-600 text-white px-1.5 py-0.5 rounded-sm">
                          Cheapest
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Fare:</span>
                      <span className={`font-mono font-bold ${isCheapestOverall ? "text-green-700 text-sm" : "text-slate-900"}`}>
                        {formatRs(airline.lowestFare)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competition Table */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200">
            <div className="col-span-4">Airline</div>
            <div className="col-span-2 text-right">Lowest fare</div>
            <div className="col-span-2 text-right">Average fare</div>
            <div className="col-span-2 text-right">Seat share</div>
            <div className="col-span-2 text-right">Carrier APIx</div>
          </div>

          <div className="divide-y divide-slate-100 my-1">
            {airlines.map((item) => {
              const isCheapestRow = item.lowestFare === minFare;
              return (
                <div
                  key={item.code}
                  className={`grid grid-cols-12 gap-2 items-center py-2.5 px-1.5 text-xs transition-colors rounded-sm ${
                    isCheapestRow
                      ? "bg-green-50"
                      : "text-slate-800"
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                    <span className={`font-semibold truncate ${isCheapestRow ? "text-green-900" : ""}`}>
                      {item.name} ({item.code})
                    </span>
                    {isCheapestRow && (
                      <span className="bg-green-100 text-green-800 border border-green-200 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        Cheapest
                      </span>
                    )}
                  </div>
                  <div className={`col-span-2 text-right font-mono ${isCheapestRow ? "font-bold text-green-700" : "text-slate-900"}`}>
                    {formatRs(item.lowestFare)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-700">
                    {formatRs(item.avgFare)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-600 flex items-center justify-end gap-1.5">
                    <span>{item.seatSharePct}%</span>
                    <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden inline-block">
                      <div className={`h-full ${isCheapestRow ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${Math.min(100, item.seatSharePct * 2)}%` }}></div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-mono font-semibold text-slate-900">
                    {item.carrierApix.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Analyse flights */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-300 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl text-slate-900">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Analyse flights · Carrier yield inspection
                  </h3>
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200">
                    {windowIndex.window}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Corridor {route.label} ({route.code})
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Cheapest flight per airline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-3">Cheapest flight by airline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {airlines.map((airline) => {
                    const isCheapestCard = airline.lowestFare === minFare;
                    return (
                      <div key={airline.code} className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                          isCheapestCard ? "bg-green-50 border-green-300 ring-1 ring-green-500" : "bg-slate-50 border-slate-200"
                        }`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{airline.name} ({airline.code})</span>
                            {isCheapestCard && <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-sm">Lowest</span>}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 font-mono">
                            {airline.flightCount} daily flights · {airline.seatSharePct}% seat share
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-mono font-bold ${isCheapestCard ? "text-green-700" : "text-slate-900"}`}>
                            {formatRs(airline.lowestFare)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Avg: {formatRs(airline.avgFare)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Outlier Filter Summary */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white text-xs shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900">Step 1 outlier filter summary</span>
                  <span className="font-mono text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded-md">
                    Peer median: <strong className="text-slate-900">{formatRs(audit.peerMedian)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-3 bg-slate-50 rounded-lg border border-slate-200 mb-3">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Total observed</div>
                    <div className="text-sm font-bold font-mono text-slate-900">{audit.totalObserved}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Valid in index</div>
                    <div className="text-sm font-bold font-mono text-slate-900">{audit.totalObserved - audit.droppedCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Dropped outliers</div>
                    <div className="text-sm font-bold font-mono text-red-600">{audit.droppedCount}</div>
                  </div>
                </div>

                {/* Filter Rules definition */}
                <div className="text-xs text-slate-600 space-y-1.5 font-sans bg-blue-50/50 p-3 rounded-md border border-blue-100">
                  <div>• <strong>Rule 1 (Peer median deviation):</strong> Fares deviating &gt; 40% ({formatRs(Math.round(0.6 * audit.peerMedian))} to {formatRs(Math.round(1.4 * audit.peerMedian))}) are discarded.</div>
                  <div>• <strong>Rule 2 (Absolute ceiling):</strong> Any observation &gt; ₹40,000 dropped instantly.</div>
                </div>

                {/* Rejected observations list */}
                {audit.droppedObservations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>Rejected observations:</span>
                    </div>
                    <div className="space-y-2">
                      {audit.droppedObservations.map((flight) => {
                        const isCeiling = flight.outlierReason === "ceiling_gt_40k";
                        const ruleText = isCeiling
                          ? "Rule 2: > ₹40,000 ceiling limit"
                          : "Rule 1: > 40% peer median deviation";

                        return (
                          <div key={flight.flightNo} className="flex flex-wrap items-center justify-between gap-2 text-xs bg-red-50 px-3 py-2 rounded-md border border-red-200 text-slate-800">
                            <span className="font-mono"><strong>{flight.flightNo}</strong> ({airlineName})</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-red-700">{formatRs(flight.fare)}</span>
                              <span className="text-[10px] font-mono font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200 whitespace-nowrap">
                                {ruleText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
