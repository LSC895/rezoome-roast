import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Loader2, Lightbulb, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScoreGauge from "@/components/ScoreGauge";

interface SharedRoastData {
  file_name: string;
  tone: string;
  language: string;
  score: number | null;
  roast_text: string | null;
  fix_suggestions: any;
}

const SharedRoast = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [roast, setRoast] = useState<SharedRoastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoast = async () => {
      if (!shareToken) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("roasts")
        .select("file_name, tone, language, score, roast_text, fix_suggestions")
        .eq("share_token", shareToken)
        .single();

      if (fetchError || !data) {
        setError("Roast not found or link expired 💀");
      } else {
        setRoast(data);
      }
      setLoading(false);
    };

    fetchRoast();
  }, [shareToken]);

  const toneEmoji = roast?.tone === "brutal" ? "💀" : roast?.tone === "gentle" ? "🫶" : "⚖️";
  const fixes = roast?.fix_suggestions || [];

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
            <Button size="sm" className="bg-gradient-fire text-primary-foreground">
              Get Your Roast 🔥
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading roast...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-2xl font-bold mb-2">{error}</h1>
              <p className="text-muted-foreground mb-8">This roast might have been deleted or the link is invalid.</p>
              <Link to="/upload">
                <Button className="bg-gradient-fire text-primary-foreground">
                  Get Your Own Roast 🔥
                </Button>
              </Link>
            </motion.div>
          ) : roast ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <p className="text-sm text-muted-foreground font-mono mb-4">someone shared their roast with you 👀</p>
                <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
                  Check Out This Roast 🔥
                </h1>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="text-sm bg-secondary px-3 py-1 rounded-full">
                    {toneEmoji} {roast.tone}
                  </span>
                  <span className="text-sm bg-secondary px-3 py-1 rounded-full">
                    🌍 {roast.language}
                  </span>
                </div>
              </motion.div>

              {/* Score */}
              {roast.score !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-10"
                >
                  <ScoreGauge score={roast.score} size={140} />
                </motion.div>
              )}

              {/* Roast Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-8 mb-10"
              >
                <div className="prose prose-invert max-w-none">
                  {roast.roast_text?.split("\n").map((line: string, i: number) => {
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

              {/* Free fixes preview */}
              {fixes.filter((f: any) => f.free).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-10"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    <h2 className="text-xl font-bold">Top Fix Suggestions</h2>
                  </div>
                  <div className="space-y-2">
                    {fixes.filter((f: any) => f.free).slice(0, 3).map((fix: any, i: number) => (
                      <div key={i} className="rounded-lg border border-border/50 bg-card p-3 text-sm">
                        {fix.text}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-8 text-center"
              >
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-xl font-bold mb-2">Want Your Resume Roasted?</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Get brutally honest AI feedback on your resume. It's free to start!
                </p>
                <Link to="/upload">
                  <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90">
                    Roast My Resume
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SharedRoast;
