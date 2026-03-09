import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Upload as UploadIcon, FileText, X, Loader2, Skull } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RoastTone = "brutal" | "balanced" | "gentle";
type RoastLanguage = "english" | "hindi" | "hinglish" | "spanish" | "french" | "german" | "japanese" | "portuguese";

const languages: { id: RoastLanguage; label: string; emoji: string }[] = [
  { id: "english", label: "English", emoji: "🇬🇧" },
  { id: "hindi", label: "हिंदी", emoji: "🇮🇳" },
  { id: "hinglish", label: "Hinglish", emoji: "🔥" },
  { id: "spanish", label: "Español", emoji: "🇪🇸" },
  { id: "french", label: "Français", emoji: "🇫🇷" },
  { id: "german", label: "Deutsch", emoji: "🇩🇪" },
  { id: "japanese", label: "日本語", emoji: "🇯🇵" },
  { id: "portuguese", label: "Português", emoji: "🇧🇷" },
];

const tones: { id: RoastTone; label: string; emoji: string; desc: string }[] = [
  { id: "brutal", label: "Brutal", emoji: "💀", desc: "No mercy. Pure devastation." },
  { id: "balanced", label: "Balanced", emoji: "⚖️", desc: "Honest but constructive." },
  { id: "gentle", label: "Gentle", emoji: "🫶", desc: "Kind nudges, soft truths." },
];

const loadingTexts = [
  "Reading your resume... 👀",
  "Finding all the red flags... 🚩",
  "Preparing emotional damage... 💀",
  "Almost done roasting... 🔥",
];

const Upload = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [tone, setTone] = useState<RoastTone>("balanced");
  const [language, setLanguage] = useState<RoastLanguage>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRoast = async () => {
    if (!file) return;

    // Require auth
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    setLoadingIdx(0);

    const interval = setInterval(() => {
      setLoadingIdx((prev) => Math.min(prev + 1, loadingTexts.length - 1));
    }, 2000);

    try {
      // 1. Upload PDF to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Create roast record
      const { data: roast, error: roastError } = await supabase
        .from("roasts")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          tone,
          language,
          status: "pending",
        })
        .select()
        .single();

      if (roastError || !roast) throw new Error("Failed to create roast record");

      // 3. Call edge function
      const { data: result, error: fnError } = await supabase.functions.invoke("roast-resume", {
        body: { roastId: roast.id },
      });

      clearInterval(interval);

      if (fnError) {
        const msg = fnError.message?.includes("non-2xx")
          ? result?.error || fnError.message
          : fnError.message;
        throw new Error(msg);
      }

      // 4. Navigate to results
      navigate("/results", {
        state: {
          roastId: roast.id,
          fileName: file.name,
          tone,
          language,
          roastText: result.roast_text,
          fixSuggestions: result.fix_suggestions,
          score: result.score,
        },
      });
    } catch (error: any) {
      clearInterval(interval);
      console.error("Roast error:", error);
      toast({
        title: "Roast failed 😵",
        description: error.message || "Something went wrong. Try again bestie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center gap-3">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            {!authLoading && !user && (
              <Link to="/auth">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              📄
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Drop it.
              <span className="text-gradient-fire"> Get wrecked.</span>
              <span className="ml-2">💀</span>
            </h1>
            <p className="text-muted-foreground text-lg">Upload a PDF and choose your pain level bestie</p>
          </motion.div>

          {/* Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                isDragActive
                  ? "border-primary bg-primary/5 shadow-neon"
                  : file
                  ? "border-primary/50 bg-card"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-card/80"
              }`}
            >
              <input {...getInputProps()} />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FileText className="h-8 w-8 text-primary" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • ready to get destroyed 🫡
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <motion.div
                      className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground">
                        {isDragActive ? "Drop it like it's hot 🔥" : "Drag & drop your resume PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse • Max 10MB • PDF only bestie</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <h2 className="text-lg font-bold font-display mb-1 text-center">Pick your language 🌍</h2>
            <p className="text-center text-xs text-muted-foreground mb-4 font-mono">roasts hit different in every tongue 👅</p>
            <div className="grid grid-cols-4 gap-3">
              {languages.map((lang) => (
                <motion.button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-xl border p-3 text-center transition-all duration-200 ${
                    language === lang.id
                      ? "border-primary bg-primary/10 shadow-neon"
                      : "border-border/50 bg-card hover:border-primary/20"
                  }`}
                >
                  <div className="text-2xl mb-1">{lang.emoji}</div>
                  <div className="font-bold text-xs">{lang.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tone Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-lg font-bold font-display mb-1 text-center">Pick your vibe 🎭</h2>
            <p className="text-center text-xs text-muted-foreground mb-4 font-mono">choose wisely... or don't 🤷</p>
            <div className="grid grid-cols-3 gap-3">
              {tones.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative rounded-xl border p-4 text-center transition-all duration-200 ${
                    tone === t.id
                      ? "border-primary bg-primary/10 shadow-neon"
                      : "border-border/50 bg-card hover:border-primary/20"
                  }`}
                >
                  <motion.div
                    className="text-2xl mb-2"
                    animate={tone === t.id ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: tone === t.id ? Infinity : 0, repeatDelay: 1 }}
                  >
                    {t.emoji}
                  </motion.div>
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                disabled={!file || isLoading}
                onClick={handleRoast}
                className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-12 h-14 disabled:opacity-40"
              >
                {isLoading ? (
                  <motion.span
                    className="flex items-center"
                    key={loadingIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {loadingTexts[loadingIdx]}
                  </motion.span>
                ) : (
                  <>
                    <Skull className="h-5 w-5 mr-2" />
                    {user ? "Roast Me 🔥" : "Sign in & Roast 🔥"}
                  </>
                )}
              </Button>
            </motion.div>
            {!isLoading && (
              <p className="text-xs text-muted-foreground/50 mt-3 font-mono">
                {user ? "we promise to only hurt your feelings a little 🤏" : "you'll need to sign in first bestie 🫡"}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
