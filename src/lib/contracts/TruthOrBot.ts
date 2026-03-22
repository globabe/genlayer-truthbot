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

// ─── Deep BFS Receipt Extraction + JSON Repair ───

/**
 * Recursively traverses nested receipt structures (result, payload, readable,
 * consensus_data, leader_receipt, vote_data, etc.) via BFS to find the first
 * JSON-parseable string containing "liar_index".
 */
function deepExtractResult(obj: any, depth = 0): any {
  if (depth > 15 || obj == null) return null;

  // If it's a string, try to parse it
  if (typeof obj === "string") {
    const cleaned = repairJson(obj);
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object" && "liar_index" in parsed) {
        return parsed;
      }
    } catch {
      // not valid JSON
    }
    return null;
  }

  // If it's a Map, convert to object
  if (obj instanceof Map) {
    const plain: Record<string, any> = {};
    obj.forEach((v: any, k: string) => { plain[k] = v; });
    return deepExtractResult(plain, depth);
  }

  // If it's an array, search each element
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = deepExtractResult(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  // Object: BFS through known keys first, then all keys
  if (typeof obj === "object") {
    const priorityKeys = [
      "result", "data", "payload", "readable", "output",
      "consensus_data", "leader_receipt", "vote_data",
      "execution_result", "contract_output", "receipt_result",
    ];
    const visited = new Set<string>();

    for (const key of priorityKeys) {
      if (key in obj) {
        visited.add(key);
        const found = deepExtractResult(obj[key], depth + 1);
        if (found) return found;
      }
    }

    for (const key of Object.keys(obj)) {
      if (visited.has(key)) continue;
      const found = deepExtractResult(obj[key], depth + 1);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Robust JSON repair: strips markdown fences, control chars,
 * fixes unquoted keys, trailing commas, etc.
 */
function repairJson(raw: string): string {
  let s = raw;
  // Strip markdown code fences
  s = s.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  // Remove control characters except newline/tab
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  // Trim whitespace
  s = s.trim();
  // Extract JSON object if embedded in other text
  const jsonMatch = s.match(/\{[\s\S]*\}/);
  if (jsonMatch) s = jsonMatch[0];
  // Fix trailing commas before closing braces/brackets
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Fix unquoted keys
  s = s.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
  return s;
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

      // Handle plain object
      if (result && typeof result === "object") {
        return {
          players: Array.isArray(result.players) ? result.players : [],
          claims: Array.isArray(result.claims) ? result.claims : [],
          liar_index: Number(result.liar_index ?? 99),
          is_resolved: Boolean(result.is_resolved ?? false),
        };
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

  async reveal(): Promise<RevealResult> {
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "reveal",
        args: [],
        value: BigInt(0),
      });

      let receipt: any;
      try {
        receipt = await this.client.waitForTransactionReceipt({
          hash: txHash,
          status: "ACCEPTED" as any,
          retries: 30,
          interval: 5000,
        });
      } catch (waitError: any) {
        // If ACCEPTED fails, try FINALIZED or poll game state
        console.warn("[TruthOrBot] ACCEPTED wait failed, trying FINALIZED:", waitError?.message);
        try {
          receipt = await this.client.waitForTransactionReceipt({
            hash: txHash,
            status: "FINALIZED" as any,
            retries: 15,
            interval: 5000,
          });
        } catch {
          // Last resort: poll game state to see if it resolved on-chain
          console.warn("[TruthOrBot] FINALIZED wait also failed, polling game state");
          const state = await this.getGameState();
          if (state.is_resolved) {
            return { liar_index: state.liar_index, reasoning: "Resolved on-chain." };
          }
          throw waitError;
        }
      }

      console.log("[TruthOrBot] Raw reveal receipt:", JSON.stringify(receipt, null, 2));

      const extracted = deepExtractResult(receipt);
      if (extracted && "liar_index" in extracted) {
        console.log("[TruthOrBot] Extracted reveal result:", extracted);
        return extracted as RevealResult;
      }

      if (receipt && typeof receipt === "object") {
        if ("liar_index" in receipt) {
          return { liar_index: Number(receipt.liar_index), reasoning: receipt.reasoning };
        }
        if (receipt.result) {
          const resultExtracted = deepExtractResult(receipt.result);
          if (resultExtracted) return resultExtracted as RevealResult;
        }
      }

      // Final fallback: check game state
      const finalState = await this.getGameState();
      if (finalState.is_resolved) {
        return { liar_index: finalState.liar_index, reasoning: "Result processed on-chain." };
      }

      console.warn("[TruthOrBot] Could not extract result from receipt, relying on state refresh");
      return { liar_index: undefined, reasoning: "Result processed on-chain. Refreshing game state." };

    } catch (error: any) {
      console.error("Error revealing:", error);
      if (error?.message) {
        try {
          const cleaned = repairJson(error.message);
          const parsed = JSON.parse(cleaned);
          if (parsed && "liar_index" in parsed) return parsed as RevealResult;
        } catch {
          // ignore
        }
      }
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
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 24,
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
