import type { Abi } from "viem";

export const vaultAbi = [
  {
    type: "function",
    name: "baseAsset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "requestDeposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "referrer", type: "address" },
    ],
    outputs: [
      { name: "epoch", type: "uint256" },
      { name: "index", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "requestRedeem",
    stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [
      { name: "epoch", type: "uint256" },
      { name: "index", type: "uint256" },
    ],
  },
] as const satisfies Abi;
