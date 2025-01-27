# Démarrer ou redémarrer
docker-compose up -d

# Arrêter les conteneurs et supprimer les volumes
docker-compose down -v

# Reconstruire l'image
docker-compose build

# Vérifier que les conteneurs sont en cours d'exécution
docker-compose ps

# Voir tous les logs
docker-compose logs

# Pour suivre les logs en temps réel (avec -f pour "follow")
docker-compose logs -f

# Création d'un admin via le script d'initialisation
docker-compose exec appbookinghall node src/scripts/init-admin.js

# Accéder au conteneur de l'application
docker-compose exec appBookingHall bash