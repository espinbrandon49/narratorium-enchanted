const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Submission extends Model { }

Submission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    // Transient chunk/event text (NOT state)
    submission: {
      type: DataTypes.STRING(200), // DB-level max length for submit event
      allowNull: false,
      validate: {
        len: [1, 200], // server-level enforcement
      },
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

    story_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "story",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: "submission",
    indexes: [{ fields: ["story_id"] }, { fields: ["user_id"] }],
  }
);

module.exports = Submission;
