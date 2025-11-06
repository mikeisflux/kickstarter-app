// ProductDimension Model - Store product dimensions for box calculation
// Location: /backend/models/ProductDimension.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductDimension = sequelize.define('ProductDimension', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  shopifyProductId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shopifyVariantId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  productTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  variantTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Dimensions
  length: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  width: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  dimensionUnit: {
    type: DataTypes.ENUM('inches', 'cm'),
    allowNull: false,
    defaultValue: 'inches'
  },
  // Weight (from Shopify)
  weight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  weightUnit: {
    type: DataTypes.ENUM('lbs', 'kg', 'oz', 'g'),
    allowNull: false,
    defaultValue: 'lbs'
  },
  // Status
  hasDimensions: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Calculated fields
  volume: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.length && this.width && this.height) {
        return this.length * this.width * this.height;
      }
      return null;
    }
  }
}, {
  tableName: 'product_dimensions',
  timestamps: true,
  indexes: [
    { fields: ['shopifyProductId'] },
    { fields: ['shopifyVariantId'], unique: true },
    { fields: ['hasDimensions'] },
    { fields: ['sku'] }
  ]
});

module.exports = ProductDimension;
