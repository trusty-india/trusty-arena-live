import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { User, Wallet, ArrowUpRight, ArrowDownRight, Clock, Trophy, Gift, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToTransactions, Transaction } from "@/lib/battleService";
import { useState, useEffect } from "react";

const txnIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "win": return <Trophy className="h-4 w-4 text-primary" />;
    case "reward": return <Gift className="h-4 w-4 text-emerald-400" />;
    case "entry_fee": return <ArrowDownRight className="h-4 w-4 text-secondary" />;
    case "redeem": return <CreditCard className="h-4 w-4 text-amber-400" />;
  }
};

const txnColor = (type: Transaction["type"]) => {
  return type === "entry_fee" || type === "redeem" ? "text-secondary" : "text-emerald-400";
};

const Profile = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions(user.uid, setTransactions);
    return unsub;
  }, [user]);

  const totalEarned = transactions.filter((t) => t.type === "win" || t.type === "reward").reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter((t) => t.type === "entry_fee" || t.type === "redeem").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 flex items-center gap-5 mb-6"
        >
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="w-16 h-16 rounded-full border-2 border-primary/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold text-foreground tracking-wider truncate">
              {profile?.displayName || "Player"}
            </h1>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">UID: {profile?.uid?.slice(0, 12)}...</p>
          </div>
        </motion.div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Balance", value: `₹${profile?.balance?.toLocaleString() ?? "0"}`, icon: Wallet, color: "text-primary" },
            { label: "Earned", value: `₹${totalEarned.toLocaleString()}`, icon: ArrowUpRight, color: "text-emerald-400" },
            { label: "Spent", value: `₹${totalSpent.toLocaleString()}`, icon: ArrowDownRight, color: "text-secondary" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-4 text-center"
            >
              <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
              <p className="font-display text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Transaction Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-5"
        >
          <h2 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> TRANSACTION HISTORY
          </h2>

          {transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No transactions yet. Join a battle to get started!</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 glass p-3 rounded-lg">
                  <div className="glass p-2 rounded-full">{txnIcon(txn.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{txn.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {txn.createdAt?.toDate?.()
                        ? txn.createdAt.toDate().toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className={`font-display text-sm font-bold ${txnColor(txn.type)}`}>
                    {txn.type === "entry_fee" || txn.type === "redeem" ? "-" : "+"}₹{Math.abs(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
