// server/services/story.service.js
const { Op } = require("sequelize");
const sequelize = require("../config/connection");
const { Submission, Token } = require("../models");
const {
  STORY_WINDOW_SIZE,
  TOKEN_MAX,
  EVENT_MAX,
} = require("../utils/constants");
const AppError = require("../utils/AppError");

/**
 * Normalize and split a submission event into tokens.
 * - trims
 * - collapses whitespace
 * - splits on space
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text.trim().replace(/\s+/g, " ").split(" ");
}

/**
 * Escape hatch snapshot:
 * Returns the authoritative story token window ordered by position.
 *
 * @param {Object} params
 * @param {number} params.storyId
 */
async function getStoryWindow({ storyId }) {
  if (!Number.isInteger(storyId) || storyId < 1) {
    throw new AppError("INVALID_STORY_ID", "Invalid story id", 400);
  }

  const tokens = await Token.findAll({
    where: { story_id: storyId },
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
 *
 * Canonical flow:
 * - validate submission event (≤ 200 chars)
 * - tokenize into words
 * - validate tokens (≤ 48 chars)
 * - write Submission (event)
 * - shift Token positions
 * - insert Token rows (state)
 *
 * @param {Object} params
 * @param {number} params.storyId
 * @param {number} params.userId
 * @param {string} params.text
 * @param {number} params.insertPosition
 */
async function submitToStory({ storyId, userId, text, insertPosition }) {
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

  if (!Number.isInteger(insertPosition) || insertPosition < 1) {
    throw new AppError(
      "INVALID_INSERT_POSITION",
      "Insert position must be an integer ≥ 1",
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

  return sequelize.transaction(async (t) => {
    // 1) Log the submission event (audit trail)
    const submission = await Submission.create(
      {
        submission: text,
        story_id: storyId,
        user_id: userId,
      },
      { transaction: t }
    );

    // 2) Shift existing tokens to make room
    await Token.increment(
      { position: tokens.length },
      {
        where: {
          story_id: storyId,
          position: { [Op.gte]: insertPosition },
        },
        transaction: t,
      }
    );

    // 3) Insert tokens as authoritative state
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

    // This is the patch payload you can emit over sockets
    return {
      type: "insert",
      storyId,
      inserted: tokenRows.length,
      from: insertPosition,
      to: insertPosition + tokenRows.length - 1,
      // include the actual inserted tokens for client patch application
      tokens: tokenRows.map((tr) => ({
        value: tr.value,
        position: tr.position,
      })),
    };
  });
}

/**
 * Delete a token at a position and close the gap.
 *
 * @param {Object} params
 * @param {number} params.storyId
 * @param {number} params.position
 */
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
  getStoryWindow,
  submitToStory,
  deleteToken,
};
