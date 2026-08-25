"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import VehicleDetailOverlay from "./VehicleDetailOverlay";
import { vehicles } from "@/data/vehicles";
import { Vehicle } from "@/types/vehicle";

interface VehicleDetailContextType {
  activeVehicle: Vehicle | null;
  openDetail: (vehicleId: string) => void;
  closeDetail: () => void;
}

const VehicleDetailContext = createContext<VehicleDetailContextType | null>(null);

/**
 * VehicleDetailProvider — Manages the vehicle inspection overlay state.
 *
 * openDetail(vehicleId) — opens the detail view for the specified vehicle
 * closeDetail()         — dismisses the detail view
 *
 * Must be inside EnquiryProvider so VehicleDetailOverlay can call useEnquiry().
 */
export function VehicleDetailProvider({ children }: { children: ReactNode }) {
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  const openDetail = useCallback((vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
    setActiveVehicle(vehicle);
  }, []);

  const closeDetail = useCallback(() => {
    setActiveVehicle(null);
  }, []);

  return (
    <VehicleDetailContext.Provider value={{ activeVehicle, openDetail, closeDetail }}>
      {children}
      <VehicleDetailOverlay
        vehicle={activeVehicle}
        onClose={closeDetail}
      />
    </VehicleDetailContext.Provider>
  );
}

/**
 * Hook to access the vehicle detail overlay trigger.
 */
export function useVehicleDetail(): VehicleDetailContextType {
  const ctx = useContext(VehicleDetailContext);
  if (!ctx) {
    throw new Error("useVehicleDetail must be used within a VehicleDetailProvider");
  }
  return ctx;
}
