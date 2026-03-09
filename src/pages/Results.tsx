import { useState, useRef } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Lightbulb, Lock, ArrowLeft, RotateCcw, Download, Share2, Copy, Check, Twitter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import ScoreGauge from "@/components/ScoreGauge";
import ShareCard from "@/components/ShareCard";

const Results = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const state = location.state as {
    roastId?: string;
    fileName?: string;
    tone?: string;
    language?: string;
    roastText?: string;
    fixSuggestions?: Array<{ text: string; free: boolean }>;
    score?: number;
  } | null;

  if (!state?.roastText) {
    return <Navigate to="/upload" replace />;
  }

  const roastText = state.roastText;
  const fixes = state.fixSuggestions || [];
  const toneEmoji = state.tone === "brutal" ? "💀" : state.tone === "gentle" ? "🫶" : "⚖️";
  const languageLabel = state.language ? state.language.charAt(0).toUpperCase() + state.language.slice(1) : "English";

  // Get first sentence for share card snippet
  const roastSnippet = roastText.split("\n").find((line: string) => line.trim() && !line.startsWith("**"))?.slice(0, 150) || roastText.slice(0, 150);

  const generateShareToken = async () => {
    if (!state.roastId || !user) return;
    
    setGeneratingToken(true);
    try {
      // Check if token already exists
      const { data: existing } = await supabase
        .from("roasts")
        .select("share_token")
        .eq("id", state.roastId)
        .single();

      if (existing?.share_token) {
        setShareToken(existing.share_token);
      } else {
        // Generate new token
        const token = Math.random().toString(36).substring(2, 10);
        const { error } = await supabase
          .from("roasts")
          .update({ share_token: token })
          .eq("id", state.roastId);

        if (error) throw error;
        setShareToken(token);
      }
    } catch (err) {
      toast({ title: "Oops 💀", description: "Couldn't generate share link", variant: "destructive" });
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyShareLink = () => {
    if (!shareToken) return;
    const link = `${window.location.origin}/roast/${shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast({ title: "Copied! 🔥", description: "Share it with your besties" });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Just got my resume roasted by AI 💀🔥 Scored ${state.score || "?"}/10. Get yours at`;
    const url = shareToken ? `${window.location.origin}/roast/${shareToken}` : window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=GetRoasted,rezoome`, "_blank");
  };

  const downloadScoreCard = async () => {
    if (!shareCardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `rezoome-score-${state.score || 0}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Downloaded! 📥", description: "Now flex it on socials" });
    } catch (err) {
      toast({ title: "Download failed 😵", description: "Try again bestie", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <Link to="/history">
                <Button variant="ghost" size="sm">History</Button>
              </Link>
            )}
            <Link to="/upload">
              <Button variant="ghost" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                New Roast
              </Button>
            </Link>
          </div>
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
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-primary">{state.fileName}</span>
              <span className="text-sm bg-secondary px-2 py-0.5 rounded-full">{toneEmoji} {state.tone}</span>
              <span className="text-sm bg-secondary px-2 py-0.5 rounded-full">🌍 {languageLabel}</span>
            </div>
          </motion.div>

          {/* Score Gauge */}
          {state.score !== null && state.score !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-10"
            >
              <ScoreGauge score={state.score} size={140} />
            </motion.div>
          )}

          {/* Share Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3 justify-center mb-10"
          >
            {!shareToken ? (
              <Button onClick={generateShareToken} variant="outline" disabled={generatingToken || !user}>
                <Share2 className="h-4 w-4 mr-2" />
                {generatingToken ? "Generating..." : "Get Share Link"}
              </Button>
            ) : (
              <Button onClick={copyShareLink} variant="outline">
                {copiedLink ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </Button>
            )}
            <Button onClick={shareOnTwitter} variant="outline">
              <Twitter className="h-4 w-4 mr-2" />
              Share on X
            </Button>
            <Button onClick={downloadScoreCard} variant="outline" disabled={downloading}>
              <Download className="h-4 w-4 mr-2" />
              {downloading ? "Creating..." : "Download Card"}
            </Button>
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

      {/* Hidden Share Card for export */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <ShareCard
          ref={shareCardRef}
          score={state.score || 0}
          tone={state.tone || "balanced"}
          language={state.language || "english"}
          fileName={state.fileName || "resume.pdf"}
          roastSnippet={roastSnippet}
        />
      </div>
    </div>
  );
};

export default Results;
