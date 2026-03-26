import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BattleCard from "@/components/BattleCard";
import LiveNotifications from "@/components/LiveNotification";
import { motion } from "framer-motion";

const battles = [
  { title: "SPEED ROUND #47", type: "4-Player" as const, entryFee: 50, prize: 180, players: 3, maxPlayers: 4, status: "live" as const, timeLeft: "2:34" },
  { title: "TRIVIA CLASH", type: "Solo" as const, entryFee: 25, prize: 100, players: 18, maxPlayers: 20, status: "live" as const, timeLeft: "5:12" },
  { title: "DEBATE ARENA", type: "Team" as const, entryFee: 100, prize: 400, players: 6, maxPlayers: 8, status: "open" as const },
  { title: "RAPID FIRE #12", type: "4-Player" as const, entryFee: 75, prize: 280, players: 2, maxPlayers: 4, status: "open" as const },
  { title: "MEGA CHALLENGE", type: "Solo" as const, entryFee: 200, prize: 1000, players: 0, maxPlayers: 50, status: "upcoming" as const, timeLeft: "Starts in 1hr" },
  { title: "1v1 SHOWDOWN", type: "Team" as const, entryFee: 150, prize: 500, players: 1, maxPlayers: 2, status: "open" as const },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LiveNotifications />
      <HeroSection />

      <section className="container mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground tracking-wider">LIVE BATTLES</h2>
              <p className="text-xs text-muted-foreground mt-1">Join a battle or watch live</p>
            </div>
            <div className="flex gap-2">
              {["All", "Live", "Open", "Upcoming"].map((filter) => (
                <button
                  key={filter}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all
                    ${filter === "All" 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "glass text-muted-foreground hover:text-foreground"}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {battles.map((battle, i) => (
              <BattleCard key={battle.title} {...battle} index={i} />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
