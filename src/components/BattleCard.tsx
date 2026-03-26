import { motion } from "framer-motion";
import { Users, Clock, Zap, Trophy, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { joinBattle } from "@/lib/battleService";
import { useState } from "react";
import { toast } from "sonner";

interface BattleCardProps {
  id: string;
  title: string;
  type: "Solo" | "Team" | "4-Player";
  entryFee: number;
  prize: number;
  playerCount: number;
  maxPlayers: number;
  status: "live" | "upcoming" | "open" | "finished";
  timeLeft?: string;
  index: number;
  isSpecial?: boolean;
  isJoined?: boolean;
}

const statusConfig = {
  live:     { label: "🔴 LIVE",     className: "bg-secondary/20 text-secondary border-secondary/30" },
  upcoming: { label: "⏳ UPCOMING", className: "bg-primary/20 text-primary border-primary/30" },
  open:     { label: "✅ OPEN",     className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  finished: { label: "🏁 FINISHED", className: "bg-muted/40 text-muted-foreground border-border" },
};

const BattleCard = ({
  id,
  title,
  type,
  entryFee,
  prize,
  playerCount,
  maxPlayers,
  status,
  timeLeft,
  index,
  isSpecial = false,
  isJoined = false,
}: BattleCardProps) => {
  const s = statusConfig[status] ?? statusConfig.open;
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!profile) return;
    if (status === "live" || isJoined) {
      navigate(`/battle/live`);
      return;
    }
    setJoining(true);
    try {
      await joinBattle(
        id,
        profile.uid,
        profile.displayName || profile.email || "Player",
      );
      toast.success(`Joined ${title}!`);
      navigate(`/battle/live`);
    } catch {
      toast.error("Could not join battle.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative group cursor-pointer overflow-hidden rounded-xl
        ${isSpecial
          ? "border-2 border-amber-400/60 shadow-[0_0_24px_4px_rgba(251,191,36,0.25)]"
          : "glass"
        }`}
      style={isSpecial ? { background: "rgba(15,10,5,0.7)" } : undefined}
    >
      {/* Special pulsing ring */}
      {isSpecial && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-xl border-2 border-amber-400/40 pointer-events-none"
        />
      )}

      {/* Live pulse ring */}
      {status === "live" && !isSpecial && (
        <div className="absolute inset-0 rounded-xl border-2 border-secondary/30 animate-glow-pulse pointer-events-none" />
      )}

      <div className="p-5 space-y-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.className}`}>
              {s.label}
            </span>
            {isSpecial && (
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40"
              >
                <Flame className="h-3 w-3" /> MEGA CHALLENGE
              </motion.span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium flex-shrink-0">{type}</span>
        </div>

        <h3 className={`font-display text-base font-bold tracking-wide ${isSpecial ? "text-amber-300" : "text-foreground"}`}>
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Entry</p>
              <p className="text-sm font-bold text-foreground">{entryFee} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className={`h-3.5 w-3.5 ${isSpecial ? "text-amber-400" : "text-secondary"}`} />
            <div>
              <p className="text-[10px] text-muted-foreground">Prize</p>
              <p className={`text-sm font-bold ${isSpecial ? "text-amber-400" : "text-secondary"}`}>{prize} pts</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {playerCount}/{maxPlayers}
            </span>
            {timeLeft && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeLeft}
              </span>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(playerCount / maxPlayers) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.08 }}
              className={`h-full rounded-full ${isSpecial ? "bg-gradient-to-r from-amber-500 to-yellow-300" : "gradient-blue"}`}
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleJoin}
          disabled={joining || status === "finished"}
          className={`w-full py-2.5 rounded-lg font-display text-xs font-bold tracking-wider transition-all duration-200
            ${isSpecial
              ? "bg-amber-400/20 text-amber-400 border border-amber-400/40 hover:bg-amber-400 hover:text-black"
              : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {joining ? "Joining..." : isJoined || status === "live" ? "WATCH LIVE" : "JOIN BATTLE"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BattleCard;
