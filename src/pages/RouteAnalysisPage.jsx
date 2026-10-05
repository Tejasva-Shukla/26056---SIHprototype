import React, { useMemo } from "react";
import { useFilter } from "../context/FilterContext";
import { getFullRouteAnalysis, CORE_ROUTES } from "../data/mockData";
import RouteSelector from "../components/RouteAnalysis/RouteSelector";
import RouteHeader from "../components/RouteAnalysis/RouteHeader";
import KpiCards from "../components/RouteAnalysis/KpiCards";
import LeadTimeCurve from "../components/RouteAnalysis/LeadTimeCurve";
import CompetitionSection from "../components/RouteAnalysis/CompetitionSection";
import DirectionalHeatmap from "../components/RouteAnalysis/DirectionalHeatmap";
import IntraDayStats from "../components/RouteAnalysis/IntraDayStats";

export default function RouteAnalysisPage() {
  const { seatClass, leadTime, setLeadTime, selectedRoute, setSelectedRoute } = useFilter();

  // Compute route analysis deterministically
  const analysis = useMemo(() => {
    return getFullRouteAnalysis(selectedRoute, seatClass, leadTime, 0);
  }, [selectedRoute, seatClass, leadTime]);

  const handleExportCsv = () => {
    if (!analysis) return;
    const csvContent =
      "RouteCode,Window,SeatClass,BaseFareP0,CapacityWeightedAPIx,UnweightedJevons,CheapestFare,CV_Pct,CompetitionCategory,FestivalSharePct\n" +
      ["T+45", "T+30", "T+15", "T+7", "T+1"]
        .map((w) => {
          const item = analysis.windowsData[w];
          return `"${analysis.route.code}","${w}","${seatClass}",${item.baseFareP0},${item.capacityWeightedJevons},${item.unweightedJevons},${item.cheapestFare},${item.cv},"${item.competitionCategory}",${item.festivalSharePct}`;
        })
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `APIx_${analysis.route.code}_Elasticity_${seatClass}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] text-[#0F172A]">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Route Selector Tabs (DEL-BOM, DEL-BLR, DEL-PAT, BOM-BLR) */}
        <RouteSelector
          currentRouteCode={selectedRoute}
          onRouteChange={(code) => setSelectedRoute(code)}
        />

        {/* Route Header with Data Freshness Badge & Export CSV */}
        <RouteHeader
          route={analysis.route}
          activeWindow={leadTime}
          onExportCsv={handleExportCsv}
        />

        {/* KPI Row (APIx, CV, Festival Share with split bar, Directional Asymmetry) */}
        <KpiCards
          windowIndex={analysis.currentWindowIndex}
          directional={analysis.directionalAnalysis}
          activeWindow={leadTime}
          routeCode={selectedRoute}
        />

        {/* Section 2: Lead-Time Elasticity Curve & Route Competition Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <LeadTimeCurve
              windowsData={analysis.windowsData}
              activeWindow={leadTime}
              onSelectWindow={(w) => setLeadTime(w)}
            />
          </div>
          <div className="lg:col-span-5">
            <CompetitionSection
              windowIndex={analysis.currentWindowIndex}
              route={analysis.route}
            />
          </div>
        </div>

        {/* Section 3: Directional Price Asymmetry & Heatmap */}
        <DirectionalHeatmap
          directional={analysis.directionalAnalysis}
          activeWindow={leadTime}
        />

        {/* Section 4: Intra-Day Statistics (Tier 1 routes only) */}
        <IntraDayStats
          currentWindowIndex={analysis.currentWindowIndex}
          route={analysis.route}
          leadTime={leadTime}
        />
      </div>
    </div>
  );
}
