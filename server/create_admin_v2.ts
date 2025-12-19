import sequelize from './src/config/database';
import User from './src/models/User';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connection established.');
    
    const email = 'admin@localhost.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists first
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
        console.log('User exists, updating password...');
        await existingUser.update({ password: hashedPassword, is_active: true });
        console.log('User updated.');
    } else {
        console.log('User does not exist, creating...');
        await User.create({
            email,
            password: hashedPassword,
            full_name: 'Admin User',
            role: 'admin',
            is_active: true
        });
        console.log('User created.');
    }

    // Verify immediately
    const verify = await User.findOne({ where: { email } });
    console.log('Verification check:', verify ? 'FOUND' : 'NOT FOUND');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
