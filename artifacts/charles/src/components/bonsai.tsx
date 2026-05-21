import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BonsaiProps {
  src: string;
  alt: string;
  className?: string;
  floating?: boolean;
}

export function Bonsai({ src, alt, className, floating = true }: BonsaiProps) {
  return (
    <motion.div
      className={cn("relative z-10 select-none pointer-events-none", className)}
      animate={
        floating
          ? {
              y: [0, -10, 0],
            }
          : {}
      }
      transition={
        floating
          ? {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {}
      }
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain drop-shadow-2xl"
        draggable={false}
      />
    </motion.div>
  );
}
