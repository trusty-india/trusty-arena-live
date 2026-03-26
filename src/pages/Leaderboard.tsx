import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToLeaderboard, LeaderboardEntry } from "@/lib/leaderboardService";

const rankStyle = (i: number) => {
  if (i === 0) return { icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
  if (i === 1) return { icon: Medal, color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/30" };
  if (i === 2) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" };
  return { icon: Trophy, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border/30" };
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeToLeaderboard(50, setEntries);
    return unsub;
  }, []);

  const myRank = entries.findIndex((e) => e.uid === user?.uid);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">LEADERBOARD</h1>
            <p className="text-xs text-muted-foreground">Top players ranked by earnings</p>
          </div>
        </motion.div>

        {/* My Rank Card */}
        {myRank >= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-4 mb-6 flex items-center gap-4 border border-primary/20"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display text-sm font-bold text-primary">
              #{myRank + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Your Rank</p>
              <p className="text-[10px] text-muted-foreground">{entries[myRank]?.displayName}</p>
            </div>
            <p className="font-display text-lg font-bold text-primary">₹{entries[myRank]?.balance?.toLocaleString()}</p>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[1, 0, 2].map((idx) => {
              const e = entries[idx];
              const style = rankStyle(idx);
              return (
                <motion.div
                  key={e.uid}
                  initial={{ opacity: 0, y: idx === 0 ? -20 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.05 }}
                  className={`glass p-4 text-center ${idx === 0 ? "row-span-1 -mt-4" : ""} border ${style.border}`}
                >
                  <div className="relative inline-block mb-2">
                    {e.photoURL ? (
                      <img src={e.photoURL} alt={e.displayName} className={`w-12 h-12 rounded-full border-2 ${style.border} mx-auto`} />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center mx-auto`}>
                        <User className={`h-5 w-5 ${style.color}`} />
                      </div>
                    )}
                    <style.icon className={`h-4 w-4 ${style.color} absolute -top-1 -right-1`} />
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{e.displayName || "Player"}</p>
                  <p className={`font-display text-sm font-bold ${style.color}`}>₹{e.balance?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">#{idx + 1}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Full List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass p-5"
        >
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No players yet. Be the first!</p>
          ) : (
            <div className="space-y-1">
              {entries.map((e, i) => {
                const style = rankStyle(i);
                const isMe = e.uid === user?.uid;
                return (
                  <motion.div
                    key={e.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.02 * i }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/20"
                    }`}
                  >
                    <span className={`w-8 text-center font-display text-sm font-bold ${i < 3 ? style.color : "text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    {e.photoURL ? (
                      <img src={e.photoURL} alt={e.displayName} className="w-8 h-8 rounded-full border border-border/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {e.displayName || "Anonymous"} {isMe && <span className="text-primary">(You)</span>}
                      </p>
                    </div>
                    <span className="font-display text-sm font-bold text-foreground">₹{e.balance?.toLocaleString()}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
