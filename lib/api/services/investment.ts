import { apiGet, apiPost, type ApiSuccessResponse } from "@/lib/api/client";
import type { FundBase, FundTransactionStatus, FundTransactionType } from "@/lib/api/types/fund";
import type { KeywordParams, PaginatedData, PaginationParams } from "@/lib/api/types/pagination";

export type InvestmentFundItem = FundBase & {
  holdingShares: number;
  investedAmount: number;
  currentValue: number;
  returnPct: number;
};

export type InvestmentSummary = {
  investedFundCount: number;
  totalInvested: number;
  currentTotalValue: number;
  cumulativePnl: number;
  cumulativePnlPct: number;
};

export type InvestmentValueTrendPoint = {
  date: string;
  value: number;
};

export type InvestmentFundDetail = FundBase & {
  holdingShares: number;
  totalDeposits: number;
  totalRedeems: number;
  netInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPct: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  realizedPnl: number;
  realizedPnlPct: number;
};

export type InvestmentFundTransaction = {
  id: number;
  timestamp: string;
  type: FundTransactionType;
  amount: number | null;
  shares: number | null;
  executedNav: number | null;
  status: FundTransactionStatus;
};

export async function listInvestmentFunds(
  params: PaginationParams & KeywordParams,
): Promise<PaginatedData<InvestmentFundItem>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<InvestmentFundItem>>>(
    "/investment/funds",
    params,
  );
  return payload.data;
}

export async function getInvestmentSummary(): Promise<InvestmentSummary> {
  const payload = await apiGet<ApiSuccessResponse<InvestmentSummary>>("/investment/summary");
  return payload.data;
}

export async function getInvestmentDetail(fundId: number): Promise<InvestmentFundDetail> {
  const payload = await apiGet<ApiSuccessResponse<InvestmentFundDetail>>(
    `/investment/funds/${fundId}/detail`,
  );
  return payload.data;
}

export async function getInvestmentValueTrend(
  fundId: number,
): Promise<InvestmentValueTrendPoint[]> {
  const payload = await apiGet<ApiSuccessResponse<InvestmentValueTrendPoint[]>>(
    `/investment/funds/${fundId}/value-trend`,
  );
  return payload.data;
}

export async function listInvestmentTransactions(
  fundId: number,
  params: PaginationParams,
): Promise<PaginatedData<InvestmentFundTransaction>> {
  const payload = await apiGet<ApiSuccessResponse<PaginatedData<InvestmentFundTransaction>>>(
    `/investment/funds/${fundId}/transactions`,
    params,
  );
  return payload.data;
}

export async function cancelInvestmentTransaction(
  fundId: number,
  transactionId: number,
): Promise<InvestmentFundTransaction> {
  const payload = await apiPost<ApiSuccessResponse<InvestmentFundTransaction>>(
    `/investment/funds/${fundId}/transactions/${transactionId}/cancel`,
  );
  return payload.data;
}
