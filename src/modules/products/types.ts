import { Product, ThemeColors, Invoice, User, Branch, Warehouse, StockTransfer } from "../../types";

export interface ProductsProps {
  products: Product[];
  setProducts: (prod: Product[]) => void;
  theme: ThemeColors;
  openUnifiedActions?: (type: string, data: any) => void;
  triggerNotification?: (text: string, type: any) => void;
  addAuditLog?: (event: string, text: string) => void;
  invoices?: Invoice[];
  setInvoices?: (invs: Invoice[]) => void;
  user?: User;
  activeBranchId?: string;
  activeWarehouseId?: string;
  activePosId?: string;
  activeStoreId?: string;
}
