const User = require("./User");
const Story = require("./Story");
const Submission = require("./Submission");
const Token = require("./Token");

// ===== Submission (event log) =====
User.hasMany(Submission, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});
Submission.belongsTo(User, {
    foreignKey: "user_id",
});

Story.hasMany(Submission, {
    foreignKey: "story_id",
    onDelete: "CASCADE",
});
Submission.belongsTo(Story, {
    foreignKey: "story_id",
});

// ===== Token (story state) =====
User.hasMany(Token, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
});
Token.belongsTo(User, {
    foreignKey: "user_id",
});

Story.hasMany(Token, {
    foreignKey: "story_id",
    onDelete: "CASCADE",
});
Token.belongsTo(Story, {
    foreignKey: "story_id",
});

// Optional provenance: submission event -> produced tokens
Submission.hasMany(Token, {
    foreignKey: "submission_id",
    onDelete: "SET NULL",
});
Token.belongsTo(Submission, {
    foreignKey: "submission_id",
});

module.exports = { User, Story, Submission, Token };
