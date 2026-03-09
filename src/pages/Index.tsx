import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Shield, ArrowRight, Star } from "lucide-react";

const exampleRoasts = [
  {
    tone: "🔥 Brutal",
    text: '"Your resume reads like a LinkedIn post written by a bot having an existential crisis. Skills: Microsoft Office? Welcome to 1997."',
  },
  {
    tone: "⚖️ Balanced",
    text: '"Your experience section has potential, but listing every project since college makes you look scattered, not versatile."',
  },
  {
    tone: "🌿 Gentle",
    text: '"You clearly have talent! Let\'s just tighten up the formatting and make your achievements shine a bit brighter."',
  },
];

const stats = [
  { value: "50K+", label: "Resumes Roasted" },
  { value: "89%", label: "Got Interviews After" },
  { value: "3", label: "Roast Tones" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/upload">
              <Button size="sm" className="bg-gradient-fire text-primary-foreground shadow-neon hover:opacity-90">
                Roast My Resume
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(16_100%_55%/0.08),transparent_60%)]" />
        <div className="container max-w-4xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 text-sm text-primary">
              <Flame className="h-4 w-4" />
              AI-Powered Resume Roasts
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              Your resume
              <span className="text-gradient-fire"> sucks.</span>
              <br />
              Let's fix it.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload your resume, pick your roast intensity, and get brutally honest AI feedback
              with actionable fixes. No sugarcoating (unless you want it).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-8 h-14 w-full sm:w-auto">
                  <Flame className="h-5 w-5 mr-2" />
                  Roast My Resume
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto border-border/50">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/30">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient-fire">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="container max-w-5xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16 font-display"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Upload", desc: "Drop your PDF resume into our secure uploader." },
              { icon: Flame, title: "Get Roasted", desc: "Pick your tone — Brutal, Balanced, or Gentle — and let AI do its thing." },
              { icon: Zap, title: "Fix & Win", desc: "Get actionable suggestions to transform your resume into interview bait." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                className="relative rounded-xl border border-border/50 bg-card p-8 text-center group hover:border-primary/40 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-5 group-hover:shadow-neon transition-shadow">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="text-sm font-mono text-muted-foreground mb-2">0{i + 1}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Roasts */}
      <section className="py-24 px-4 bg-card/50">
        <div className="container max-w-4xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4 font-display"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Sample Roasts
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12">See what our AI has to say...</p>
          <div className="grid gap-6">
            {exampleRoasts.map((roast, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-6 md:p-8"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-sm font-mono text-primary mb-3">{roast.tone}</div>
                <p className="text-foreground/90 italic text-lg leading-relaxed">{roast.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-4">
        <div className="container max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-neon-yellow text-neon-yellow" />
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl font-medium italic text-foreground/90 mb-6">
            "I thought my resume was solid. Rezoome showed me it was mid at best.
            After the fixes, I got 3 interviews in a week."
          </blockquote>
          <p className="text-muted-foreground">— Sarah K., Software Engineer</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container max-w-2xl text-center">
          <motion.div
            className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Flame className="h-12 w-12 text-primary mx-auto mb-6 animate-flame-flicker" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Ready to get roasted?</h2>
            <p className="text-muted-foreground mb-8">Free to start. No account required for your first roast.</p>
            <Link to="/upload">
              <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-10 h-14">
                <Flame className="h-5 w-5 mr-2" />
                Upload Resume
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-foreground">rezoome</span>
          </div>
          <div className="flex gap-6">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/upload" className="hover:text-foreground transition-colors">Upload</Link>
          </div>
          <p>© 2026 Rezoome. All rights roasted.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
