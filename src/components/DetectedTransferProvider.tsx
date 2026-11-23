import { createContext, useContext, useState, type ReactNode } from "react";
import { applyTransferFund, SAMPLE_TRANSFERS, type DetectedTransfer } from "@/lib/detectedTransfers";

type TransferContext = {
  transfers: DetectedTransfer[];
  prompted: boolean;
  autoOpen: boolean;
  reset: (transfers: DetectedTransfer[], autoOpen: boolean) => void;
  markPrompted: () => void;
  assign: (id: string, fund: string) => void;
};
const Context = createContext<TransferContext | null>(null);

export function DetectedTransferProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<DetectedTransfer[]>(SAMPLE_TRANSFERS);
  const [prompted, setPrompted] = useState(false);
  const [autoOpen, setAutoOpen] = useState(true);
  return <Context.Provider value={{ transfers, prompted, autoOpen, reset: (rows, shouldOpen) => { setTransfers(rows); setAutoOpen(shouldOpen); setPrompted(false); }, markPrompted: () => setPrompted(true), assign: (id, fund) => setTransfers((current) => applyTransferFund(current, id, fund)) }}>{children}</Context.Provider>;
}

export function useDetectedTransfers() {
  const context = useContext(Context);
  if (!context) throw new Error("Detected transfers need their provider");
  return context;
}