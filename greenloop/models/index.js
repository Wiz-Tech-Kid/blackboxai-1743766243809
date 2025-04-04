const { Sequelize } = require('sequelize');
const User = require('./User');
const Emission = require('./Emission');

const sequelize = new Sequelize(process.env.DB_URL || 'postgres://user:pass@localhost:5432/greenloop', {
  logging: false
});

const models = {
  User: User(sequelize),
  Emission: Emission(sequelize)
};

Object.values(models).forEach(model => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };