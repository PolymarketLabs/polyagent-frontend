export type FundStatus = "RUNNING" | "STOPPED";
export type FundTransactionType = "DEPOSIT" | "REDEEM";
export type FundTransactionStatus = "PENDING" | "SETTLED" | "CANCELED";

export type FundBase = {
  fundId: number;
  fundName: string;
  fundDescription: string;
  manager: string;
  vaultAddress: string;
  createdAt: string;
  status: FundStatus;
  riskProfile: string;
  marketUniverse: string[];
  rebalanceRule: string;
  minimumDeposit: number;
  minimumRedeem: number;
  managementFeeRate: number;
  performanceFeeRate: number;
  autoStopLossPct: number;
  currentNav: number;
};
