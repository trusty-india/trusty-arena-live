import Navbar from "@/components/Navbar";
import VideoArena from "@/components/VideoArena";
import LiveNotifications from "@/components/LiveNotification";
import PTTButton from "@/components/PTTButton";
import LiveQuiz from "@/components/LiveQuiz";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Volume2, Trophy, Heart } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  subscribeToBattle,
  Battle,
  clearWinnerStatus,
  voteForPlayer,
} from "@/lib/battleService";
import { QuizSet, subscribeToQuizSets } from "@/lib/quizService";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

interface HeartPop {
  id: number;
  x: number;
}

const FALLBACK_BATTLE_ID = "demo-battle-1";

const BattleLive = () => {
  const { profile } = useAuth();
  const { search } = useLocation();
  const battleId = new URLSearchParams(search).get("id") ?? FALLBACK_BATTLE_ID;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [allQuizSets, setAllQuizSets] = useState<QuizSet[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [heartPops, setHeartPops] = useState<Record<string, HeartPop[]>>({});
  const [votedUids, setVotedUids] = useState<Set<string>>(new Set());
  const confettiFired = useRef(false);

  // Subscribe to the real battle doc from Firestore
  useEffect(() => {
    const unsub = subscribeToBattle(battleId, setBattle);
    return unsub;
  }, [battleId]);

  // Subscribe to quiz sets so we can look up the active one
  useEffect(() => {
    const unsub = subscribeToQuizSets(setAllQuizSets);
    return unsub;
  }, []);

  // Winner detection on the current user's doc
  useEffect(() => {
    if (!profile?.uid) return;
    const unsub = onSnapshot(doc(db, "users", profile.uid), (snap) => {
      const data = snap.data();
      if (data?.battleStatus === "winner" && !confettiFired.current) {
        confettiFired.current = true;
        setShowVictory(true);
        const fire = (ratio: number, opts: confetti.Options) =>
          confetti({
            ...opts,
            origin: { y: 0.6 },
            particleCount: Math.floor(300 * ratio),
            colors: ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"],
          });
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

  const handleVote = useCallback(async (uid: string, playerName: string) => {
    if (!profile?.uid) { toast.error("Sign in to vote"); return; }
    if (votedUids.has(uid)) { toast("You already voted for " + playerName); return; }
    try {
      await voteForPlayer(battleId, uid);
      setVotedUids((prev) => new Set([...prev, uid]));
      // Spawn heart pops
      const pops: HeartPop[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 80 - 40,
      }));
      setHeartPops((prev) => ({ ...prev, [uid]: [...(prev[uid] ?? []), ...pops] }));
      setTimeout(() => {
        setHeartPops((prev) => {
          const ids = new Set(pops.map((p) => p.id));
          return { ...prev, [uid]: (prev[uid] ?? []).filter((h) => !ids.has(h.id)) };
        });
      }, 1000);
      toast.success(`❤️ Voted for ${playerName}!`);
    } catch { toast.error("Vote failed"); }
  }, [battleId, profile?.uid, votedUids]);

  const userName = profile?.displayName || profile?.email?.split("@")[0] || "Player";
  const isAdmin = profile?.email === "bsnsspower@gmail.com";

  // Find the active quiz set
  const activeQuizSet = battle?.quizSetId
    ? allQuizSets.find((q) => q.id === battle.quizSetId) ?? null
    : null;

  const playerList = Object.entries(battle?.players ?? {});

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <LiveNotifications />

      {/* ── VICTORY Overlay ── */}
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
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Trophy className="h-28 w-28 text-amber-400 mx-auto drop-shadow-lg" />
              </motion.div>
              <div className="space-y-2">
                <h1 className="font-display text-6xl font-black tracking-widest text-amber-400">VICTORY!</h1>
                <p className="text-xl text-foreground font-semibold">{userName}, you won! +100 pts added</p>
                <p className="text-sm text-muted-foreground">Your balance has been updated</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDismissVictory}
                className="px-10 py-4 rounded-2xl font-display text-sm font-bold tracking-widest bg-amber-400 text-black hover:bg-amber-300 transition-all shadow-xl"
              >
                CLAIM VICTORY 🏆
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 py-8">
        {/* Battle header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary animate-pulse-neon" />
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">
                {battle?.title ?? "LOADING..."}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {battle
                ? `${battle.type} Battle • Entry: ${battle.entryFee} pts • Prize: ${battle.prize} pts`
                : "Battle loading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {battle?.isQuizActive && (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="glass px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/30"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary">QUIZ LIVE</span>
              </motion.div>
            )}
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
              <Volume2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Admin Live</span>
            </div>
          </div>
        </motion.div>

        {/* ── Video Grid with Quiz overlay ── */}
        <div className="mb-8 relative">
          <VideoArena userName={userName} />

          {/* Quiz overlay sits on top of the video grid */}
          <AnimatePresence>
            {battle?.isQuizActive && activeQuizSet && profile?.uid && (
              <LiveQuiz
                battle={battle}
                quizSet={activeQuizSet}
                currentUserUid={profile.uid}
                currentUserName={userName}
                isAdmin={isAdmin}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Vote Board ── */}
        {playerList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4 text-secondary" />
              <h2 className="font-display text-sm font-bold text-foreground tracking-wider">VOTE FOR YOUR FAVOURITE</h2>
              <span className="text-[10px] text-muted-foreground">• votes update live</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {playerList.map(([uid, player]) => {
                const alreadyVoted = votedUids.has(uid);
                const isMe = uid === profile?.uid;
                const pops = heartPops[uid] ?? [];

                return (
                  <motion.div
                    key={uid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-xl p-4 flex flex-col items-center gap-3 relative overflow-hidden"
                  >
                    {/* Floating hearts */}
                    <AnimatePresence>
                      {pops.map((pop) => (
                        <motion.div
                          key={pop.id}
                          initial={{ opacity: 1, y: 0, x: pop.x, scale: 0.5 }}
                          animate={{ opacity: 0, y: -60, x: pop.x + (Math.random() * 20 - 10), scale: 1.2 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute bottom-12 pointer-events-none"
                          style={{ left: "50%" }}
                        >
                          <Heart className="h-5 w-5 fill-secondary text-secondary" />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-black text-primary border-2 border-primary/30">
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + city */}
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground leading-tight">{player.name}</p>
                      <p className="text-[10px] text-muted-foreground">{player.city}</p>
                    </div>

                    {/* Vote count */}
                    <div className="flex items-center gap-1.5">
                      <Heart className={`h-4 w-4 ${alreadyVoted ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                      <span className="font-display text-sm font-bold text-foreground tabular-nums">
                        {player.votes ?? 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground">votes</span>
                    </div>

                    {/* Vote button */}
                    <motion.button
                      whileTap={!isMe && !alreadyVoted ? { scale: 0.92 } : {}}
                      onClick={() => !isMe && !alreadyVoted && handleVote(uid, player.name)}
                      disabled={isMe || alreadyVoted}
                      data-testid={`button-vote-${uid}`}
                      className={`w-full py-2 rounded-lg font-display text-xs font-bold tracking-wider transition-all
                        ${isMe
                          ? "bg-muted/20 text-muted-foreground cursor-not-allowed opacity-50"
                          : alreadyVoted
                            ? "bg-secondary/20 text-secondary border border-secondary/30 cursor-default"
                            : "bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-secondary-foreground"
                        }`}
                    >
                      {isMe ? "YOU" : alreadyVoted ? "❤️ VOTED" : "❤️ VOTE"}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

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
