import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

// Lives in its own module so hot reloads can't create a second copy.
export const AuthContext = createContext<AuthState | null>(null);
