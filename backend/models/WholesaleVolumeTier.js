// WholesaleVolumeTier Model - Stores volume pricing tiers
// Location: /backend/models/WholesaleVolumeTier.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesaleVolumeTier = sequelize.define('WholesaleVolumeTier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ruleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'wholesale_pricing_rules',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  tierType: {
    type: DataTypes.ENUM('per_variant', 'per_product', 'across_products'),
    allowNull: false,
    defaultValue: 'per_variant'
  },
  displayOnProductPage: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'wholesale_volume_tiers',
  timestamps: true,
  indexes: [
    { fields: ['ruleId'] },
    { fields: ['quantity'] }
  ]
});

module.exports = WholesaleVolumeTier;
