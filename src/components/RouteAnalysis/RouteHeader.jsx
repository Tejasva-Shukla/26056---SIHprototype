import React, { useState } from "react";
import { ROUTE_TIER_CONFIG, EXPIRY_RULES_HOURS } from "../../data/mockData";
import { useFilter } from "../../context/FilterContext";
import { RefreshCw, Download, Clock } from "lucide-react";

export default function RouteHeader({ route, activeWindow, onExportCsv }) {
  const { routeFreshness, refreshRouteData } = useFilter();
  const [isFetching, setIsFetching] = useState(false);

  const tierInfo = ROUTE_TIER_CONFIG[route.code] || { tier: 2, label: "Tier 2 Corridor" };
  const tier = tierInfo.tier;
  const maxExpiryHours = (EXPIRY_RULES_HOURS[tier] && EXPIRY_RULES_HOURS[tier][activeWindow]) || 24;

  const lastUpdatedMs = routeFreshness[route.code] || Date.now() - 4 * 3600 * 1000;
  const ageMs = Math.max(0, Date.now() - lastUpdatedMs);
  const ageHours = Math.floor(ageMs / (3600 * 1000));
  const isExpired = ageHours >= maxExpiryHours;

  const handleFetchLive = () => {
    setIsFetching(true);
    setTimeout(() => {
      refreshRouteData(route.code);
      setIsFetching(false);
    }, 700);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-slate-200">
      {/* Route Identity */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {route.label}
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-700">
            {route.code}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {route.distanceKm} km
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
            {tierInfo.label}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Origin: <strong className="text-slate-700">{route.fromCity}</strong> ({route.fromState}) ➔ Destination:{" "}
          <strong className="text-slate-700">{route.toCity}</strong> ({route.toState})
        </p>
      </div>

      {/* Actions & Freshness status */}
      <div className="flex items-center gap-3 flex-wrap self-start md:self-center">
        {/* Requirement 6: Data Freshness Badge */}
        <div className="flex items-center gap-2">
          {isExpired ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-red-50 text-red-800 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>Last updated: {ageHours}h ago (Max {maxExpiryHours}h)</span>
              </span>
              <button
                onClick={handleFetchLive}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-2.5 py-1 transition-colors border border-red-700 shadow-2xs"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
                <span>{isFetching ? "Fetching..." : "Fetch live fares"}</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Last updated: {ageHours === 0 ? "Just now" : `${ageHours}h ago`}</span>
            </span>
          )}
        </div>

        {/* Export CSV button */}
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium px-3 py-1 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        )}
      </div>
    </div>
  );
}
