import Navbar from "@/components/Navbar";
import VideoArena from "@/components/VideoArena";
import LiveNotifications from "@/components/LiveNotification";
import PTTButton from "@/components/PTTButton";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Volume2, Trophy } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { subscribeToBattle, Battle, clearWinnerStatus } from "@/lib/battleService";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEMO_BATTLE_ID = "demo-battle-1";

const BattleLive = () => {
  const { profile } = useAuth();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const confettiFired = useRef(false);

  // Subscribe to the battle document
  useEffect(() => {
    const unsub = subscribeToBattle(DEMO_BATTLE_ID, (b) => {
      setBattle(b);
    });
    return unsub;
  }, []);

  // ── Winner detection: watch current user's Firestore doc for battleStatus ──
  useEffect(() => {
    if (!profile?.uid) return;

    const unsub = onSnapshot(doc(db, "users", profile.uid), (snap) => {
      const data = snap.data();
      if (data?.battleStatus === "winner" && !confettiFired.current) {
        confettiFired.current = true;
        setShowVictory(true);

        // Multi-burst confetti celebration
        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...opts,
            origin: { y: 0.6 },
            particleCount: Math.floor(300 * particleRatio),
            colors: ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"],
          });
        };
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2,  { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1,  { spread: 120, startVelocity: 45 });
      }
    });
    return unsub;
  }, [profile?.uid]);

  const handleDismissVictory = async () => {
    setShowVictory(false);
    confettiFired.current = false;
    if (profile?.uid) await clearWinnerStatus(profile.uid);
  };

  const userName = profile?.displayName || profile?.email?.split("@")[0] || "Player";

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <LiveNotifications />

      {/* ── VICTORY Full-Screen Overlay ── */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center space-y-6 px-8"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Trophy className="h-28 w-28 text-amber-400 mx-auto drop-shadow-lg" />
              </motion.div>

              <div className="space-y-2">
                <h1 className="font-display text-6xl font-black tracking-widest text-amber-400 drop-shadow-lg">
                  VICTORY!
                </h1>
                <p className="text-xl text-foreground font-semibold">
                  {userName}, you won! +100 pts added
                </p>
                <p className="text-sm text-muted-foreground">
                  Your balance has been updated
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismissVictory}
                className="px-10 py-4 rounded-2xl font-display text-sm font-bold tracking-widest
                           bg-amber-400 text-black hover:bg-amber-300 transition-all shadow-xl"
              >
                CLAIM VICTORY 🏆
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Agora Video Arena — 2×2 live grid */}
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
