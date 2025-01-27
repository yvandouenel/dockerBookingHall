import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const User = db.users;

const initAdmin = async () => {
    try {
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
            await User.create({
                login: 'admin@bookinghall.com',
                pwd: hashedPassword,
                role: 'admin',
                firstname: 'Admin',
                lastname: 'System',
                phone: '0000000000'
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit();
    }
};

initAdmin();
