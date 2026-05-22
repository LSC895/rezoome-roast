import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Check, X, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Dip your toes in the fire bestie. 🫡",
    cta: "Start Free ✨",
    href: "/upload",
    featured: false,
    features: [
      { text: "1 roast per day", included: true },
      { text: "All 3 roast tones", included: true },
      { text: "3 fix suggestions per roast", included: true },
      { text: "Full fix suggestions", included: false },
      { text: "Roast history & dashboard", included: false },
      { text: "Priority AI processing", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$5",
    period: "/month",
    desc: "Maximum roasting power. Bussin fr fr. 🔥",
    cta: "Go Pro 💀",
    href: "/upload",
    featured: true,
    features: [
      { text: "Unlimited roasts", included: true },
      { text: "All 3 roast tones", included: true },
      { text: "All fix suggestions unlocked", included: true },
      { text: "Full rewrite suggestions", included: true },
      { text: "Roast history & dashboard", included: true },
      { text: "Priority AI processing", included: true },
    ],
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">RoastMyCV</span>
          </Link>
          <Link to="/upload">
            <Button size="sm" className="bg-gradient-fire text-primary-foreground shadow-neon hover:opacity-90">
              Roast My Resume
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6 text-sm text-primary">
              <Zap className="h-4 w-4" />
              no cap pricing 🫡
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Choose your
              <span className="text-gradient-fire"> heat level</span>
              <span className="ml-2">🌶️</span>
            </h1>
            <p className="text-lg text-muted-foreground">Start free. Upgrade when you're addicted. no judgment 💅</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl border p-8 ${
                  plan.featured
                    ? "border-primary/50 bg-card shadow-fire"
                    : "border-border/50 bg-card"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-fire text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      {f.included ? (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={f.included ? "text-foreground" : "text-muted-foreground/40"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button
                    size="lg"
                    className={`w-full ${
                      plan.featured
                        ? "bg-gradient-fire text-primary-foreground shadow-neon hover:opacity-90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ-like note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-12"
          >
            Cancel anytime. No contracts. No BS. Just vibes and roasts. 🫡
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
