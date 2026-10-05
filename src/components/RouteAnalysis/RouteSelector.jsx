import React from "react";

const ROUTES = [
  { code: "DEL-BOM", label: "DEL → BOM (Delhi - Mumbai)" },
  { code: "DEL-BLR", label: "DEL → BLR (Delhi - Bengaluru)" },
  { code: "DEL-PAT", label: "DEL → PAT (Delhi - Patna)" },
  { code: "BOM-BLR", label: "BOM → BLR (Mumbai - Bengaluru)" },
];

export default function RouteSelector({ currentRouteCode, onRouteChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-xs text-zinc-500 font-medium shrink-0">Routes:</span>
        {ROUTES.map((route) => {
          const isSelected = currentRouteCode === route.code;
          return (
            <button
              key={route.code}
              onClick={() => onRouteChange(route.code)}
              className={`px-3 py-1 text-xs font-mono transition-colors whitespace-nowrap border ${
                isSelected
                  ? "bg-zinc-900 text-white border-zinc-900 font-semibold shadow-xs"
                  : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {route.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
