// Box Selector Routes - Complete CRUD for box management system
// Location: /backend/routes/boxSelector.js

const express = require('express');
const router = express.Router();
const {
  Box,
  BoxAssignment,
  ProductDimension,
  BoxSelectorSettings
} = require('../models');
const logger = require('../services/logger');
const { calculateOptimalBox } = require('../services/packingAlgorithm');

// ==================== BOX MANAGEMENT ====================

/**
 * GET /api/box-selector/boxes
 * Get all boxes
 */
router.get('/boxes', async (req, res) => {
  try {
    const { activeOnly } = req.query;

    const where = activeOnly === 'true' ? { isActive: true } : {};

    const boxes = await Box.findAll({
      where,
      order: [['priority', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      count: boxes.length,
      boxes
    });
  } catch (error) {
    logger.error(`Error fetching boxes: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/box-selector/boxes/:id
 * Get single box by ID
 */
router.get('/boxes/:id', async (req, res) => {
  try {
    const box = await Box.findByPk(req.params.id, {
      include: [{
        model: BoxAssignment,
        as: 'assignments',
        limit: 10,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!box) {
      return res.status(404).json({ success: false, error: 'Box not found' });
    }

    res.json({ success: true, box });
  } catch (error) {
    logger.error(`Error fetching box: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/box-selector/boxes
 * Create new box
 */
router.post('/boxes', async (req, res) => {
  try {
    const box = await Box.create(req.body);
    logger.info(`Created box: ${box.name}`);

    res.status(201).json({ success: true, box });
  } catch (error) {
    logger.error(`Error creating box: ${error.message}`);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Box name must be unique'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/box-selector/boxes/:id
 * Update box
 */
router.put('/boxes/:id', async (req, res) => {
  try {
    const box = await Box.findByPk(req.params.id);

    if (!box) {
      return res.status(404).json({ success: false, error: 'Box not found' });
    }

    await box.update(req.body);
    logger.info(`Updated box: ${box.name}`);

    res.json({ success: true, box });
  } catch (error) {
    logger.error(`Error updating box: ${error.message}`);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Box name must be unique'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/box-selector/boxes/:id
 * Delete box
 */
router.delete('/boxes/:id', async (req, res) => {
  try {
    const box = await Box.findByPk(req.params.id);

    if (!box) {
      return res.status(404).json({ success: false, error: 'Box not found' });
    }

    // Check if box is assigned to unfulfilled orders
    const assignmentCount = await BoxAssignment.count({
      where: {
        boxId: box.id,
        isFulfilled: false
      }
    });

    await box.destroy();
    logger.info(`Deleted box: ${box.name}`);

    res.json({
      success: true,
      message: 'Box deleted',
      hadAssignments: assignmentCount > 0,
      assignmentCount
    });
  } catch (error) {
    logger.error(`Error deleting box: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/box-selector/boxes/:id/toggle-active
 * Toggle box active status
 */
router.patch('/boxes/:id/toggle-active', async (req, res) => {
  try {
    const box = await Box.findByPk(req.params.id);

    if (!box) {
      return res.status(404).json({ success: false, error: 'Box not found' });
    }

    await box.update({ isActive: !box.isActive });

    res.json({ success: true, box });
  } catch (error) {
    logger.error(`Error toggling box status: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/box-selector/boxes/bulk-import
 * Bulk import boxes from CSV data
 */
router.post('/boxes/bulk-import', async (req, res) => {
  try {
    const { boxes } = req.body;

    if (!Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'boxes array is required'
      });
    }

    const results = { success: [], failed: [] };

    for (const boxData of boxes) {
      try {
        const box = await Box.create(boxData);
        results.success.push({ name: box.name, id: box.id });
      } catch (error) {
        results.failed.push({
          name: boxData.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      summary: {
        total: boxes.length,
        successful: results.success.length,
        failed: results.failed.length
      },
      results
    });
  } catch (error) {
    logger.error(`Error bulk importing boxes: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PRODUCT DIMENSIONS ====================

/**
 * GET /api/box-selector/product-dimensions
 * Get all product dimensions
 */
router.get('/product-dimensions', async (req, res) => {
  try {
    const { hasDimensions, search } = req.query;

    const where = {};
    if (hasDimensions === 'true') where.hasDimensions = true;
    if (hasDimensions === 'false') where.hasDimensions = false;

    const dimensions = await ProductDimension.findAll({
      where,
      order: [['productTitle', 'ASC']]
    });

    // Apply search filter if provided
    let filtered = dimensions;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = dimensions.filter(d =>
        d.productTitle?.toLowerCase().includes(searchLower) ||
        d.variantTitle?.toLowerCase().includes(searchLower) ||
        d.sku?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      dimensions: filtered
    });
  } catch (error) {
    logger.error(`Error fetching product dimensions: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/box-selector/product-dimensions/:variantId
 * Update product dimensions
 */
router.put('/product-dimensions/:variantId', async (req, res) => {
  try {
    const [dimension, created] = await ProductDimension.findOrCreate({
      where: { shopifyVariantId: req.params.variantId },
      defaults: {
        ...req.body,
        shopifyVariantId: req.params.variantId,
        hasDimensions: !!(req.body.length && req.body.width && req.body.height)
      }
    });

    if (!created) {
      await dimension.update({
        ...req.body,
        hasDimensions: !!(req.body.length && req.body.width && req.body.height),
        lastSyncedAt: new Date()
      });
    }

    res.json({ success: true, dimension, created });
  } catch (error) {
    logger.error(`Error updating product dimensions: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/box-selector/product-dimensions/bulk-import
 * Bulk import product dimensions
 */
router.post('/product-dimensions/bulk-import', async (req, res) => {
  try {
    const { dimensions } = req.body;

    if (!Array.isArray(dimensions) || dimensions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'dimensions array is required'
      });
    }

    const results = { success: [], failed: [] };

    for (const dimData of dimensions) {
      try {
        const [dimension, created] = await ProductDimension.findOrCreate({
          where: { shopifyVariantId: dimData.shopifyVariantId },
          defaults: {
            ...dimData,
            hasDimensions: !!(dimData.length && dimData.width && dimData.height)
          }
        });

        if (!created) {
          await dimension.update({
            ...dimData,
            hasDimensions: !!(dimData.length && dimData.width && dimData.height),
            lastSyncedAt: new Date()
          });
        }

        results.success.push({
          variantId: dimData.shopifyVariantId,
          created
        });
      } catch (error) {
        results.failed.push({
          variantId: dimData.shopifyVariantId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      summary: {
        total: dimensions.length,
        successful: results.success.length,
        failed: results.failed.length
      },
      results
    });
  } catch (error) {
    logger.error(`Error bulk importing dimensions: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BOX ASSIGNMENTS ====================

/**
 * GET /api/box-selector/assignments
 * Get box assignments
 */
router.get('/assignments', async (req, res) => {
  try {
    const { orderId, isFulfilled } = req.query;

    const where = {};
    if (orderId) where.shopifyOrderId = orderId;
    if (isFulfilled === 'true') where.isFulfilled = true;
    if (isFulfilled === 'false') where.isFulfilled = false;

    const assignments = await BoxAssignment.findAll({
      where,
      include: [{ model: Box }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    logger.error(`Error fetching box assignments: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/box-selector/calculate-box
 * Calculate optimal box for given items
 * Body: { items: [{ length, width, height, weight, quantity }] }
 */
router.post('/calculate-box', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items array is required'
      });
    }

    const result = await calculateOptimalBox(items);

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error(`Error calculating box: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/box-selector/assignments
 * Create box assignment for order
 */
router.post('/assignments', async (req, res) => {
  try {
    const assignment = await BoxAssignment.create(req.body);
    logger.info(`Created box assignment for order ${assignment.shopifyOrderId}`);

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    logger.error(`Error creating box assignment: ${error.message}`);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Assignment already exists for this order'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/box-selector/assignments/:orderId
 * Update box assignment (manual override)
 */
router.put('/assignments/:orderId', async (req, res) => {
  try {
    const assignment = await BoxAssignment.findOne({
      where: { shopifyOrderId: req.params.orderId }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    await assignment.update({
      ...req.body,
      assignmentMethod: 'manual'
    });

    res.json({ success: true, assignment });
  } catch (error) {
    logger.error(`Error updating box assignment: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SETTINGS ====================

/**
 * GET /api/box-selector/settings
 * Get box selector settings
 */
router.get('/settings', async (req, res) => {
  try {
    let settings = await BoxSelectorSettings.findOne();

    if (!settings) {
      settings = await BoxSelectorSettings.create({});
    }

    res.json({ success: true, settings });
  } catch (error) {
    logger.error(`Error fetching box selector settings: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/box-selector/settings
 * Update box selector settings
 */
router.put('/settings', async (req, res) => {
  try {
    let settings = await BoxSelectorSettings.findOne();

    if (!settings) {
      settings = await BoxSelectorSettings.create(req.body);
    } else {
      await settings.update(req.body);
    }

    res.json({ success: true, settings });
  } catch (error) {
    logger.error(`Error updating box selector settings: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== REPORTS ====================

/**
 * GET /api/box-selector/reports/box-usage
 * Get box usage statistics
 */
router.get('/reports/box-usage', async (req, res) => {
  try {
    const boxes = await Box.findAll({
      include: [{
        model: BoxAssignment,
        as: 'assignments'
      }]
    });

    const usage = boxes.map(box => ({
      id: box.id,
      name: box.name,
      dimensions: `${box.length}×${box.width}×${box.height}`,
      timesUsed: box.assignments.length,
      cost: box.cost,
      totalCost: parseFloat(box.cost || 0) * box.assignments.length
    }));

    res.json({
      success: true,
      usage,
      summary: {
        totalBoxes: boxes.length,
        totalAssignments: usage.reduce((sum, u) => sum + u.timesUsed, 0),
        totalCost: usage.reduce((sum, u) => sum + u.totalCost, 0)
      }
    });
  } catch (error) {
    logger.error(`Error generating box usage report: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
