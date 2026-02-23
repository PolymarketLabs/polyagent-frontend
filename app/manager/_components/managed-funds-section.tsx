"use client";

import { useState } from "react";

import { ManagerFundsTable } from "@/app/manager/_components/manager-funds-table";
import { SectionCard } from "@/components/cards/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateFundDraft = {
  fundName: string;
  fundDescription: string;
  riskProfile: string;
  marketUniverse: string;
  rebalanceRule: string;
  minimumDeposit: string;
  minimumRedeem: string;
  managementFeeRatePct: string;
  performanceFeeRatePct: string;
  autoStopLossPct: string;
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

const DEFAULT_DRAFT: CreateFundDraft = {
  fundName: "",
  fundDescription: "",
  riskProfile: "MEDIUM",
  marketUniverse: "Politics, Macro, Crypto Events",
  rebalanceRule: "Weekly + event-driven rebalance",
  minimumDeposit: "1000",
  minimumRedeem: "100",
  managementFeeRatePct: "2",
  performanceFeeRatePct: "20",
  autoStopLossPct: "15",
};

function CreateFundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [draft, setDraft] = useState<CreateFundDraft>(DEFAULT_DRAFT);

  if (!open) {
    return null;
  }

  const canSubmit = draft.fundName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">Create Fund</h3>
        </div>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
            setDraft(DEFAULT_DRAFT);
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs text-[var(--text-muted)]">Fund Name</p>
              <Input
                value={draft.fundName}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, fundName: event.target.value }))
                }
                placeholder="Global Macro Opportunities"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs text-[var(--text-muted)]">Fund Description</p>
              <textarea
                value={draft.fundDescription}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, fundDescription: event.target.value }))
                }
                rows={3}
                className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Risk Profile</p>
              <Select
                value={draft.riskProfile}
                onValueChange={(value) => setDraft((prev) => ({ ...prev, riskProfile: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_PROFILE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs text-[var(--text-muted)]">Market Universe</p>
              <Select
                value={draft.marketUniverse}
                onValueChange={(value) => setDraft((prev) => ({ ...prev, marketUniverse: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_UNIVERSE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-3">
              <p className="text-xs text-[var(--text-muted)]">Rebalance Rule</p>
              <Select
                value={draft.rebalanceRule}
                onValueChange={(value) => setDraft((prev) => ({ ...prev, rebalanceRule: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REBALANCE_RULE_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Minimum Deposit (USD)</p>
              <Input
                value={draft.minimumDeposit}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, minimumDeposit: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Minimum Redeem (USD)</p>
              <Input
                value={draft.minimumRedeem}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, minimumRedeem: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Auto Stop-Loss (%)</p>
              <Input
                value={draft.autoStopLossPct}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, autoStopLossPct: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Management Fee (%)</p>
              <Input
                value={draft.managementFeeRatePct}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, managementFeeRatePct: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">Performance Fee (%)</p>
              <Input
                value={draft.performanceFeeRatePct}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, performanceFeeRatePct: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Fund
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ManagedFundsSection() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <SectionCard
        title={
          <div className="flex items-center justify-between gap-2">
            <span>Managed Funds</span>
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              Create Fund
            </Button>
          </div>
        }
        description="Click Manage to open a detail page."
        headerClassName="pb-3"
        titleClassName="text-base"
      >
        <ManagerFundsTable />
      </SectionCard>

      <CreateFundModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
