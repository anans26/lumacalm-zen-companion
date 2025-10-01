import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const motivationalMessages = [
  "You're doing great! 🌸",
  "Breathe in peace, breathe out stress 🌊",
  "You are worthy of calm 💜",
  "Take your time, you're safe here 🦋",
  "One breath at a time 🌟",
  "You've got this 💙",
  "Healing takes time, be patient 🌺",
  "You are stronger than you know 🌈"
];

export const BreathingExercise = () => {
  const [isExpanding, setIsExpanding] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Change breathing state every 4 seconds (2s in, 2s out)
    const breathingInterval = setInterval(() => {
      setIsExpanding((prev) => !prev);
    }, 4000);

    // Change motivational message every 8 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 8000);

    return () => {
      clearInterval(breathingInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] rounded-3xl p-6 shadow-xl backdrop-blur-sm border border-white/20 w-72">
        <h3 className="text-sm font-semibold text-foreground/80 mb-4 text-center">
          Breathing Exercise
        </h3>
        
        <div className="flex flex-col items-center gap-4">
          {/* Animated breathing ball */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{
              scale: isExpanding ? 1.3 : 1,
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
            }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg flex items-center justify-center">
              <span className="text-3xl">😌</span>
            </div>
          </motion.div>

          {/* Breathing instruction */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isExpanding ? "inhale" : "exhale"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium text-foreground/70"
            >
              {isExpanding ? "Breathe in..." : "Breathe out..."}
            </motion.p>
          </AnimatePresence>

          {/* Motivational message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-xs text-center text-foreground/60 h-8 flex items-center"
            >
              {motivationalMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
