import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ClaimForm } from "@/components/ClaimForm";
import { PlayersBoard } from "@/components/PlayersBoard";
import { RevealPanel } from "@/components/RevealPanel";
import { ResetGameButton } from "@/components/ResetGameButton";
import { HowItWorks } from "@/components/HowItWorks";
import { useGameState } from "@/lib/hooks/useTruthOrBot";
import { getContractAddress } from "@/lib/genlayer/client";
import { AlertCircle } from "lucide-react";
import { GenLayerLogo } from "@/components/GenLayerLogo";

const Index = () => {
  const { data: gameState, isLoading, error } = useGameState();
  const contractAddress = getContractAddress();

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Navbar />

      <main className="container mx-auto px-4">
        <HeroSection />

        {!contractAddress ? (
          <div className="mx-auto max-w-md rounded-xl border border-warning/30 bg-warning/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-warning" />
            <h3 className="font-display text-lg font-semibold text-foreground">Setup Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Set <code className="font-mono text-primary">VITE_CONTRACT_ADDRESS</code> in your environment to connect to the deployed contract.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load game state. Check your connection.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 pb-8">
            <div className="grid gap-6 md:grid-cols-5">
              <div className="md:col-span-3">
                <PlayersBoard gameState={gameState ?? null} />
              </div>
              <div className="md:col-span-2 space-y-6">
                <ClaimForm gameState={gameState ?? null} />
                <RevealPanel gameState={gameState ?? null} />
                <ResetGameButton gameState={gameState ?? null} />
              </div>
            </div>
          </div>
        )}

        <HowItWorks />

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            Built on <GenLayerLogo className="inline h-4 w-auto text-primary" /> — Intelligent Contracts with AI consensus
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
