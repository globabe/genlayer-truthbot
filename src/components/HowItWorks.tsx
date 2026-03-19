import { motion } from "framer-motion";
import { Shield, Brain, Link } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Shield,
      title: "Submit Claims",
      description: "Each player writes two truths and one lie. Claims are stored on-chain via GenLayer.",
      color: "text-primary",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "The Intelligent Contract uses an LLM with consensus (Equivalence Principle) to identify the lie.",
      color: "text-accent",
    },
    {
      icon: Link,
      title: "On-chain Verdict",
      description: "Results are deterministic and verifiable. All validators must agree on the outcome.",
      color: "text-warning",
    },
  ];

  return (
    <section className="py-16">
      <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">
        How It Works
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="rounded-xl border border-border bg-card p-6 text-center"
          >
            <step.icon className={`mx-auto mb-3 h-8 w-8 ${step.color}`} />
            <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
