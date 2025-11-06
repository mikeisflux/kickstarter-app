// Box Model - Shipping box definitions
// Location: /backend/models/Box.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Box = sequelize.define('Box', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  boxType: {
    type: DataTypes.ENUM('mailer', 'box', 'envelope', 'tube', 'custom'),
    allowNull: false,
    defaultValue: 'box'
  },
  // Dimensions
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dimensionUnit: {
    type: DataTypes.ENUM('inches', 'cm'),
    allowNull: false,
    defaultValue: 'inches'
  },
  // Weight
  maxWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  boxWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  weightUnit: {
    type: DataTypes.ENUM('lbs', 'kg', 'oz', 'g'),
    allowNull: false,
    defaultValue: 'lbs'
  },
  // Cost and metadata
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  material: {
    type: DataTypes.STRING,
    allowNull: true
  },
  supplierSku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Status and priority
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  // Notes
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Calculated fields
  volume: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.length * this.width * this.height;
    }
  }
}, {
  tableName: 'boxes',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['priority'] },
    { fields: ['name'], unique: true }
  ]
});

module.exports = Box;
