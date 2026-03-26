import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BattleCard from "@/components/BattleCard";
import LiveNotifications from "@/components/LiveNotification";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { subscribeToBattles, Battle } from "@/lib/battleService";
import { useAuth } from "@/contexts/AuthContext";
import { Flame } from "lucide-react";

type Filter = "All" | "Live" | "Open" | "Upcoming";

const Index = () => {
  const { profile } = useAuth();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  // Real-time listener — shows ALL battles from Firestore
  useEffect(() => {
    const unsub = subscribeToBattles((all) => {
      // Show open, live, and upcoming — exclude only "finished"
      const visible = all.filter((b) => b.status !== "finished");
      // Special challenges float to top
      visible.sort((a, b) => {
        if (a.isSpecial && !b.isSpecial) return -1;
        if (!a.isSpecial && b.isSpecial) return 1;
        if (a.status === "live" && b.status !== "live") return -1;
        if (a.status !== "live" && b.status === "live") return 1;
        return 0;
      });
      setBattles(visible);
    });
    return unsub;
  }, []);

  const filtered = battles.filter((b) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Live") return b.status === "live";
    if (activeFilter === "Open") return b.status === "open";
    if (activeFilter === "Upcoming") return b.status === "upcoming";
    return true;
  });

  // Check which battles this user has already joined
  const joinedIds = new Set(
    battles.filter((b) => profile?.uid && b.players?.[profile.uid]).map((b) => b.id)
  );

  const filterCounts: Record<Filter, number> = {
    All: battles.length,
    Live: battles.filter((b) => b.status === "live").length,
    Open: battles.filter((b) => b.status === "open").length,
    Upcoming: battles.filter((b) => b.status === "upcoming").length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <LiveNotifications />
      <HeroSection />

      <section className="container mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Section header + filters */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground tracking-wider flex items-center gap-2">
                LIVE BATTLES
                {battles.some((b) => b.isSpecial) && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Flame className="h-4 w-4" /> Special Events Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {filtered.length} battle{filtered.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(["All", "Live", "Open", "Upcoming"] as Filter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all
                    ${activeFilter === filter
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "glass text-muted-foreground hover:text-foreground"}`}
                >
                  {filter}
                  {filterCounts[filter] > 0 && (
                    <span className="ml-1 opacity-60">({filterCounts[filter]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Battle grid */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center text-3xl">
                ⚔️
              </div>
              <p className="font-display text-lg font-bold text-muted-foreground">
                {activeFilter === "All" ? "No battles yet" : `No ${activeFilter.toLowerCase()} battles`}
              </p>
              <p className="text-xs text-muted-foreground/60">
                The admin will create new battles soon. Check back shortly!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((battle, i) => (
                <BattleCard
                  key={battle.id}
                  id={battle.id}
                  title={battle.title}
                  type={battle.type}
                  entryFee={battle.entryFee}
                  prize={battle.prize}
                  playerCount={Object.keys(battle.players ?? {}).length}
                  maxPlayers={battle.maxPlayers}
                  status={battle.status}
                  index={i}
                  isSpecial={battle.isSpecial}
                  isJoined={joinedIds.has(battle.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
