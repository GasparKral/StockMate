import type { UUID } from "node:crypto";
import type { Product } from "./product";
import type { UserInfo } from "./userInfo";

export type StockMovement = {
  id: UUID;
  product: Product;
  quantity: number;
  notes: string;
  type: MovementType;
  reason: MovementReason;
  registeredAt: string;
  registeredBy: UserInfo;
};

export type MovementType = "ENTRY" | "EXIT";
export type MovementReason =
  | "PURCHASE"
  | "RETURN"
  | "ADJUSTMENT"
  | "SALE"
  | "WASTE"
  | "ADJUSTMENT_OUT";
