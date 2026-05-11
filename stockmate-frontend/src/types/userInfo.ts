import type { UUID } from "node:crypto";

export type UserInfo = {
  id: UUID;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};
