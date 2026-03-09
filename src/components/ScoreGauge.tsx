import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge = ({ score, size = 120 }: ScoreGaugeProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  
  const getScoreColor = () => {
    if (score >= 7) return "hsl(var(--primary))";
    if (score >= 4) return "hsl(40 100% 55%)"; // amber
    return "hsl(0 70% 55%)"; // red
  };

  const getScoreEmoji = () => {
    if (score >= 8) return "🔥";
    if (score >= 6) return "✨";
    if (score >= 4) return "😬";
    return "💀";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold font-display"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <motion.span
          className="text-xs text-muted-foreground font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          /10
        </motion.span>
        <motion.span
          className="text-lg mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {getScoreEmoji()}
        </motion.span>
      </div>
    </div>
  );
};

export default ScoreGauge;
