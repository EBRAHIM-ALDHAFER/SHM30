import React, { useState } from "react";
import { Invoice, Product, Customer, User, ThemeColors } from "../types";
import POS from "./POS";
import { Store, MapPin, Package } from "lucide-react";

interface PosAndOperationsProps {
  products: Product[];
  setProducts: (val: Product[]) => void;
  invoices: Invoice[];
  setInvoices: (val: Invoice[]) => void;
  customers: Customer[];
  setCustomers: (val: Customer[]) => void;
  theme: ThemeColors;
  user: User;
  triggerNotification?: (text: string, type?: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  isPosFullscreen?: boolean;
  setIsPosFullscreen?: (val: boolean) => void;
  // Workspace Environment Settings
  activeBranchId?: string;
  activeWarehouseId?: string;
  activePosId?: string;
  branches?: any[];
  warehouses?: any[];
  posUnits?: any[];
}

export default function PosAndOperations({
  products,
  setProducts,
  invoices,
  setInvoices,
  customers,
  setCustomers,
  theme,
  user,
  triggerNotification = () => {},
  addAuditLog = () => {},
  isPosFullscreen = false,
  setIsPosFullscreen = () => {},
  activeBranchId = "br_riyadh_main",
  activeWarehouseId = "wh_central_riyadh",
  activePosId = "pos_riyadh_1",
  branches = [],
  warehouses = [],
  posUnits = []
}: PosAndOperationsProps) {
  return (
    <div className="space-y-6">
      <POS
        products={products}
        setProducts={setProducts}
        invoices={invoices}
        setInvoices={setInvoices}
        customers={customers}
        setCustomers={setCustomers}
        theme={theme}
        user={user}
        isPosFullscreen={isPosFullscreen}
        setIsPosFullscreen={setIsPosFullscreen}
        triggerNotification={triggerNotification}
        addAuditLog={addAuditLog}
        activeBranchId={activeBranchId}
        activeWarehouseId={activeWarehouseId}
        activePosId={activePosId}
        branches={branches}
        warehouses={warehouses}
        posUnits={posUnits}
      />
    </div>
  );
}
