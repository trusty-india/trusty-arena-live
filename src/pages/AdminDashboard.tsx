import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Mic,
  Zap,
  Gift,
  CreditCard,
  Plus,
  Trophy,
  Users,
  Gamepad2,
  LayoutGrid,
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success(`🎉 500 pts added to ${name}!`);
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
    toast.success(`✅ ${taskName} Table Created!`);
  };

  const handleDeclareWinnerFromBattle = async (
    battleId: string,
    winnerUid: string,
    prize: number,
  ) => {
    try {
      await declareWinner(battleId, winnerUid, prize);
      confetti({ particleCount: 300, spread: 150, origin: { y: 0.5 } });
      toast.success("🏆 Winner Declared Successfully!");
    } catch (error) {
      toast.error("Error declaring winner");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <Navbar />

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-2xl border border-secondary/20">
              <Shield className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-foreground tracking-tighter italic uppercase">
                GOD MODE
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                Super Admin Control Panel
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMicOn(!isMicOn)}
            className={`px-6 py-3 rounded-full font-display text-xs font-black flex items-center gap-2 transition-all ${
              isMicOn
                ? "bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-white/5 text-muted-foreground border border-white/10"
            }`}
          >
            <Mic className="h-4 w-4" />{" "}
            {isMicOn ? "🎙️ LIVE MIC: ON" : "ACTIVATE MIC"}
          </motion.button>
        </div>

        {/* ── SECTION 1: CREATE GAME (Input) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-6 border-l-4 border-primary">
            <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> OPEN NEW GAME TABLE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" className="bg-black">
                  Choose Game Category...
                </option>
                <option value="LUDO KING" className="bg-black">
                  LUDO KING
                </option>
                <option value="BIKE RACE" className="bg-black">
                  BIKE RACE
                </option>
                <option value="CAR RACE" className="bg-black">
                  CAR RACE
                </option>
                <option value="CARD GAME" className="bg-black">
                  CARD GAME
                </option>
                <option value="DANCE BATTLE" className="bg-black">
                  DANCE BATTLE
                </option>
              </select>

              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                {["Solo", "Team"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTaskType(t as any)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${taskType === t ? "bg-primary text-black" : "text-muted-foreground"}`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  placeholder="Entry Fee"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={handleCreateBattle}
                  className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-black rounded-lg text-[10px] font-black"
                >
                  CREATE
                </button>
              </div>
            </div>
          </div>

          <div className="glass p-6 border-l-4 border-secondary">
            <h3 className="text-sm font-black text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" /> PENDING REDEEMS
            </h3>
            <p className="text-2xl font-black text-secondary">
              {redeemRequests.length}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
              Withdrawal Requests Waiting
            </p>
          </div>
        </div>

        {/* ── SECTION 2: CATEGORIZED GAME TABLES (The Main Fix) ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-l-4 border-secondary pl-4">
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
              Live Game Arenas
            </h2>
            <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-bold rounded">
              REAL-TIME
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {liveBattles.length === 0 ? (
              <div className="col-span-full py-20 glass text-center border-dashed border-2 border-white/5">
                <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground italic">
                  No active tables. Create one above to start!
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {liveBattles.map((battle) => (
                  <motion.div
                    key={battle.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-3xl overflow-hidden border border-white/10"
                  >
                    {/* Table Header: Category Name */}
                    <div className="bg-gradient-to-r from-secondary/20 to-transparent p-5 flex justify-between items-center border-b border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-secondary" />
                          <h3 className="text-xl font-black text-white italic">
                            {battle.title}
                          </h3>
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                          ID: {battle.id.slice(-6)} • {battle.type} Arena
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground font-black uppercase">
                          Winner Prize
                        </p>
                        <p className="text-2xl font-black text-primary leading-none">
                          {battle.prize} PTS
                        </p>
                      </div>
                    </div>

                    {/* Table Content: Players in this specific game */}
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] text-muted-foreground uppercase tracking-tighter border-b border-white/5">
                            <th className="pb-3 font-black">Participant</th>
                            <th className="pb-3 font-black text-center">
                              Votes
                            </th>
                            <th className="pb-3 font-black text-right">
                              Declare Results
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(battle.players || {}).map(
                            ([uid, player]) => (
                              <tr
                                key={uid}
                                className="group hover:bg-white/[0.02] transition-colors border-b border-white/5"
                              >
                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-primary p-[1px]">
                                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-xs text-white uppercase">
                                        {player.name?.charAt(0)}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm text-white leading-none mb-1">
                                        {player.name}
                                      </p>
                                      <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                                        UID: {uid.slice(0, 8)}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 text-center">
                                  <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-black text-secondary border border-white/10">
                                    {player.votes || 0}
                                  </span>
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() =>
                                        handleReward(uid, player.name || "")
                                      }
                                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                      <Gift className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeclareWinnerFromBattle(
                                          battle.id,
                                          uid,
                                          battle.prize,
                                        )
                                      }
                                      className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-black text-[11px] shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all"
                                    >
                                      <Trophy className="h-3.5 w-3.5" /> WINNER
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>

                      {Object.keys(battle.players || {}).length === 0 && (
                        <div className="py-12 text-center">
                          <p className="text-xs text-muted-foreground italic opacity-50">
                            This {battle.title} table is empty. Waiting for
                            warriors...
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── SECTION 3: ALL USERS QUICK LIST ── */}
        <div className="glass p-6 opacity-60 hover:opacity-100 transition-opacity">
          <h3 className="text-sm font-black text-foreground mb-6 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> USER DIRECTORY (
            {allUsers.length})
          </h3>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-white/5 uppercase font-bold text-[9px]">
                  <th className="pb-4 text-left">User Profile</th>
                  <th className="pb-4 text-right">Points Balance</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr
                    key={u.uid}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[8px] font-black">
                        {u.displayName?.charAt(0)}
                      </div>
                      <span>{u.displayName || u.email}</span>
                    </td>
                    <td className="py-3 text-right font-black text-primary">
                      {(u.balance || 0).toLocaleString()} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
