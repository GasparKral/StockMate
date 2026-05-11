import type { UUID } from "crypto";

export type Product = {
  id: UUID;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  unit: string; // Unidades KG/ml/Lb..
  category: string;
  stock: number;
  minStock: number;
  state: boolean;
};
