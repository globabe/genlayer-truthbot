import { WalletButton } from "./WalletButton";
import { Bot } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary neon-text" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Truth <span className="text-primary">or</span> Bot
          </span>
        </div>
        <WalletButton />
      </div>
    </nav>
  );
}
