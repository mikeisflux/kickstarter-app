// Packing Algorithm Service - Calculate optimal box for items
// Location: /backend/services/packingAlgorithm.js

const { Box, BoxSelectorSettings } = require('../models');
const logger = require('./logger');

/**
 * Calculate optimal box for given items
 * @param {Array} items - Array of items with dimensions and weight
 * @returns {Object} - Selected box and packing details
 */
async function calculateOptimalBox(items) {
  try {
    // Get settings
    const settings = await BoxSelectorSettings.findOne();
    const packingBuffer = settings?.packingBufferPercentage || 20;
    const packingMaterialWeight = settings?.packingMaterialWeight || 0.1;
    const selectionStrategy = settings?.boxSelectionStrategy || 'smallest_volume';

    // Calculate total dimensions and weight
    let totalVolume = 0;
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    for (const item of items) {
      const itemVolume = (item.length || 0) * (item.width || 0) * (item.height || 0);
      const quantity = item.quantity || 1;

      totalVolume += itemVolume * quantity;
      totalWeight += (item.weight || 0) * quantity;

      // Track max dimensions
      maxLength = Math.max(maxLength, item.length || 0);
      maxWidth = Math.max(maxWidth, item.width || 0);
      maxHeight = Math.max(maxHeight, item.height || 0);
    }

    // Apply packing buffer
    const bufferedVolume = totalVolume * (1 + packingBuffer / 100);
    const totalPackageWeight = totalWeight + packingMaterialWeight;

    logger.info(`Calculated packing requirements: volume=${bufferedVolume.toFixed(2)}, weight=${totalPackageWeight.toFixed(2)}`);

    // Get active boxes
    const boxes = await Box.findAll({
      where: { isActive: true },
      order: [['priority', 'ASC']]
    });

    if (boxes.length === 0) {
      throw new Error('No active boxes available');
    }

    // Filter eligible boxes
    const eligibleBoxes = boxes.filter(box => {
      const boxVolume = box.length * box.width * box.height;
      const boxMaxWeight = box.maxWeight;
      const totalWeightWithBox = totalPackageWeight + (box.boxWeight || 0);

      // Check volume
      if (boxVolume < bufferedVolume) return false;

      // Check weight
      if (totalWeightWithBox > boxMaxWeight) return false;

      // Simple dimension check (largest item must fit in box)
      // Note: This is simplified - true 3D bin packing would be more complex
      const boxDimensions = [box.length, box.width, box.height].sort((a, b) => b - a);
      const itemDimensions = [maxLength, maxWidth, maxHeight].sort((a, b) => b - a);

      for (let i = 0; i < 3; i++) {
        if (itemDimensions[i] > boxDimensions[i]) return false;
      }

      return true;
    });

    if (eligibleBoxes.length === 0) {
      logger.warn('No eligible boxes found for items');

      // Fallback behavior
      const fallback = settings?.fallbackBehavior || 'largest_box';

      if (fallback === 'largest_box') {
        // Use largest available box
        const largestBox = boxes.reduce((max, box) =>
          (box.length * box.width * box.height) > (max.length * max.width * max.height) ? box : max
        , boxes[0]);

        return {
          box: largestBox,
          reason: 'fallback_largest',
          totalWeight: totalPackageWeight + (largestBox.boxWeight || 0),
          packingEfficiency: 0,
          warning: 'Items may not fit properly - using largest available box'
        };
      } else {
        throw new Error('No suitable box found for items');
      }
    }

    // Select optimal box based on strategy
    let selectedBox;

    switch (selectionStrategy) {
      case 'smallest_volume':
        selectedBox = eligibleBoxes.reduce((min, box) => {
          const minVol = min.length * min.width * min.height;
          const boxVol = box.length * box.width * box.height;
          return boxVol < minVol ? box : min;
        }, eligibleBoxes[0]);
        break;

      case 'lowest_cost':
        selectedBox = eligibleBoxes.reduce((min, box) =>
          (box.cost || 0) < (min.cost || 0) ? box : min
        , eligibleBoxes[0]);
        break;

      case 'highest_priority':
        selectedBox = eligibleBoxes[0]; // Already sorted by priority
        break;

      case 'best_fit':
        selectedBox = eligibleBoxes.reduce((best, box) => {
          const bestVol = best.length * best.width * best.height;
          const boxVol = box.length * box.width * box.height;
          const bestWaste = bestVol - bufferedVolume;
          const boxWaste = boxVol - bufferedVolume;
          return boxWaste < bestWaste ? box : best;
        }, eligibleBoxes[0]);
        break;

      default:
        selectedBox = eligibleBoxes[0];
    }

    // Calculate packing efficiency
    const boxVolume = selectedBox.length * selectedBox.width * selectedBox.height;
    const packingEfficiency = (totalVolume / boxVolume) * 100;

    logger.info(`Selected box: ${selectedBox.name}, efficiency: ${packingEfficiency.toFixed(1)}%`);

    return {
      box: selectedBox,
      reason: `selected_by_${selectionStrategy}`,
      totalWeight: totalPackageWeight + (selectedBox.boxWeight || 0),
      totalVolume: totalVolume,
      bufferedVolume: bufferedVolume,
      packingEfficiency: parseFloat(packingEfficiency.toFixed(2)),
      itemCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    };

  } catch (error) {
    logger.error(`Error calculating optimal box: ${error.message}`);
    throw error;
  }
}

module.exports = {
  calculateOptimalBox
};
