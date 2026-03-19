import { motion } from "framer-motion";
import { Bot, Users, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-32 pb-16 text-center">
      {/* Glow orb */}
      <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <Zap className="h-3.5 w-3.5" />
          Powered by GenLayer Intelligent Contracts
        </div>

        <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl">
          Truth <span className="text-primary neon-text">or</span> Bot
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
          An AI-powered social deduction game. Submit your claims — two truths and one lie — and let the Intelligent Contract find the liar.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>3 Players</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" />
            <span>AI Judge</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            <span>On-chain</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
