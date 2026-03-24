import { motion } from "framer-motion";
import { useReveal } from "@/lib/hooks/useTruthOrBot";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import type { GameState } from "@/lib/contracts/TruthOrBot";
import mochiMain from "@/assets/mochi-main.png";
import mochiIdea from "@/assets/mochi-sticker-idea.png";

interface Props {
  gameState: GameState | null;
}

export function RevealPanel({ gameState }: Props) {
  const { reveal, isRevealing } = useReveal();
  const { isConnected } = useWallet();

  const totalClaims = gameState?.total_claims ?? 0;
  const isResolved = gameState?.is_resolved ?? false;
  const canReveal = totalClaims >= 3 && !isResolved && isConnected;
  const liarIndex = gameState?.liar_index ?? 99;
  const liarClaim = gameState?.liar_claim ?? "";

  if (isResolved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="neon-border-accent rounded-xl bg-card p-6 text-center"
      >
        <motion.img
          src={mochiIdea}
          alt="Mochi has the answer!"
          className="mx-auto mb-3 h-16 w-auto drop-shadow-[0_0_20px_hsl(270,80%,65%,0.5)]"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-accent neon-text-accent" />
        <h3 className="font-display text-xl font-bold text-foreground">Mochi Has Spoken!</h3>

        {liarClaim && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">The Lie (Claim {liarIndex + 1})</span>
            </div>
            <p className="text-base font-display font-bold text-foreground">"{liarClaim}"</p>
          </motion.div>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          Check the claim cards above to see the full verdict.
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
      <motion.img
        src={mochiMain}
        alt="Mochi AI Judge"
        className={`mx-auto mb-3 h-14 w-auto ${canReveal ? "drop-shadow-[0_0_20px_hsl(270,80%,65%,0.4)]" : "opacity-40 grayscale"}`}
        animate={isRevealing ? { rotate: [0, -5, 5, -5, 0] } : {}}
        transition={{ repeat: isRevealing ? Infinity : 0, duration: 0.5 }}
      />
      <h3 className="font-display text-lg font-semibold text-foreground">Mochi's Verdict</h3>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">
        {totalClaims < 3
          ? `Submit ${3 - totalClaims} more claim${3 - totalClaims > 1 ? "s" : ""} for Mochi to judge`
          : "Ready! Mochi will analyze claims and find the lie."}
      </p>

      <Button
        onClick={() => reveal()}
        disabled={!canReveal || isRevealing}
        className={`font-display ${
          canReveal
            ? "mochi-glow-btn bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isRevealing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Mochi is thinking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Ask Mochi to Reveal
          </span>
        )}
      </Button>
    </motion.div>
  );
}
