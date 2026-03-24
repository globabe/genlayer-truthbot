import { motion } from "framer-motion";
import { MessageSquare, Eye, EyeOff, AlertTriangle } from "lucide-react";
import type { GameState } from "@/lib/contracts/TruthOrBot";

interface Props {
  gameState: GameState | null;
}

export function PlayersBoard({ gameState }: Props) {
  const totalClaims = gameState?.total_claims ?? 0;
  const claims = gameState?.claims ?? [];
  const isResolved = gameState?.is_resolved ?? false;
  const liarIndex = gameState?.liar_index ?? 99;
  const liarClaim = gameState?.liar_claim ?? "";
  const slots = [0, 1, 2];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Claims ({totalClaims}/3)
      </h3>

      <div className="space-y-3">
        {slots.map((i) => {
          const hasClaim = i < totalClaims;
          const isLiar = isResolved && liarIndex === i;
          const isClean = isResolved && liarIndex !== i && hasClaim;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-4 transition-all ${
                isLiar
                  ? "border-destructive/50 bg-destructive/5 shadow-[0_0_20px_hsl(0_72%_55%/0.15)]"
                  : isClean
                  ? "border-success/30 bg-success/5"
                  : hasClaim
                  ? "border-border bg-card"
                  : "border-border/30 bg-card/30"
              }`}
            >
              {hasClaim ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isLiar ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                      }`}>
                        {isLiar ? "!" : i + 1}
                      </div>
                      <span className="font-display text-sm text-foreground font-medium">
                        Claim {i + 1}
                      </span>
                    </div>
                    {isLiar && (
                      <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        <AlertTriangle className="h-3 w-3" /> LIE
                      </span>
                    )}
                    {isClean && (
                      <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                        <Eye className="h-3 w-3" /> TRUTH
                      </span>
                    )}
                  </div>

                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {isResolved ? (
                        <>
                          <Eye className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                          {claims[i]}
                        </>
                      ) : (
                        <span className="italic text-muted-foreground">
                          <EyeOff className="mr-1 inline h-3.5 w-3.5" />
                          Claim hidden until reveal
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground italic">Waiting for claim...</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
