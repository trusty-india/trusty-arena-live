import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useState } from "react";

const PTTButton = () => {
  const [isHolding, setIsHolding] = useState(false);

  return (
    <motion.button
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      animate={isHolding ? { scale: 1.2 } : { scale: 1 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full 
                  flex items-center justify-center transition-all duration-200
                  ${isHolding
                    ? "bg-secondary neon-glow-crimson"
                    : "glass border-primary/30 hover:neon-glow-blue"
                  }`}
    >
      <Mic className={`h-6 w-6 ${isHolding ? "text-secondary-foreground" : "text-primary"}`} />
      {isHolding && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-10 glass px-3 py-1 rounded-full"
        >
          <span className="text-[10px] font-bold text-secondary">Recording... 10s</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export default PTTButton;
