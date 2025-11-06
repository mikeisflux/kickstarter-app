// BoxSelectorSettings Model - Global box selector app settings
// Location: /backend/models/BoxSelectorSettings.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BoxSelectorSettings = sequelize.define('BoxSelectorSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Packing algorithm settings
  packingBufferPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    validate: {
      min: 0,
      max: 100
    }
  },
  packingMaterialWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.1
  },
  packingMaterialWeightUnit: {
    type: DataTypes.ENUM('lbs', 'kg', 'oz', 'g'),
    allowNull: false,
    defaultValue: 'lbs'
  },
  boxSelectionStrategy: {
    type: DataTypes.ENUM('smallest_volume', 'lowest_cost', 'highest_priority', 'best_fit'),
    allowNull: false,
    defaultValue: 'smallest_volume'
  },

  // Units configuration
  defaultDimensionUnit: {
    type: DataTypes.ENUM('inches', 'cm'),
    allowNull: false,
    defaultValue: 'inches'
  },
  defaultWeightUnit: {
    type: DataTypes.ENUM('lbs', 'kg', 'oz', 'g'),
    allowNull: false,
    defaultValue: 'lbs'
  },

  // Carrier integration
  enableUSPS: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  enableUPS: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enableFedEx: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  uspsApiKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  upsApiKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fedexApiKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  originAddress: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },

  // Order settings
  autoAssignBoxes: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  sendNotifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notificationEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  includeBoxInfoInPackingSlips: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  // Fallback behavior
  fallbackBehavior: {
    type: DataTypes.ENUM('error', 'largest_box', 'no_shipping'),
    allowNull: false,
    defaultValue: 'largest_box'
  },

  // Advanced settings
  debugMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enableManualOverride: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'box_selector_settings',
  timestamps: true
});

module.exports = BoxSelectorSettings;
