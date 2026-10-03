import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    stateCode?: string;
  }
  interface Session {
    user: DefaultSession["user"] & { role: string; stateCode: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    stateCode?: string;
  }
}
