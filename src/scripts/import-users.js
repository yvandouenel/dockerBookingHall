// import-users.js
import { promises as fs } from 'fs';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';

const User = db.users;
const SALT_ROUNDS = 10;

async function importUsers() {
    try {
        // 1. Lire le fichier JSON
        const rawData = await fs.readFile('src/scripts/users_export.json', 'utf8');
        const drupalUsers = JSON.parse(rawData);

        // 3. Transformer et valider les données
        const sequelizeUsers = await Promise.all(drupalUsers.map(async user => {
            // Utiliser le login comme mot de passe temporaire et le hasher
            const hashedPassword = await bcrypt.hash(user.login, SALT_ROUNDS);
            
            return {
                uid: user.uid,
                login: user.login,
                pwd: hashedPassword,
                role: user.role || 'user',
                firstname: user.firstname || null,
                lastname: user.lastname || null,
                phone: user.phone || ''
            };
        }));

        // 4. Insérer les utilisateurs
        await db.sequelize.transaction(async (t) => {
            for (const user of sequelizeUsers) {
                try {
                    await User.create(user, { transaction: t });
                    console.log(`✓ Utilisateur importé: ${user.login} (mot de passe temporaire: ${user.login})`);
                } catch (error) {
                    if (error.name === 'SequelizeUniqueConstraintError') {
                        console.warn(`⚠ L'utilisateur ${user.login} existe déjà`);
                    } else {
                        throw error;
                    }
                }
            }
        });

        console.log('\nImportation terminée avec succès!');
        console.log(`Total utilisateurs traités: ${sequelizeUsers.length}`);
        console.log('\nLe mot de passe temporaire pour chaque utilisateur est son login');
        
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
    }
}

// Lancer l'importation
importUsers();