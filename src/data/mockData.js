// =====================================================================
// APIx Prototype — SIH 2026, PS 26056: Core Synthetic Data & Constants
// =====================================================================

// ---------------------------------------------------------------------
// CONFIGURABLE CONSTANTS (As specified in UI prompt requirements)
// ---------------------------------------------------------------------

/**
 * Directional Heatmap maximum index clamp for deep red colour
 */
export const HEATMAP_CLAMP_MAX = 150;

/**
 * Festival Demand Share severity thresholds (%)
 */
export const FESTIVAL_MODERATE_THRESHOLD = 15.0; // Above this is amber
export const FESTIVAL_HIGH_THRESHOLD = 30.0;     // Above this is red

/**
 * Demo values for the prototype. Replace with the festival.json + decay-ratio calculation in the full build.
 */
export const DEMO_FESTIVAL_SHARE_BY_WINDOW = {
  "DEL-BOM": { "T+45": 7.0, "T+30": 15.0, "T+15": 22.5, "T+7": 21.0, "T+1": 18.5 },
  "DEL-BLR": { "T+45": 5.0, "T+30": 12.0, "T+15": 18.5, "T+7": 25.0, "T+1": 19.5 },
  "DEL-PAT": { "T+45": 10.0, "T+30": 18.0, "T+15": 24.5, "T+7": 23.0, "T+1": 21.5 },
  "BOM-BLR": { "T+45": 6.0, "T+30": 10.0, "T+15": 14.5, "T+7": 18.0, "T+1": 12.5 },
  "default": { "T+45": 5.0, "T+30": 10.0, "T+15": 15.0, "T+7": 12.0, "T+1": 10.0 }
};

/**
 * Coefficient of Variation (CV) Competition category bands & labels
 */
export const CV_BANDS = {
  MONOPOLY: { max: 0, label: "Monopoly route", desc: "Single airline, price-exploitation risk", color: "red" },
  SHADOW_PRICING: { min: 0, max: 2, label: "Shadow pricing", desc: "Algorithmic price matching (<2%)", color: "amber" },
  // Between 2% and 5%
  MODERATE: { min: 2, max: 5, label: "Moderate competition", desc: "Differentiated tier offerings (2%-5%)", color: "neutral" }, // TODO: Confirm label for 2%-5% band
  HEALTHY: { min: 5, max: 15, label: "Healthy competition", desc: "Balanced multi-carrier pricing (5%-15%)", color: "green" },
  PRICE_WAR: { min: 15, label: "Active price war", desc: "Aggressive carrier undercutting (>15%)", color: "purple" },
};

/**
 * Intra-day APIx alert threshold
 * TODO: Confirm the exact alert threshold value with domain specialist
 */
export const INTRADAY_ALERT_THRESHOLD = 145.0;

/**
 * Route tier classification for Intra-day breakdown and Data Freshness
 * DEL-BOM, DEL-BLR, BOM-BLR are Tier 1; DEL-PAT is Tier 2 / Regional migration corridor
 * TODO: Confirm if additional routes will be added to Tier 1
 */
export const ROUTE_TIER_CONFIG = {
  "DEL-BOM": { tier: 1, label: "Tier 1 Metro Corridor" },
  "DEL-BLR": { tier: 1, label: "Tier 1 Metro Corridor" },
  "BOM-BLR": { tier: 1, label: "Tier 1 Metro Corridor" },
  "DEL-PAT": { tier: 2, label: "Tier 2 Regional Migration Corridor" },
};

/**
 * Max Expiry (in hours) based on Route Tier and Lead Time Window
 * From methodology doc:
 * Tier 1: T+1 12h, T+7/15 24h, T+30/45 48h (2 days)
 * Tier 2: T+1/7 24h, T+15 48h (2 days), T+30/45 120h (5 days)
 * Tier 3: T+1/7/15 120h (5 days), T+30/45 168h (7 days)
 */
export const EXPIRY_RULES_HOURS = {
  1: { "T+1": 12, "T+7": 24, "T+15": 24, "T+30": 48, "T+45": 48 },
  2: { "T+1": 24, "T+7": 24, "T+15": 48, "T+30": 120, "T+45": 120 },
  3: { "T+1": 120, "T+7": 120, "T+15": 120, "T+30": 168, "T+45": 168 },
};

