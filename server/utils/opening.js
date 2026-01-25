const {
  OPENING_PERIOD_HOURS,
  OPENING_WINDOW_MINUTES,
  OPENING_ANCHOR_OFFSET_MINUTES,
} = require("./constants");

const MS = 1000;
const MIN = 60 * MS;
const HOUR = 60 * MIN;

/**
 * The Opening is pure time math.
 *
 * Schedule:
 * - Anchor: Midnight at UTC+01:00 (fixed offset; does not shift with DST)
 * - Period: every 12 hours
 * - Window: 30 minutes
 *
 * We compute by shifting "now" into the anchor offset timeline:
 *   localMs = nowMs + offsetMs
 * so that UTC day boundaries align with the UTC+01:00 anchor.
 */
function getOpeningState(nowMs = Date.now()) {
  const offsetMs = OPENING_ANCHOR_OFFSET_MINUTES * MIN;
  const periodMs = OPENING_PERIOD_HOURS * HOUR;
  const windowMs = OPENING_WINDOW_MINUTES * MIN;

  const localMs = nowMs + offsetMs;

  // Start of the current 12-hour cycle in the anchor-aligned timeline.
  const cycleStartLocalMs = Math.floor(localMs / periodMs) * periodMs;

  // Convert cycle start back to UTC.
  const opensAtMs = cycleStartLocalMs - offsetMs;
  const closesAtMs = opensAtMs + windowMs;
  const nextOpenAtMs = opensAtMs + periodMs;

  const isOpen = nowMs >= opensAtMs && nowMs < closesAtMs;

  return {
    isOpen,
    opensAt: new Date(opensAtMs).toISOString(),
    closesAt: new Date(closesAtMs).toISOString(),
    nextOpenAt: new Date(nextOpenAtMs).toISOString(),
  };
}

module.exports = {
  getOpeningState,
};
