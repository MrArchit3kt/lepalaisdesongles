export type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function detectIsIos(): boolean {
  const userAgent = window.navigator.userAgent;

  const isAppleMobile = /iPad|iPhone|iPod/.test(userAgent);

  const isIpadDesktopMode =
    userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1;

  return isAppleMobile || isIpadDesktopMode;
}

export function detectIsStandalone(): boolean {
  const matchesDisplayMode = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;

  const iosStandalone =
    (window.navigator as { standalone?: boolean }).standalone === true;

  return matchesDisplayMode || iosStandalone;
}
