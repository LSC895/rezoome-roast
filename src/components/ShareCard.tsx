import { forwardRef } from "react";
import { Flame } from "lucide-react";

interface ShareCardProps {
  score: number;
  tone: string;
  language: string;
  fileName: string;
  roastSnippet: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ score, tone, language, fileName, roastSnippet }, ref) => {
    const getScoreColor = () => {
      if (score >= 7) return "from-orange-500 to-red-500";
      if (score >= 4) return "from-amber-500 to-orange-500";
      return "from-red-600 to-red-800";
    };

    const getScoreEmoji = () => {
      if (score >= 8) return "🔥";
      if (score >= 6) return "✨";
      if (score >= 4) return "😬";
      return "💀";
    };

    const toneEmoji = tone === "brutal" ? "💀" : tone === "gentle" ? "🫶" : "⚖️";
    const languageLabel = language.charAt(0).toUpperCase() + language.slice(1);

    return (
      <div
        ref={ref}
        className="w-[400px] bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-zinc-800"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-white text-lg">rezoome</span>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
              {toneEmoji} {tone}
            </span>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
              {languageLabel}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center py-6">
          <div className={`bg-gradient-to-br ${getScoreColor()} rounded-full w-24 h-24 flex flex-col items-center justify-center`}>
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-xs text-white/80">/10</span>
          </div>
          <span className="text-4xl ml-3">{getScoreEmoji()}</span>
        </div>

        {/* File name */}
        <p className="text-center text-zinc-500 text-xs font-mono mb-4 truncate">
          📄 {fileName}
        </p>

        {/* Roast snippet */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-4">
          <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 italic">
            "{roastSnippet}"
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Get roasted at rezoome.app</span>
          <span>🔥 #GetRoasted</span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
