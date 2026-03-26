import { motion } from "framer-motion";
import { Users, Clock, Zap, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BattleCardProps {
  title: string;
  type: "Solo" | "Team" | "4-Player";
  entryFee: number;
  prize: number;
  players: number;
  maxPlayers: number;
  status: "live" | "upcoming" | "open";
  timeLeft?: string;
  index: number;
}

const statusConfig = {
  live: { label: "🔴 LIVE", className: "bg-secondary/20 text-secondary border-secondary/30" },
  upcoming: { label: "⏳ UPCOMING", className: "bg-primary/20 text-primary border-primary/30" },
  open: { label: "✅ OPEN", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

const BattleCard = ({ title, type, entryFee, prize, players, maxPlayers, status, timeLeft, index }: BattleCardProps) => {
  const s = statusConfig[status];
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="glass group cursor-pointer relative overflow-hidden"
    >
      {status === "live" && (
        <div className="absolute inset-0 rounded-xl border-2 border-secondary/30 animate-glow-pulse pointer-events-none" />
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.className}`}>
            {s.label}
          </span>
          <span className="text-xs text-muted-foreground font-medium">{type}</span>
        </div>

        <h3 className="font-display text-base font-bold text-foreground tracking-wide">{title}</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Entry</p>
              <p className="text-sm font-bold text-foreground">{entryFee} pts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-secondary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Prize</p>
              <p className="text-sm font-bold text-secondary">{prize} pts</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {players}/{maxPlayers}
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
              animate={{ width: `${(players / maxPlayers) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-full gradient-blue rounded-full"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/battle/live")}
          className="w-full py-2.5 rounded-lg font-display text-xs font-bold tracking-wider 
                     bg-primary/10 text-primary border border-primary/20 
                     hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          {status === "live" ? "WATCH LIVE" : "JOIN BATTLE"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BattleCard;
