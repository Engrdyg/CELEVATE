/** Shared motion tokens (mirrors CSS custom properties in globals.css). */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.15,
  base: 0.22,
  slow: 0.4,
  reveal: 0.7,
};

export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as const,
  soft: { type: "spring", stiffness: 260, damping: 30 } as const,
};
