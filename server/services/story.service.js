const { Op } = require("sequelize");
const sequelize = require("../config/connection");
const { Story, Submission, Token } = require("../models");
const { STORY_WINDOW_SIZE, TOKEN_MAX, EVENT_MAX } = require("../utils/constants");
const AppError = require("../utils/AppError");

// server-defined default story
const DEFAULT_STORY_NAME = process.env.DEFAULT_STORY_NAME || "Default Story";

// In-memory cache
let _defaultStoryId = null;

/**
 * Ensure the default story exists (no seed required).
 * Returns the canonical story id.
 */
async function getDefaultStoryId() {
  if (_defaultStoryId) return _defaultStoryId;

  const [story] = await Story.findOrCreate({
    where: { storyname: DEFAULT_STORY_NAME },
    defaults: { storyname: DEFAULT_STORY_NAME },
  });

  _defaultStoryId = story.id;
  return _defaultStoryId;
}

/**
 * Normalize and split a submission event into tokens.
 */
function tokenize(text) {
  return text.trim().replace(/\s+/g, " ").split(" ");
}

/**
 * Escape hatch snapshot:
 * Returns the authoritative story token window ordered by position.
 */
async function getStoryWindow({ storyId }) {
  if (!Number.isInteger(storyId) || storyId < 1) {
    throw new AppError("INVALID_STORY_ID", "Invalid story id", 400);
  }

  // Soft-cap: return ONLY the most recent window (deterministic, bounded payload).
  // NOTE: "most recent" is defined by highest Token.position.
  const maxPosition = await Token.max("position", {
    where: { story_id: storyId },
  });

  if (!maxPosition) {
    return { storyId, tokens: [] };
  }

  const startPosition = Math.max(1, maxPosition - STORY_WINDOW_SIZE + 1);

  const tokens = await Token.findAll({
    where: {
      story_id: storyId,
      position: { [Op.gte]: startPosition },
    },
    order: [["position", "ASC"]],
    limit: STORY_WINDOW_SIZE,
  });

  return {
    storyId,
    tokens: tokens.map((t) => ({
      id: t.id,
      value: t.value,
      position: t.position,
    })),
  };
}

/**
 * Handle a submission event and convert it into story tokens.
 */
async function submitToStory({ storyId, userId, text }) {
  if (!Number.isInteger(storyId) || storyId < 1) {
    throw new AppError("INVALID_STORY_ID", "Invalid story id", 400);
  }

  if (!Number.isInteger(userId) || userId < 1) {
    throw new AppError("INVALID_USER", "Invalid user", 400);
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    throw new AppError("INVALID_SUBMISSION", "Submission text is required", 400);
  }

  if (text.length > EVENT_MAX) {
    throw new AppError(
      "SUBMISSION_TOO_LONG",
      `Submission must be ≤ ${EVENT_MAX} characters`,
      400
    );
  }

  const tokens = tokenize(text);

  for (const token of tokens) {
    if (token.length > TOKEN_MAX) {
      throw new AppError(
        "TOKEN_TOO_LONG",
        `Token exceeds ${TOKEN_MAX} characters`,
        400
      );
    }
  }

  // Phase 8 (Living Window Soft Cap): MVP is append-only.
  // We store full history in DB, but only *render* a bounded window.
  // Insert position is therefore always the tail: (max(position) + 1).
  //
  // We compute this on the server to avoid any client/window ambiguity.
  // If a rare race triggers a unique constraint, we retry a few times.
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sequelize.transaction(async (t) => {
        const maxPosition = await Token.max("position", {
          where: { story_id: storyId },
          transaction: t,
        });

        const insertPosition = (maxPosition || 0) + 1;

        const submission = await Submission.create(
          {
            submission: text,
            story_id: storyId,
            user_id: userId,
          },
          { transaction: t }
        );

        const tokenRows = tokens.map((value, i) => ({
          value,
          position: insertPosition + i,
          story_id: storyId,
          user_id: userId,
          submission_id: submission.id,
        }));

        await Token.bulkCreate(tokenRows, {
          transaction: t,
          validate: true,
        });

        // ✅ Server-owned living window boundary AFTER this insert
        // newMaxPosition = oldMax + insertedCount
        const newMaxPosition = (maxPosition || 0) + tokenRows.length;
        const windowStartPosition = Math.max(
          1,
          newMaxPosition - STORY_WINDOW_SIZE + 1
        );

        return {
          type: "insert",
          storyId,
          inserted: tokenRows.length,
          from: insertPosition,
          to: insertPosition + tokenRows.length - 1,

          // ✅ canonical boundary: client should drop anything below this position
          windowStartPosition,

          tokens: tokenRows.map((tr) => ({
            value: tr.value,
            position: tr.position,
          })),
        };
      });
    } catch (err) {
      const isUniqueViolation =
        err?.name === "SequelizeUniqueConstraintError" ||
        err?.original?.code === "ER_DUP_ENTRY";

      if (isUniqueViolation && attempt < MAX_RETRIES) continue;
      throw err;
    }
  }
}

async function deleteToken({ storyId, position }) {
  if (!Number.isInteger(storyId) || storyId < 1) {
    throw new AppError("INVALID_STORY_ID", "Invalid story id", 400);
  }

  if (!Number.isInteger(position) || position < 1) {
    throw new AppError("INVALID_POSITION", "Position must be ≥ 1", 400);
  }

  return sequelize.transaction(async (t) => {
    const deleted = await Token.destroy({
      where: { story_id: storyId, position },
      transaction: t,
    });

    if (!deleted) {
      return { type: "delete", storyId, deleted: false, position };
    }

    await Token.increment(
      { position: -1 },
      {
        where: {
          story_id: storyId,
          position: { [Op.gt]: position },
        },
        transaction: t,
      }
    );

    return { type: "delete", storyId, deleted: true, position };
  });
}

module.exports = {
  getDefaultStoryId,
  getStoryWindow,
  submitToStory,
  deleteToken,
};
