import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Lock, ArrowLeft, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Results = () => {
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as {
    roastId?: string;
    fileName?: string;
    tone?: string;
    roastText?: string;
    fixSuggestions?: Array<{ text: string; free: boolean }>;
    score?: number;
  } | null;

  if (!state?.roastText) {
    return <Navigate to="/upload" replace />;
  }

  const roastText = state.roastText;
  const fixes = state.fixSuggestions || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
          </Link>
          <Link to="/upload">
            <Button variant="ghost" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              New Roast
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/upload" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to upload
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-8 w-8 text-primary animate-flame-flicker" />
              <h1 className="text-3xl md:text-4xl font-bold font-display">Your Roast is Served</h1>
            </div>
            <p className="text-muted-foreground">
              <span className="font-mono text-primary">{state.fileName}</span> — {state.tone} mode
              {state.score !== null && state.score !== undefined && (
                <span className="ml-2 font-bold text-foreground">• Score: {state.score}/10</span>
              )}
            </p>
          </motion.div>

          {/* Roast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card p-8 mb-10"
          >
            <div className="prose prose-invert max-w-none">
              {roastText.split("\n").map((line: string, i: number) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  const text = line.replace(/\*\*/g, "");
                  return <h3 key={i} className="text-primary font-bold mt-6 mb-2 first:mt-0">{text}</h3>;
                }
                if (line.includes("**")) {
                  const parts = line.split("**");
                  return (
                    <p key={i} className="text-foreground/90 leading-relaxed mb-3">
                      {parts.map((part: string, j: number) =>
                        j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
                      )}
                    </p>
                  );
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-foreground/90 leading-relaxed mb-3">{line}</p>;
              })}
            </div>
          </motion.div>

          {/* Fix Suggestions */}
          {fixes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold font-display">Fix Suggestions</h2>
              </div>

              <div className="space-y-3">
                {fixes.map((fix: { text: string; free: boolean }, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className={`rounded-xl border p-4 flex items-start gap-3 ${
                      fix.free
                        ? "border-border/50 bg-card"
                        : "border-border/30 bg-card/50 opacity-60"
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      fix.free ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {fix.free ? (
                        <span className="text-xs font-bold">{i + 1}</span>
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={fix.free ? "text-foreground" : "text-muted-foreground"}>{fix.text}</p>
                      {!fix.free && (
                        <span className="text-xs text-primary font-mono mt-1 inline-block">PRO</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Unlock CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8 text-center"
              >
                <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Unlock All Fix Suggestions</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Get the full list of actionable fixes, unlimited roasts, and roast history.
                </p>
                <Link to="/pricing">
                  <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90">
                    Upgrade to Pro — $5/mo
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
