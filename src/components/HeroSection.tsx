import { motion } from "framer-motion";
import { Users, Zap } from "lucide-react";
import mochiMain from "@/assets/mochi-main.png";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-32 pb-16 text-center">
      {/* Mochi violet glow orb */}
      <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/15 blur-[120px]" />

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
          An AI-powered social deduction game. Submit your claims — two truths and one lie — and let <span className="text-primary font-semibold">Mochi</span> find the liar.
        </p>

        {/* Mochi mascot as AI Judge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          className="mx-auto mt-8 relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-[60px] scale-75" />
          <img
            src={mochiMain}
            alt="Mochi - GenLayer AI Judge mascot"
            className="relative mx-auto h-40 w-auto drop-shadow-[0_0_30px_hsl(270,80%,65%,0.4)]"
          />
        </motion.div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>3 Players</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <img src={mochiMain} alt="" className="h-5 w-5 object-contain" />
            <span className="text-primary font-medium">Mochi Judge</span>
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
