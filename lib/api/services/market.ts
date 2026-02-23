import { apiGet, type ApiSuccessResponse } from "@/lib/api/client";
import type {
  FundBase,
  FundStatus,
  FundTransactionStatus,
  FundTransactionType,
} from "@/lib/api/types/fund";
import type {
  KeywordParams,
  PaginatedData,
  PaginationParams,
  SortOrder,
} from "@/lib/api/types/pagination";
export type MarketFundDetail = FundBase & {
  cumulativeReturnPct: number;
  maxDrawdownPct: number;
  aum: number;
  investorCount: number;
};

export type MarketFundPerformanceData = {
  date: string;
  value: number;
}[];

export type MarketFundPosition = {
  id: number;
  marketName: string;
  allocationPct: number;
  shares: number;
  currentValue: number;
  outcome: "YES" | "NO";
};

export type MarketFundCashReserve = {
  allocationPct: number;
  currentValue: number;
};

export type MarketFundInvestorRanking = {
  id: number;
  rank: number;
  investor: string;
  holdingShares: number;
  holdingSharePct: number;
};

export type MarketFundTransaction = {
  id: number;
  date: string;
  type: FundTransactionType;
  investor: string;
  amount: number | null;
  shares: number | null;
  status: FundTransactionStatus;
};

export type MarketSummary = {
  fundCount: number;
  totalInvestorCount: number;
  totalInvested: number;
  totalValue: number;
};

export async function listMarketFunds(
  params: PaginationParams &
    KeywordParams & {
      status?: FundStatus;
      sortBy?: "CUMULATIVE_RETURN_PCT" | "AUM" | "INVESTOR_COUNT";
      sortOrder?: SortOrder;
    },
): Promise<PaginatedData<MarketFundDetail>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<MarketFundDetail>>>(
    "/market/funds",
    params,
  );
  return payload.data;
}

export async function getMarketSummary(): Promise<MarketSummary> {
  const payload = await apiGet<ApiSuccessResponse<MarketSummary>>("/market/summary");
  return payload.data;
}

export async function getMarketFundDetail(fundId: number): Promise<MarketFundDetail> {
  const payload = await apiGet<ApiSuccessResponse<MarketFundDetail>>(
    `/market/funds/${fundId}/detail`,
  );
  return payload.data;
}

export async function getMarketFundPerformance(fundId: number): Promise<MarketFundPerformanceData> {
  const payload = await apiGet<ApiSuccessResponse<MarketFundPerformanceData>>(
    `/market/funds/${fundId}/performance`,
  );
  return payload.data;
}

export async function listMarketFundPositions(
  fundId: number,
  params: PaginationParams,
): Promise<PaginatedData<MarketFundPosition>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<MarketFundPosition>>>(
    `/market/funds/${fundId}/positions`,
    params,
  );
  return payload.data;
}

export async function getMarketFundCashReserve(fundId: number): Promise<MarketFundCashReserve> {
  const payload = await apiGet<ApiSuccessResponse<MarketFundCashReserve>>(
    `/market/funds/${fundId}/cash-reserve`,
  );
  return payload.data;
}

export async function listMarketFundInvestorRankings(
  fundId: number,
  params: PaginationParams,
): Promise<PaginatedData<MarketFundInvestorRanking>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<MarketFundInvestorRanking>>>(
    `/market/funds/${fundId}/investor-rankings`,
    params,
  );
  return payload.data;
}

export async function listMarketFundTransactions(
  fundId: number,
  params: PaginationParams,
): Promise<PaginatedData<MarketFundTransaction>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<MarketFundTransaction>>>(
    `/market/funds/${fundId}/transactions`,
    params,
  );
  return payload.data;
}
