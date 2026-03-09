import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, Upload as UploadIcon, FileText, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type RoastTone = "brutal" | "balanced" | "gentle";

const tones: { id: RoastTone; label: string; emoji: string; desc: string }[] = [
  { id: "brutal", label: "Brutal", emoji: "🔥", desc: "No mercy. Pure devastation." },
  { id: "balanced", label: "Balanced", emoji: "⚖️", desc: "Honest but constructive." },
  { id: "gentle", label: "Gentle", emoji: "🌿", desc: "Kind nudges, soft truths." },
];

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [tone, setTone] = useState<RoastTone>("balanced");
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRoast = async () => {
    if (!file) return;
    setIsLoading(true);
    // For now, navigate to results with mock data
    // Will be replaced with actual API call when backend is set up
    setTimeout(() => {
      navigate("/results", { state: { fileName: file.name, tone } });
    }, 1500);
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
          <Link to="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Drop your resume.
              <span className="text-gradient-fire"> Get roasted.</span>
            </h1>
            <p className="text-muted-foreground text-lg">Upload a PDF and choose your pain level.</p>
          </motion.div>

          {/* Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
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
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
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
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                      <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {isDragActive ? "Drop it like it's hot 🔥" : "Drag & drop your resume PDF"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse • Max 10MB</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Tone Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <h2 className="text-lg font-bold font-display mb-4 text-center">Pick your roast intensity</h2>
            <div className="grid grid-cols-3 gap-3">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`relative rounded-xl border p-4 text-center transition-all duration-200 ${
                    tone === t.id
                      ? "border-primary bg-primary/10 shadow-neon"
                      : "border-border/50 bg-card hover:border-primary/20"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                </button>
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
            <Button
              size="lg"
              disabled={!file || isLoading}
              onClick={handleRoast}
              className="bg-gradient-fire text-primary-foreground shadow-fire hover:opacity-90 text-lg px-12 h-14 disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Roasting...
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5 mr-2" />
                  Roast Me 🔥
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
