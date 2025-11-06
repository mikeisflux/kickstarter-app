// DraftOrderStatus Model - Track processing status of draft orders
// Location: /backend/models/DraftOrderStatus.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DraftOrderStatus = sequelize.define('DraftOrderStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  draftOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  draftOrderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'process_later'),
    allowNull: false,
    defaultValue: 'active'
  },
  movedToProcessLaterAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  movedToProcessLaterBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'draft_order_statuses',
  timestamps: true,
  indexes: [
    { fields: ['draftOrderId'], unique: true },
    { fields: ['status'] }
  ]
});

module.exports = DraftOrderStatus;
