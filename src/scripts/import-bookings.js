// import-bookings.js
import { promises as fs } from 'fs';
import db from '../models/index.js';

const Booking = db.bookings;

async function importBookings() {
    try {
        // 1. Lire le fichier JSON
        const rawData = await fs.readFile('src/scripts/events_export.json', 'utf8');
        const drupalEvents = JSON.parse(rawData);

        // 2. Transformer et valider les données
        const bookings = drupalEvents.map(event => {
            // Nettoyer la description (body) si elle existe
            let cleanDescription = '';
            if (event.body) {
                cleanDescription = event.body.replace(/<[^>]*>/g, '').trim();
            }

            // S'assurer que les dates sont valides
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            // Vérifier que les dates sont valides
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn(`⚠ Dates invalides pour l'événement "${event.title}"`);
                return null;
            }

            return {
                title: event.title || 'Sans titre',
                description: cleanDescription,
                start_date: startDate,
                end_date: endDate,
                private: false,
                paid: false,
                uid: parseInt(event.uid, 10) // Utilisation de uid au lieu de userId
            };
        }).filter(booking => booking !== null); // Filtrer les événements invalides

        // 3. Insérer les réservations
        await db.sequelize.transaction(async (t) => {
            let successCount = 0;
            let errorCount = 0;

            for (const booking of bookings) {
                try {
                    // Vérifier si l'utilisateur existe
                    const user = await db.users.findByPk(booking.uid);
                    if (!user) {
                        console.warn(`⚠ Utilisateur ${booking.uid} non trouvé pour la réservation "${booking.title}"`);
                        errorCount++;
                        continue;
                    }

                    await Booking.create(booking, { transaction: t });
                    console.log(`✓ Réservation importée: ${booking.title} (Utilisateur: ${booking.uid})`);
                    successCount++;
                } catch (error) {
                    console.warn(`⚠ Erreur pour la réservation "${booking.title}":`, error.message);
                    errorCount++;
                }
            }

            console.log('\nRésumé de l\'importation:');
            console.log(`Total traité: ${bookings.length}`);
            console.log(`Succès: ${successCount}`);
            console.log(`Erreurs: ${errorCount}`);
        });

        console.log('\nImportation terminée avec succès!');
        
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
        process.exit(1);
    } finally {
        await db.sequelize.close();
    }
}

// Lancer l'importation
importBookings();