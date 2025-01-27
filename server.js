import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './src/models/index.js';
import routes from './src/routes/index.js';

dotenv.config();

const app = express();

// Configuration CORS détaillée
const corsOptions = {
    origin: function (origin, callback) {
        // En développement, on accepte toutes les origines
        callback(null, true);
        // En production, vous devriez spécifier les domaines autorisés :
        // const allowedOrigins = ['http://votre-frontend.com'];
        // if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        //     callback(null, true);
        // } else {
        //     callback(new Error('Not allowed by CORS'));
        // }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Sync database
db.sequelize.sync()
    .then(() => {
        console.log("Database synced");
    })
    .catch((err) => {
        console.log("Failed to sync database: " + err.message);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
