import Navbar from "@/components/Navbar";
import VideoArena from "@/components/VideoArena";
import LiveNotifications from "@/components/LiveNotification";
import PTTButton from "@/components/PTTButton";
import { motion } from "framer-motion";
import { MessageSquare, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeToBattle, Battle } from "@/lib/battleService";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";

const DEMO_BATTLE_ID = "demo-battle-1";

const BattleLive = () => {
  const { profile } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [showWinConfetti, setShowWinConfetti] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBattle(DEMO_BATTLE_ID, (b) => {
      if (b?.winnerId && b.winnerId === profile?.uid && !showWinConfetti) {
        setShowWinConfetti(true);
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"] });
      }
      setBattle(b);
    });
    return unsub;
  }, [profile?.uid, showWinConfetti]);

  const userName = profile?.displayName || profile?.email?.split("@")[0] || "Player";

  return (
    <div className="min-h-screen">
      <Navbar />
      <LiveNotifications />

      <div className="container mx-auto px-6 py-8">
        {/* Battle header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-neon" />
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">
                {battle?.title ?? "SPEED ROUND #47"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {battle
                ? `${battle.type} Battle • Entry: ${battle.entryFee} pts • Prize: ${battle.prize} pts`
                : "4-Player Battle • Entry: 50 pts • Prize: 180 pts"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Admin Live</span>
            </div>
            <div className="glass px-3 py-1.5 rounded-full">
              <span className="text-xs font-display font-bold text-secondary">02:34</span>
            </div>
          </div>
        </motion.div>

        {/* Winner Banner */}
        {battle?.winnerId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong p-4 mb-6 text-center border border-primary/30"
          >
            <p className="font-display text-lg font-bold text-primary">
              🏆 WINNER! +{battle.prize} pts
            </p>
          </motion.div>
        )}

        {/* Agora Video Arena — 2x2 grid with live video */}
        <div className="mb-8">
          <VideoArena userName={userName} />
        </div>

        {/* Live Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Live Chat</span>
            <span className="text-[10px] text-muted-foreground">• 1.2K watching</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {[
              { user: "Vikram", msg: "This battle is 🔥" },
              { user: "Meera", msg: "Come on! 💪" },
              { user: "Admin", msg: "Next round starting in 30 seconds...", isAdmin: true },
            ].map((chat, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-xs font-bold ${chat.isAdmin ? "text-secondary" : "text-primary"}`}>
                  {chat.user}:
                </span>
                <span className="text-xs text-muted-foreground">{chat.msg}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              data-testid="input-chat"
              className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              data-testid="button-send-chat"
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Send
            </button>
          </div>
        </motion.div>
      </div>

      <PTTButton />
    </div>
  );
};

export default BattleLive;
