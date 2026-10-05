import React, { useState } from "react";
import { HEATMAP_CLAMP_MAX } from "../../data/mockData";

const formatRs = (num) => "₹" + Math.round(num).toLocaleString("en-IN");

// Red-Green continuous diverging color scale
// 100.0 = solid green (#16A34A) -> ~105 light green/yellow -> ~110 amber -> ~125 orange -> 150+ deep red (clamped)
export function getHeatmapStyle(val) {
  const clamped = Math.min(HEATMAP_CLAMP_MAX, Math.max(100.0, val));
  const ratio = (clamped - 100.0) / (HEATMAP_CLAMP_MAX - 100.0); // 0.0 to 1.0

  if (clamped <= 100.05) {
    return {
      bg: "bg-[#DCFCE7]",
      border: "border-[#86EFAC]",
      text: "text-[#14532D]",
      style: { backgroundColor: "#DCFCE7", borderColor: "#86EFAC", color: "#14532D" },
    };
  }

  if (clamped <= 105.0) {
    return {
      bg: "bg-[#ECFCCB]",
      border: "border-[#BEF264]",
      text: "text-[#365314]",
      style: { backgroundColor: "#ECFCCB", borderColor: "#BEF264", color: "#365314" },
    };
  }

  if (clamped <= 112.0) {
    return {
      bg: "bg-[#FEF3C7]",
      border: "border-[#FCD34D]",
      text: "text-[#78350F]",
      style: { backgroundColor: "#FEF3C7", borderColor: "#FCD34D", color: "#78350F" },
    };
  }

  if (clamped <= 128.0) {
    return {
      bg: "bg-[#FFEDD5]",
      border: "border-[#FDBA74]",
      text: "text-[#7C2D12]",
      style: { backgroundColor: "#FFEDD5", borderColor: "#FDBA74", color: "#7C2D12" },
    };
  }

  return {
    bg: "bg-[#FEE2E2]",
    border: "border-[#FCA5A5]",
    text: "text-[#7F1D1D]",
    style: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", color: "#7F1D1D" },
  };
}

