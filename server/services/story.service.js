const { Op } = require("sequelize");
const sequelize = require("../config/connection");
const { Submission, Token } = require("../models");
const { TOKEN_MAX, EVENT_MAX } = require("../utils/constants");
const AppError = require("../utils/AppError");

/**
 * Normalize and split a submission event into tokens.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text.trim().replace(/\s+/g, " ").split(" ");
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
  if (typeof text !== "string" || text.length === 0) {
    throw new AppError("INVALID_SUBMISSION", 400);
  }

  if (text.length > EVENT_MAX) {
    throw new AppError("SUBMISSION_TOO_LONG", 400);
  }

  if (!Number.isInteger(insertPosition) || insertPosition < 1) {
    throw new AppError("INVALID_INSERT_POSITION", 400);
  }

  const tokens = tokenize(text);

  for (const token of tokens) {
    if (token.length > TOKEN_MAX) {
      throw new AppError("TOKEN_TOO_LONG", 400);
    }
  }

  return sequelize.transaction(async (t) => {
    // 1) Log the submission event
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

    return {
      inserted: tokenRows.length,
      from: insertPosition,
      to: insertPosition + tokenRows.length - 1,
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
  if (!Number.isInteger(position) || position < 1) {
    throw new AppError("INVALID_POSITION", 400);
  }

  return sequelize.transaction(async (t) => {
    const deleted = await Token.destroy({
      where: { story_id: storyId, position },
      transaction: t,
    });

    if (!deleted) {
      return { deleted: false };
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

    return { deleted: true };
  });
}

module.exports = {
  submitToStory,
  deleteToken,
};
