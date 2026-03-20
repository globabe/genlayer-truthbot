import { WalletButton } from "./WalletButton";
import { GenLayerLogo } from "./GenLayerLogo";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <GenLayerLogo className="h-5 w-auto text-foreground" />
          <div className="h-5 w-px bg-border/50" />
          <span className="font-display text-sm font-bold tracking-tight text-foreground">
            Truth <span className="text-primary neon-text">or</span> Bot
          </span>
        </div>
        <WalletButton />
      </div>
    </nav>
  );
}
