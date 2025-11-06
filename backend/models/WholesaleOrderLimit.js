// WholesaleOrderLimit Model - Minimum order requirements for wholesale
// Location: /backend/models/WholesaleOrderLimit.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesaleOrderLimit = sequelize.define('WholesaleOrderLimit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  customerTags: {
    type: DataTypes.JSON, // Array of customer tags
    allowNull: false,
    defaultValue: []
  },
  customerTargeting: {
    type: DataTypes.ENUM('tagged', 'all_logged_in'),
    allowNull: false,
    defaultValue: 'tagged'
  },
  orderScope: {
    type: DataTypes.ENUM('all', 'first_only', 'first_and_subsequent'),
    allowNull: false,
    defaultValue: 'all'
  },
  firstOrderMinimum: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subsequentOrderMinimum: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  minimumType: {
    type: DataTypes.ENUM('amount', 'quantity'),
    allowNull: false,
    defaultValue: 'amount'
  },
  minimumValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  conditionLogic: {
    type: DataTypes.ENUM('all', 'any'),
    allowNull: false,
    defaultValue: 'all'
  },
  conditions: {
    type: DataTypes.JSON, // Array of condition objects
    allowNull: true,
    defaultValue: []
  },
  failureAction: {
    type: DataTypes.ENUM('block_order', 'retail_price'),
    allowNull: false,
    defaultValue: 'block_order'
  },
  customMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'wholesale_order_limits',
  timestamps: true,
  indexes: [
    { fields: ['status'] }
  ]
});

module.exports = WholesaleOrderLimit;
