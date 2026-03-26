import { motion } from "framer-motion";
import { Zap, User, Wallet, Shield, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { profile, isAdmin, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong sticky top-0 z-50 px-6 py-3"
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold tracking-wider text-foreground">
            TRUSTY
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Battles
          </Link>
          <Link to="/battle/live" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Live Arena
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            PvP
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Leaderboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass flex items-center gap-2 px-3 py-1.5 rounded-full">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {profile?.balance?.toLocaleString() ?? "0"}
            </span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>

          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.displayName}
              className="w-8 h-8 rounded-full border-2 border-primary/30"
            />
          ) : (
            <div className="glass p-2 rounded-full">
              <User className="h-4 w-4 text-foreground" />
            </div>
          )}

          {isAdmin && (
            <Link to="/admin" className="glass p-2 rounded-full hover:neon-glow-crimson transition-shadow">
              <Shield className="h-4 w-4 text-secondary" />
            </Link>
          )}

          <button
            onClick={logout}
            className="glass p-2 rounded-full hover:bg-destructive/20 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
