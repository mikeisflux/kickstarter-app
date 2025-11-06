// WholesaleShippingRule Model - Custom shipping rates for wholesale customers
// Location: /backend/models/WholesaleShippingRule.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesaleShippingRule = sequelize.define('WholesaleShippingRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shippingTitle: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  shippingMessage: {
    type: DataTypes.STRING(160),
    allowNull: true
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
    type: DataTypes.ENUM('tagged', 'all_logged_in', 'all_customers'),
    allowNull: false,
    defaultValue: 'tagged'
  },
  geographicScope: {
    type: DataTypes.ENUM('all', 'specific'),
    allowNull: false,
    defaultValue: 'all'
  },
  countries: {
    type: DataTypes.JSON, // Array of country codes ['US', 'CA']
    allowNull: true,
    defaultValue: []
  },
  chargeType: {
    type: DataTypes.ENUM('flat_rate', 'percentage', 'conditional'),
    allowNull: false,
    defaultValue: 'flat_rate'
  },
  chargeValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Conditional shipping settings
  conditionBasis: {
    type: DataTypes.ENUM('cart_total', 'cart_items', 'cart_weight'),
    allowNull: true
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  maxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  }
}, {
  tableName: 'wholesale_shipping_rules',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] }
  ]
});

module.exports = WholesaleShippingRule;
