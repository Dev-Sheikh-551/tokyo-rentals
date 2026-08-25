"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import EnquiryOverlay from "./EnquiryOverlay";

interface EnquiryContextType {
  isOpen: boolean;
  isComplete: boolean;
  selectedVehicleId: string | null;
  /** Opens the enquiry overlay. Pass a vehicle id to preselect it in the form. */
  openEnquiry: (vehicleId?: string | React.MouseEvent | unknown) => void;
  closeEnquiry: () => void;
  onSuccess: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | null>(null);

/**
 * EnquiryProvider — Hoists enquiry modal state so any component in the tree
 * can trigger the shared EnquiryOverlay without duplicating state.
 *
 * openEnquiry() — opens a blank enquiry
 * openEnquiry(vehicleId) — opens with that vehicle pre-selected in the form
 */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const openEnquiry = useCallback((vehicleId?: string | React.MouseEvent | unknown) => {
    if (typeof vehicleId === "string") {
      setSelectedVehicleId(vehicleId);
    } else {
      setSelectedVehicleId(null);
    }
    setIsOpen(true);
  }, []);

  const closeEnquiry = useCallback(() => {
    setIsOpen(false);
    // Clear vehicle selection after the close animation completes (~600ms)
    setTimeout(() => setSelectedVehicleId(null), 600);
  }, []);

  const onSuccess = useCallback(() => {
    setIsOpen(false);
    setIsComplete(true);
    setTimeout(() => setSelectedVehicleId(null), 600);
  }, []);

  return (
    <EnquiryContext.Provider
      value={{
        isOpen,
        isComplete,
        selectedVehicleId,
        openEnquiry,
        closeEnquiry,
        onSuccess,
      }}
    >
      {children}
      <EnquiryOverlay
        isOpen={isOpen}
        onClose={closeEnquiry}
        onSuccess={onSuccess}
        initialVehicleId={selectedVehicleId}
      />
    </EnquiryContext.Provider>
  );
}

/**
 * Hook to access the shared Enquiry overlay trigger and state.
 */
export function useEnquiry(): EnquiryContextType {
  const ctx = useContext(EnquiryContext);
  if (!ctx) {
    throw new Error("useEnquiry must be used within an EnquiryProvider");
  }
  return ctx;
}
