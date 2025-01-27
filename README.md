# Objet de l'application

Application test de réservation de salle en créant des containers docker avec l'architecture suivante : 
* un container appbookinghall qui utilise Nodejs/express/Sequelize
* un container dbbookinghall qui utilise mysql
 ./src:/usr/src/app/src

* Volumes "mappés" et volume anonyme
  - Le dossier ./src de l'host est mappé avec /usr/src/app/src du conteneur
  - Le fichier ./server.js de l'host est mappé avec /usr/src/app/server.js du conteneur
  - Le fichier  ./.env de l'host est mappé avec /usr/src/app/.env du conteneur
  - un volume anonyme qui correspond au répertoire /usr/src/app/node_modules est créé afin d'éviter que le dossier node_modules du conteneur soit écrasé par celui de l'host

* un réseau docker todoListNetwork qui permettra aux conteneurs de communiquer entre eux
* Le tout est orchestré par un fichier docker-compose.yml
* un fichier db.config.js permet de d'utiliser les variables issues de du fichier .env
* un fichier .env.sample sert de base à copier dans un fichier .env (qui sera ignoré par git)

## Coeur de l'application
L'application crée les endpoints qui permettent de gérer l'authentification et les réservations.
### Authentification :

- POST /api/auth/login : Connexion d'un utilisateur existant
- POST /api/auth/signup : Création d'un nouvel utilisateur (accessible uniquement aux administrateurs)

Tous les endpoints liés aux réservations nécessitent un token JWT valide dans le header "Authorization" sous la forme :
Authorization: Bearer <token>
Le token est obtenu lors de la connexion via /api/auth/login et reste valide pendant 24 heures.

### Réservations :

- POST /api/bookings : Création d'une nouvelle réservation
- GET /api/bookings/monthly?year=YYYY&month=MM : Récupération des réservations pour un mois donné
- PUT /api/bookings/:bid : Modification d'une réservation existante (l'utilisateur ne peut modifier que ses propres réservations, l'administrateur peut modifier toutes les réservations)



## Base de données
Le SGBD utilisé est MySQL version 8.
L'ORM utilisé est Sequelize. Il permet une interaction simplifiée avec la base de données MySQL en utilisant des modèles JavaScript.
Voici la structure des différentes tables :

- Table users : uid (clé primaire), login (email), pwd (mot de passe encodé), role (user/admin), firstname, lastname, phone
- Table bookings : bid (clé primaire), title, description, start_date, end_date, private (booléen), paid (booléen), uid (clé étrangère vers users)

Les valeurs nécessaires à la construction de la base de données se trouvent dans le fichier .env (copié depuis .env.sample), qui contient notamment :

- DB_NAME : nom de la base de données (bookinghalldb)
- DB_USERNAME : nom d'utilisateur (admin)
- DB_PASSWORD : mot de passe

Les scripts à lire pour comprendre exactement les interactions possibles avec la base de données sont :

- src/models/user.model.js et src/models/booking.model.js pour la définition des modèles
- src/controllers/auth.controller.js pour la gestion des utilisateurs
- src/controllers/booking.controller.js pour la gestion des réservations
- src/models/index.js pour la configuration de Sequelize et les relations entre les tables

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

# Se connecter depuis le conteneur MySQL :
```bash
docker-compose exec dbbookinghall mysql -u admin -p bookinghalldb
```
Mot de passe : 123ABc;#789

# Test de login avec l'admin :

```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
    "login": "admin@bookinghall.com",
    "pwd": "Admin123!@#"
}'
```
Cela doit renvoyer une réponse avec un token. Ex : 
```bash
{"uid":1,"login":"admin@bookinghall.com","role":"admin","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzk5MjIzMSwiZXhwIjoxNzM4MDc4NjMxfQ.TjeL-Bn2ZKcwdaeaYzVPM3krgMNxJ3zhB-y0BrfZXws"}
```

# Créer une réservation :
```bash
curl -X POST http://localhost:3000/api/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNzk5MzA0NSwiZXhwIjoxNzM4MDc5NDQ1fQ.rHlJIJKj7DqyNhIt7uMdczWh__w_j1Td5ecZ_GlI58w" \
-d '{
    "title": "Réunion test 3",
    "description": "Test de la première réservation",
    "start_date": "2025-01-27T14:00:00",
    "end_date": "2025-01-27T16:00:00",
    "private": false,
    "paid": false
}'
```
