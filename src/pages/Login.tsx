import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Shield, Trophy } from "lucide-react";

const Login = () => {
  const { user, loading, loginWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-strong w-full max-w-sm p-8 text-center space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-10 w-10 text-primary" />
            <span className="font-display text-3xl font-black tracking-wider text-foreground">TRUSTY</span>
          </div>
          <p className="text-sm text-muted-foreground">India's Most Trusted Live Competition Platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Zap, val: "12.4K", label: "Players" },
            { icon: Trophy, val: "₹8.2L", label: "Prizes" },
            { icon: Shield, val: "99.8%", label: "Trust" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="glass p-2.5 rounded-lg">
              <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-display font-bold text-foreground">{val}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Google Login */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={loginWithGoogle}
          className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wider
                     bg-foreground text-background hover:opacity-90 transition-all
                     flex items-center justify-center gap-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </motion.button>

        <p className="text-[10px] text-muted-foreground">
          By signing in, you agree to our Terms of Service & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
