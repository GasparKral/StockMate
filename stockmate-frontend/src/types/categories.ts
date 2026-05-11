import type { UUID } from "crypto";

export type Category = {
  id: UUID;
  name: string;
  description: string;
  productCount: number;
};
