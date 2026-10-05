import React from "react";
import { Link } from "react-router-dom";
import { useFilter } from "../context/FilterContext";
import { CORE_ROUTES, STATE_WEIGHTS } from "../data/mockData";
import { Plane, ArrowRight, Building2, Calendar } from "lucide-react";

export default function OverviewPage() {
  const { seatClass, leadTime, setSelectedRoute } = useFilter();

  const routes = CORE_ROUTES.filter((r) =>
    ["DEL-BOM", "DEL-BLR", "DEL-PAT", "BOM-BLR"].includes(r.code)
  );

  const leadMultiplier = {
    "T+45": 0.94,
    "T+30": 0.98,
    "T+15": 1.05,
    "T+7": 1.14,
    "T+1": 1.28,
  }[leadTime] || 1.28;

  const totalWeight = STATE_WEIGHTS.reduce((sum, s) => sum + s.hcesWeight, 0) || 1;
  const nationalComposite =
    STATE_WEIGHTS.reduce((sum, s) => sum + s.currentApix * leadMultiplier * s.hcesWeight, 0) /
    totalWeight;
  const nationalYoY = Math.round((nationalComposite - 100) * 10) / 10;

  const highestState = [...STATE_WEIGHTS].sort((a, b) => b.currentApix - a.currentApix)[0];
  const avgFestivalMarkup =
    Math.round(
      (STATE_WEIGHTS.reduce((sum, s) => sum + s.festivalMarkupAvgPct, 0) / STATE_WEIGHTS.length) *
        10
    ) / 10;

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] text-[#0F172A]">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Header */}
        <div className="border-b border-zinc-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              National Airfare Price Index (APIx) — Overview
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Methodological demonstration of capacity-weighted Jevons price aggregates and advance booking lead-time pricing.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-600 bg-white px-3 py-1 border border-zinc-200 shadow-2xs">
            <span>Window: <strong className="text-blue-700">{leadTime}</strong></span>
            <span>·</span>
            <span className="capitalize">Seat: <strong className="text-zinc-900">{seatClass}</strong></span>
          </div>
        </div>

        {/* Prototype Statement */}
        <div className="p-3.5 bg-white border border-zinc-200 text-xs text-zinc-600 leading-relaxed shadow-2xs">
          Prototype demonstrating the index methodology on synthetic data for a representative route set. Full-scale coverage and additional analysis layers are active for MoSPI augmentation.
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
          <div className="bg-white border border-zinc-200 p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>National APIx composite</span>
              <span className="font-mono text-zinc-400 text-xs">{leadTime} window</span>
            </div>
            <div className="my-2.5 flex items-baseline gap-3">
              <div className="text-2xl font-bold font-mono text-zinc-900 tabular-nums">
                {nationalComposite.toFixed(1)}
              </div>
              <div className="text-xs font-semibold font-mono text-rose-600">
                ▲ +{nationalYoY}% YoY
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              HCES 2023–24 weighted basket (Base 2024 = 100.0)
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Highest state inflation</span>
              <span className="text-xs font-mono text-rose-700 font-bold">
                {(highestState.currentApix * leadMultiplier).toFixed(1)} pts
              </span>
            </div>
            <div className="my-2.5">
              <div className="text-base font-semibold text-zinc-900">
                {highestState.stateName} ({highestState.stateCode})
              </div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">
                Weight: {(highestState.hcesWeight * 100).toFixed(2)}% in HCES basket
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              Driven by high outbound asymmetry (e.g. DEL-PAT corridor)
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Festival markup average</span>
              <span className="font-mono text-xs text-zinc-400">All windows</span>
            </div>
            <div className="my-2.5 flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono text-zinc-900 tabular-nums">
                {avgFestivalMarkup}%
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              Average premium attributable to seasonal holiday migration
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-4 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs">
              <span>Monitored corridors</span>
              <span className="font-mono text-xs text-zinc-400">4 corridors</span>
            </div>
            <div className="my-2.5">
              <div className="text-2xl font-bold font-mono text-zinc-900">
                4 / 4
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-500 truncate">
              DEL-BOM · DEL-BLR · DEL-PAT · BOM-BLR
            </div>
          </div>
        </div>

        {/* Core Monitored Routes Section */}
        <div className="bg-white border border-zinc-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Core monitored routes</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Representative high-density and regional migration corridors
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              Seat class: <strong className="text-zinc-800 capitalize">{seatClass}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {routes.map((route) => (
              <div
                key={route.code}
                className="p-3.5 bg-white border border-zinc-200 hover:border-zinc-400 transition-colors flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-zinc-900 mb-1">
                    {route.code}
                  </div>
                  <div className="text-xs text-zinc-800 font-medium truncate">
                    {route.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                    {route.distanceKm} km · {route.fromState} ➔ {route.toState}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {leadTime} window
                  </span>
                  <Link
                    to="/route-analysis"
                    onClick={() => setSelectedRoute(route.code)}
                    className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium"
                  >
                    <span>View route</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
