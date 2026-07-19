import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { blockClipPath } from "./shape";

interface BlockProps {
  width: number;
  height: number;
  degreeIn?: number;
  degreeOut?: number;
  background: string;
  children: ReactNode;
  className?: string;
}

export function Block({ width, height, degreeIn = 0, degreeOut = 0, background, children, className }: BlockProps) {
  return (
    <motion.div
      layout
      className={`fb-block ${className ?? ""}`}
      style={{
        width,
        height,
        background,
        clipPath: blockClipPath(width, height, degreeIn, degreeOut),
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <div className="fb-block-inner">{children}</div>
    </motion.div>
  );
}
