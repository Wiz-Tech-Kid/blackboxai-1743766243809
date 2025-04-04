const express = require('express');
const { Emission } = require('../models');
const router = express.Router();

// Emission factors (kg CO2e per unit)
const EMISSION_FACTORS = {
  ENERGY: {
    ELECTRICITY: 0.5, // per kWh
    NATURAL_GAS: 0.2, // per kWh
    SOLAR: 0.05,     // per kWh
  },
  TRANSPORT: {
    CAR_GASOLINE: 0.12, // per km
    CAR_ELECTRIC: 0.05, // per km
    BUS: 0.08,         // per km
    TRAIN: 0.05,       // per km
    PLANE: 0.25,       // per km
  },
  DIGITAL: {
    CLOUD_STORAGE: 0.0002, // per GB/month
    STREAMING: 0.0005,     // per hour
  },
  WASTE: {
    LANDFILL: 0.5,       // per kg
    RECYCLING: 0.1,      // per kg
    COMPOST: 0.05,       // per kg
  }
};

// Calculate CO2 equivalent
const calculateCO2e = (category, subcategory, value) => {
  const factor = EMISSION_FACTORS[category]?.[subcategory] || 0;
  return value * factor;
};

// Submit new emission data
router.post('/', async (req, res) => {
  try {
    const { userId, category, subcategory, value, unit } = req.body;
    const co2e = calculateCO2e(category, subcategory, value);
    
    const emission = await Emission.create({
      userId,
      category,
      subcategory,
      value,
      unit,
      co2e
    });

    res.json(emission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's emissions
router.get('/user/:userId', async (req, res) => {
  try {
    const emissions = await Emission.findAll({
      where: { userId: req.params.userId },
      order: [['date', 'DESC']]
    });
    res.json(emissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;