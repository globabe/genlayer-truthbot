import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export interface GameState {
  players: string[];
  claims: string[];
  liar_index: number;
  is_resolved: boolean;
}

export interface RevealResult {
  liar_index?: number;
  reasoning?: string;
  error?: string;
  details?: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}

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

  async getGameState(): Promise<GameState> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_game_state",
        args: [],
      });

      // Handle Map-based response from GenLayer
      if (result instanceof Map) {
        const obj: any = {};
        result.forEach((value: any, key: string) => {
          if (key === "players" || key === "claims") {
            obj[key] = value instanceof Array ? value : Array.from(value);
          } else if (key === "liar_index") {
            obj[key] = Number(value);
          } else if (key === "is_resolved") {
            obj[key] = Boolean(value);
          } else {
            obj[key] = value;
          }
        });
        return obj as GameState;
      }

      return result as GameState;
    } catch (error) {
      console.error("Error fetching game state:", error);
      throw new Error("Failed to fetch game state");
    }
  }

  async addClaim(claim: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "add_claim",
        args: [claim],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error adding claim:", error);
      throw new Error(error?.message || "Failed to submit claim");
    }
  }

  async reveal(): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "reveal",
        args: [],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (error: any) {
      console.error("Error revealing:", error);
      throw new Error(error?.message || "Failed to reveal the liar");
    }
  }
}

export default TruthOrBot;
