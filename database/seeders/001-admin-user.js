const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    return queryInterface.bulkInsert('users', [{
      full_name: 'Administrator',
      email: 'admin@localhost.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { email: 'admin@localhost.com' }, {});
  }
};
