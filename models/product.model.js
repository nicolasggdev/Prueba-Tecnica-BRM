const { database } = require("../database/database");

const { DataTypes } = require("sequelize");

const Product = database.define("product", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER,
    unique: true,
    autoIncrement: true,
    allowNull: false
  },
  batchNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantityAvailable: {
    type: DataTypes.INTEGER,
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

module.exports = { Product };
