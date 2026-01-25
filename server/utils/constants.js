module.exports = {
  STORY_WINDOW_SIZE: 10000,
  TOKEN_MAX: 48,
  EVENT_MAX: 200,

  // The Opening (server-authoritative, fixed schedule)
  // Anchor: Midnight UTC+01:00, repeats every 12 hours.
  // Window: 30 minutes.
  OPENING_PERIOD_HOURS: 12,
  OPENING_WINDOW_MINUTES: 30,
  OPENING_ANCHOR_OFFSET_MINUTES: 60, // UTC+01:00 fixed offset (no DST)
};
