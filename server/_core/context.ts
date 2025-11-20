import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getDefaultUser } from "../initDefaultUser";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Simplified authentication: always use default user
  // No login required - perfect for personal use or demo
  const user = await getDefaultUser();

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