export function getContinuousColorHex(val, isInterpolated = false) {
  const clamped = Math.min(HEATMAP_CLAMP_MAX, Math.max(100.0, val));
  const t = (clamped - 100.0) / (HEATMAP_CLAMP_MAX - 100.0); // 0 (100) to 1 (150)

  // 100: Green rgb(22, 163, 74)
  // 110: Amber rgb(245, 158, 11)
  // 125: Orange rgb(234, 88, 12)
  // 150: Deep Red rgb(220, 38, 38)
  let r, g, b;
  if (t < 0.2) { // 100 to 110
    const localT = t / 0.2;
    r = Math.round(22 + (245 - 22) * localT);
    g = Math.round(163 + (158 - 163) * localT);
    b = Math.round(74 + (11 - 74) * localT);
  } else if (t < 0.5) { // 110 to 125
    const localT = (t - 0.2) / 0.3;
    r = Math.round(245 + (234 - 245) * localT);
    g = Math.round(158 + (88 - 158) * localT);
    b = Math.round(11 + (12 - 11) * localT);
  } else { // 125 to 150
    const localT = (t - 0.5) / 0.5;
    r = Math.round(234 + (220 - 234) * localT);
    g = Math.round(88 + (38 - 88) * localT);
    b = Math.round(12 + (38 - 12) * localT);
  }

  const alpha = isInterpolated ? 0.72 : 1.0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DirectionalHeatmap({ directional, activeWindow }) {
  const [tooltip, setTooltip] = useState(null);

  const windows = ["T+45", "T+30", "T+15", "T+7", "T+1"];
  const anchorDays = { "T+45": 45, "T+30": 30, "T+15": 15, "T+7": 7, "T+1": 1 };

  // Generate 45 daily interpolated points (from T+45 down to T+1)
  const interpolatedDays = [];
  for (let day = 45; day >= 1; day--) {
    let lowerWin, upperWin;
    if (day >= 30) {
      lowerWin = "T+30";
      upperWin = "T+45";
    } else if (day >= 15) {
      lowerWin = "T+15";
      upperWin = "T+30";
    } else if (day >= 7) {
      lowerWin = "T+7";
      upperWin = "T+15";
    } else {
      lowerWin = "T+1";
      upperWin = "T+7";
    }

    const dUpper = anchorDays[upperWin];
    const dLower = anchorDays[lowerWin];
    const factor = (day - dLower) / (dUpper - dLower); // 0 (at lower) to 1 (at upper)

    const outLower = directional.outboundHeatmapIndex[lowerWin];
    const outUpper = directional.outboundHeatmapIndex[upperWin];
    const interpOut = outLower + factor * (outUpper - outLower);

    const inLower = directional.inboundHeatmapIndex[lowerWin];
    const inUpper = directional.inboundHeatmapIndex[upperWin];
    const interpIn = inLower + factor * (inUpper - inLower);

    const isAnchor = day === 45 || day === 30 || day === 15 || day === 7 || day === 1;
    let anchorLabel = null;
    if (day === 45) anchorLabel = "T+45";
    else if (day === 30) anchorLabel = "T+30";
    else if (day === 15) anchorLabel = "T+15";
    else if (day === 7) anchorLabel = "T+7";
    else if (day === 1) anchorLabel = "T+1";

    interpolatedDays.push({
      day,
      label: `T+${day}`,
      isAnchor,
      anchorLabel,
      outboundIndex: Math.round(interpOut * 10) / 10,
      inboundIndex: Math.round(interpIn * 10) / 10,
    });
  }

  // Active window asymmetry calculation
  const activeOutFare = directional.outboundFares[activeWindow];
  const activeInFare = directional.inboundFares[activeWindow];
  const activeAsymmetry = Math.round((activeOutFare / activeInFare) * 1000) / 10;
  const activeSpread = (activeAsymmetry / 100).toFixed(2);

  // Dynamic plain language summary under title
  let dynamicPlainLanguage = `Outbound ${directional.outboundCode} is ${activeSpread}x the return fare at ${activeWindow}.`;
  if (activeAsymmetry > 100) {
    const diffPct = (activeAsymmetry - 100).toFixed(1);
    dynamicPlainLanguage = `Outbound ${directional.outboundCode} is ${activeSpread}x (${diffPct}% higher than) the return fare at ${activeWindow}.`;
  } else if (activeAsymmetry < 100) {
    const returnSpread = (100 / activeAsymmetry).toFixed(2);
    dynamicPlainLanguage = `Return leg ${directional.inboundCode} is ${returnSpread}x the outbound fare at ${activeWindow}.`;
  }

  // Chip severity color for active asymmetry
  let asymmetryChipClass = "bg-slate-100 text-slate-800 border-slate-300";
  if (activeAsymmetry > 130) {
    asymmetryChipClass = "bg-rose-50 text-rose-800 border-rose-300 font-bold";
  } else if (activeAsymmetry > 110) {
    asymmetryChipClass = "bg-amber-50 text-amber-800 border-amber-300 font-semibold";
  } else if (activeAsymmetry < 90) {
    asymmetryChipClass = "bg-blue-50 text-blue-800 border-blue-300 font-semibold";
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between my-4 shadow-sm relative">
      {/* Header & Dynamic Chip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Directional price asymmetry &amp; heatmap
            </h3>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200">
              Outbound vs return
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized to cheaper leg = 100.0 baseline across each booking window
          </p>
          {/* Plain language insight dynamically updating */}
          <p className="text-xs font-medium text-blue-900 mt-1 bg-blue-50/60 px-2 py-0.5 border-l-2 border-blue-600 inline-block">
            {dynamicPlainLanguage}
          </p>
        </div>

        {/* Top-right asymmetry chip matching active window & colored by severity */}
        <div className={`text-xs border px-3 py-1 font-mono transition-colors shadow-2xs ${asymmetryChipClass}`}>
          Asymmetry at {activeWindow}:{" "}
          <strong className="text-slate-950 font-bold">
            {activeAsymmetry.toFixed(1)}%
          </strong>{" "}
          <span className="text-slate-600 font-normal">
            ({activeSpread}x)
          </span>
        </div>
      </div>

      {/* Main Heatmap Table with 5 Anchor Windows */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-2 text-center text-xs font-medium text-slate-500 pb-2 border-b border-slate-200">
            <div className="text-left font-medium">Corridor leg</div>
            {windows.map((w) => {
              const isActive = w === activeWindow;
              return (
                <div
                  key={w}
                  className={`font-mono transition-colors ${
                    isActive ? "text-blue-700 font-bold underline decoration-2 underline-offset-4" : "text-slate-600"
                  }`}
                >
                  {w} {isActive && "★"}
                </div>
              );
            })}
          </div>

          {/* Row 1: Outbound Leg */}
          <div className="grid grid-cols-6 gap-2 items-center py-2 text-xs border-b border-slate-100">
            <div className="text-left font-medium text-slate-800 font-mono flex flex-col">
              <span className="font-bold">{directional.outboundCode}</span>
              <span className="text-[11px] text-slate-500 font-sans">Outbound</span>
            </div>
            {windows.map((w) => {
              const val = directional.outboundHeatmapIndex[w];
              const fare = directional.outboundFares[w];
              const isActive = w === activeWindow;
              const colorInfo = getHeatmapStyle(val);
              const higherPct = (val - 100).toFixed(1);

              return (
                <div
                  key={w}
                  onMouseEnter={() =>
                    setTooltip({
                      route: `${directional.outboundCode} (Outbound)`,
                      window: w,
                      index: val.toFixed(1),
                      fare,
                      higherPct,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className={`py-2 px-1 text-center font-mono transition-all border cursor-pointer ${
                    isActive ? "border-2 border-slate-900 shadow-sm" : colorInfo.border
                  }`}
                  style={colorInfo.style}
                >
                  <div className="text-xs font-bold tabular-nums">
                    {val.toFixed(1)}
                  </div>
                  <div className="text-[11px] opacity-80 tabular-nums">
                    {formatRs(fare)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: Inbound Leg */}
          <div className="grid grid-cols-6 gap-2 items-center py-2 text-xs border-b border-slate-100">
            <div className="text-left font-medium text-slate-800 font-mono flex flex-col">
              <span className="font-bold">{directional.inboundCode}</span>
              <span className="text-[11px] text-slate-500 font-sans">Inbound (Return)</span>
            </div>
            {windows.map((w) => {
              const val = directional.inboundHeatmapIndex[w];
              const fare = directional.inboundFares[w];
              const isActive = w === activeWindow;
              const colorInfo = getHeatmapStyle(val);
              const higherPct = (val - 100).toFixed(1);

              return (
                <div
                  key={w}
                  onMouseEnter={() =>
                    setTooltip({
                      route: `${directional.inboundCode} (Inbound)`,
                      window: w,
                      index: val.toFixed(1),
                      fare,
                      higherPct,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className={`py-2 px-1 text-center font-mono transition-all border cursor-pointer ${
                    isActive ? "border-2 border-slate-900 shadow-sm" : colorInfo.border
                  }`}
                  style={colorInfo.style}
                >
                  <div className="text-xs font-bold tabular-nums">
                    {val.toFixed(1)}
                  </div>
                  <div className="text-[11px] opacity-80 tabular-nums">
                    {formatRs(fare)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 3: Asymmetry Index (%) per window */}
          <div className="grid grid-cols-6 gap-2 items-center py-2 text-xs">
            <div className="text-left font-medium text-slate-700 font-mono text-[11px]">
              Asymmetry index (%)
            </div>
            {windows.map((w) => {
              const outFare = directional.outboundFares[w];
              const inFare = directional.inboundFares[w] || 1;
              const asym = Math.round((outFare / inFare) * 1000) / 10;
              const isActive = w === activeWindow;

              let chipBg = "bg-slate-100 text-slate-700 border-slate-200";
              if (asym > 125) chipBg = "bg-rose-100 text-rose-800 border-rose-300 font-bold";
              else if (asym > 108) chipBg = "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
              else if (asym < 95) chipBg = "bg-blue-100 text-blue-800 border-blue-300 font-semibold";

              return (
                <div
                  key={w}
                  className={`py-1 px-1 text-center font-mono text-xs border rounded-none ${
                    isActive ? "ring-2 ring-slate-800 font-bold" : ""
                  } ${chipBg}`}
                >
                  {asym.toFixed(1)}%
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requirement 3: Continuous Interpolation Strip Layer (T+45 to T+1) */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Interpolated Continuous Heatmap Strip (T+45 ➔ T+1):
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Outbound relative spread daily decay
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Linear interpolation between anchor windows
          </span>
        </div>

        {/* 45-day interpolated fine strip */}
        <div className="relative pt-4 pb-2">
          <div className="flex w-full h-7 border border-slate-300 overflow-hidden shadow-2xs">
            {interpolatedDays.map((item) => {
              const bg = getContinuousColorHex(item.outboundIndex, !item.isAnchor);
              return (
                <div
                  key={item.day}
                  onMouseEnter={() =>
                    setTooltip({
                      route: `${directional.outboundCode} (Interpolated Outbound)`,
                      window: `Day ${item.day} (T+${item.day})`,
                      index: item.outboundIndex.toFixed(1),
                      fare: Math.round(
                        (directional.outboundFares["T+1"] * item.outboundIndex) /
                          directional.outboundHeatmapIndex["T+1"]
                      ),
                      higherPct: (item.outboundIndex - 100).toFixed(1),
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  className={`flex-1 h-full cursor-pointer relative transition-transform hover:scale-y-110 ${
                    item.isAnchor ? "border-r border-slate-700/40" : "border-r border-black/5"
                  }`}
                  style={{ backgroundColor: bg }}
                  title={`Day T+${item.day}: Index ${item.outboundIndex}`}
                >
                  {item.isAnchor && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Anchor labels under the strip */}
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 px-1">
            <span>T+45 (Anchor)</span>
            <span>T+30</span>
            <span>T+15</span>
            <span>T+7</span>
            <span>T+1 (Departure)</span>
          </div>
        </div>
      </div>

      {/* Legend with Continuous Red-Green Gradient Bar */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-slate-800">Diverging scale:</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-800 font-bold">100.0 (Cheaper leg baseline)</span>
            <div
              className="w-36 h-3 rounded-none border border-slate-300"
              style={{
                background: "linear-gradient(to right, #16A34A 0%, #84CC16 20%, #F59E0B 45%, #EA580C 75%, #DC2626 100%)",
              }}
            ></div>
            <span className="text-[11px] font-mono text-rose-800 font-bold">{HEATMAP_CLAMP_MAX}+ (Max clamp)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">· Interpolated strip has lighter opacity</span>
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Lower leg indexed to 100.0
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltip && (
        <div className="absolute z-30 bottom-16 left-6 bg-slate-900 text-white text-xs p-2.5 rounded shadow-xl border border-slate-700 pointer-events-none font-mono">
          <div className="font-bold text-amber-300 mb-0.5">{tooltip.route} · {tooltip.window}</div>
          <div className="text-slate-200">
            Index: <strong className="text-white">{tooltip.index}</strong>
            {tooltip.fare ? ` · Fare: ${formatRs(tooltip.fare)}` : ""}
          </div>
          <div className="text-[11px] text-emerald-300 mt-0.5">
            {Number(tooltip.higherPct) <= 0
              ? "Cheapest leg baseline (100.0)"
              : `${tooltip.higherPct}% higher than the cheaper leg`}
          </div>
        </div>
      )}
    </div>
  );
}
