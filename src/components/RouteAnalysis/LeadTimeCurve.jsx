import React, { useState } from "react";

const formatRs = (num) => "₹" + Math.round(num).toLocaleString("en-IN");

const GAP_MODERATE_THRESHOLD = 10;
const GAP_HIGH_THRESHOLD = 25;

export default function LeadTimeCurve({ windowsData, activeWindow, onSelectWindow }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const windows = ["T+45", "T+30", "T+15", "T+7", "T+1"];
  const p0Fares = windows.map((w) => windowsData[w].baseFareP0);
  const ptFares = windows.map((w) => {
    const apix = windowsData[w].capacityWeightedJevons;
    return Math.round((windowsData[w].baseFareP0 * apix) / 100);
  });

  const allFares = [...p0Fares, ...ptFares];
  const minFare = 0.90 * Math.min(...allFares);
  const maxFare = 1.10 * Math.max(...allFares);

  const svgWidth = 740;
  const svgHeight = 260;
  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index) => paddingLeft + (index / (windows.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - ((val - minFare) / (maxFare - minFare)) * chartHeight;

  // Path strings
  const p0Path = p0Fares
    .map((val, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`)
    .join(" ");

  const ptPath = ptFares
    .map((val, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`)
    .join(" ");

  // Shaded polygon between Pt and P0
  const shadedPolygonPath =
    ptFares.map((val, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx).toFixed(1)} ${getY(val).toFixed(1)}`).join(" ") +
    " " +
    [...p0Fares]
      .reverse()
      .map((val, idx) => `L ${getX(windows.length - 1 - idx).toFixed(1)} ${getY(val).toFixed(1)}`)
      .join(" ") +
    " Z";

  // Y-axis tick values (5 steps)
  const yTicks = Array.from({ length: 5 }, (_, idx) => minFare + ((maxFare - minFare) * idx) / 4);

  const activeIdx = windows.indexOf(activeWindow);
  const activeP0 = p0Fares[activeIdx];
  const activePt = ptFares[activeIdx];
  const activeGapPct = Math.round(((activePt - activeP0) / activeP0) * 100);
  const activeGapRs = activePt - activeP0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative h-full">
      {/* Title & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Lead-time elasticity &amp; dynamic pricing curve
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            2024 seasonal baseline (P0) vs real-time capacity-weighted yield (Pt)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3.5 h-1 bg-[#2563EB] inline-block rounded-xs"></span>
            <span className="font-medium">2024 Base (P0)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3.5 h-1 bg-[#EA580C] inline-block rounded-xs"></span>
            <span className="font-medium">Current Pt</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 bg-[#EA580C]/15 border border-[#EA580C]/40 inline-block"></span>
            <span>Elasticity Gap</span>
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto py-1 relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[560px] h-auto overflow-visible select-none"
        >
          {/* Horizontal Gridlines */}
          {yTicks.map((val, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                x2={svgWidth - paddingRight}
                y1={getY(val)}
                y2={getY(val)}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={getY(val) + 3}
                textAnchor="end"
                fontSize="10"
                fill="#64748B"
                className="font-mono"
              >
                ₹{Math.round(val).toLocaleString("en-IN")}
              </text>
            </g>
          ))}

          {/* Vertical Guide Line for Active Window */}
          <line
            x1={getX(activeIdx)}
            x2={getX(activeIdx)}
            y1={paddingTop - 10}
            y2={paddingTop + chartHeight}
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Shaded Area between Pt and P0 */}
          <path d={shadedPolygonPath} fill="rgba(234, 88, 12, 0.12)" />

          {/* P0 Line (Blue #2563EB) */}
          <path
            d={p0Path}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Pt Line (Orange-Red #EA580C) */}
          <path
            d={ptPath}
            fill="none"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points, Gap Badges, and Hover Interaction */}
          {windows.map((win, idx) => {
            const x = getX(idx);
            const yP0 = getY(p0Fares[idx]);
            const yPt = getY(ptFares[idx]);
            const isActive = idx === activeIdx;

            const gapPct = Math.round(((ptFares[idx] - p0Fares[idx]) / p0Fares[idx]) * 100);
            const badgeSign = gapPct >= 0 ? `+${gapPct}%` : `${gapPct}%`;

            // Badge styling
            let badgeBg = "#DCFCE7"; // Light green
            let badgeText = "#16A34A";
            let badgeBorder = "#86EFAC";
            if (gapPct > GAP_HIGH_THRESHOLD) {
              badgeBg = "#FEE2E2"; // Light red
              badgeText = "#DC2626";
              badgeBorder = "#FCA5A5";
            } else if (gapPct > GAP_MODERATE_THRESHOLD) {
              badgeBg = "#FEF3C7"; // Light amber
              badgeText = "#D97706";
              badgeBorder = "#FCD34D";
            }

            // Top y position for badge (above highest of Pt or P0)
            const badgeY = Math.min(yPt, yP0) - 18;

            return (
              <g
                key={win}
                className="cursor-pointer"
                onClick={() => onSelectWindow(win)}
                onMouseEnter={() =>
                  setHoveredPoint({
                    window: win,
                    x,
                    y: Math.min(yPt, yP0),
                    p0: p0Fares[idx],
                    pt: ptFares[idx],
                    gapRs: ptFares[idx] - p0Fares[idx],
                    gapPct,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Gap Badge Above Point */}
                <g transform={`translate(${x}, ${badgeY})`}>
                  <rect
                    x="-22"
                    y="-11"
                    width="44"
                    height="16"
                    rx="3"
                    fill={badgeBg}
                    stroke={badgeBorder}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="700"
                    fill={badgeText}
                    className="font-mono"
                  >
                    {badgeSign}
                  </text>
                </g>

                {/* P0 Marker (Blue #2563EB) */}
                <circle
                  cx={x}
                  cy={yP0}
                  r={isActive ? "5.5" : "4"}
                  fill={isActive ? "#2563EB" : "#FFFFFF"}
                  stroke="#2563EB"
                  strokeWidth="2"
                />

                {/* Pt Marker (Orange-Red #EA580C) */}
                <circle
                  cx={x}
                  cy={yPt}
                  r={isActive ? "6.5" : "4.5"}
                  fill={isActive ? "#EA580C" : "#FFFFFF"}
                  stroke="#EA580C"
                  strokeWidth="2.5"
                />

                {/* X-axis Label */}
                <text
                  x={x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize="12"
                  fill={isActive ? "#0F172A" : "#64748B"}
                  fontWeight={isActive ? "700" : "500"}
                  className="font-mono"
                >
                  {win}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-lg border border-slate-700"
            style={{
              left: `${Math.min(svgWidth - 140, Math.max(20, hoveredPoint.x - 65))}px`,
              top: `${Math.max(10, hoveredPoint.y - 75)}px`,
            }}
          >
            <div className="font-mono font-bold text-blue-300 border-b border-slate-700 pb-1 mb-1">
              Window: {hoveredPoint.window}
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-[11px] font-mono">
              <span className="text-slate-400">2024 Base (P0):</span>
              <span className="text-right">{formatRs(hoveredPoint.p0)}</span>
              <span className="text-slate-400">Current (Pt):</span>
              <span className="text-right text-orange-400">{formatRs(hoveredPoint.pt)}</span>
              <span className="text-slate-400">Gap:</span>
              <span className={`text-right font-bold ${hoveredPoint.gapPct >= 0 ? "text-red-400" : "text-green-400"}`}>
                {hoveredPoint.gapPct >= 0 ? `+${hoveredPoint.gapPct}%` : `${hoveredPoint.gapPct}%`} ({formatRs(hoveredPoint.gapRs)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Strip: Active window summary */}
      <div className="pt-3 pb-2 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono bg-slate-50 px-3 rounded-md mt-2 border border-slate-100">
        <div>
          <strong className="text-slate-800">{activeWindow}</strong> · Base fare (P0):{" "}
          <strong className="text-slate-700">{formatRs(activeP0)}</strong> · Current fare (Pt):{" "}
          <strong className="text-orange-600">{formatRs(activePt)}</strong> · Gap:{" "}
          <span
            className={`font-semibold ${
              activeGapPct >= 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {activeGapPct >= 0 ? `+${activeGapPct}%` : `${activeGapPct}%`} ({formatRs(activeGapRs)})
          </span>
        </div>
      </div>

      {/* Requirement 1: Clickable Window Chips Below Chart */}
      <div className="pt-3 flex items-center gap-2 flex-wrap mt-auto">
        {windows.map((win, idx) => {
          const isActive = win === activeWindow;
          const gapPct = Math.round(((ptFares[idx] - p0Fares[idx]) / p0Fares[idx]) * 100);
          const sign = gapPct >= 0 ? `+${gapPct}%` : `${gapPct}%`;

          return (
            <button
              key={win}
              onClick={() => onSelectWindow(win)}
              className={`px-3 py-1.5 flex-1 rounded-md text-xs font-mono transition-all border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>{win}</span>{" "}
              <span
                className={
                  isActive
                    ? "text-blue-100 font-semibold"
                    : gapPct > GAP_HIGH_THRESHOLD
                    ? "text-red-600 font-semibold"
                    : gapPct > GAP_MODERATE_THRESHOLD
                    ? "text-amber-600 font-semibold"
                    : "text-green-600 font-semibold"
                }
              >
                ({sign})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
