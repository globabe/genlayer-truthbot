import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export interface GameState {
  total_claims: number;
  claims: string[];
  liar_index: number;
  liar_claim: string;
  is_resolved: boolean;
}

export interface RevealResult {
  liar_index?: number;
  liar_claim?: string;
  reasoning?: string;
  error?: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}

const GAS_LIMIT = 10000000;

class TruthOrBot {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(contractAddress: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (studioUrl) config.endpoint = studioUrl;
    this.client = createClient(config);
  }

  async checkNow(): Promise<GameState> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "check_now",
        args: [],
      });

      if (result instanceof Map) {
        const obj: any = {};
        result.forEach((v: any, k: string) => { obj[k] = v; });
        return {
          total_claims: Number(obj.total_claims ?? 0),
          claims: Array.isArray(obj.claims) ? obj.claims : [],
          liar_index: Number(obj.liar_index ?? 99),
          liar_claim: String(obj.liar_claim ?? ""),
          is_resolved: Boolean(obj.is_resolved ?? false),
        };
      }

      return {
        total_claims: Number(result?.total_claims ?? 0),
        claims: Array.isArray(result?.claims) ? result.claims : [],
        liar_index: Number(result?.liar_index ?? 99),
        liar_claim: String(result?.liar_claim ?? ""),
        is_resolved: Boolean(result?.is_resolved ?? false),
      };
    } catch (error) {
      console.error("Error fetching game state:", error);
      throw new Error("Failed to fetch game state");
    }
  }

  // Keep backward compat
  async getGameState(): Promise<GameState> {
    return this.checkNow();
  }

  async addClaim(claim: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "add_claim",
        args: [claim],
        value: BigInt(0),
        gaslimit: GAS_LIMIT,
      } as any);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "FINALIZED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error adding claim:", error);
      throw new Error(error?.message || "Failed to submit claim");
    }
  }

  async reveal(): Promise<RevealResult> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "reveal",
        args: [],
        value: BigInt(0),
        gaslimit: GAS_LIMIT,
      } as any);

      await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "FINALIZED" as any,
        retries: 40,
        interval: 5000,
      });

      // After finalization, read on-chain state directly
      const state = await this.checkNow();
      if (state.is_resolved) {
        return { liar_index: state.liar_index, liar_claim: state.liar_claim };
      }

      return { liar_index: undefined, liar_claim: undefined };
    } catch (error: any) {
      console.error("Error revealing:", error);
      // Check if resolved on-chain despite error
      try {
        const state = await this.checkNow();
        if (state.is_resolved) {
          return { liar_index: state.liar_index, liar_claim: state.liar_claim };
        }
      } catch { /* ignore */ }
      throw new Error(error?.message || "Failed to reveal the liar");
    }
  }

  async resetGame(): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "reset_game",
        args: [],
        value: BigInt(0),
        gaslimit: GAS_LIMIT,
      } as any);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "FINALIZED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error resetting game:", error);
      throw new Error(error?.message || "Failed to reset game");
    }
  }
}

export default TruthOrBot;
