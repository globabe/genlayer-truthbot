import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import TruthOrBot from "../contracts/TruthOrBot";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/WalletProvider";
import { toast } from "sonner";

export function useTruthOrBotContract(): TruthOrBot | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  return useMemo(() => {
    if (!contractAddress) return null;
    return new TruthOrBot(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);
}

export function useGameState() {
  const contract = useTruthOrBotContract();
  const contractAddress = getContractAddress();

  return useQuery({
    queryKey: ["gameState", contractAddress],
    queryFn: () => {
      if (!contract) return Promise.resolve(null);
      return contract.checkNow();
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 8000,
    staleTime: 3000,
    enabled: !!contract,
  });
}

export function useAddClaim() {
  const contract = useTruthOrBotContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (claim: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsSubmitting(true);
      return contract.addClaim(claim);
    },
    onSuccess: async () => {
      // Force refresh via check_now after claim
      await queryClient.refetchQueries({ queryKey: ["gameState"] });
      setIsSubmitting(false);
      toast.success("Claim submitted!", { description: "Your claim has been recorded on-chain." });
    },
    onError: (err: any) => {
      setIsSubmitting(false);
      toast.error("Failed to submit claim", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isSubmitting, addClaim: mutation.mutate, addClaimAsync: mutation.mutateAsync };
}

export function useReveal() {
  const contract = useTruthOrBotContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isRevealing, setIsRevealing] = useState(false);

  const forceRefresh = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ["gameState"] });
  }, [queryClient]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsRevealing(true);
      return contract.reveal();
    },
    onSuccess: async (result) => {
      setIsRevealing(false);
      await forceRefresh();

      if (result?.liar_claim) {
        toast.success("Mochi found the lie!", {
          description: `"${result.liar_claim}" was identified as the lie.`,
        });
      } else {
        toast.success("Reveal complete!", { description: "Refreshing game state..." });
        // Poll until resolved
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 3000));
          await forceRefresh();
          const state = queryClient.getQueryData<any>(["gameState"]);
          if (state?.is_resolved) break;
        }
      }
    },
    onError: async (err: any) => {
      setIsRevealing(false);
      await forceRefresh();
      const state = queryClient.getQueryData<any>(["gameState"]);
      if (state?.is_resolved) {
        toast.success("Mochi found the lie!", { description: "Result found on-chain." });
      } else {
        toast.error("Failed to reveal", { description: err?.message || "Please try again." });
      }
    },
  });

  return { ...mutation, isRevealing, reveal: mutation.mutate, revealAsync: mutation.mutateAsync };
}

export function useResetGame() {
  const contract = useTruthOrBotContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsResetting(true);
      return contract.resetGame();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["gameState"] });
      setIsResetting(false);
      toast.success("Game reset!", { description: "A new round has begun." });
    },
    onError: (err: any) => {
      setIsResetting(false);
      toast.error("Failed to reset game", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isResetting, resetGame: mutation.mutate };
}
