import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/upload" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = isSignUp
      ? await signUp(email, password, displayName)
      : await signIn(email, password);

    setSubmitting(false);

    if (error) {
      toast({ title: "Oops 💀", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Check your email 📧", description: "We sent you a confirmation link bestie!" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              {isSignUp ? "✨" : "🔥"}
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              {isSignUp ? "Join the roast" : "Welcome back"}
              <span className="text-gradient-fire"> bestie</span> 💅
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Create an account to save your roasts" : "Sign in to continue getting roasted"}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border/50 bg-card p-8 space-y-5"
          >
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="your name bestie"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-secondary border-border/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="at least 6 chars"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Hold on...</>
              ) : isSignUp ? (
                "Create Account 🔥"
              ) : (
                "Sign In 💀"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
