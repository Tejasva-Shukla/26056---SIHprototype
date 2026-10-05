import React, { createContext, useContext, useState, useEffect } from "react";

const FilterContext = createContext(undefined);

export function FilterProvider({ children }) {
  const [seatClass, setSeatClassState] = useState("economy");
  const [leadTime, setLeadTimeState] = useState("T+1");
  const [selectedRoute, setSelectedRouteState] = useState("DEL-PAT");
  // Freshness simulation state: routeCode -> lastUpdated timestamp (ms)
  const [routeFreshness, setRouteFreshness] = useState({
    "DEL-BOM": Date.now() - 4 * 3600 * 1000,    // 4 hours ago (fresh)
    "DEL-BLR": Date.now() - 10 * 3600 * 1000,   // 10 hours ago (fresh for T+7/15/30, near expiry for T+1)
    "DEL-PAT": Date.now() - 28 * 3600 * 1000,   // 28 hours ago (expired for T+1 24h, triggers amber badge & fetch button)
    "BOM-BLR": Date.now() - 2 * 3600 * 1000,    // 2 hours ago (fresh)
  });

  useEffect(() => {
    try {
      const savedSeat = localStorage.getItem("apix_seat_class");
      const savedLead = localStorage.getItem("apix_lead_time");
      const savedRoute = localStorage.getItem("apix_route");

      if (savedSeat === "economy" || savedSeat === "business") {
        setSeatClassState(savedSeat);
      }
      if (["T+1", "T+7", "T+15", "T+30", "T+45"].includes(savedLead)) {
        setLeadTimeState(savedLead);
      }
      if (savedRoute) {
        setSelectedRouteState(savedRoute);
      }
    } catch (e) {
      // LocalStorage access may fail in restricted iframe environments
    }
  }, []);

  const setSeatClass = (val) => {
    setSeatClassState(val);
    try {
      localStorage.setItem("apix_seat_class", val);
    } catch (e) {}
  };

  const setLeadTime = (val) => {
    setLeadTimeState(val);
    try {
      localStorage.setItem("apix_lead_time", val);
    } catch (e) {}
  };

  const setSelectedRoute = (val) => {
    setSelectedRouteState(val);
    try {
      localStorage.setItem("apix_route", val);
    } catch (e) {}
  };

  const refreshRouteData = (routeCode) => {
    setRouteFreshness((prev) => ({
      ...prev,
      [routeCode]: Date.now(),
    }));
  };

  return (
    <FilterContext.Provider
      value={{
        seatClass,
        setSeatClass,
        leadTime,
        setLeadTime,
        selectedRoute,
        setSelectedRoute,
        routeFreshness,
        refreshRouteData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
