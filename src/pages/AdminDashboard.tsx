import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Mic, Zap, UserX, Gift, CreditCard, Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";

const livePlayers = [
  { id: 1, name: "Rahul", city: "Delhi", points: 2450, status: "live" },
  { id: 2, name: "Priya", city: "Mumbai", points: 3200, status: "live" },
  { id: 3, name: "Ankit", city: "Bangalore", points: 1800, status: "live" },
  { id: 4, name: "Sneha", city: "Jaipur", points: 2900, status: "warned" },
];

const redeemRequests = [
  { id: 1, user: "Vikram", amount: 500, upi: "vikram@upi", status: "pending" },
  { id: 2, user: "Meera", amount: 1200, upi: "meera@upi", status: "pending" },
  { id: 3, user: "Arjun", amount: 300, upi: "arjun@upi", status: "approved" },
];

const AdminDashboard = () => {
  const [isMicOn, setIsMicOn] = useState(false);

  const handleReward = (name: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"],
    });
    alert(`🎉 500 Points added to ${name}!`);
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
            <p className="text-xs text-muted-foreground">Admin Control Panel</p>
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
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="grid grid-cols-3 gap-2">
                  {["Solo", "Team", "4-Player"].map((type) => (
                    <button key={type} className="glass text-[10px] font-bold py-2 rounded-lg text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Entry Fee (pts)"
                  type="number"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="w-full py-2.5 rounded-lg font-display text-xs font-bold tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-all">
                  CREATE & SCHEDULE
                </button>
              </div>
            </motion.div>
          </div>

          {/* Middle: Live Players */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5"
          >
            <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> LIVE PLAYERS
            </h3>
            <div className="space-y-3">
              {livePlayers.map((player) => (
                <div
                  key={player.id}
                  className={`glass p-3 flex items-center justify-between ${
                    player.status === "warned" ? "border-destructive/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-primary">{player.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{player.name}</p>
                      <p className="text-[10px] text-muted-foreground">{player.city} • {player.points} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReward(player.name)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                      title="Add Points"
                    >
                      <Gift className="h-3.5 w-3.5 text-emerald-400" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all"
                      title="Warn Player"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-all"
                      title="Kick Player"
                    >
                      <UserX className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
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
