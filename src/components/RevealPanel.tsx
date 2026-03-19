import { motion } from "framer-motion";
import { useReveal } from "@/lib/hooks/useTruthOrBot";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, CheckCircle2 } from "lucide-react";
import type { GameState } from "@/lib/contracts/TruthOrBot";

interface Props {
  gameState: GameState | null;
}

export function RevealPanel({ gameState }: Props) {
  const { reveal, isRevealing } = useReveal();
  const { isConnected } = useWallet();

  const playerCount = gameState?.players?.length ?? 0;
  const isResolved = gameState?.is_resolved ?? false;
  const canReveal = playerCount >= 2 && !isResolved && isConnected;
  const liarIndex = gameState?.liar_index ?? 99;

  if (isResolved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="neon-border-accent rounded-xl bg-card p-6 text-center"
      >
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-accent neon-text-accent" />
        <h3 className="font-display text-xl font-bold text-foreground">Game Resolved!</h3>
        <p className="mt-2 text-muted-foreground">
          The AI identified <span className="font-bold text-destructive">Player {liarIndex + 1}</span> as the liar.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the player cards above to see the claims and verdict.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-6 text-center ${
        canReveal ? "neon-border-accent bg-card" : "border-border/30 bg-card/30"
      }`}
    >
      <Bot className={`mx-auto mb-3 h-10 w-10 ${canReveal ? "text-accent neon-text-accent" : "text-muted-foreground"}`} />
      <h3 className="font-display text-lg font-semibold text-foreground">AI Reveal</h3>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        {playerCount < 2
          ? "Need at least 2 players to reveal"
          : "Ready! The AI will analyze claims and find the liar."}
      </p>

      <Button
        onClick={() => reveal()}
        disabled={!canReveal || isRevealing}
        className={`font-display ${
          canReveal
            ? "neon-border-accent bg-accent/10 text-accent hover:bg-accent/20"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isRevealing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            AI is thinking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Reveal the Liar
          </span>
        )}
      </Button>
    </motion.div>
  );
}
