// WholesalePricingRule Model - Stores wholesale pricing rules
// Location: /backend/models/WholesalePricingRule.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesalePricingRule = sequelize.define('WholesalePricingRule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('common', 'individual', 'volume'),
    allowNull: false,
    defaultValue: 'common'
  },
  status: {
    type: DataTypes.ENUM('published', 'unpublished'),
    allowNull: false,
    defaultValue: 'unpublished'
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'fixed_price'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  customerTags: {
    type: DataTypes.JSON, // Array of customer tags ['wholesale', 'vip']
    allowNull: false,
    defaultValue: []
  },
  customerTargeting: {
    type: DataTypes.ENUM('tagged', 'all_logged_in', 'all_customers'),
    allowNull: false,
    defaultValue: 'tagged'
  },
  productScope: {
    type: DataTypes.ENUM('all', 'collections', 'specific', 'mixed'),
    allowNull: false,
    defaultValue: 'all'
  },
  productIds: {
    type: DataTypes.JSON, // Array of Shopify product IDs
    allowNull: true,
    defaultValue: []
  },
  collectionIds: {
    type: DataTypes.JSON, // Array of Shopify collection IDs
    allowNull: true,
    defaultValue: []
  },
  excludedProductIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  excludedCollectionIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  variantPricing: {
    type: DataTypes.JSON, // For individual variant pricing: { variant_id: { discount_type, discount_value } }
    allowNull: true,
    defaultValue: {}
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'wholesale_pricing_rules',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['priority'] }
  ]
});

module.exports = WholesalePricingRule;
