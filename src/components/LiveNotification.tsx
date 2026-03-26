import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Notification {
  id: number;
  message: string;
  type: "vote" | "admin" | "reward";
}

const mockNotifications: Notification[] = [
  { id: 1, message: "🗳️ Rahul from Delhi Voted!", type: "vote" },
  { id: 2, message: "🎉 Admin: 500 Points added to Priya!", type: "reward" },
  { id: 3, message: "⚡ Ankit joined the battle!", type: "vote" },
  { id: 4, message: "⚠️ Admin: Warning issued to Player 3", type: "admin" },
  { id: 5, message: "🏆 Sneha won 1000 pts!", type: "reward" },
];

const typeStyles = {
  vote: "border-primary/30 bg-primary/10",
  admin: "border-secondary/30 bg-secondary/10",
  reward: "border-emerald-500/30 bg-emerald-500/10",
};

const LiveNotifications = () => {
  const [visible, setVisible] = useState<Notification[]>([]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      const notif = mockNotifications[idx % mockNotifications.length];
      const newNotif = { ...notif, id: Date.now() };
      setVisible((prev) => [newNotif, ...prev].slice(0, 3));
      idx++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 w-72">
      <AnimatePresence>
        {visible.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`glass border ${typeStyles[n.type]} px-4 py-3 rounded-xl`}
          >
            <p className="text-xs font-medium text-foreground">{n.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveNotifications;