// ---------------------------------------------------------------------
// CORE CORRIDORS & AIRLINES
// ---------------------------------------------------------------------

export const CORE_ROUTES = [
  { code: "DEL-BOM", from: "DEL", to: "BOM", fromCity: "Delhi", toCity: "Mumbai", fromState: "Delhi", toState: "Maharashtra", label: "Delhi → Mumbai", distanceKm: 1148 },
  { code: "DEL-BLR", from: "DEL", to: "BLR", fromCity: "Delhi", toCity: "Bengaluru", fromState: "Delhi", toState: "Karnataka", label: "Delhi → Bengaluru", distanceKm: 1740 },
  { code: "DEL-PAT", from: "DEL", to: "PAT", fromCity: "Delhi", toCity: "Patna", fromState: "Delhi", toState: "Bihar", label: "Delhi → Patna", distanceKm: 850 },
  { code: "BOM-BLR", from: "BOM", to: "BLR", fromCity: "Mumbai", toCity: "Bengaluru", fromState: "Maharashtra", toState: "Karnataka", label: "Mumbai → Bengaluru", distanceKm: 842 },
  { code: "BOM-DEL", from: "BOM", to: "DEL", fromCity: "Mumbai", toCity: "Delhi", fromState: "Maharashtra", toState: "Delhi", label: "Mumbai → Delhi", distanceKm: 1148 },
  { code: "BLR-DEL", from: "BLR", to: "DEL", fromCity: "Bengaluru", toCity: "Delhi", fromState: "Karnataka", toState: "Delhi", label: "Bengaluru → Delhi", distanceKm: 1740 },
  { code: "PAT-DEL", from: "PAT", to: "DEL", fromCity: "Patna", toCity: "Delhi", fromState: "Bihar", toState: "Delhi", label: "Patna → Delhi", distanceKm: 850 },
  { code: "BLR-BOM", from: "BLR", to: "BOM", fromCity: "Bengaluru", toCity: "Mumbai", fromState: "Karnataka", toState: "Maharashtra", label: "Bengaluru → Mumbai", distanceKm: 842 },
];

export const AIRLINES = [
  { code: "6E", name: "IndiGo", icao: "IGO", defaultSeats: 186, avgPlf: 0.884 },
  { code: "AI", name: "Air India", icao: "AIC", defaultSeats: 162, avgPlf: 0.852 },
  { code: "IX", name: "Air India Express", icao: "AXB", defaultSeats: 180, avgPlf: 0.865 },
  { code: "QP", name: "Akasa Air", icao: "AKJ", defaultSeats: 189, avgPlf: 0.861 },
  { code: "SG", name: "SpiceJet", icao: "SEJ", defaultSeats: 189, avgPlf: 0.889 },
];

export const FESTIVALS = [
  { id: "chhath-puja", name: "Chhath Puja", dateStart: "2026-11-14", dateEnd: "2026-11-18", corridors: ["DEL-PAT", "BOM-PAT", "BLR-PAT", "CCU-PAT"], impactPct: 42.5 },
  { id: "diwali", name: "Diwali Festival Week", dateStart: "2026-11-06", dateEnd: "2026-11-12", corridors: ["DEL-BOM", "BOM-DEL", "DEL-BLR", "BLR-DEL", "DEL-PAT", "BOM-GOI"], impactPct: 38.0 },
  { id: "durga-puja", name: "Durga Puja", dateStart: "2026-10-18", dateEnd: "2026-10-24", corridors: ["DEL-CCU", "BOM-CCU", "BLR-CCU", "CCU-DEL"], impactPct: 34.0 },
  { id: "eid-ul-fitr", name: "Eid-ul-Fitr", dateStart: "2026-03-20", dateEnd: "2026-03-23", corridors: ["DEL-SXR", "BOM-DEL", "DEL-HYD", "HYD-DEL"], impactPct: 26.5 },
  { id: "pongal-sankranti", name: "Pongal / Makar Sankranti", dateStart: "2026-01-13", dateEnd: "2026-01-17", corridors: ["BLR-MAA", "MAA-BLR", "DEL-HYD", "BOM-MAA"], impactPct: 28.0 },
  { id: "holi", name: "Holi Festival", dateStart: "2026-03-03", dateEnd: "2026-03-06", corridors: ["DEL-PAT", "DEL-BOM", "BOM-DEL"], impactPct: 22.0 },
];

