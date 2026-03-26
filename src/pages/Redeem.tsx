import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ArrowDownRight, CreditCard, Clock, CheckCircle, XCircle, IndianRupee } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createRedeemRequest, subscribeToUserRedeemRequests, RedeemRequest } from "@/lib/redeemService";
import { toast } from "sonner";

const QUICK_AMOUNTS = [100, 250, 500, 1000];

const Redeem = () => {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<RedeemRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserRedeemRequests(user.uid, setRequests);
    return unsub;
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !profile) return;
    const amt = parseInt(amount);
    if (!amt || amt < 50) {
      toast.error("Minimum withdrawal is ₹50");
      return;
    }
    if (!upiId.includes("@")) {
      toast.error("Enter a valid UPI ID (e.g., name@upi)");
      return;
    }
    if ((profile.balance ?? 0) < amt) {
      toast.error("Insufficient balance!");
      return;
    }
    setSubmitting(true);
    try {
      await createRedeemRequest(user.uid, profile.displayName, profile.photoURL, profile.email, amt, upiId);
      toast.success(`Withdrawal of ₹${amt} requested!`);
      setAmount("");
      setUpiId("");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSubmitting(false);
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-amber-400" />;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-500/20 text-amber-400",
      approved: "bg-emerald-500/20 text-emerald-400",
      rejected: "bg-destructive/20 text-destructive",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <CreditCard className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">WITHDRAW</h1>
            <p className="text-xs text-muted-foreground">Request UPI payout from your wallet</p>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-5 mb-6 text-center border border-primary/20"
        >
          <Wallet className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="font-display text-3xl font-bold text-foreground">₹{profile?.balance?.toLocaleString() ?? "0"}</p>
          <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
        </motion.div>

        {/* Withdraw Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-5 mb-6 space-y-4"
        >
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> REQUEST PAYOUT
          </h3>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(String(amt))}
                className={`px-4 py-2 rounded-lg font-display text-xs font-bold transition-all ${
                  amount === String(amt)
                    ? "bg-primary text-primary-foreground"
                    : "glass text-muted-foreground hover:text-primary"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Amount (min ₹50)..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="UPI ID (e.g., yourname@paytm)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 rounded-xl font-display text-sm font-bold tracking-wider bg-secondary text-secondary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting ? "Processing..." : `WITHDRAW${amount ? ` ₹${amount}` : ""}`}
          </motion.button>

          <p className="text-[10px] text-muted-foreground text-center">
            1 Point = ₹1 • Admin will approve your request and send payment via UPI
          </p>
        </motion.div>

        {/* Request History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-5"
        >
          <h3 className="font-display text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <ArrowDownRight className="h-4 w-4 text-secondary" /> WITHDRAWAL HISTORY
          </h3>

          {requests.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No withdrawal requests yet</p>
          ) : (
            <div className="space-y-2">
              {requests.map((req) => (
                <div key={req.id} className="glass p-3 flex items-center gap-3">
                  {statusIcon(req.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">₹{req.amount} → {req.upiId}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {req.createdAt?.toDate?.()
                        ? req.createdAt.toDate().toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge(req.status)}`}>
                    {req.status}
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

export default Redeem;
