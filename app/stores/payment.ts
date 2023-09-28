import { create } from "zustand";
import { SafeListing } from "../types";
import { Range } from "react-date-range";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface PaymentState {
  listing: SafeListing | null;
  dateRange: Range;
  setListing: (listing: SafeListing) => void;
  setDateRange: (dateRange: Range) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  listing: null,
  dateRange: initialDateRange,
  setListing: (listing: SafeListing) => set(() => ({ listing })),
  setDateRange: (dateRange: Range) => set(() => ({ dateRange })),
}));
