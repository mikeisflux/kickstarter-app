// Wholesale Pricing Routes - Complete CRUD for wholesale pricing system
// Location: /backend/routes/wholesale.js

const express = require('express');
const router = express.Router();
const {
  WholesalePricingRule,
  WholesaleVolumeTier,
  WholesaleShippingRule,
  WholesaleOrderLimit,
  WholesaleSettings
} = require('../models');
const logger = require('../services/logger');

// ==================== PRICING RULES ====================

/**
 * GET /api/wholesale/pricing-rules
 * Get all pricing rules
 */
router.get('/pricing-rules', async (req, res) => {
  try {
    const rules = await WholesalePricingRule.findAll({
      include: [{
        model: WholesaleVolumeTier,
        as: 'volumeTiers'
      }],
      order: [['priority', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (error) {
    logger.error(`Error fetching pricing rules: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/wholesale/pricing-rules/:id
 * Get single pricing rule by ID
 */
router.get('/pricing-rules/:id', async (req, res) => {
  try {
    const rule = await WholesalePricingRule.findByPk(req.params.id, {
      include: [{
        model: WholesaleVolumeTier,
        as: 'volumeTiers'
      }]
    });

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    res.json({ success: true, rule });
  } catch (error) {
    logger.error(`Error fetching pricing rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wholesale/pricing-rules
 * Create new pricing rule
 */
router.post('/pricing-rules', async (req, res) => {
  try {
    const rule = await WholesalePricingRule.create(req.body);
    logger.info(`Created pricing rule: ${rule.name}`);

    res.status(201).json({ success: true, rule });
  } catch (error) {
    logger.error(`Error creating pricing rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/wholesale/pricing-rules/:id
 * Update pricing rule
 */
router.put('/pricing-rules/:id', async (req, res) => {
  try {
    const rule = await WholesalePricingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    await rule.update(req.body);
    logger.info(`Updated pricing rule: ${rule.name}`);

    res.json({ success: true, rule });
  } catch (error) {
    logger.error(`Error updating pricing rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wholesale/pricing-rules/:id
 * Delete pricing rule
 */
router.delete('/pricing-rules/:id', async (req, res) => {
  try {
    const rule = await WholesalePricingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    await rule.destroy();
    logger.info(`Deleted pricing rule: ${rule.name}`);

    res.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    logger.error(`Error deleting pricing rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/wholesale/pricing-rules/:id/toggle-status
 * Toggle rule status (published/unpublished)
 */
router.patch('/pricing-rules/:id/toggle-status', async (req, res) => {
  try {
    const rule = await WholesalePricingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    const newStatus = rule.status === 'published' ? 'unpublished' : 'published';
    await rule.update({ status: newStatus });

    res.json({ success: true, rule });
  } catch (error) {
    logger.error(`Error toggling rule status: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== VOLUME TIERS ====================

/**
 * POST /api/wholesale/pricing-rules/:ruleId/volume-tiers
 * Add volume tier to rule
 */
router.post('/pricing-rules/:ruleId/volume-tiers', async (req, res) => {
  try {
    const tier = await WholesaleVolumeTier.create({
      ...req.body,
      ruleId: req.params.ruleId
    });

    res.status(201).json({ success: true, tier });
  } catch (error) {
    logger.error(`Error creating volume tier: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/wholesale/volume-tiers/:id
 * Update volume tier
 */
router.put('/volume-tiers/:id', async (req, res) => {
  try {
    const tier = await WholesaleVolumeTier.findByPk(req.params.id);

    if (!tier) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }

    await tier.update(req.body);
    res.json({ success: true, tier });
  } catch (error) {
    logger.error(`Error updating volume tier: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wholesale/volume-tiers/:id
 * Delete volume tier
 */
router.delete('/volume-tiers/:id', async (req, res) => {
  try {
    const tier = await WholesaleVolumeTier.findByPk(req.params.id);

    if (!tier) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }

    await tier.destroy();
    res.json({ success: true, message: 'Tier deleted' });
  } catch (error) {
    logger.error(`Error deleting volume tier: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SHIPPING RULES ====================

/**
 * GET /api/wholesale/shipping-rules
 * Get all shipping rules
 */
router.get('/shipping-rules', async (req, res) => {
  try {
    const rules = await WholesaleShippingRule.findAll({
      order: [['priority', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    logger.error(`Error fetching shipping rules: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wholesale/shipping-rules
 * Create new shipping rule
 */
router.post('/shipping-rules', async (req, res) => {
  try {
    const rule = await WholesaleShippingRule.create(req.body);
    res.status(201).json({ success: true, rule });
  } catch (error) {
    logger.error(`Error creating shipping rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/wholesale/shipping-rules/:id
 * Update shipping rule
 */
router.put('/shipping-rules/:id', async (req, res) => {
  try {
    const rule = await WholesaleShippingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    await rule.update(req.body);
    res.json({ success: true, rule });
  } catch (error) {
    logger.error(`Error updating shipping rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wholesale/shipping-rules/:id
 * Delete shipping rule
 */
router.delete('/shipping-rules/:id', async (req, res) => {
  try {
    const rule = await WholesaleShippingRule.findByPk(req.params.id);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }

    await rule.destroy();
    res.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    logger.error(`Error deleting shipping rule: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ORDER LIMITS ====================

/**
 * GET /api/wholesale/order-limits
 * Get all order limit rules
 */
router.get('/order-limits', async (req, res) => {
  try {
    const limits = await WholesaleOrderLimit.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, count: limits.length, limits });
  } catch (error) {
    logger.error(`Error fetching order limits: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wholesale/order-limits
 * Create new order limit rule
 */
router.post('/order-limits', async (req, res) => {
  try {
    const limit = await WholesaleOrderLimit.create(req.body);
    res.status(201).json({ success: true, limit });
  } catch (error) {
    logger.error(`Error creating order limit: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/wholesale/order-limits/:id
 * Update order limit rule
 */
router.put('/order-limits/:id', async (req, res) => {
  try {
    const limit = await WholesaleOrderLimit.findByPk(req.params.id);

    if (!limit) {
      return res.status(404).json({ success: false, error: 'Limit not found' });
    }

    await limit.update(req.body);
    res.json({ success: true, limit });
  } catch (error) {
    logger.error(`Error updating order limit: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wholesale/order-limits/:id
 * Delete order limit rule
 */
router.delete('/order-limits/:id', async (req, res) => {
  try {
    const limit = await WholesaleOrderLimit.findByPk(req.params.id);

    if (!limit) {
      return res.status(404).json({ success: false, error: 'Limit not found' });
    }

    await limit.destroy();
    res.json({ success: true, message: 'Limit deleted' });
  } catch (error) {
    logger.error(`Error deleting order limit: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SETTINGS ====================

/**
 * GET /api/wholesale/settings
 * Get wholesale settings
 */
router.get('/settings', async (req, res) => {
  try {
    let settings = await WholesaleSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await WholesaleSettings.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    logger.error(`Error fetching wholesale settings: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/wholesale/settings
 * Update wholesale settings
 */
router.put('/settings', async (req, res) => {
  try {
    let settings = await WholesaleSettings.findOne();

    if (!settings) {
      settings = await WholesaleSettings.create(req.body);
    } else {
      await settings.update(req.body);
    }

    res.json({ success: true, settings });
  } catch (error) {
    logger.error(`Error updating wholesale settings: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PRICING CALCULATION ====================

/**
 * POST /api/wholesale/calculate-price
 * Calculate wholesale price for given items and customer
 * Body: { customerTags: [], items: [{ variantId, quantity, price }] }
 */
router.post('/calculate-price', async (req, res) => {
  try {
    const { customerTags = [], items = [] } = req.body;

    // Get all published pricing rules
    const rules = await WholesalePricingRule.findAll({
      where: { status: 'published' },
      include: [{ model: WholesaleVolumeTier, as: 'volumeTiers' }],
      order: [['priority', 'ASC']]
    });

    const results = items.map(item => {
      let appliedRule = null;
      let discountedPrice = parseFloat(item.price);

      // Find applicable rule
      for (const rule of rules) {
        // Check customer targeting
        if (rule.customerTargeting === 'tagged' &&
            !rule.customerTags.some(tag => customerTags.includes(tag))) {
          continue;
        }

        // Check product scope
        if (rule.productScope === 'specific' &&
            !rule.productIds.includes(item.variantId)) {
          continue;
        }

        // Apply discount
        if (rule.discountType === 'percentage') {
          discountedPrice = item.price * (1 - rule.discountValue / 100);
        } else if (rule.discountType === 'fixed_amount') {
          discountedPrice = Math.max(0, item.price - rule.discountValue);
        } else if (rule.discountType === 'fixed_price') {
          discountedPrice = rule.discountValue;
        }

        appliedRule = {
          id: rule.id,
          name: rule.name,
          discountType: rule.discountType,
          discountValue: rule.discountValue
        };

        break; // Use first matching rule (highest priority)
      }

      return {
        variantId: item.variantId,
        quantity: item.quantity,
        originalPrice: parseFloat(item.price),
        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
        savings: parseFloat((item.price - discountedPrice).toFixed(2)),
        appliedRule
      };
    });

    res.json({ success: true, results });
  } catch (error) {
    logger.error(`Error calculating wholesale price: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
