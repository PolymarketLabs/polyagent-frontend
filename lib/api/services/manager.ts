import { apiGet, type ApiSuccessResponse } from "@/lib/api/client";
import type { FundBase } from "@/lib/api/types/fund";
import type { KeywordParams, PaginatedData, PaginationParams } from "@/lib/api/types/pagination";

export type ManagerFundItem = FundBase & {
  cumulativeReturnPct: number;
  aum: number;
  investorCount: number;
};

export type ManagerSummary = {
  fundCount: number;
  totalInvestorCount: number;
  totalInvested: number;
  totalValue: number;
};

export type ManagerIntentSide = "BUY" | "SELL";
export type ManagerIntentOrderType = "GTC" | "GTD" | "FOK" | "FAK";
export type ManagerIntentStatus = "PENDING" | "EXECUTING" | "COMPLETED" | "FAILED";

export type ManagerIntent = {
  intentId: string;
  createdAt: string;
  deferExec: boolean;
  order: {
    tokenId: string;
    side: ManagerIntentSide;
    expiration: string;
  };
  orderType: ManagerIntentOrderType;
  postOnly: boolean;
  status: ManagerIntentStatus;
  errorMessage?: string;
};

export async function listManagerFunds(
  params: PaginationParams & KeywordParams,
): Promise<PaginatedData<ManagerFundItem>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<ManagerFundItem>>>(
    "/manager/funds",
    params,
  );
  return payload.data;
}

export async function getManagerSummary(): Promise<ManagerSummary> {
  const payload = await apiGet<ApiSuccessResponse<ManagerSummary>>("/manager/summary");
  return payload.data;
}

export async function listManagerIntents(
  fundId: number,
  params: PaginationParams,
): Promise<PaginatedData<ManagerIntent>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<ManagerIntent>>>(
    `/manager/funds/${fundId}/intents`,
    params,
  );
  return payload.data;
}
