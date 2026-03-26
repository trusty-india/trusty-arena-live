import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Shield, Mic, Zap, UserX, Gift, CreditCard, Plus,
  Trophy, Users, Flame, Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPointsToUser, declareWinner, createBattle, subscribeToBattles, Battle,
  subscribeToAllUsers, declareWinnerByUid, UserProfile,
} from "@/lib/battleService";
import { subscribeToAllRedeemRequests, approveRedeemRequest, rejectRedeemRequest, RedeemRequest } from "@/lib/redeemService";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [isMicOn, setIsMicOn] = useState(false);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [redeemRequests, setRedeemRequests] = useState<RedeemRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [declaringWinner, setDeclaringWinner] = useState<string | null>(null);

  // Create task form
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<"Solo" | "Team" | "4-Player">("Solo");
  const [entryFee, setEntryFee] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBattles((b) => setBattles(b.filter((x) => x.status !== "finished")));
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

  /* ── Handlers ── */

  const handleReward = async (uid: string, name: string) => {
    await addPointsToUser(uid, 500);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success(`🎉 500 pts added to ${name}!`);
  };

  const handleCreateBattle = async () => {
    if (!taskName || !entryFee) { toast.error("Fill in task name and entry fee"); return; }
    const fee = parseInt(entryFee);
    setCreating(true);
    try {
      await createBattle({
        title: taskName.toUpperCase(),
        type: taskType,
        entryFee: fee,
        prize: fee * 4,
        players: {},
        maxPlayers: taskType === "Solo" ? 20 : taskType === "Team" ? 8 : 4,
        status: "open",
        isSpecial,
      });
      setTaskName(""); setEntryFee(""); setIsSpecial(false);
      toast.success(`✅ "${taskName.toUpperCase()}" created!`);
    } catch { toast.error("Failed to create battle"); }
    finally { setCreating(false); }
  };

  const handleDeclareWinnerInBattle = async (battleId: string, winnerUid: string, prize: number, name: string) => {
    setDeclaringWinner(`${battleId}-${winnerUid}`);
    try {
      await declareWinner(battleId, winnerUid, prize);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      toast.success(`🏆 ${name} wins! +${prize} pts`);
    } catch { toast.error("Failed to declare winner"); }
    finally { setDeclaringWinner(null); }
  };

  const handleDeclareWinnerByUid = async (uid: string, name: string) => {
    setDeclaringWinner(uid);
    try {
      await declareWinnerByUid(uid);
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.4 }, colors: ["#3B82F6", "#F59E0B", "#10B981"] });
      toast.success(`🏆 ${name} declared winner! +100 pts`);
    } catch { toast.error("Failed to declare winner"); }
    finally { setDeclaringWinner(null); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">GOD MODE</h1>
            <p className="text-xs text-muted-foreground">Admin Control Panel • {profile?.email}</p>
          </div>
        </motion.div>

        {/* ── Row 1: Mic + Create Task + Redeem ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Master Mic */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Mic className="h-4 w-4 text-secondary" /> MASTER MIC
            </h3>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-full py-4 rounded-xl font-display text-sm font-bold tracking-wider transition-all ${
                isMicOn ? "bg-secondary text-secondary-foreground neon-glow-crimson" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {isMicOn ? "🎙️ LIVE — Speaking to All" : "TAP TO GO LIVE"}
            </motion.button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="glass text-[10px] font-bold py-2 rounded-lg text-secondary hover:bg-secondary/10 transition-all">⚠️ Send Warning</button>
              <button className="glass text-[10px] font-bold py-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">🎉 Congratulate</button>
            </div>
          </motion.div>

          {/* Create Task */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> CREATE GAME TASK
            </h3>
            <div className="space-y-3">
              <input
                placeholder="Game name (e.g. Ludo, Dance, Race)"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-3 gap-2">
                {(["Solo", "Team", "4-Player"] as const).map((t) => (
                  <button key={t} onClick={() => setTaskType(t)}
                    className={`glass text-[10px] font-bold py-2 rounded-lg transition-all ${taskType === t ? "text-primary bg-primary/10 border border-primary/30" : "text-muted-foreground hover:text-primary"}`}>
                    {t}
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

              {/* ── Special Challenge Toggle ── */}
              <button
                type="button"
                onClick={() => setIsSpecial((v) => !v)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                  isSpecial
                    ? "bg-amber-400/15 border-amber-400/50 text-amber-400"
                    : "glass border-border text-muted-foreground hover:border-amber-400/30 hover:text-amber-400/70"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Flame className="h-3.5 w-3.5" /> Mark as Special Challenge
                </span>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${isSpecial ? "bg-amber-400" : "bg-muted"}`}>
                  <motion.div
                    animate={{ x: isSpecial ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                  />
                </div>
              </button>

              <button
                onClick={handleCreateBattle}
                disabled={creating}
                className={`w-full py-2.5 rounded-lg font-display text-xs font-bold tracking-wider transition-all disabled:opacity-60
                  ${isSpecial ? "bg-amber-400 text-black hover:bg-amber-300" : "bg-primary text-primary-foreground hover:opacity-90"}`}
              >
                {creating ? "Creating..." : isSpecial ? "🔥 CREATE MEGA CHALLENGE" : "CREATE & SCHEDULE"}
              </button>
            </div>
          </motion.div>

          {/* Redeem Requests */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" /> REDEEM REQUESTS
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {redeemRequests.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No redeem requests.</p>}
              {redeemRequests.map((req) => (
                <div key={req.id} className="glass p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {req.photoURL && <img src={req.photoURL} alt="" className="w-6 h-6 rounded-full" />}
                      <p className="text-sm font-bold text-foreground">{req.displayName}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${req.status === "pending" ? "bg-amber-500/20 text-amber-400" : req.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">₹{req.amount} → {req.upiId}</p>
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => { await approveRedeemRequest(req.id); toast.success(`Approved ₹${req.amount}`); }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">APPROVE</button>
                      <button onClick={async () => { await rejectRedeemRequest(req.id); toast.info("Rejected"); }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all">REJECT</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Arena Cards: one card per battle ── */}
        {battles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display text-lg font-bold text-foreground tracking-wider mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> ACTIVE ARENAS ({battles.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {battles.map((battle) => {
                const playerList = Object.entries(battle.players ?? {});
                return (
                  <motion.div
                    key={battle.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-xl p-5 space-y-4 ${
                      battle.isSpecial
                        ? "border-2 border-amber-400/50 shadow-[0_0_20px_2px_rgba(251,191,36,0.2)] bg-black/60"
                        : "glass"
                    }`}
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {battle.isSpecial && <Flame className="h-4 w-4 text-amber-400" />}
                        <h3 className={`font-display text-base font-bold tracking-wide ${battle.isSpecial ? "text-amber-300" : "text-foreground"}`}>
                          {battle.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {battle.isSpecial && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                            🔥 Special
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          battle.status === "live" ? "bg-secondary/20 text-secondary" :
                          battle.status === "open" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-primary/20 text-primary"
                        }`}>
                          {battle.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      {battle.type} • Entry: {battle.entryFee} pts • Prize: {battle.prize} pts • {playerList.length}/{battle.maxPlayers} players
                    </p>

                    {/* Players table */}
                    {playerList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-3">No players joined yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {playerList.map(([uid, player]) => {
                          const key = `${battle.id}-${uid}`;
                          const isWinner = battle.winnerId === uid;
                          return (
                            <div key={uid} className="flex items-center justify-between glass px-3 py-2 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">
                                  {player.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-foreground">{player.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{player.city} • {player.votes} votes</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isWinner && (
                                  <span className="text-[10px] font-bold text-amber-400">🏆 Winner</span>
                                )}
                                {!isWinner && !battle.winnerId && (
                                  <>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleReward(uid, player.name)}
                                      title="Add 500 pts"
                                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                                    >
                                      <Gift className="h-3.5 w-3.5 text-emerald-400" />
                                    </motion.button>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      disabled={declaringWinner === key}
                                      onClick={() => handleDeclareWinnerInBattle(battle.id, uid, battle.prize, player.name)}
                                      data-testid={`button-arena-winner-${uid}`}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider
                                                 bg-primary/10 border border-primary/20 text-primary
                                                 hover:bg-primary hover:text-primary-foreground transition-all
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Trophy className="h-3 w-3" />
                                      {declaringWinner === key ? "..." : "DECLARE WINNER"}
                                    </motion.button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── All Users Table ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5">
          <h3 className="font-display text-sm font-bold text-foreground mb-5 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> ALL USERS ({allUsers.length})
          </h3>
          {allUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No users found in Firestore.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">User</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Balance</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.uid} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {u.photoURL
                            ? <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full border border-border" />
                            : <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{u.displayName?.charAt(0)?.toUpperCase() || "?"}</div>
                          }
                          <span className="font-medium text-foreground">{u.displayName || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-3 text-right font-display font-bold text-primary">{(u.balance ?? 0).toLocaleString()} pts</td>
                      <td className="py-3 px-3 text-center">
                        {u.battleStatus === "winner"
                          ? <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">🏆 Winner</span>
                          : <span className="bg-muted/40 text-muted-foreground text-[10px] px-2 py-0.5 rounded-full">—</span>
                        }
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleReward(u.uid, u.displayName || u.email)} title="Add 500 pts"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">
                            <Gift className="h-3.5 w-3.5 text-emerald-400" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeclareWinnerByUid(u.uid, u.displayName || u.email)}
                            disabled={declaringWinner === u.uid}
                            title="Declare Winner (+100 pts)"
                            data-testid={`button-declare-winner-${u.uid}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-[10px] font-bold
                                       bg-primary/10 border border-primary/20 text-primary
                                       hover:bg-primary hover:text-primary-foreground transition-all
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trophy className="h-3 w-3" />
                            {declaringWinner === u.uid ? "..." : "Declare Winner"}
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

      </div>
    </div>
  );
};

export default AdminDashboard;
