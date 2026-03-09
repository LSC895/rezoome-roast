import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, FileText, Clock, Copy, Check, Gift, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Roast {
  id: string;
  file_name: string;
  tone: string;
  language: string;
  score: number | null;
  roast_text: string | null;
  fix_suggestions: any;
  created_at: string;
  share_token: string | null;
}

interface Profile {
  referral_code: string | null;
  bonus_roasts: number;
  is_pro: boolean;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch roasts
      const { data: roastsData } = await supabase
        .from("roasts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("referral_code, bonus_roasts, is_pro")
        .eq("user_id", user.id)
        .single();

      // Fetch referral count
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);

      setRoasts(roastsData || []);
      setProfile(profileData);
      setReferralCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleViewRoast = (roast: Roast) => {
    navigate("/results", {
      state: {
        roastId: roast.id,
        fileName: roast.file_name,
        tone: roast.tone,
        language: roast.language,
        roastText: roast.roast_text,
        fixSuggestions: roast.fix_suggestions,
        score: roast.score,
      },
    });
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    toast({ title: "Copied! 🔥", description: "Share it with your besties" });
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const toneEmoji = (tone: string) => 
    tone === "brutal" ? "💀" : tone === "gentle" ? "🫶" : "⚖️";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/upload">
              <Button size="sm" className="bg-gradient-fire text-primary-foreground">
                New Roast 🔥
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              Your Roast History 📜
            </h1>
            <p className="text-muted-foreground">All your emotional damage in one place 💀</p>
          </motion.div>

          {/* Referral Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Invite Friends, Get Free Roasts 🎁</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your referral link. When friends sign up, you both get +3 bonus roasts!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-secondary rounded-lg px-4 py-2 font-mono text-sm truncate">
                    {profile?.referral_code 
                      ? `${window.location.origin}/auth?ref=${profile.referral_code}`
                      : "Loading..."
                    }
                  </div>
                  <Button onClick={copyReferralLink} variant="outline" className="flex-shrink-0">
                    {copiedReferral ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedReferral ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span><strong>{referralCount}</strong> referrals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <span><strong>{profile?.bonus_roasts || 0}</strong> bonus roasts</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Roast List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : roasts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold mb-2">No roasts yet</h3>
              <p className="text-muted-foreground mb-6">Time to get your resume destroyed bestie</p>
              <Link to="/upload">
                <Button className="bg-gradient-fire text-primary-foreground">
                  Get Your First Roast 🔥
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {roasts.map((roast, i) => (
                <motion.div
                  key={roast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => handleViewRoast(roast)}
                  className="rounded-xl border border-border/50 bg-card p-5 cursor-pointer hover:border-primary/30 transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold truncate">{roast.file_name}</h3>
                        {roast.score !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            roast.score >= 7 ? "bg-primary/20 text-primary" :
                            roast.score >= 4 ? "bg-amber-500/20 text-amber-500" :
                            "bg-red-500/20 text-red-500"
                          }`}>
                            {roast.score}/10
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{toneEmoji(roast.tone)} {roast.tone}</span>
                        <span>•</span>
                        <span>{roast.language}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(roast.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
