const express = require('express');
const { Emission, sequelize } = require('../models');
const router = express.Router();

// Get emissions summary for dashboard
router.get('/:userId', async (req, res) => {
  try {
    const emissions = await Emission.findAll({
      where: { userId: req.params.userId },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('co2e')), 'total']],
      group: ['category']
    });

    const total = emissions.reduce((sum, item) => sum + parseFloat(item.dataValues.total), 0);
    
    // SDG impact calculation (simplified example)
    const sdgImpact = {
      SDG7: { progress: Math.min(100, (total * 0.1)), description: "Affordable & Clean Energy" },
      SDG9: { progress: Math.min(100, (total * 0.05)), description: "Industry, Innovation & Infrastructure" },
      SDG12: { progress: Math.min(100, (total * 0.15)), description: "Responsible Consumption" },
      SDG13: { progress: Math.min(100, (total * 0.2)), description: "Climate Action" }
    };

    res.json({
      emissionsByCategory: emissions,
      totalEmissions: total,
      sdgImpact,
      reductionTips: generateReductionTips(emissions)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate personalized reduction tips
function generateReductionTips(emissions) {
  const tips = [];
  emissions.forEach(item => {
    const category = item.dataValues.category;
    const total = parseFloat(item.dataValues.total);
    
    if (category === 'ENERGY' && total > 100) {
      tips.push("Consider switching to renewable energy sources to reduce your energy emissions");
    }
    if (category === 'TRANSPORT' && total > 50) {
      tips.push("Try carpooling or using public transportation to reduce your transport emissions");
    }
    if (category === 'DIGITAL' && total > 10) {
      tips.push("Reduce streaming quality and clean up cloud storage to lower digital emissions");
    }
    if (category === 'WASTE' && total > 30) {
      tips.push("Increase recycling and composting to reduce waste emissions");
    }
  });
  return tips.length > 0 ? tips : ["Great job! Your emissions are below average for all categories"];
}

module.exports = router;