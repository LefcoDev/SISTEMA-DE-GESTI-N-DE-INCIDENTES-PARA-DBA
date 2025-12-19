import sequelize from './src/config/database';
import User from './src/models/User';
import bcrypt from 'bcrypt';

async function verifyLogin() {
  try {
    await sequelize.authenticate();
    console.log('Connection established.');
    
    const email = 'admin@localhost.com';
    const password = 'admin123';

    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.log('User not found');
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Login verification for ${email}: ${isValid ? 'SUCCESS' : 'FAILED'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

verifyLogin();
