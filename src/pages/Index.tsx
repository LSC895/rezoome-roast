import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Shield, ArrowRight, Star, Skull, Sparkles, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const memes = [
  { text: "HR after seeing your resume:", img: "😐📄➡️🗑️" },
  { text: "You: 'I'm a quick learner'", img: "Recruiter: 💀💀💀" },
  { text: "Skills: Microsoft Word", img: "It's 2026 bestie... 🫠" },
];

const exampleRoasts = [
  {
    tone: "🔥 Brutal",
    text: '"Bro your resume has more red flags than my ex. "Detail-oriented" but you misspelled your own job title. I can\'t. 💀"',
  },
  {
    tone: "⚖️ Balanced",
    text: '"Okay so your experience is lowkey solid but the formatting is giving \'first draft at 3am.\' Let\'s glow it up."',
  },
  {
    tone: "🌿 Gentle",
    text: '"You have so much potential bestie! Let\'s just reorganize a few things and you\'ll be eating fr fr. 🫶"',
  },
];

const stats = [
  { value: "50K+", label: "Resumes Destroyed" },
  { value: "89%", label: "Got Interviews After" },
  { value: "∞", label: "Tears Shed" },
];

const floatingEmojis = ["🔥", "💀", "😭", "🗑️", "✨", "💅", "🫠", "😤"];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating background emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {floatingEmojis.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-[0.06]"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${5 + (i * 17) % 85}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.4 }}>
              <Flame className="h-7 w-7 text-primary" />
            </motion.div>
            <span className="text-xl font-bold font-display tracking-tight">rezoome</span>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">beta</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/upload">
              <Button size="sm" className="bg-gradient-fire text-primary-foreground shadow-neon hover:opacity-90">
                Roast Me 💀
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(16_100%_55%/0.12),transparent_60%)]" />
        <div className="container max-w-4xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 text-sm text-primary"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4" />
              AI that doesn't sugarcoat 💅
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
              One resume for
              <br />
              <motion.span
                className="text-gradient-fire inline-block"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                every job!
              </motion.span>
              <motion.span
                className="inline-block ml-3 text-5xl md:text-6xl"
                animate={{ rotate: [0, 14, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                🔥
              </motion.span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Upload your resume, pick your roast intensity, and get
              <span className="text-foreground font-semibold"> brutally honest </span>
              AI feedback with fixes that actually slap.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-10 font-mono">
              no cap, your resume needs this 😤
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-8 h-14 w-full sm:w-auto">
                    <Skull className="h-5 w-5 mr-2" />
                    Roast My Resume
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/pricing">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto border-border/50">
                    View Pricing ✨
                  </Button>
                </motion.div>
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
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold text-gradient-fire"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meme Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container max-w-4xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4 font-display"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            POV: Your resume rn 💀
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 font-mono text-sm">it's giving... unemployed</p>
          <div className="grid md:grid-cols-3 gap-5">
            {memes.map((meme, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border/50 bg-card p-6 text-center group hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 30, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <p className="text-sm text-muted-foreground mb-3 font-mono">{meme.text}</p>
                <p className="text-3xl md:text-4xl leading-relaxed">{meme.img}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="container max-w-5xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4 font-display"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How it works (it's lowkey easy)
          </motion.h2>
          <p className="text-center text-muted-foreground mb-16 text-sm">3 steps to resume redemption 🙏</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Upload", desc: "Yeet your PDF resume into our secure uploader. We don't judge (yet).", emoji: "📄" },
              { icon: Flame, title: "Get Roasted", desc: "Pick Brutal, Balanced, or Gentle. The AI will read you for filth. 💅", emoji: "🔥" },
              { icon: Zap, title: "Fix & Win", desc: "Get actual fixes that make recruiters slide into your DMs. fr fr.", emoji: "✨" },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                className="relative rounded-2xl border border-border/50 bg-card p-8 text-center group hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <motion.div
                  className="text-4xl mb-4"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {step.emoji}
                </motion.div>
                <div className="text-xs font-mono text-primary mb-2">step 0{i + 1}</div>
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
            Sample Roasts 🍗
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 text-sm font-mono">real output, real pain</p>
          <div className="grid gap-6">
            {exampleRoasts.map((roast, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border/50 bg-card p-6 md:p-8 hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
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
              <motion.div
                key={i}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, repeatDelay: 3 }}
              >
                <Star className="h-6 w-6 fill-neon-yellow text-neon-yellow" />
              </motion.div>
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl font-medium italic text-foreground/90 mb-6">
            "I was today years old when I found out my resume was actually trash.
            After the fixes, 3 interviews in a week. This app is bussin fr. 💀🔥"
          </blockquote>
          <p className="text-muted-foreground">— Sarah K., Software Engineer</p>
          <p className="text-xs text-muted-foreground/50 mt-2 font-mono">verified roast survivor ✅</p>
        </div>
      </section>

      {/* Viral tweet-style section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container max-w-2xl">
          <div className="space-y-4">
            {[
              { user: "@recruiterguy", text: "if i see 'proficient in microsoft word' one more time i'm gonna lose it 😭", likes: "12.4K" },
              { user: "@jobseeker404", text: "just got my resume roasted by rezoome and i've never been more attacked AND motivated at the same time", likes: "8.9K" },
              { user: "@hiringmanager", text: "whoever built rezoome deserves a raise. i wish every candidate used this before applying 🙏", likes: "23.1K" },
            ].map((tweet, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-xs font-mono text-primary mb-2">{tweet.user}</p>
                <p className="text-foreground/90 text-sm leading-relaxed">{tweet.text}</p>
                <p className="text-xs text-muted-foreground/50 mt-2">❤️ {tweet.likes}</p>
              </motion.div>
            ))}
          </div>
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
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-6"
            >
              🔥
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">Ready to get roasted bestie?</h2>
            <p className="text-muted-foreground mb-8">Free to start. No cap, no account needed. 🫡</p>
            <Link to="/upload">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-10 h-14">
                  <Skull className="h-5 w-5 mr-2" />
                  Let's Go 💀
                </Button>
              </motion.div>
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
          <p className="font-mono text-xs">© 2026 rezoome. all rights roasted. 🫡</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
