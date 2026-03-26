import { motion } from "framer-motion";
import { Mic, MicOff, AlertTriangle, ThumbsUp, Trophy } from "lucide-react";
import { useState } from "react";

interface PlayerVideoProps {
  name: string;
  city: string;
  votes: number;
  totalVotes: number;
  color: "blue" | "red";
  isWarned?: boolean;
  isWinner?: boolean;
  index: number;
  onVote?: () => void;
}

const PlayerVideo = ({ name, city, votes, totalVotes, color, isWarned, isWinner, index, onVote }: PlayerVideoProps) => {
  const [muted] = useState(false);
  const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
  const isBlue = color === "blue";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.15 }}
      className={`glass relative overflow-hidden ${
        isWarned ? "animate-warning-flash animate-shake border-2 border-destructive" : ""
      } ${isWinner ? "border-2 border-primary neon-glow-blue" : ""}`}
    >
      {/* Simulated video area */}
      <div className="aspect-video bg-muted/50 relative flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold ${
          isBlue ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
        }`}>
          {name.charAt(0)}
        </div>

        {/* Winner crown */}
        {isWinner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-1/2 -translate-x-1/2"
          >
            <Trophy className="h-8 w-8 text-primary drop-shadow-lg" />
          </motion.div>
        )}

        {/* Mic indicator */}
        <div className="absolute top-2 right-2">
          {muted ? (
            <MicOff className="h-4 w-4 text-destructive" />
          ) : (
            <Mic className={`h-4 w-4 ${isBlue ? "text-primary" : "text-secondary"}`} />
          )}
        </div>

        {/* Warning overlay */}
        {isWarned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-destructive/20 flex items-center justify-center"
          >
            <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
          </motion.div>
        )}

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-neon" />
          <span className="text-[10px] font-bold text-foreground">LIVE</span>
        </div>
      </div>

      {/* Player info & vote bar */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground">{city}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-display font-bold ${isBlue ? "text-primary" : "text-secondary"}`}>
              {votes} votes
            </span>
            {onVote && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onVote}
                className={`p-1.5 rounded-lg transition-all ${
                  isBlue ? "bg-primary/10 hover:bg-primary/20" : "bg-secondary/10 hover:bg-secondary/20"
                }`}
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${isBlue ? "text-primary" : "text-secondary"}`} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Voting progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${isBlue ? "gradient-blue" : "gradient-crimson"}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerVideo;
