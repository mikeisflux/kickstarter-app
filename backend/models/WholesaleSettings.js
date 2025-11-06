// WholesaleSettings Model - Global wholesale app settings
// Location: /backend/models/WholesaleSettings.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WholesaleSettings = sequelize.define('WholesaleSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Display settings
  showCrossedOutPrices: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  useCompareAtPrice: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  // Coupon field management
  couponFieldAccess: {
    type: DataTypes.ENUM('all', 'tagged', 'disabled'),
    allowNull: false,
    defaultValue: 'disabled'
  },
  preventAutoDiscounts: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  // Checkout discount method
  discountMethod: {
    type: DataTypes.ENUM('draft_order', 'coupon_code'),
    allowNull: false,
    defaultValue: 'draft_order'
  },
  discountLabel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'WHOLESALE DISCOUNT'
  },

  // Login page customization
  signupFormOption: {
    type: DataTypes.ENUM('none', 'wholesale_only', 'both'),
    allowNull: false,
    defaultValue: 'both'
  },
  wholesaleSignupUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  wholesaleSignupLabel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Create wholesale account'
  },

  // Additional features
  chargeAdditionalFee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  additionalFeeType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: true
  },
  additionalFeeValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  additionalFeeLabel: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Processing Fee'
  },

  // Sale clock settings
  saleClockEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  saleClockBackgroundColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#000000'
  },
  saleClockForegroundColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#ffffff'
  },
  saleClockTextAlign: {
    type: DataTypes.ENUM('left', 'center', 'right'),
    allowNull: false,
    defaultValue: 'left'
  },
  saleClockFontSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 14
  },
  saleClockBorderRadius: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4
  },

  // Mode
  mode: {
    type: DataTypes.ENUM('test', 'live'),
    allowNull: false,
    defaultValue: 'test'
  },

  // Theme integration
  themeAppEmbedEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'wholesale_settings',
  timestamps: true
});

module.exports = WholesaleSettings;
