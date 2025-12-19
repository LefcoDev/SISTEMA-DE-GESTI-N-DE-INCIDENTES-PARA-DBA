
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('servers', 'monitoring_user', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('servers', 'monitoring_password', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('servers', 'monitoring_user');
    await queryInterface.removeColumn('servers', 'monitoring_password');
  }
};
