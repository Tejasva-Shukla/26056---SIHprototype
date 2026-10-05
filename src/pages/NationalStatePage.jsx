import React, { useState, useMemo } from "react";
import { useFilter } from "../context/FilterContext";
import { STATE_WEIGHTS } from "../data/mockData";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  TrendingUp,
  ArrowUpDown,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";

export default function NationalStatePage() {
  const { leadTime, seatClass } = useFilter();

  const [sortField, setSortField] = useState("weight");
  const [sortAsc, setSortAsc] = useState(false);
  const [isFrameworkOpen, setIsFrameworkOpen] = useState(false);

  // Lead time price relative multiplier
  const leadMultiplier = {
    "T+45": 0.94,
    "T+30": 0.98,
    "T+15": 1.05,
    "T+7": 1.14,
    "T+1": 1.28,
  }[leadTime] || 1.28;

  // Compute state indices and inflation
  const statesData = useMemo(() => {
    return STATE_WEIGHTS.map((state) => {
      const adjustedApix = Math.round(state.currentApix * leadMultiplier * 10) / 10;
      const adjustedInflation = Math.round((adjustedApix - 100) * 10) / 10;

      // Status pill: Elevated, Watch, Normal
      let status = "Normal";
      if (adjustedInflation >= 45) {
        status = "Elevated";
      } else if (adjustedInflation >= 25) {
        status = "Watch";
      }

      return {
        ...state,
        adjustedApix,
        adjustedInflation,
        status,
      };
    });
  }, [leadMultiplier]);

  // National Composite & Aggregates
  const totalWeight = statesData.reduce((sum, s) => sum + s.hcesWeight, 0) || 1;
  const nationalComposite =
    statesData.reduce((sum, s) => sum + s.adjustedApix * s.hcesWeight, 0) / totalWeight;
  const nationalYoY = Math.round((nationalComposite - 100) * 10) / 10;

  const highestState = [...statesData].sort((a, b) => b.adjustedApix - a.adjustedApix)[0];
  const avgFestivalMarkup =
    Math.round(
      (statesData.reduce((sum, s) => sum + s.festivalMarkupAvgPct, 0) / statesData.length) * 10
    ) / 10;

  // Sorting
  const sortedStates = useMemo(() => {
    return [...statesData].sort((a, b) => {
      let diff = 0;
      if (sortField === "weight") diff = b.hcesWeight - a.hcesWeight;
      else if (sortField === "apix") diff = b.adjustedApix - a.adjustedApix;
      else if (sortField === "inflation") diff = b.adjustedInflation - a.adjustedInflation;
      else if (sortField === "state") diff = a.stateName.localeCompare(b.stateName);
      else if (sortField === "festival") diff = b.festivalMarkupAvgPct - a.festivalMarkupAvgPct;
      return sortAsc ? -diff : diff;
    });
  }, [statesData, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // State APIx color chip scale relative to min/max
  const minStateApix = Math.min(...statesData.map((s) => s.adjustedApix));
  const maxStateApix = Math.max(...statesData.map((s) => s.adjustedApix));

  const getStateApixColor = (val) => {
    const range = maxStateApix - minStateApix || 1;
    const ratio = (val - minStateApix) / range; // 0 to 1
    if (ratio >= 0.7) {
      return {
        chip: "bg-red-50 text-red-800 border-red-200",
        bar: "bg-red-500",
      };
    }
    if (ratio >= 0.35) {
      return {
        chip: "bg-amber-50 text-amber-800 border-amber-200",
        bar: "bg-amber-500",
      };
    }
    return {
      chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
      bar: "bg-emerald-500",
    };
  };

  // CSV Export
  const handleExportCsv = () => {
    const header = "StateCode,StateName,HCES_Weight_Pct,Adjusted_APIx,YoY_Inflation_Pct,Festival_Markup_Avg_Pct,Active_Routes_Count,Status\n";
    const rows = sortedStates
      .map(
        (s) =>
          `"${s.stateCode}","${s.stateName}",${(s.hcesWeight * 100).toFixed(2)},${s.adjustedApix.toFixed(1)},${s.adjustedInflation.toFixed(1)},${s.festivalMarkupAvgPct.toFixed(1)},${s.activeRoutesCount},"${s.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MoSPI_National_State_APIx_${leadTime}_${seatClass}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Ranked states list for horizontal bar chart
  const rankedStates = useMemo(() => {
    return [...statesData].sort((a, b) => b.adjustedApix - a.adjustedApix);
  }, [statesData]);

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] text-[#0F172A]">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Page Title & Item Code Header */}
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                State-wise &amp; National Airfare Price Index (APIx)
              </h2>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5">
                HCES Item 07.3.3.1.2.01
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              State-level index aggregation using Household Consumption Expenditure Survey 2023–24 weights (Base 2024 = 100.0).
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-white px-3 py-1 border border-slate-200 shadow-2xs">
            <span>Window: <strong className="text-blue-700">{leadTime}</strong></span>
            <span>·</span>
            <span className="capitalize">Seat: <strong className="text-slate-900">{seatClass}</strong></span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* HERO BLOCK: Dominates the page (2-3x height of current KPI cards) */}
        {/* ================================================================= */}
        <div className="w-full bg-gradient-to-r from-blue-50/90 via-white to-blue-50/50 border border-blue-200/80 p-6 sm:p-8 shadow-xs rounded-none">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 font-mono">
                  Primary Composite Index
                </span>
                <span className="text-xs font-mono bg-blue-100/70 text-blue-800 px-2 py-0.5 border border-blue-200">
                  Item 07.3.3.1.2.01
                </span>
                <span className="text-xs font-mono bg-white text-slate-700 px-2 py-0.5 border border-slate-200">
                  Window: {leadTime} · {seatClass.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                National Airfare Price Index (APIx)
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                HCES 2023–24 weighted basket (Base 2024 = 100.0) · Monthly domestic passenger air travel inflation measure for Ministry of Statistics and Programme Implementation.
              </p>
            </div>

            {/* Very Large National Index Number (72px - 96px) */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 lg:text-right shrink-0">
              <div 
                className="font-black font-mono tracking-tighter text-blue-950 tabular-nums"
                style={{ fontSize: '88px', lineHeight: 1 }}
              >
                {nationalComposite.toFixed(1)}
              </div>
              <div className="flex flex-col sm:items-start lg:items-end">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-sm font-bold font-mono shadow-2xs">
                  <TrendingUp className="w-4 h-4" />
                  <span>▲ +{nationalYoY}% YoY</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 mt-1">
                  Base 2024 = 100.0 pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Secondary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-4">
          {/* Card 1: Highest State Inflation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-700">Highest state inflation</span>
              <span className="text-xs font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 border border-rose-200">
                {highestState.adjustedApix.toFixed(1)} pts
              </span>
            </div>
            <div className="my-2.5">
              <div className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{highestState.stateName} ({highestState.stateCode})</span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Weight: {(highestState.hcesWeight * 100).toFixed(2)}% in HCES basket
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Driven by high outbound asymmetry (e.g. DEL-PAT corridor)
            </div>
          </div>

          {/* Card 2: Festival Markup Average */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-700">Festival markup average</span>
              <span className="font-mono text-xs text-slate-400">All windows</span>
            </div>
            <div className="my-2.5 flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
                {avgFestivalMarkup}%
              </div>
              <span className="text-xs text-amber-600 font-mono font-semibold">Seasonal Surge</span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              Average premium attributable to seasonal holiday migration
            </div>
          </div>

          {/* Card 3: Monitored Corridors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-700">Monitored corridors</span>
              <span className="font-mono text-xs text-slate-400">4 corridors active</span>
            </div>
            <div className="my-2.5 flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono text-slate-900">
                4 / 4
              </div>
              <span className="text-xs text-emerald-600 font-mono font-medium">100% Ingested</span>
            </div>
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 truncate">
              DEL-BOM · DEL-BLR · DEL-PAT · BOM-BLR
            </div>
          </div>
        </div>

        {/* Collapsible Weighting Framework Info Panel */}
        <div className="bg-white rounded-xl border border-slate-200 text-xs text-slate-600 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsFrameworkOpen(!isFrameworkOpen)}
            className="w-full p-3.5 flex items-center justify-between font-semibold text-slate-800 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Weighting framework &amp; aggregation methodology</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                (Click to {isFrameworkOpen ? "collapse" : "expand"})
              </span>
            </div>
            {isFrameworkOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isFrameworkOpen && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 text-slate-600 text-xs leading-relaxed bg-slate-50/50">
              <p>
                State indices are compiled from route-level capacity-weighted Jevons price relatives, scaled according to state passenger flows and weighted nationally by HCES 2023–24 Item Code 07.3.3.1.2.01.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 bg-white border border-slate-200">
                  <div className="font-bold text-slate-800">1. Micro Layer</div>
                  <div className="text-slate-500">Carrier capacity-weighted Jevons formula with peer-median outlier scrubbing.</div>
                </div>
                <div className="p-2 bg-white border border-slate-200">
                  <div className="font-bold text-slate-800">2. Meso Layer</div>
                  <div className="text-slate-500">Corridor asymmetry decomposition and advance lead-time booking decay.</div>
                </div>
                <div className="p-2 bg-white border border-slate-200">
                  <div className="font-bold text-slate-800">3. Macro Layer</div>
                  <div className="text-slate-500">HCES 2023-24 consumer expenditure weighting for official CPI basket inclusion.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ranked Horizontal Bar Chart of State APIx */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Ranked State Airfare Price Index ({leadTime})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Horizontal comparison of state APIx relative to baseline (100.0)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Baseline: 100.0
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {rankedStates.map((state) => {
              const colorInfo = getStateApixColor(state.adjustedApix);
              const barPct = Math.min(
                100,
                Math.max(10, ((state.adjustedApix - 100) / (maxStateApix - 100)) * 100)
              );

              return (
                <div key={state.stateCode} className="flex items-center gap-3 text-xs">
                  {/* State Name */}
                  <div className="w-32 shrink-0 font-medium text-slate-800 truncate flex items-center gap-1.5">
                    <span className="font-mono text-slate-500 w-6">{state.stateCode}</span>
                    <span className="truncate">{state.stateName}</span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-4 bg-slate-100 border border-slate-200 relative overflow-hidden">
                    <div
                      className={`h-full ${colorInfo.bar} transition-all duration-300`}
                      style={{ width: `${barPct}%` }}
                    ></div>
                  </div>

                  {/* Score & Weight */}
                  <div className="w-24 text-right shrink-0 flex items-center justify-end gap-1.5 font-mono">
                    <span className="font-bold text-slate-900">
                      {state.adjustedApix.toFixed(1)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({(state.hcesWeight * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* State-wise Table with Sorting & Inline Bars */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  State-wise airfare price index &amp; HCES weights
                </h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200">
                  Item 07.3.3.1.2.01
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthetic state weighting structure derived from HCES 2023–24 Annexure 5.3d
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 border border-slate-200">
                Lead time: <strong className="text-slate-900">{leadTime}</strong>
              </div>
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs px-2.5 py-1 font-medium transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs min-w-[700px] border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-2xs z-10">
                <tr className="text-xs font-semibold text-slate-600">
                  <th
                    onClick={() => handleSort("state")}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>State / UT</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("weight")}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>HCES weight</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("apix")}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>State APIx ({leadTime})</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("inflation")}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>YoY inflation</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("festival")}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Festival markup avg</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-right">Active routes</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {sortedStates.map((state) => {
                  const apixColor = getStateApixColor(state.adjustedApix);
                  const isPositiveYoY = state.adjustedInflation >= 0;

                  // Status pill color
                  let statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-300";
                  if (state.status === "Elevated") {
                    statusBadge = "bg-rose-50 text-rose-800 border-rose-300 font-semibold";
                  } else if (state.status === "Watch") {
                    statusBadge = "bg-amber-50 text-amber-800 border-amber-300 font-semibold";
                  }

                  return (
                    <tr
                      key={state.stateCode}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* State / UT */}
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-mono text-slate-400 mr-2 text-xs">
                          {state.stateCode}
                        </span>
                        <span className="font-medium text-slate-800">
                          {state.stateName}
                        </span>
                      </td>

                      {/* HCES Weight with inline horizontal bar */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-none overflow-hidden inline-block">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${state.hcesWeight * 1000}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-700">
                            {(100 * state.hcesWeight).toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* State APIx with coloured value chip */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-2 py-0.5 border text-xs font-bold font-mono inline-block ${apixColor.chip}`}
                        >
                          {state.adjustedApix.toFixed(1)}
                        </span>
                      </td>

                      {/* YoY Inflation */}
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          state.adjustedInflation > 20 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {isPositiveYoY ? "+" : ""}
                        {state.adjustedInflation.toFixed(1)}%
                      </td>

                      {/* Festival Average Markup */}
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {state.festivalMarkupAvgPct.toFixed(1)}%
                      </td>

                      {/* Active Routes */}
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {state.activeRoutesCount}
                      </td>

                      {/* Status Pills: Elevated (red-tinted), Normal (green-tinted), Watch (amber-tinted) */}
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span
                          className={`text-[11px] px-2 py-0.5 border inline-block ${statusBadge}`}
                        >
                          {state.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
