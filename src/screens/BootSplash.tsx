import { motion } from 'motion/react';
import { LogoMark } from '@/components/brand/logo';

/** Brand splash shown while the persisted session is restored. */
export function BootSplash() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-background">
      <div className="aurora opacity-70" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center"
      >
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="grid size-24 place-items-center rounded-[1.75rem] border border-primary/25 bg-card/70 shadow-glow"
        >
          <LogoMark className="size-14" />
        </motion.div>
        <h1 className="text-gold mt-6 text-2xl font-extrabold tracking-tight">Nix Academy</h1>
      </motion.div>
    </div>
  );
}
