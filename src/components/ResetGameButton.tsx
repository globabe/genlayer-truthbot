import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useResetGame } from "@/lib/hooks/useTruthOrBot";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import type { GameState } from "@/lib/contracts/TruthOrBot";

interface Props {
  gameState: GameState | null;
}

export function ResetGameButton({ gameState }: Props) {
  const { resetGame, isResetting } = useResetGame();
  const { isConnected } = useWallet();

  const isResolved = gameState?.is_resolved ?? false;

  if (!isResolved || !isConnected) return null;

  return (
    <Button
      onClick={() => resetGame()}
      disabled={isResetting}
      className="mochi-glow-btn bg-primary/10 text-primary hover:bg-primary/20 font-display w-full"
    >
      {isResetting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Resetting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          New Game
        </span>
      )}
    </Button>
  );
}
