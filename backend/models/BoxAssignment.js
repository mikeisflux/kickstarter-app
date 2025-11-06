// BoxAssignment Model - Track which box is assigned to which order
// Location: /backend/models/BoxAssignment.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BoxAssignment = sequelize.define('BoxAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  shopifyOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  shopifyOrderNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  boxId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'boxes',
      key: 'id'
    }
  },
  // Packing details
  itemsPacked: {
    type: DataTypes.JSON, // Array of line items with dimensions
    allowNull: false,
    defaultValue: []
  },
  calculatedTotalWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  calculatedTotalVolume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  packingEfficiency: {
    type: DataTypes.DECIMAL(5, 2), // Percentage (0-100)
    allowNull: true
  },
  // Assignment metadata
  assignmentMethod: {
    type: DataTypes.ENUM('automatic', 'manual'),
    allowNull: false,
    defaultValue: 'automatic'
  },
  assignedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assignmentReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Status
  isFulfilled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fulfilledAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'box_assignments',
  timestamps: true,
  indexes: [
    { fields: ['shopifyOrderId'], unique: true },
    { fields: ['boxId'] },
    { fields: ['isFulfilled'] }
  ]
});

module.exports = BoxAssignment;
