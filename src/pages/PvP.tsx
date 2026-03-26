import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Plus, Zap, User, X, Trophy, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import confetti from "canvas-confetti";
import {
  PvPChallenge,
  subscribeToChallenges,
  createChallenge,
  acceptChallenge,
  cancelChallenge,
  declareChallengWinner,
} from "@/lib/pvpService";
import { toast } from "sonner";

const BET_PRESETS = [50, 100, 250, 500, 1000];

const PvP = () => {
  const { user, profile, isAdmin } = useAuth();
  const [challenges, setChallenges] = useState<PvPChallenge[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [customBet, setCustomBet] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToChallenges(setChallenges);
    return unsub;
  }, []);

  const openChallenges = challenges.filter((c) => c.status === "open");
  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed").slice(0, 10);

  const myChallenges = challenges.filter(
    (c) => c.creatorUid === user?.uid || c.opponentUid === user?.uid
  );

  const handleCreate = async () => {
    if (!user || !profile) return;
    const amount = customBet ? parseInt(customBet) : betAmount;
    if (!amount || amount < 10) {
      toast.error("Minimum bet is ₹10");
      return;
    }
    if ((profile.balance ?? 0) < amount) {
      toast.error("Insufficient balance!");
      return;
    }
    setCreating(true);
    try {
      await createChallenge(user.uid, profile.displayName, profile.photoURL, amount);
      toast.success(`Challenge created for ₹${amount}!`);
      setShowCreate(false);
      setCustomBet("");
    } catch (e: any) {
      toast.error(e.message);
    }
    setCreating(false);
  };

  const handleAccept = async (challenge: PvPChallenge) => {
    if (!user || !profile) return;
    try {
      await acceptChallenge(challenge.id, user.uid, profile.displayName, profile.photoURL);
      toast.success(`Challenge accepted! ₹${challenge.betAmount} deducted.`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCancel = async (challenge: PvPChallenge) => {
    try {
      await cancelChallenge(challenge.id, challenge.creatorUid);
      toast.info("Challenge cancelled. Points refunded.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeclareWinner = async (challenge: PvPChallenge, winnerUid: string) => {
    await declareChallengWinner(challenge.id, winnerUid);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#3B82F6", "#EF4444", "#10B981"] });
    toast.success("Winner declared! 🎉");
  };

  const PlayerAvatar = ({ name, photo, size = "w-10 h-10" }: { name: string; photo?: string; size?: string }) =>
    photo ? (
      <img src={photo} alt={name} className={`${size} rounded-full border-2 border-primary/30`} />
    ) : (
      <div className={`${size} rounded-full bg-muted flex items-center justify-center`}>
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
    );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Swords className="h-8 w-8 text-secondary" />
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">PvP ARENA</h1>
              <p className="text-xs text-muted-foreground">Challenge a friend • 1v1 point betting</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs font-bold tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" /> CREATE CHALLENGE
          </motion.button>
        </motion.div>

        {/* Create Challenge Panel */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass p-6 space-y-4">
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> SET YOUR BET
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BET_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setBetAmount(amt); setCustomBet(""); }}
                      className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all ${
                        betAmount === amt && !customBet
                          ? "bg-primary text-primary-foreground"
                          : "glass text-muted-foreground hover:text-primary"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Custom amount..."
                    value={customBet}
                    onChange={(e) => setCustomBet(e.target.value)}
                    className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="px-6 py-2 rounded-lg font-display text-xs font-bold tracking-wider bg-secondary text-secondary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {creating ? "..." : `BET ₹${customBet || betAmount}`}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Balance: ₹{profile?.balance?.toLocaleString() ?? "0"} • Winner takes 2× the bet
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Open Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-5 mb-6"
        >
          <h2 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> OPEN CHALLENGES ({openChallenges.length})
          </h2>
          {openChallenges.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No open challenges. Be the first to create one!</p>
          ) : (
            <div className="space-y-3">
              {openChallenges.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-4 flex items-center gap-4"
                >
                  <PlayerAvatar name={c.creatorName} photo={c.creatorPhoto} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{c.creatorName}</p>
                    <p className="text-[10px] text-muted-foreground">Waiting for opponent...</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-lg font-bold text-primary">₹{c.betAmount}</p>
                    <p className="text-[10px] text-muted-foreground">Prize: ₹{c.betAmount * 2}</p>
                  </div>
                  {c.creatorUid === user?.uid ? (
                    <button
                      onClick={() => handleCancel(c)}
                      className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAccept(c)}
                      className="px-4 py-2 rounded-lg font-display text-xs font-bold tracking-wider bg-secondary text-secondary-foreground hover:opacity-90 transition-all"
                    >
                      ACCEPT
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Active Matches */}
        {activeChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5 mb-6"
          >
            <h2 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Swords className="h-4 w-4 text-secondary" /> ACTIVE MATCHES ({activeChallenges.length})
            </h2>
            <div className="space-y-4">
              {activeChallenges.map((c) => (
                <div key={c.id} className="glass p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <PlayerAvatar name={c.creatorName} photo={c.creatorPhoto} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{c.creatorName}</p>
                        <p className="text-[10px] text-primary">Challenger</p>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <p className="font-display text-xs font-bold text-muted-foreground">VS</p>
                      <p className="font-display text-lg font-bold text-secondary">₹{c.betAmount * 2}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                      <div className="min-w-0 text-right">
                        <p className="text-sm font-bold text-foreground truncate">{c.opponentName}</p>
                        <p className="text-[10px] text-secondary">Opponent</p>
                      </div>
                      <PlayerAvatar name={c.opponentName || ""} photo={c.opponentPhoto} />
                    </div>
                  </div>
                  {/* Admin can declare winner */}
                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t border-border/30">
                      <button
                        onClick={() => handleDeclareWinner(c, c.creatorUid)}
                        className="flex-1 py-2 rounded-lg text-[10px] font-display font-bold tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1"
                      >
                        <Trophy className="h-3 w-3" /> {c.creatorName} WINS
                      </button>
                      <button
                        onClick={() => handleDeclareWinner(c, c.opponentUid!)}
                        className="flex-1 py-2 rounded-lg text-[10px] font-display font-bold tracking-wider bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all flex items-center justify-center gap-1"
                      >
                        <Trophy className="h-3 w-3" /> {c.opponentName} WINS
                      </button>
                    </div>
                  )}
                  {/* Non-admin sees waiting state */}
                  {!isAdmin && (c.creatorUid === user?.uid || c.opponentUid === user?.uid) && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" /> Waiting for admin to declare winner...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Results */}
        {completedChallenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-5"
          >
            <h2 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> RECENT RESULTS
            </h2>
            <div className="space-y-2">
              {completedChallenges.map((c) => {
                const creatorWon = c.winnerId === c.creatorUid;
                return (
                  <div key={c.id} className="glass p-3 flex items-center gap-3">
                    <PlayerAvatar name={creatorWon ? c.creatorName : (c.opponentName || "")} photo={creatorWon ? c.creatorPhoto : c.opponentPhoto} size="w-8 h-8" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        🏆 {creatorWon ? c.creatorName : c.opponentName} won ₹{c.betAmount * 2}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        vs {creatorWon ? c.opponentName : c.creatorName}
                      </p>
                    </div>
                    <span className="font-display text-xs font-bold text-primary">₹{c.betAmount * 2}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PvP;
