import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface BreathingExerciseProps {
  onClose: () => void;
}

export const BreathingExercise = ({ onClose }: BreathingExerciseProps) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-accent/90 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl w-80"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/60 hover:text-foreground hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>

        <h3 className="text-lg font-semibold text-foreground/80 mb-6 text-center">
          Breathing Exercise
        </h3>
        
        <div className="flex flex-col items-center gap-6">
          {/* Animated breathing ball with smiley face */}
          <motion.div
            className="relative flex items-center justify-center w-48 h-48"
            animate={{
              scale: isExpanding ? 1.1 : 1,
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-muted/30 rounded-[2rem]" />
            <motion.div
              className="relative w-32 h-32 rounded-full bg-muted shadow-xl flex items-center justify-center overflow-hidden"
              animate={{
                scale: isExpanding ? 1.2 : 1,
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
            >
              {/* Smiley face */}
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="flex gap-4 mb-2">
                  <div className="w-2 h-1 bg-foreground/60 rounded-full" />
                  <div className="w-2 h-1 bg-foreground/60 rounded-full" />
                </div>
                <svg width="40" height="20" viewBox="0 0 40 20" className="mt-2">
                  <path
                    d="M5 5 Q20 15 35 5"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* Breathing instruction */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isExpanding ? "inhale" : "exhale"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-base font-medium text-foreground/80"
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
              className="text-sm text-center text-foreground/70 h-10 flex items-center"
            >
              {motivationalMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
