const { database } = require("../database/database");

const { DataTypes } = require("sequelize");

const Order = database.define("order", {
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
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  issuedAt: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "active"
  }
});

module.exports = { Order };
