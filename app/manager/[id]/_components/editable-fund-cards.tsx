"use client";

import { useState } from "react";

import { formatUsd, formatUtcDateTime } from "@/lib/format/fund";
import { SectionCard } from "@/components/cards/section-card";
import { FundRulesGrid, FundStrategyGrid } from "@/components/fund/fund-detail-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EditableFundCardsProps = {
  fund: {
    fundId: number;
    fundName: string;
    fundDescription: string;
    status: "RUNNING" | "STOPPED";
    vaultAddress: string;
    manager: string;
    createdAt: string;
    riskProfile: string;
    marketUniverse: string[];
    rebalanceRule: string;
    minimumDeposit: number;
    minimumRedeem: number;
    managementFeeRate: number;
    performanceFeeRate: number;
    autoStopLossPct: number;
  };
  overviewContent?: React.ReactNode;
};

type BaseState = {
  fundName: string;
  fundDescription: string;
};

type StrategyState = {
  riskProfile: string;
  marketUniverse: string;
  rebalanceRule: string;
};

type RulesState = {
  minimumDeposit: number;
  minimumRedeem: number;
  managementFeeRate: number;
  performanceFeeRate: number;
  autoStopLossPct: number;
};

const RISK_PROFILE_OPTIONS = ["LOW", "MEDIUM", "MEDIUM_HIGH", "HIGH"];
const MARKET_UNIVERSE_OPTIONS = [
  "Politics, Macro, Crypto Events",
  "Politics, Macro",
  "Crypto Events",
  "Sports, Politics",
  "Global Events",
];
const REBALANCE_RULE_OPTIONS = [
  "Weekly + event-driven rebalance",
  "Daily volatility targeting",
  "Event-driven active rebalance",
  "Weekly rebalance",
  "Monthly rebalance",
];

function getFundStatusVariant(status: "RUNNING" | "STOPPED"): "success" | "destructive" {
  return status === "RUNNING" ? "success" : "destructive";
}

function parseNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function EditDialog({
  title,
  open,
  onCancel,
  onSave,
  children,
}: {
  title: string;
  open: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
        </div>
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EditableFundCards({ fund, overviewContent }: EditableFundCardsProps) {
  const [baseState, setBaseState] = useState<BaseState>({
    fundName: fund.fundName,
    fundDescription: fund.fundDescription,
  });
  const [strategyState, setStrategyState] = useState<StrategyState>({
    riskProfile: fund.riskProfile,
    marketUniverse: fund.marketUniverse.join(", "),
    rebalanceRule: fund.rebalanceRule,
  });
  const [rulesState, setRulesState] = useState<RulesState>({
    minimumDeposit: fund.minimumDeposit,
    minimumRedeem: fund.minimumRedeem,
    managementFeeRate: fund.managementFeeRate,
    performanceFeeRate: fund.performanceFeeRate,
    autoStopLossPct: fund.autoStopLossPct,
  });

  const [baseDraft, setBaseDraft] = useState(baseState);
  const [strategyDraft, setStrategyDraft] = useState(strategyState);
  const [rulesDraft, setRulesDraft] = useState({
    minimumDeposit: String(rulesState.minimumDeposit),
    minimumRedeem: String(rulesState.minimumRedeem),
    managementFeeRate: String(rulesState.managementFeeRate),
    performanceFeeRate: String(rulesState.performanceFeeRate),
    autoStopLossPct: String(rulesState.autoStopLossPct),
  });

  const [baseOpen, setBaseOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const openBase = () => {
    setBaseDraft(baseState);
    setBaseOpen(true);
  };
  const openStrategy = () => {
    setStrategyDraft(strategyState);
    setStrategyOpen(true);
  };
  const openRules = () => {
    setRulesDraft({
      minimumDeposit: String(rulesState.minimumDeposit),
      minimumRedeem: String(rulesState.minimumRedeem),
      managementFeeRate: String(rulesState.managementFeeRate),
      performanceFeeRate: String(rulesState.performanceFeeRate),
      autoStopLossPct: String(rulesState.autoStopLossPct),
    });
    setRulesOpen(true);
  };

  const strategyRiskOptions = Array.from(
    new Set([...RISK_PROFILE_OPTIONS, strategyDraft.riskProfile].filter(Boolean)),
  );
  const strategyMarketUniverseOptions = Array.from(
    new Set([...MARKET_UNIVERSE_OPTIONS, strategyDraft.marketUniverse].filter(Boolean)),
  );
  const strategyRebalanceOptions = Array.from(
    new Set([...REBALANCE_RULE_OPTIONS, strategyDraft.rebalanceRule].filter(Boolean)),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Fund Operations
              </p>
              <Badge variant={getFundStatusVariant(fund.status)}>{fund.status}</Badge>
              <Badge>Fund #{fund.fundId}</Badge>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={openBase}>
              Edit
            </Button>
          </div>
          <CardTitle>{baseState.fundName}</CardTitle>
          <CardDescription>{baseState.fundDescription}</CardDescription>
          <div className="space-y-1 pt-1 text-xs text-[var(--text-muted)]">
            <div>
              Vault: <span className="font-mono">{fund.vaultAddress}</span>
            </div>
            <div>
              Manager: <span className="font-mono">{fund.manager}</span>
            </div>
            <div>Created At: {formatUtcDateTime(fund.createdAt)}</div>
          </div>
        </CardHeader>
      </Card>

      {overviewContent ? (
        <SectionCard
          title="Overview"
          description="Core fund indicators for quick decision making."
          headerClassName="pb-3"
          titleClassName="text-base"
        >
          {overviewContent}
        </SectionCard>
      ) : null}

      <SectionCard
        title={
          <div className="flex items-center justify-between gap-2">
            <span>Strategy</span>
            <Button type="button" size="sm" variant="outline" onClick={openStrategy}>
              Edit
            </Button>
          </div>
        }
        description="Target markets and portfolio construction approach."
        headerClassName="pb-3"
        titleClassName="text-base"
      >
        <FundStrategyGrid
          riskProfile={strategyState.riskProfile}
          marketUniverse={strategyState.marketUniverse}
          rebalanceRule={strategyState.rebalanceRule}
        />
      </SectionCard>

      <SectionCard
        title={
          <div className="flex items-center justify-between gap-2">
            <span>Rules</span>
            <Button type="button" size="sm" variant="outline" onClick={openRules}>
              Edit
            </Button>
          </div>
        }
        description="Investment thresholds, fee settings, and stop-loss constraints."
        headerClassName="pb-3"
        titleClassName="text-base"
      >
        <FundRulesGrid
          items={[
            { label: "Minimum Deposit", value: formatUsd(rulesState.minimumDeposit) },
            { label: "Minimum Redeem", value: formatUsd(rulesState.minimumRedeem) },
            {
              label: "Management Fee",
              value: `${(rulesState.managementFeeRate * 100).toFixed(1)}%`,
            },
            {
              label: "Performance Fee",
              value: `${(rulesState.performanceFeeRate * 100).toFixed(1)}%`,
            },
            {
              label: "Auto Stop-Loss",
              value: `${(rulesState.autoStopLossPct * 100).toFixed(1)}%`,
              fullRow: true,
            },
          ]}
        />
      </SectionCard>

      <EditDialog
        title="Edit Fund Info"
        open={baseOpen}
        onCancel={() => setBaseOpen(false)}
        onSave={() => {
          setBaseState(baseDraft);
          setBaseOpen(false);
        }}
      >
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Fund Name</p>
          <Input
            value={baseDraft.fundName}
            onChange={(event) =>
              setBaseDraft((prev) => ({ ...prev, fundName: event.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Fund Description</p>
          <textarea
            value={baseDraft.fundDescription}
            onChange={(event) =>
              setBaseDraft((prev) => ({ ...prev, fundDescription: event.target.value }))
            }
            rows={4}
            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />
        </div>
      </EditDialog>

      <EditDialog
        title="Edit Strategy"
        open={strategyOpen}
        onCancel={() => setStrategyOpen(false)}
        onSave={() => {
          setStrategyState(strategyDraft);
          setStrategyOpen(false);
        }}
      >
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Risk Profile</p>
          <Select
            value={strategyDraft.riskProfile}
            onValueChange={(value) => setStrategyDraft((prev) => ({ ...prev, riskProfile: value }))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategyRiskOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Market Universe</p>
          <Select
            value={strategyDraft.marketUniverse}
            onValueChange={(value) =>
              setStrategyDraft((prev) => ({ ...prev, marketUniverse: value }))
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategyMarketUniverseOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[var(--text-muted)]">Rebalance Rule</p>
          <Select
            value={strategyDraft.rebalanceRule}
            onValueChange={(value) =>
              setStrategyDraft((prev) => ({ ...prev, rebalanceRule: value }))
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strategyRebalanceOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </EditDialog>

      <EditDialog
        title="Edit Rules"
        open={rulesOpen}
        onCancel={() => setRulesOpen(false)}
        onSave={() => {
          setRulesState({
            minimumDeposit: parseNumber(rulesDraft.minimumDeposit, rulesState.minimumDeposit),
            minimumRedeem: parseNumber(rulesDraft.minimumRedeem, rulesState.minimumRedeem),
            managementFeeRate: parseNumber(
              rulesDraft.managementFeeRate,
              rulesState.managementFeeRate,
            ),
            performanceFeeRate: parseNumber(
              rulesDraft.performanceFeeRate,
              rulesState.performanceFeeRate,
            ),
            autoStopLossPct: parseNumber(rulesDraft.autoStopLossPct, rulesState.autoStopLossPct),
          });
          setRulesOpen(false);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Minimum Deposit</p>
            <Input
              value={rulesDraft.minimumDeposit}
              onChange={(event) =>
                setRulesDraft((prev) => ({ ...prev, minimumDeposit: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Minimum Redeem</p>
            <Input
              value={rulesDraft.minimumRedeem}
              onChange={(event) =>
                setRulesDraft((prev) => ({ ...prev, minimumRedeem: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Management Fee Rate</p>
            <Input
              value={rulesDraft.managementFeeRate}
              onChange={(event) =>
                setRulesDraft((prev) => ({ ...prev, managementFeeRate: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-muted)]">Performance Fee Rate</p>
            <Input
              value={rulesDraft.performanceFeeRate}
              onChange={(event) =>
                setRulesDraft((prev) => ({ ...prev, performanceFeeRate: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs text-[var(--text-muted)]">Auto Stop-Loss Pct</p>
            <Input
              value={rulesDraft.autoStopLossPct}
              onChange={(event) =>
                setRulesDraft((prev) => ({ ...prev, autoStopLossPct: event.target.value }))
              }
            />
          </div>
        </div>
      </EditDialog>
    </>
  );
}
