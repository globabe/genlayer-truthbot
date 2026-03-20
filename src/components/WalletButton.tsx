import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function WalletButton() {
  const { address, isConnected, isLoading, isMetaMaskInstalled, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      toast.error("MetaMask not found", { description: "Please install MetaMask to play." });
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      await connectWallet();
      toast.success("Wallet connected!");
    } catch (err: any) {
      if (!err.message?.includes("rejected")) {
        toast.error("Connection failed", { description: err.message });
      }
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="neon-border rounded-lg px-3 py-1.5 font-mono text-sm text-primary">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button variant="ghost" size="icon" onClick={disconnectWallet} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isLoading} className="mochi-glow-btn bg-primary/10 text-primary hover:bg-primary/20 font-display">
      {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
