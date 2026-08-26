import { createContext, useContext } from "react";

/**
 * Orientation hooks used by the table layout.
 *
 * The table is never physically rotated — the felt adapts natively to whatever
 * way the phone is held. These contexts live in their own module (rather than
 * in LandscapeShell) so Fast Refresh keeps working: files that also export
 * components should not export hooks or other non-component values.
 */

/** True when the viewport is held in portrait orientation (taller than wide). */
const PortraitCtx = createContext(false);

/**
 * True when the table itself is rotated 90° — always false in the new design.
 * Kept for compatibility with drag math that used to compensate for rotation.
 */
const RotatedCtx = createContext(false);

/** True when the table itself is rotated 90° — always false in the new design. */
export const useTableRotated = () => useContext(RotatedCtx);

/** True when the phone is upright; children use it to shrink the table layout. */
export const useIsPortrait = () => useContext(PortraitCtx);

export { PortraitCtx, RotatedCtx };