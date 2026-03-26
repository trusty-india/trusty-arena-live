import { motion } from "framer-motion";
import { Zap, Shield, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-neon" />
            <span className="text-xs font-medium text-muted-foreground">12 Live Battles Right Now</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-black tracking-wider text-foreground leading-tight">
            COMPETE.{" "}
            <span className="text-primary text-glow-blue">WIN.</span>{" "}
            <span className="text-secondary text-glow-crimson">EARN.</span>
          </h1>

          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            India's most trusted live competition platform. Join real-time battles, stake your points, and win big.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/battle/live")}
              className="px-8 py-3 rounded-xl font-display text-sm font-bold tracking-wider 
                         bg-primary text-primary-foreground neon-glow-blue transition-all"
            >
              JOIN BATTLE
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/battle/live")}
              className="px-8 py-3 rounded-xl font-display text-sm font-bold tracking-wider 
                         glass border-primary/30 text-primary hover:bg-primary/10 transition-all"
            >
              WATCH LIVE
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-16"
        >
          {[
            { icon: Zap, label: "Active Players", value: "12.4K" },
            { icon: Trophy, label: "Total Prizes", value: "₹8.2L" },
            { icon: Shield, label: "Trust Score", value: "99.8%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass p-4 text-center">
              <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="font-display text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
