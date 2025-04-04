const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Emission = sequelize.define('Emission', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('ENERGY', 'TRANSPORT', 'DIGITAL', 'WASTE'),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    co2e: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    }
  });

  Emission.associate = function(models) {
    Emission.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Emission;
};