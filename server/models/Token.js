const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Token extends Model { }

Token.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    // Smallest immutable unit of story state
    value: {
      type: DataTypes.STRING(48), // DB-level max length
      allowNull: false,
      validate: {
        len: [1, 48], // server-level enforcement
      },
    },

    // Ordering truth (1-based)
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // position >= 1
      },
    },

    story_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "story",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // Optional provenance link: which submission event produced this token
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "submission",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: "token",
    indexes: [
      // DB constraint: UNIQUE (story_id, position)
      {
        unique: true,
        fields: ["story_id", "position"],
      },
      { fields: ["story_id"] },
      { fields: ["user_id"] },
      { fields: ["submission_id"] },
    ],
  }
);

module.exports = Token;
