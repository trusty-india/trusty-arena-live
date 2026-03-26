import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Mic, Zap, UserX, Gift, CreditCard, Plus, AlertTriangle, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { addPointsToUser, declareWinner, createBattle, subscribeToBattles, Battle } from "@/lib/battleService";

interface RedeemRequest {
  id: string;
  user: string;
  amount: number;
  upi: string;
  status: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [isMicOn, setIsMicOn] = useState(false);
  const [liveBattles, setLiveBattles] = useState<Battle[]>([]);
  const [redeemRequests] = useState<RedeemRequest[]>([
    { id: "1", user: "Vikram", amount: 500, upi: "vikram@upi", status: "pending" },
    { id: "2", user: "Meera", amount: 1200, upi: "meera@upi", status: "pending" },
    { id: "3", user: "Arjun", amount: 300, upi: "arjun@upi", status: "approved" },
  ]);

  // Task creation state
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<"Solo" | "Team" | "4-Player">("Solo");
  const [entryFee, setEntryFee] = useState("");

  useEffect(() => {
    const unsub = subscribeToBattles((battles) => {
      setLiveBattles(battles.filter((b) => b.status === "live" || b.status === "open"));
    });
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
    alert(`🎉 500 Points added to ${name}!`);
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
    alert("✅ Battle created!");
  };

  const handleDeclareWinner = async (battleId: string, winnerUid: string, prize: number) => {
    await declareWinner(battleId, winnerUid, prize);
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Shield className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">GOD MODE</h1>
            <p className="text-xs text-muted-foreground">Admin Control Panel • {profile?.email}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Task Controller & Mic */}
          <div className="lg:col-span-1 space-y-4">
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
                {isMicOn ? "🎙️ LIVE — Speaking to All" : "TAP TO GO LIVE"}
              </motion.button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="glass text-[10px] font-bold py-2 rounded-lg text-secondary hover:bg-secondary/10 transition-all">
                  ⚠️ Send Warning
                </button>
                <button className="glass text-[10px] font-bold py-2 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-all">
                  🎉 Congratulate
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
          </div>

          {/* Middle: Live Battles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> LIVE BATTLES ({liveBattles.length})
            </h3>
            <div className="space-y-3">
              {liveBattles.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No live battles. Create one!</p>
              )}
              {liveBattles.map((battle) => (
                <div key={battle.id} className="glass p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{battle.title}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase">{battle.status}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {battle.type} • {Object.keys(battle.players).length}/{battle.maxPlayers} players • Prize: {battle.prize} pts
                  </p>
                  {Object.entries(battle.players).map(([uid, player]) => (
                    <div key={uid} className="flex items-center justify-between py-1">
                      <span className="text-xs text-foreground">{player.name} ({player.votes} votes)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReward(uid, player.name)}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                          title="Add 500 pts"
                        >
                          <Gift className="h-3 w-3 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => handleDeclareWinner(battle.id, uid, battle.prize)}
                          className="p-1 rounded bg-primary/10 hover:bg-primary/20"
                          title="Declare Winner"
                        >
                          <Trophy className="h-3 w-3 text-primary" />
                        </button>
                        <button className="p-1 rounded bg-destructive/10 hover:bg-destructive/20" title="Kick">
                          <UserX className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Redeem Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-secondary" /> REDEEM REQUESTS
            </h3>
            <div className="space-y-3">
              {redeemRequests.map((req) => (
                <div key={req.id} className="glass p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-foreground">{req.user}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      req.status === "pending"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">₹{req.amount} → {req.upi}</p>
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all">
                        APPROVE
                      </button>
                      <button className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all">
                        REJECT
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
