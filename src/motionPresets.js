export const revealViewport = { once: false, amount: 0.18 };

const transition = (delay = 0) => ({
  duration: 0.48,
  delay,
  ease: [0.22, 1, 0.36, 1],
});

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: transition(delay) }),
};

export const fadeLeft = {
  hidden: { opacity: 0, x: -26 },
  visible: { opacity: 1, x: 0, transition: transition() },
};

export const fadeRight = {
  hidden: { opacity: 0, x: 26 },
  visible: { opacity: 1, x: 0, transition: transition() },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transition() },
};
