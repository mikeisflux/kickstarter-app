// models/index.js - Updated with Fulfillment, Wholesale, and Box Selector Models
// Location: /backend/models/index.js

const sequelize = require('../config/database');

// Original models
const Project = require('./Project');
const Backer = require('./Backer');
const Mapping = require('./Mapping');
const VerificationLog = require('./VerificationLog');
const User = require('./User');
const OrderAssignment = require('./OrderAssignment');

// Wholesale models
const WholesalePricingRule = require('./WholesalePricingRule');
const WholesaleVolumeTier = require('./WholesaleVolumeTier');
const WholesaleShippingRule = require('./WholesaleShippingRule');
const WholesaleOrderLimit = require('./WholesaleOrderLimit');
const WholesaleSettings = require('./WholesaleSettings');

// Box Selector models
const Box = require('./Box');
const BoxAssignment = require('./BoxAssignment');
const ProductDimension = require('./ProductDimension');
const BoxSelectorSettings = require('./BoxSelectorSettings');

// Draft Order Status (for mark-as-paid tabs)
const DraftOrderStatus = require('./DraftOrderStatus');

// Define relationships
Project.hasMany(Backer, { foreignKey: 'projectId' });
Backer.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Mapping, { foreignKey: 'projectId' });
Mapping.belongsTo(Project, { foreignKey: 'projectId' });

// Fulfillment relationships
User.hasMany(OrderAssignment, { foreignKey: 'assignedToUserId' });
OrderAssignment.belongsTo(User, { foreignKey: 'assignedToUserId', as: 'assignedUser' });

// Wholesale relationships
WholesalePricingRule.hasMany(WholesaleVolumeTier, { foreignKey: 'ruleId', as: 'volumeTiers' });
WholesaleVolumeTier.belongsTo(WholesalePricingRule, { foreignKey: 'ruleId' });

// Box Selector relationships
Box.hasMany(BoxAssignment, { foreignKey: 'boxId', as: 'assignments' });
BoxAssignment.belongsTo(Box, { foreignKey: 'boxId' });

// Sync database function
async function syncDatabase() {
  try {
    console.log('🔄 Syncing database models...');

    // Keep existing Kickstarter tables untouched
    await Project.sync({ alter: false });
    await Backer.sync({ alter: false });
    await Mapping.sync({ alter: false });

    // Create new fulfillment tables (force recreate if exists)
    await User.sync({ force: true });
    await VerificationLog.sync({ force: true });
    await OrderAssignment.sync({ force: true });

    // Create Wholesale tables
    await WholesalePricingRule.sync({ alter: true });
    await WholesaleVolumeTier.sync({ alter: true });
    await WholesaleShippingRule.sync({ alter: true });
    await WholesaleOrderLimit.sync({ alter: true });
    await WholesaleSettings.sync({ alter: true });

    // Create Box Selector tables
    await Box.sync({ alter: true });
    await BoxAssignment.sync({ alter: true });
    await ProductDimension.sync({ alter: true });
    await BoxSelectorSettings.sync({ alter: true });

    // Create Draft Order Status table
    await DraftOrderStatus.sync({ alter: true });

    console.log('✅ All models synchronized successfully');

    // Seed employee stations
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🌱 Seeding employee stations...');
      await User.bulkCreate([
        { username: 'station1', displayName: 'Station 1', role: 'employee', stationNumber: 1, isActive: true },
        { username: 'station2', displayName: 'Station 2', role: 'employee', stationNumber: 2, isActive: true },
        { username: 'station3', displayName: 'Station 3', role: 'employee', stationNumber: 3, isActive: true }
      ]);
      console.log('✅ Created 3 employee stations');
    }

    // Seed default wholesale settings
    const wholesaleSettingsCount = await WholesaleSettings.count();
    if (wholesaleSettingsCount === 0) {
      console.log('🌱 Creating default wholesale settings...');
      await WholesaleSettings.create({});
      console.log('✅ Created default wholesale settings');
    }

    // Seed default box selector settings
    const boxSelectorSettingsCount = await BoxSelectorSettings.count();
    if (boxSelectorSettingsCount === 0) {
      console.log('🌱 Creating default box selector settings...');
      await BoxSelectorSettings.create({});
      console.log('✅ Created default box selector settings');
    }
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  Project,
  Backer,
  Mapping,
  VerificationLog,
  User,
  OrderAssignment,
  WholesalePricingRule,
  WholesaleVolumeTier,
  WholesaleShippingRule,
  WholesaleOrderLimit,
  WholesaleSettings,
  Box,
  BoxAssignment,
  ProductDimension,
  BoxSelectorSettings,
  DraftOrderStatus,
  syncDatabase
};