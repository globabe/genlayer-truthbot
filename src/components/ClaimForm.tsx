import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useAddClaim } from "@/lib/hooks/useTruthOrBot";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle } from "lucide-react";
import type { GameState } from "@/lib/contracts/TruthOrBot";

interface Props {
  gameState: GameState | null;
}

export function ClaimForm({ gameState }: Props) {
  const [claim, setClaim] = useState("");
  const { isConnected, address } = useWallet();
  const { addClaim, isSubmitting } = useAddClaim();

  const playerCount = gameState?.players?.length ?? 0;
  const isFull = playerCount >= 3;
  const hasSubmitted = gameState?.players?.some(
    (p) => p.toLowerCase() === address?.toLowerCase()
  );

  const handleSubmit = () => {
    if (!claim.trim()) return;
    addClaim(claim.trim(), {
      onSuccess: () => setClaim(""),
    });
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-border rounded-xl bg-card p-6 text-center"
      >
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-warning" />
        <p className="font-display text-foreground">Connect your wallet to join the game</p>
        <p className="mt-1 text-sm text-muted-foreground">You need MetaMask to submit claims</p>
      </motion.div>
    );
  }

  if (hasSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-border rounded-xl bg-card p-6 text-center"
      >
        <p className="font-display text-primary">✓ Claim submitted!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Waiting for other players to join ({playerCount}/3)
        </p>
      </motion.div>
    );
  }

  if (isFull) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-border-warning rounded-xl bg-card p-6 text-center"
      >
        <p className="font-display text-warning">Game room is full</p>
        <p className="mt-1 text-sm text-muted-foreground">3 players have already joined</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-border rounded-xl bg-card p-6"
    >
      <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Submit Your Claim</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Write two truths and one lie. The AI will try to find the lie.
      </p>

      <Textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="e.g. I've visited 20 countries. I can speak 4 languages. I once met a president."
        className="min-h-[100px] resize-none border-border bg-secondary/50 font-display text-foreground placeholder:text-muted-foreground focus:ring-primary"
        maxLength={500}
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{claim.length}/500</span>
        <Button
          onClick={handleSubmit}
          disabled={!claim.trim() || isSubmitting}
          className="neon-border bg-primary/10 text-primary hover:bg-primary/20 font-display"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit Claim
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
