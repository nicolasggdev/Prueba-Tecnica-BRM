const { database } = require("../database/database");

const { DataTypes } = require("sequelize");

const Cart = database.define("cart", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    unique: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active"
  }
});

module.exports = { Cart };
