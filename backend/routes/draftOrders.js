// Draft Orders Routes - Mark as Paid functionality
// Location: /backend/routes/draftOrders.js

const express = require('express');
const router = express.Router();
const { fetchOpenDraftOrders, markDraftOrdersAsPaid } = require('../services/shopify');
const { DraftOrderStatus } = require('../models');
const logger = require('../services/logger');

/**
 * GET /api/draft-orders/open
 * Fetch all open draft orders from Shopify with local processing status
 */
router.get('/open', async (req, res) => {
  try {
    logger.info('Fetching open draft orders from Shopify...');

    const draftOrders = await fetchOpenDraftOrders();

    // Fetch local processing statuses
    const localStatuses = await DraftOrderStatus.findAll();
    const statusMap = {};
    localStatuses.forEach(status => {
      statusMap[status.draftOrderId] = status.status;
    });

    // Transform the draft orders to include all necessary information + local status
    const transformedOrders = draftOrders.map(order => {
      // Calculate total items
      const totalItems = order.line_items.reduce((sum, item) => sum + item.quantity, 0);

      // Get customer name
      const customerName = order.customer
        ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim()
        : order.billing_address
          ? `${order.billing_address.first_name || ''} ${order.billing_address.last_name || ''}`.trim()
          : 'Unknown';

      return {
        id: order.id,
        name: order.name,
        orderNumber: order.order_number || order.name,
        email: order.email,
        customerName: customerName,
        customerId: order.customer?.id,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        totalPrice: order.total_price,
        subtotalPrice: order.subtotal_price,
        totalTax: order.total_tax,
        currency: order.currency,
        status: order.status,
        lineItems: order.line_items.map(item => ({
          id: item.id,
          variantId: item.variant_id,
          productId: item.product_id,
          title: item.title,
          variantTitle: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          vendor: item.vendor,
          requiresShipping: item.requires_shipping,
          taxable: item.taxable,
          name: item.name
        })),
        totalItems: totalItems,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        note: order.note,
        tags: order.tags,
        taxExempt: order.tax_exempt,
        invoiceUrl: order.invoice_url,
        invoiceSentAt: order.invoice_sent_at,
        completedAt: order.completed_at,
        // Add local processing status (defaults to 'active' if not set)
        processingStatus: statusMap[order.id.toString()] || 'active'
      };
    });

    logger.info(`Successfully fetched ${transformedOrders.length} open draft orders`);

    res.json({
      success: true,
      count: transformedOrders.length,
      draftOrders: transformedOrders
    });

  } catch (error) {
    logger.error(`Error fetching open draft orders: ${error.message}`);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/draft-orders/mark-as-paid
 * Mark selected draft orders as paid (complete them)
 * Body: { draftOrderIds: [id1, id2, ...] }
 */
router.post('/mark-as-paid', async (req, res) => {
  try {
    const { draftOrderIds } = req.body;

    if (!draftOrderIds || !Array.isArray(draftOrderIds) || draftOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'draftOrderIds array is required'
      });
    }

    logger.info(`Marking ${draftOrderIds.length} draft orders as paid...`);

    const results = await markDraftOrdersAsPaid(draftOrderIds);

    res.json({
      success: true,
      results: results,
      summary: {
        total: draftOrderIds.length,
        successful: results.success.length,
        failed: results.failed.length
      }
    });

  } catch (error) {
    logger.error(`Error marking draft orders as paid: ${error.message}`);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/draft-orders/move-to-process-later
 * Move draft orders to "Process Later" tab
 * Body: { draftOrderIds: [id1, id2, ...] }
 */
router.post('/move-to-process-later', async (req, res) => {
  try {
    const { draftOrderIds } = req.body;

    if (!draftOrderIds || !Array.isArray(draftOrderIds) || draftOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'draftOrderIds array is required'
      });
    }

    logger.info(`Moving ${draftOrderIds.length} draft orders to Process Later...`);

    const results = [];
    for (const orderId of draftOrderIds) {
      try {
        const [statusRecord, created] = await DraftOrderStatus.findOrCreate({
          where: { draftOrderId: orderId.toString() },
          defaults: {
            draftOrderId: orderId.toString(),
            status: 'process_later',
            movedToProcessLaterAt: new Date()
          }
        });

        if (!created) {
          // Update existing record
          await statusRecord.update({
            status: 'process_later',
            movedToProcessLaterAt: new Date()
          });
        }

        results.push({ orderId, success: true });
      } catch (error) {
        logger.error(`Failed to move order ${orderId}: ${error.message}`);
        results.push({ orderId, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      summary: {
        total: draftOrderIds.length,
        successful,
        failed
      },
      results
    });

  } catch (error) {
    logger.error(`Error moving draft orders to Process Later: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/draft-orders/move-to-active
 * Move draft orders back to "Active" tab
 * Body: { draftOrderIds: [id1, id2, ...] }
 */
router.post('/move-to-active', async (req, res) => {
  try {
    const { draftOrderIds } = req.body;

    if (!draftOrderIds || !Array.isArray(draftOrderIds) || draftOrderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'draftOrderIds array is required'
      });
    }

    logger.info(`Moving ${draftOrderIds.length} draft orders to Active...`);

    const results = [];
    for (const orderId of draftOrderIds) {
      try {
        const statusRecord = await DraftOrderStatus.findOne({
          where: { draftOrderId: orderId.toString() }
        });

        if (statusRecord) {
          await statusRecord.update({
            status: 'active',
            movedToProcessLaterAt: null
          });
        } else {
          // Create new record as active (default state)
          await DraftOrderStatus.create({
            draftOrderId: orderId.toString(),
            status: 'active'
          });
        }

        results.push({ orderId, success: true });
      } catch (error) {
        logger.error(`Failed to move order ${orderId}: ${error.message}`);
        results.push({ orderId, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      success: true,
      summary: {
        total: draftOrderIds.length,
        successful,
        failed
      },
      results
    });

  } catch (error) {
    logger.error(`Error moving draft orders to Active: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