export const STATE_WEIGHTS = [
  { stateCode: "DL", stateName: "Delhi", hcesWeight: 0.0842, currentApix: 114.8, yoyInflationPct: 14.8, activeRoutesCount: 18, festivalMarkupAvgPct: 18.2 },
  { stateCode: "MH", stateName: "Maharashtra", hcesWeight: 0.0965, currentApix: 112.4, yoyInflationPct: 12.4, activeRoutesCount: 22, festivalMarkupAvgPct: 16.5 },
  { stateCode: "KA", stateName: "Karnataka", hcesWeight: 0.0782, currentApix: 110.9, yoyInflationPct: 10.9, activeRoutesCount: 16, festivalMarkupAvgPct: 14.1 },
  { stateCode: "BR", stateName: "Bihar", hcesWeight: 0.0315, currentApix: 138.6, yoyInflationPct: 38.6, activeRoutesCount: 8, festivalMarkupAvgPct: 34.8 },
  { stateCode: "WB", stateName: "West Bengal", hcesWeight: 0.0541, currentApix: 118.2, yoyInflationPct: 18.2, activeRoutesCount: 14, festivalMarkupAvgPct: 21.4 },
  { stateCode: "TN", stateName: "Tamil Nadu", hcesWeight: 0.0624, currentApix: 109.1, yoyInflationPct: 9.1, activeRoutesCount: 14, festivalMarkupAvgPct: 12.3 },
  { stateCode: "TG", stateName: "Telangana", hcesWeight: 0.0512, currentApix: 108.4, yoyInflationPct: 8.4, activeRoutesCount: 12, festivalMarkupAvgPct: 11.8 },
  { stateCode: "GA", stateName: "Goa", hcesWeight: 0.0218, currentApix: 124.5, yoyInflationPct: 24.5, activeRoutesCount: 8, festivalMarkupAvgPct: 27.6 },
  { stateCode: "AS", stateName: "Assam", hcesWeight: 0.0245, currentApix: 116.3, yoyInflationPct: 16.3, activeRoutesCount: 6, festivalMarkupAvgPct: 15.2 },
  { stateCode: "JK", stateName: "Jammu & Kashmir", hcesWeight: 0.0195, currentApix: 129.4, yoyInflationPct: 29.4, activeRoutesCount: 5, festivalMarkupAvgPct: 26.0 },
  { stateCode: "GJ", stateName: "Gujarat", hcesWeight: 0.0588, currentApix: 107.6, yoyInflationPct: 7.6, activeRoutesCount: 10, festivalMarkupAvgPct: 9.4 },
];

export const LEAD_TIME_WINDOWS = ["T+45", "T+30", "T+15", "T+7", "T+1"];

// ---------------------------------------------------------------------
// DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (Identical to original)
// ---------------------------------------------------------------------

