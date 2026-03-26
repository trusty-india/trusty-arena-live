import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Shield,
  Mic,
  Zap,
  UserX,
  Gift,
  CreditCard,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPointsToUser,
  declareWinner,
  createBattle,
  subscribeToBattles,
  Battle,
  subscribeToAllUsers,
  declareWinnerByUid,
  UserProfile,
} from "@/lib/battleService";
import {
  subscribeToAllRedeemRequests,
  approveRedeemRequest,
  rejectRedeemRequest,
  RedeemRequest,
} from "@/lib/redeemService";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [isMicOn, setIsMicOn] = useState(false);
  const [liveBattles, setLiveBattles] = useState<Battle[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<RedeemRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [declaringWinner, setDeclaringWinner] = useState<string | null>(null);

  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<"Solo" | "Team" | "4-Player">(
    "Solo",
  );
  const [entryFee, setEntryFee] = useState("");

  useEffect(() => {
    const unsub = subscribeToBattles((battles) => {
      setLiveBattles(
        battles.filter((b) => b.status === "live" || b.status === "open"),
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToAllRedeemRequests(setRedeemRequests);
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToAllUsers(setAllUsers);
    return unsub;
  }, []);

  const handleReward = async (uid: string, name: string) => {
    await addPointsToUser(uid, 500);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"],
    });
    toast.success(`?? 500 pts added to ${name}!`);
  };

  const handleCreateBattle = async () => {
    if (!taskName || !entryFee) return;
    const fee = parseInt(entryFee);
    await createBattle({
      title: taskName.toUpperCase(),
      type: taskType,
      entryFee: fee,
      prize: fee * 4,
      players: {},
      maxPlayers: taskType === "Solo" ? 20 : taskType === "Team" ? 8 : 4,
      status: "open",
    });
    setTaskName("");
    setEntryFee("");
    toast.success("? Battle created!");
  };

  const handleDeclareWinnerFromBattle = async (
    battleId: string,
    winnerUid: string,
    prize: number,
  ) => {
    try {
      // Fixed: Removed the 4th argument (battle.title) as declareWinner only takes 3
      await declareWinner(battleId, winnerUid, prize);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      toast.success("Winner declared successfully!");
    } catch (error) {
      toast.error("Error declaring winner");
    }
  };

  const handleDeclareWinnerByUid = async (uid: string, name: string) => {
    setDeclaringWinner(uid);
    try {
      await declareWinnerByUid(uid);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.4 },
        colors: ["#3B82F6", "#F59E0B", "#10B981"],
      });
      toast.success(`?? ${name} declared winner! +100 pts`);
    } catch {
      toast.error("Failed to declare winner");
    } finally {
      setDeclaringWinner(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Shield className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">
              GOD MODE
            </h1>
            <p className="text-xs text-muted-foreground">
              Admin Control Panel • {profile?.email}
            </p>
          </div>
        </motion.div>

        {/* -- Top row: controls -- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Master Mic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Mic className="h-4 w-4 text-secondary" /> MASTER MIC
            </h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-full py-4 rounded-xl font-display text-sm font-bold tracking-wider transition-all ${
                isMicOn
                  ? "bg-secondary text-secondary-foreground neon-glow-crimson"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {isMicOn ? "??? LIVE — Speaking to All" : "TAP TO GO LIVE"}
            </motion.button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="glass text-[10px] font-bold py-2 rounded-lg text-secondary hover:bg-secondary/10 transition-all">
                ?? Send Warning
              </button>
              <button className="glass text-[10px] font-bold py-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">
                ?? Congratulate
              </button>
            </div>
          </motion.div>

          {/* Create Task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> CREATE TASK
            </h3>
            <div className="space-y-3">
              <input
                placeholder="Task name..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-3 gap-2">
                {(["Solo", "Team", "4-Player"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTaskType(type)}
                    className={`glass text-[10px] font-bold py-2 rounded-lg transition-all ${
                      taskType === type
                        ? "text-primary border-primary/30 bg-primary/10"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <input
                placeholder="Entry Fee (pts)"
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleCreateBattle}
                className="w-full py-2.5 rounded-lg font-display text-xs font-bold tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                CREATE & SCHEDULE
              </button>
            </div>
          </motion.div>

          {/* Redeem Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" /> REDEEM REQUESTS
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {redeemRequests.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No redeem requests.
                </p>
              )}
              {redeemRequests.map((req) => (
                <div key={req.id} className="glass p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {req.photoURL && (
                        <img
                          src={req.photoURL}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <p className="text-sm font-bold text-foreground">
                        {req.displayName}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        req.status === "pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : req.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ?{req.amount} ? {req.upiId}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {req.email}
                  </p>
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          await approveRedeemRequest(req.id);
                          toast.success(`?${req.amount} approved`);
                        }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={async () => {
                          await rejectRedeemRequest(req.id);
                          toast.info("Rejected & refunded");
                        }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all"
                      >
                        REJECT
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* -- Users Table -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5"
        >
          <h3 className="font-display text-sm font-bold text-foreground mb-5 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> ALL USERS (
            {allUsers.length})
          </h3>

          {allUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No users found in Firestore.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                      User
                    </th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                      Email
                    </th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                      Balance
                    </th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">
                      Status
                    </th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr
                      key={u.uid}
                      className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              className="w-7 h-7 rounded-full border border-border"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                              {u.displayName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="font-medium text-foreground">
                            {u.displayName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 text-right font-display font-bold text-primary">
                        {(u.balance ?? 0).toLocaleString()} pts
                      </td>
                      <td className="py-3 px-3 text-center">
                        {u.battleStatus === "winner" ? (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                            ?? Winner
                          </span>
                        ) : (
                          <span className="bg-muted/40 text-muted-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleReward(u.uid, u.displayName || u.email)
                            }
                            title="Add 500 pts"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                          >
                            <Gift className="h-3.5 w-3.5 text-emerald-400" />
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleDeclareWinnerByUid(
                                u.uid,
                                u.displayName || u.email,
                              )
                            }
                            disabled={declaringWinner === u.uid}
                            title="Declare Winner (+100 pts)"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] font-bold tracking-wider
                                       bg-primary/10 border border-primary/20 text-primary
                                       hover:bg-primary hover:text-primary-foreground transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trophy className="h-3 w-3" />
                            {declaringWinner === u.uid
                              ? "..."
                              : "Declare Winner"}
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* -- Active Arenas Master Control -- */}
        {liveBattles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-5 border-t-2 border-primary/20"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary animate-pulse" />
              ACTIVE ARENAS ({liveBattles.length})
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {liveBattles.map((battle) => (
                <div
                  key={battle.id}
                  className="bg-black/20 rounded-xl p-4 border border-white/5 shadow-inner"
                >
                  <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                    <div>
                      <p className="text-sm font-black text-primary uppercase tracking-wider">
                        {battle.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic">
                        {battle.type} • Prize:{" "}
                        <span className="text-secondary font-bold">
                          {battle.prize} pts
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold border border-secondary/20">
                      {battle.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(battle.players || {}).map(
                      ([uid, player]) => (
                        <div
                          key={uid}
                          className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold">
                                {(player.name || "P").charAt(0)}
                              </div>
                              <div className="absolute -top-1 -right-1 bg-red-500 text-[8px] px-1 rounded-full text-white font-black">
                                {player.votes || 0}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground leading-none">
                                {player.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {player.city || "Global Player"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReward(uid, player.name)}
                              className="p-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors"
                              title="Give Bonus"
                            >
                              <Gift className="h-3.5 w-3.5 text-emerald-400" />
                            </button>

                            <button
                              onClick={() =>
                                handleDeclareWinnerFromBattle(
                                  battle.id,
                                  uid,
                                  battle.prize,
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/80 text-black text-[10px] font-black transition-transform active:scale-95"
                            >
                              <Trophy className="h-3 w-3" /> WINNER
                            </button>
                          </div>
                        </div>
                      ),
                    )}

                    {Object.keys(battle.players || {}).length === 0 && (
                      <p className="text-[10px] text-center text-muted-foreground py-2 italic">
                        No warriors joined this battle yet...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
