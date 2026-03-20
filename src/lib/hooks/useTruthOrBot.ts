import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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

  return useQuery({
    queryKey: ["gameState"],
    queryFn: () => {
      if (!contract) return Promise.resolve(null);
      return contract.getGameState();
    },
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
      if (!contract) throw new Error("Contract not configured. Set VITE_CONTRACT_ADDRESS in your .env file.");
      if (!address) throw new Error("Wallet not connected.");
      setIsSubmitting(true);
      return contract.addClaim(claim);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameState"] });
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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsRevealing(true);
      return contract.reveal();
    },
    onSuccess: (result) => {
      // Aggressively refresh game state regardless of parsed result
      queryClient.invalidateQueries({ queryKey: ["gameState"] });
      setIsRevealing(false);
      if (result?.liar_index !== undefined && result.liar_index !== null) {
        toast.success("The Bot has been identified!", {
          description: result.reasoning || "The AI has spoken.",
        });
      } else {
        // Transaction succeeded but couldn't parse result — state will refresh
        toast.success("Reveal complete!", {
          description: "The game state is updating...",
        });
      }
    },
    onError: (err: any) => {
      setIsRevealing(false);
      // Even on error, refresh state — the tx may have succeeded on-chain
      queryClient.invalidateQueries({ queryKey: ["gameState"] });
      toast.error("Failed to reveal", { description: err?.message || "Please try again." });
    },
  });

  return { ...mutation, isRevealing, reveal: mutation.mutate, revealAsync: mutation.mutateAsync };
}
