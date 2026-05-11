import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  userId: string;
  username: string;
  role: "OPERATOR" | "ADMIN";
};

type AuthStoreState = {
  user?: User;
};

export type AuthStoreActions = {
  setUser: (
    newUser:
      | AuthStoreState["user"]
      | ((currenUser: AuthStoreState["user"]) => AuthStoreState["user"]),
  ) => void;
};

export type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = createStore<AuthStore>()(
  persist(
    (set) => ({
      user: undefined,
      setUser: (newUser) => {
        set((state) => ({
          user: typeof newUser === "function" ? newUser(state.user) : newUser,
        }));
      },
    }),
    { name: "user-data" },
  ),
);
