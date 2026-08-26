const SEEN_KEY = "flintyo.tutorial.seen";

/** Whether the player has already gone through the tutorial. */
export const tutorialSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

/** Mark the tutorial as seen so it only appears for a brand-new player. */
export const markTutorialSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
};