export function createPRNG(seed) {
  let t = Math.abs(seed) % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => {
    t = (16807 * t) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

// ---------------------------------------------------------------------
// INDEX CALCULATION MATHS (Preserved exactly as in existing prototype)
// ---------------------------------------------------------------------

export function calculateBaseFareP0(route, leadTime, seatClass) {
  const seed = hashString(`${route.code}-${leadTime}-${seatClass}-base-2022`);
  const prng = createPRNG(seed);
  const leadFactors = { "T+45": 0.88, "T+30": 0.94, "T+15": 1.0, "T+7": 1.08, "T+1": 1.22 };
  
  return Math.round(
    (3.65 * route.distanceKm + 650) *
    leadFactors[leadTime] *
    (0.95 + 0.1 * prng()) *
    1.113025 *
    (seatClass === "business" ? 2.9 : 1.0)
  );
}

/**
 * Generate synthetic flight observations for a corridor.
 * NOTE: Timestamps span all 4 intra-day buckets (Late night, Morning peak, Afternoon peak, Evening peak)
 * to support the intra-day breakdown visualization while keeping fare values strictly deterministic.
 */
export function generateObservations(route, leadTime, seatClass, cycleIndex = 0) {
  const seed = hashString(`${route.code}-${leadTime}-${seatClass}-${cycleIndex}`);
  const prng = createPRNG(seed);
  const baseP0 = calculateBaseFareP0(route, leadTime, seatClass);
  const observations = [];

  const leadMultipliers = {
    "T+45": 0.96 + 0.08 * prng(),
    "T+30": 1.02 + 0.08 * prng(),
    "T+15": 1.14 + 0.12 * prng(),
    "T+7": 1.32 + 0.22 * prng(),
    "T+1": route.code === "DEL-PAT" ? 2.15 + 0.45 * prng() : 1.62 + 0.35 * prng(),
  };

  const expectedFare = baseP0 * leadMultipliers[leadTime];

  // Distribution of times across all 4 Intra-Day Buckets:
  // Red-eye (00:00 - 05:59): 02:30, 04:45
  // Morning peak (06:00 - 11:59): 06:15, 08:40, 10:20
  // Afternoon peak (12:00 - 16:59): 13:10, 14:50, 16:15
  // Evening peak (17:00 - 23:59): 18:10, 19:40, 21:30
  const departureTimes = [
    "02:30", "04:45", "06:15", "08:40", "10:20", "13:10", "14:50", "16:15", "18:10", "19:40", "21:30"
  ];

  AIRLINES.forEach((airline, airlineIdx) => {
    const flightCount = 3 + (airlineIdx % 2); // 3 or 4 flights per airline = 17 flights total
    for (let f = 0; f < flightCount; f++) {
      const flightNo = `${airline.code}-${100 + 20 * airlineIdx + 4 * f + Math.floor(8 * prng())}`;
      const departureTime = departureTimes[(airlineIdx * 2 + f) % departureTimes.length];
      
      let airlineWeight = 1.0;
      if (airline.code === "6E") airlineWeight = 0.98 + 0.05 * prng();
      else if (airline.code === "AI") airlineWeight = 1.02 + 0.07 * prng();
      else if (airline.code === "QP") airlineWeight = 0.94 + 0.06 * prng();
      else if (airline.code === "SG") airlineWeight = 0.96 + 0.12 * prng();
      else if (airline.code === "IX") airlineWeight = 0.95 + 0.06 * prng();

      let fare = Math.round(expectedFare * airlineWeight * (0.97 + 0.06 * prng()));
      
      // Preserve original outlier injection triggers
      if (leadTime === "T+1" && airlineIdx === 1 && f === 0) {
        fare = Math.round(1.65 * expectedFare);
      }
      if (leadTime === "T+1" && airlineIdx === 0 && f === 2 && prng() > 0.6) {
        fare = 42500;
      }

      const seatsRemaining = Math.max(1, Math.floor(28 * prng()) + 2);
      const plf = Math.round((airline.avgPlf + (0.08 * prng() - 0.04)) * 1000) / 1000;

      observations.push({
        flightNo,
        airlineCode: airline.code,
        airlineName: airline.name,
        departureTime,
        fare,
        seatsRemaining,
        plf,
        isOutlier: false,
      });
    }
  });

  const sortedFares = observations.map((o) => o.fare).sort((a, b) => a - b);
  const mid = Math.floor(sortedFares.length / 2);
  const peerMedian = sortedFares.length % 2 === 0
    ? Math.round((sortedFares[mid - 1] + sortedFares[mid]) / 2)
    : sortedFares[mid];

  return { observations, peerMedian };
}

export function filterOutliers(observations, peerMedian) {
  const valid = [];
  const dropped = [];

  observations.forEach((flight) => {
    const deviation = Math.abs(flight.fare - peerMedian) / peerMedian;
    if (flight.fare > 40000) {
      flight.isOutlier = true;
      flight.outlierReason = "ceiling_gt_40k";
      dropped.push(flight);
    } else if (deviation > 0.4) {
      flight.isOutlier = true;
      flight.outlierReason = "deviation_gt_40pct";
      dropped.push(flight);
    } else {
      valid.push(flight);
    }
  });

  return {
    valid,
    audit: {
      totalObserved: observations.length,
      peerMedian,
      deviationThresholdPct: 40,
      ceilingLimit: 40000,
      droppedCount: dropped.length,
      droppedObservations: dropped,
    },
  };
}

export function computeIndex(validFlights, baseP0) {
  if (validFlights.length === 0) {
    return {
      capacityWeightedJevons: 100.0,
      unweightedJevons: 100.0,
      apixScore: 100.0,
      airlineBreakdown: [],
      cv: 0,
      competitionCategory: "monopoly",
    };
  }

  const airlineGroups = {};
  validFlights.forEach((f) => {
    if (!airlineGroups[f.airlineCode]) airlineGroups[f.airlineCode] = [];
    airlineGroups[f.airlineCode].push(f);
  });

  const airlineCodes = Object.keys(airlineGroups);
  
  // Unweighted Jevons
  let logSum = 0;
  validFlights.forEach((f) => {
    logSum += Math.log(f.fare / baseP0);
  });
  const unweightedJevons = Math.round(1000 * Math.exp(logSum / validFlights.length)) / 10;

  const airlineMetaMap = new Map(AIRLINES.map((a) => [a.code, a]));
  const carrierStats = airlineCodes.map((code) => {
    const meta = airlineMetaMap.get(code) || { code, name: code, icao: code, defaultSeats: 180, avgPlf: 0.86 };
    const flights = airlineGroups[code];
    const totalSeats = flights.length * meta.defaultSeats;
    const avgPlf = flights.reduce((sum, f) => sum + f.plf, 0) / flights.length;
    const avgFare = Math.round(flights.reduce((sum, f) => sum + f.fare, 0) / flights.length);
    const lowestFare = Math.min(...flights.map((f) => f.fare));
    return {
      code,
      airlineMeta: meta,
      totalSeats,
      avgPlf,
      capacityScore: totalSeats * avgPlf,
      flights,
      avgFare,
      lowestFare,
    };
  });

  const totalCapacityScore = carrierStats.reduce((sum, c) => sum + c.capacityScore, 0) || 1;
  const totalFleetSeats = carrierStats.reduce((sum, c) => sum + c.totalSeats, 0) || 1;
  const minObservedFare = Math.min(...validFlights.map((f) => f.fare));

  let weightedLogSum = 0;
  const airlineBreakdown = carrierStats.map((c) => {
    const weight = c.capacityScore / totalCapacityScore;
    const fareRatio = c.avgFare / baseP0;
    weightedLogSum += weight * Math.log(fareRatio);

    return {
      code: c.code,
      name: c.airlineMeta.name,
      lowestFare: c.lowestFare,
      avgFare: c.avgFare,
      flightCount: c.flights.length,
      seatSharePct: Math.round((c.totalSeats / totalFleetSeats) * 1000) / 10,
      capacityWeightPct: Math.round(weight * 1000) / 10,
      carrierApix: Math.round(fareRatio * 1000) / 10,
      isBestValue: c.lowestFare === minObservedFare,
    };
  }).sort((a, b) => a.lowestFare - b.lowestFare);

  const capacityWeightedJevons = Math.round(1000 * Math.exp(weightedLogSum)) / 10;

  // CV Calculation
  const fares = validFlights.map((f) => f.fare);
  const meanFare = fares.reduce((sum, f) => sum + f, 0) / fares.length;
  const variance = fares.reduce((sum, f) => sum + Math.pow(f - meanFare, 2), 0) / fares.length;
  const cvPct = Math.round((Math.sqrt(variance) / meanFare) * 1000) / 10;

  let competitionCategory = "healthy";
  if (airlineCodes.length <= 1 || cvPct === 0) {
    competitionCategory = "monopoly";
  } else if (cvPct < 2) {
    competitionCategory = "shadow_pricing";
  } else if (cvPct > 15) {
    competitionCategory = "price_war";
  }

  return {
    capacityWeightedJevons,
    unweightedJevons,
    apixScore: capacityWeightedJevons,
    airlineBreakdown,
    cv: cvPct,
    competitionCategory,
  };
}

export function computeFestivalShare(route, leadTime, apixScore) {
  const demoShares = DEMO_FESTIVAL_SHARE_BY_WINDOW[route.code] || DEMO_FESTIVAL_SHARE_BY_WINDOW["default"];
  return demoShares[leadTime] || 0;
}

export function computeDirectionalAnalysis(route, seatClass, activeWindow, cycleIndex = 0) {
  const returnCode = `${route.to}-${route.from}`;
  const returnRoute = CORE_ROUTES.find((r) => r.code === returnCode) || {
    ...route,
    code: returnCode,
    from: route.to,
    to: route.from,
    fromCity: route.toCity,
    toCity: route.fromCity,
    label: `${route.toCity} → ${route.fromCity}`,
  };

  const outboundFares = {};
  const inboundFares = {};

  LEAD_TIME_WINDOWS.forEach((window) => {
    const p0Out = calculateBaseFareP0(route, window, seatClass);
    const p0In = calculateBaseFareP0(returnRoute, window, seatClass);

    const { observations: obsOut, peerMedian: medOut } = generateObservations(route, window, seatClass, cycleIndex);
    const { observations: obsIn, peerMedian: medIn } = generateObservations(returnRoute, window, seatClass, cycleIndex);

    const validOut = filterOutliers(obsOut, medOut).valid;
    const validIn = filterOutliers(obsIn, medIn).valid;

    const apixOut = computeIndex(validOut, p0Out).capacityWeightedJevons;
    const apixIn = computeIndex(validIn, p0In).capacityWeightedJevons;

    outboundFares[window] = Math.round((p0Out * apixOut) / 100);
    if (route.code === "DEL-PAT") {
      inboundFares[window] = Math.round((p0In * Math.min(apixIn, 112)) / 100);
    } else {
      inboundFares[window] = Math.round((p0In * apixIn) / 100);
    }
  });

  const outboundHeatmapIndex = {};
  const inboundHeatmapIndex = {};

  LEAD_TIME_WINDOWS.forEach((window) => {
    const minFare = Math.min(outboundFares[window], inboundFares[window]) || 1;
    outboundHeatmapIndex[window] = Math.round((outboundFares[window] / minFare) * 1000) / 10;
    inboundHeatmapIndex[window] = Math.round((inboundFares[window] / minFare) * 1000) / 10;
  });

  const activeOutFare = outboundFares[activeWindow];
  const activeInFare = inboundFares[activeWindow] || 1;

  return {
    outboundCode: route.code,
    inboundCode: returnRoute.code,
    outboundFares,
    inboundFares,
    outboundHeatmapIndex,
    inboundHeatmapIndex,
    asymmetryIndexPct: Math.round((activeOutFare / activeInFare) * 1000) / 10,
  };
}

export function getFullRouteAnalysis(routeCode, seatClass = "economy", activeWindow = "T+1", cycleIndex = 0) {
  const route = CORE_ROUTES.find((r) => r.code === routeCode) || CORE_ROUTES[0];
  const windowsData = {};

  LEAD_TIME_WINDOWS.forEach((window) => {
    const baseP0 = calculateBaseFareP0(route, window, seatClass);
    const { observations, peerMedian } = generateObservations(route, window, seatClass, cycleIndex);
    const { valid, audit } = filterOutliers(observations, peerMedian);
    const indexResult = computeIndex(valid, baseP0);
    const festivalSharePct = computeFestivalShare(route, window, indexResult.apixScore);
    const cheapestFare = valid.length > 0 ? Math.min(...valid.map((f) => f.fare)) : baseP0;

    windowsData[window] = {
      window,
      baseFareP0: baseP0,
      unweightedJevons: indexResult.unweightedJevons,
      capacityWeightedJevons: indexResult.capacityWeightedJevons,
      apixScore: indexResult.apixScore,
      diffFromBasePct: Math.round((indexResult.apixScore - 100) * 10) / 10,
      cv: indexResult.cv,
      competitionCategory: indexResult.competitionCategory,
      cheapestFare,
      airlineBreakdown: indexResult.airlineBreakdown,
      outlierAudit: audit,
      festivalSharePct,
      validObservations: valid,
    };
  });

  const directionalAnalysis = computeDirectionalAnalysis(route, seatClass, activeWindow, cycleIndex);

  return {
    route,
    seatClass,
    activeWindow,
    windowsData,
    currentWindowIndex: windowsData[activeWindow],
    directionalAnalysis,
  };
}
